const ACCOUNTS_STRINGS = require('../constants/accounts.strings');
const Accounts = require('../models/accounts.model');
const AccountTransactions = require('../controllers/accountTransactions.controller');
const { Op } = require("sequelize");

/**creates a new account */
const createAccount = async (req, res) => {
    try {
        if (!IsAccountBodyValid(req.body, res))
            return;

        const result = await Accounts.exists({name: req.body.name})
        if (result) {
            res.status(406).send({message: ACCOUNTS_STRINGS.DUPLICATE_ACCOUNT_NAME})
            return;
        }

        var companyDuplicate = await Accounts.exists({companyId: req.body.companyId})
        if (companyDuplicate) {
            res.status(406).send({message: ACCOUNTS_STRINGS.DUPLICATE_COMPANY_ACCOUNT})
            return;
        }

        const account = await Accounts.create({
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
            openingBalance: req.body.openingBalance,
            companyId: req.body.companyId == 0 ? null : req.body.companyId,
            bankName: req.body.bankName,
            bankAccountNumber: req.body.bankAccountNumber,
        })

        await AccountTransactions.createAccountTransaction(req.body.openingBalance, ACCOUNTS_STRINGS.ACCOUNT_CREATED, account.id);
        res.send(account);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_CREATING_ACCOUNT, stack: err.stack})
    }
}

/**update a account by id*/
const updateAccount = async (req, res) => {
    try {
        if (!IsAccountBodyValid(req.body, res))
            return;
        const result = await Accounts.exists({name: req.body.name, id: {[Op.not]: req.params.id}})
        if (result) {
            res.status(406).send({message: ACCOUNTS_STRINGS.DUPLICATE_ACCOUNT_NAME})
            return;
        }    

        if (req.body.companyId == 0) req.body.companyId = null;

        await Accounts.update(req.body,req.params.id) ? 
        res.send({message: ACCOUNTS_STRINGS.ACCOUNT_UPDATED_SUCCESSFULLY}) : 
        res.status(406).send({message: `${ACCOUNTS_STRINGS.ERROR_UPDATING_ACCOUNT}, id=${req.params.id}`})
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
        account? res.send(account) : res.status(404).send({message: `${ACCOUNTS_STRINGS.ACCOUNT_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNT, stack: err.stack})
    }
}

/** get all accounts */
const getAllAccounts = async (req, res) => {
    try {
        res.send(await Accounts.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNTS, stack: err.stack})
    }
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

module.exports = {
    createAccount,
    updateAccount,
    getAccount,
    getAllAccounts,
    deleteAccount,
}