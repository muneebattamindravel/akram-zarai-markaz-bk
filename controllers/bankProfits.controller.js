/**creates a new BankProfit */
const accountsModel = require('../models/accounts.model');
const bankProfitsModel = require('../models/bankProfits.model');
const accountTransactionsController = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');
const accountsController = require('../controllers/accounts.controller');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');

const createBankProfit = async (req, res) => {
    try {
        const createdBankProfit = await bankProfitsModel.create({
            date: req.body.date,
            notes: req.body.notes,
            amount: req.body.amount,
            type: req.body.type,
            accountId: req.body.accountId
        });

        const where = {id: req.body.accountId}
        const include = []
        const onlineAccount = (await accountsModel.getAll(where, include))[0];

        await accountTransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.BANK_PROFIT,
            req.body.type,
            onlineAccount.id,
            createdBankProfit.id,
            "",
            "",
            "",
            ""
        );

        res.send(createdBankProfit);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Create BankProfits Error", stack: err.stack})
    }
}

/** get BankProfits */
const getBankProfits = async (req, res) => {
    try {        
        var allBankProfits = await bankProfitsModel.getAll(req.query.from, req.query.to);
        res.send(allBankProfits)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Get BankProfits Error", stack: err.stack})
    }
}

/** get BankProfit with id */
const getBankProfit = async (req, res) => {
    try {
        let BankProfit = await bankProfitsModel.getByID(req.params.id)
        if (BankProfit) {
            res.send(BankProfit)
        }
        else {
            res.status(404).send({message: 'BankProfit Not Found'})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'BankProfits Error', stack: err.stack})
    }
}

/** delete BankProfit */
const deleteBankProfit = async (req, res) => {
    try {        
        const bankprofit = await bankProfitsModel.getByID(req.params.id)
        await bankProfitsModel.deleteById(bankprofit.id);
        let onlineAccount = await accountsModel.getByID(bankprofit.accountId);

        await accounttransactionsModel.deleteByReference(bankprofit.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.BANK_PROFIT)
        await accountsController.consolidateAccountStatementWorker(onlineAccount.id)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Delete BankProfit Error", stack: err.stack})
    }
}

module.exports = {
    createBankProfit,
    getBankProfits,
    getBankProfit,
    deleteBankProfit
}