const ACCOUNTS_STRINGS = require('../constants/accounts.strings');
const Accounts = require('../models/accounts.model');
const accounttransactionsModel = require('../models/accountTransactions.model');
const { Op } = require("sequelize");
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const accounttransactionsController = require('./accountTransactions.controller');

/**creates a new account */
const createAccount = async (req, res) => {
    try {
        if (!IsAccountBodyValid(req.body, res))
            return;

        const account = await Accounts.create({
            createdDate: new Date(),
            name: req.body.name,
            type: req.body.type,
            openingBalance: req.body.openingBalance,
            description: req.body.description,
            bankName: req.body.bankName,
            bankAccountNumber: req.body.bankAccountNumber,
            isDefault: false,
            referenceId: req.body.referenceId == 0 ? null : referenceId,
        })

        await accounttransactionsController.createaccounttransaction(
            new Date(),
            req.body.openingBalance,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.ACCOUNT_CREATED,
            req.body.type,
            account.id,
            account.id, 
            "", 
            "",
            "",
            "");
        res.send(account);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_CREATING_ACCOUNT, stack: err.stack})
    }
}

/**creates a new account - FOR DB MIGRATION*/
const createAccountDBMigration = async (date, name, description, type, openingBalance, referenceId, bankName, bankAccountNumber, isDefault) => {
    try {
        const account = await Accounts.create({
            createdDate: date,
            name: name,
            description: description,
            type: type,
            openingBalance: openingBalance,
            referenceId: referenceId == 0 ? null : referenceId,
            bankName: bankName,
            bankAccountNumber: bankAccountNumber,
            isDefault: isDefault,
        })

        await accounttransactionsController.createaccounttransaction(
            date,
            openingBalance, 
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.ACCOUNT_CREATED,
            type,
            account.id,
            account.id,
            "",
            "",
            "",
            "");

        return account;
    }
    catch (err) {
        return err.message.toString();
    }
}

/**update a account by id*/
const updateAccount = async (req, res) => {
    try {
        if (!IsAccountBodyValid(req.body, res))
            return;
        const result = await Accounts.exists(
            {name: req.body.name, type: req.body.type ,  id: {[Op.not]: req.params.id}}
        )
        if (result) {
            res.status(406).send({message: ACCOUNTS_STRINGS.DUPLICATE_ACCOUNT_NAME})
            return;
        } 

        const updated = await Accounts.update(req.body, req.params.id);
        if (updated) {
            await accounttransactionsController.updateOpeningBalance(req.params.id, req.body.openingBalance);
            res.send({message: ACCOUNTS_STRINGS.ACCOUNT_UPDATED_SUCCESSFULLY})
        }
        else {
            res.status(406).send({message: `${ACCOUNTS_STRINGS.ERROR_UPDATING_ACCOUNT}, id=${req.params.id}`})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_UPDATING_ACCOUNT, stack: err.stack})
    }
}

/** get a account with id */
const getAccount = async (req, res) => {
    try {
        const account = await Accounts.getByID(req.params.id)
        if (account) {
            let balance = 0.00
            let lastTransaction = await accounttransactionsModel.getLastTransaction(account.id);
            if (lastTransaction) 
                balance = lastTransaction.closingBalance;
            account.setDataValue('balance', balance);

            let opening = (await accounttransactionsModel.getFirstTransaction(account.id)).amount;
            account.setDataValue("openingBalance", opening);
            
            res.send(account)
        }
        else {
            res.status(404).send({message: `${ACCOUNTS_STRINGS.ACCOUNT_NOT_FOUND} ,id=${req.params.id}`})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

/** get account statement against account id */
const getAccountStatement = async (req, res) => {
    try {
        const { Op } = require("sequelize");
        const models = require('../models');

        const where = {
            "accountId": req.params.id,
            "transactionDate" : {
                [Op.between]: [req.query.from, req.query.to]
            }
        }

        const include = [
            {model: models.accounts}
        ] 

        const accounttransactions = await accounttransactionsModel.getAll(
            where, include,
        );

        res.send(accounttransactions);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT_STATEMENT, stack: err.stack})
    }
}

/** consolidateAccountStatementRoute */
const consolidateAccountStatement = async (req, res) => {
    try {
        res.send(await consolidateAccountStatementWorker(req.params.id));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Error Consolidating', stack: err.stack})
    }
}

/** consolidateAccountStatementsForAllRoute */
const consolidateAccountStatementForAll = async (req, res) => {
    try {
        let allAccounts = await Accounts.getAll();
        
        await Promise.all(allAccounts.map(async (account) => {
            console.log(account.id)
            await consolidateAccountStatementWorker(account.id)
        }));

        console.log("Accounts Length = " + allAccounts.length)
        res.send('Success');
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Error Consolidating', stack: err.stack})
    }
}

const consolidateAccountStatementWorker = async(accountId) => {
    const where = {"accountId": accountId}
    const include = []
    const accounttransactions = await accounttransactionsModel.getAll(where, include,);
    
    let closingBalance = accounttransactions[0].amount;
    accounttransactions.shift();
    await Promise.all(accounttransactions.map(async (accounttransaction) => {
        closingBalance = closingBalance + accounttransaction.amount;
        const updateBody = {
            'closingBalance': closingBalance
        }
        await accounttransactionsModel.update(updateBody, accounttransaction.id);
    }));

    return accounttransactions;
}

/** get balance of the default account */
const getDefaultAccountBalance = async (req, res) => {
    try {
        res.send(await getDefaultAccountBalanceWorker());
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

const getDefaultAccountBalanceWorker = async () => {
    try {
        const account = await Accounts.getDefaultAccount();
        if (account) {
            let balance = 0.00
            let lastTransaction = await accounttransactionsModel.getLastTransaction(account.id);
            if (lastTransaction) 
                balance = lastTransaction.closingBalance;
            
            const amountObject = {
                amount: balance
            }
            
            return amountObject;
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

/** get all accounts */
const getAllAccounts = async (req, res) => {
    try {
        res.send(await getAllAccountsWorker());
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNTS, stack: err.stack})
    }
}

const getAllAccountsWorker = async () => {
    const where = {}
    const include = []
    let allAccounts = await Accounts.getAll(where, include);

    await Promise.all(allAccounts.map(async (account) => {
        let balance = 0.00
        let lastTransaction = await accounttransactionsModel.getLastTransaction(account.id);
        if (lastTransaction) 
            balance = lastTransaction.closingBalance;
        
        account.setDataValue('balance', balance);
    }));

    return allAccounts
}

/** delete account by id */
const deleteAccount = async (req, res) => {
    try {
        const id = req.params.id;
        await Accounts.deleteById(req.params.id) ? res.send({message: ACCOUNTS_STRINGS.ACCOUNT_DELETED}) : res.status(406).send({message: `${ACCOUNTS_STRINGS.ACCOUNT_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: ACCOUNTS_STRINGS.ACCOUNT_NOT_DELETED, stack: err.stack})
    }
}

const IsAccountBodyValid = (body, res) => {
    if (!body.name) {
        res.status(406).send({message: ACCOUNTS_STRINGS.ACCOUNT_NAME_NULL});
        return false;
    }

    if (!body.type) {
        res.status(406).send({message: ACCOUNTS_STRINGS.ACCOUNT_TYPE_NULL});
        return false;
    }
    return true
}

/** add capital for a partner account */
const addCapital = async (req, res) => {
    try {
        //add to partner capital account
        await accounttransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.CAPITAL_ADDED,
            req.body.details,
            req.body.partnerAccountId,
            req.body.partnerAccountId,
            "",
            "",
            "",
            "");

            //also add to amount to credit account
        await accounttransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.CAPITAL_ADDED,
            req.body.details,
            req.body.creditAccountId,
            req.body.creditAccountId,
            "",
            "",
            "",
            "");

            res.send(req.body)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Adding Capital", stack: err.stack})
    }
}

/** add profit for a partner account */
const addProfit = async (req, res) => {
    try {
        //add to partner profit account
        await accounttransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.PROFIT_POSTED,
            req.body.details,
            req.body.partnerAccountId,
            req.body.partnerAccountId,
            "",
            "",
            "",
            "");

            res.send(req.body)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Posting Profit", stack: err.stack})
    }
}

module.exports = {
    createAccount,
    updateAccount,
    getAccount,
    getDefaultAccountBalance,
    getAllAccounts,
    deleteAccount,
    createAccountDBMigration,
    getAccountStatement,
    consolidateAccountStatementWorker,
    consolidateAccountStatement,
    consolidateAccountStatementForAll,
    addCapital,
    addProfit,
    getDefaultAccountBalanceWorker,
    getAllAccountsWorker
}