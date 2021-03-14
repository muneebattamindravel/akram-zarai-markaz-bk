const ACCOUNTTRANSACTIONS_STRINGS = require('../constants/accountTransactions.strings');
const AccountTransactions = require('../models/accountTransactions.model');

/**creates a new accountTransaction */
const createAccountTransaction = async (amount, description, accountId) => {
    try {
        let lastTransaction = await AccountTransactions.getLastTransaction(accountId);
        if (lastTransaction) {
            await AccountTransactions.create({
                amount: amount,
                description: description,
                accountId: accountId,
                closingBalance: (parseFloat(lastTransaction.closingBalance) + parseFloat(amount)),
            })
        }
        else {
            await AccountTransactions.create({
                amount: amount,
                description: description,
                accountId: accountId,
                closingBalance: parseFloat(amount),
            })
        }
    }
    catch (err) {
        return err.message.toString();
    }
}

/** get a accountTransaction with id */
const getAccountTransaction = async (req, res) => {
    try {
        const accountTransaction = await AccountTransactions.getByID(req.params.id)
        accountTransaction? res.send(accountTransaction) : res.status(404).send({message: `${ACCOUNTTRANSACTIONS_STRINGS.ACCOUNTTRANSACTION_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTTRANSACTIONS_STRINGS.ERROR_GETTING_ACCOUNTTRANSACTION, stack: err.stack})
    }
}

/** get all accountTransactions */
const getAllAccountTransactions = async (req, res) => {
    try {
        res.send(await AccountTransactions.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTTRANSACTIONS_STRINGS.ERROR_GETTING_ACCOUNTTRANSACTIONS, stack: err.stack})
    }
}

module.exports = {
    createAccountTransaction,
    getAccountTransaction,
    getAllAccountTransactions,
}