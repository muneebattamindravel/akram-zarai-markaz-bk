const ACCOUNTTRANSACTIONS_STRINGS = require('../constants/accountTransactions.strings');
const AccountTransactions = require('../models/accountTransactions.model');

/**creates a new accountTransaction */
const createAccountTransaction = async (date, amount, type, details, accountId, referenceId, bookNumber, billNumber, invoiceNumber, prNumber) => {
    try {
        let lastTransaction = await AccountTransactions.getLastTransaction(accountId);
        if (lastTransaction) {
            await AccountTransactions.create({
                transactionDate: date,
                amount: amount,
                type: type,
                details: details,
                accountId: accountId,
                closingBalance: (parseFloat(lastTransaction.closingBalance) + parseFloat(amount)),
                referenceId: referenceId,
                bookNumber: bookNumber,
                billNumber: billNumber,
                invoiceNumber: invoiceNumber,
                prNumber: prNumber
            })
        }
        else {
            await AccountTransactions.create({
                transactionDate: date,
                amount: amount,
                type: type,
                details: details,
                accountId: accountId,
                closingBalance: parseFloat(amount),
                referenceId: referenceId,
                bookNumber: bookNumber,
                billNumber: billNumber,
                invoiceNumber: invoiceNumber,
                prNumber: prNumber
            })
        }
    }
    catch (err) {
        return err.message.toString();
    }
}

const updateOpeningBalance = async(accountId, openingBalance) => {
    try {
        let firstTransaction = await AccountTransactions.getFirstTransaction(accountId);

        firstTransaction.setDataValue("amount", openingBalance);
        firstTransaction.setDataValue("closingBalance", openingBalance);

        const updateObject = {
            "amount": openingBalance,
            "closingBalance": openingBalance
        }

        await AccountTransactions.update(updateObject, firstTransaction.id);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Updating Opening Balance", stack: err.stack})
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
    updateOpeningBalance
}