const ACCOUNTTRANSACTIONS_STRINGS = require('../constants/accounttransactions.strings');
const accounttransactions = require('../models/accounttransactions.model');

/**creates a new accounttransaction */
const createaccounttransaction = async (date, amount, type, details, accountId, referenceId, bookNumber, billNumber, invoiceNumber, prNumber) => {
    try {
        let lastTransaction = await accounttransactions.getLastTransaction(accountId);
        if (lastTransaction) {
            await accounttransactions.create({
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
            await accounttransactions.create({
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
        let firstTransaction = await accounttransactions.getFirstTransaction(accountId);

        firstTransaction.setDataValue("amount", openingBalance);
        firstTransaction.setDataValue("closingBalance", openingBalance);

        const updateObject = {
            "amount": openingBalance,
            "closingBalance": openingBalance
        }

        await accounttransactions.update(updateObject, firstTransaction.id);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Updating Opening Balance", stack: err.stack})
    }
}

/** get a accounttransaction with id */
const getaccounttransaction = async (req, res) => {
    try {
        const accounttransaction = await accounttransactions.getByID(req.params.id)
        accounttransaction? res.send(accounttransaction) : res.status(404).send({message: `${ACCOUNTTRANSACTIONS_STRINGS.ACCOUNTTRANSACTION_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTTRANSACTIONS_STRINGS.ERROR_GETTING_ACCOUNTTRANSACTION, stack: err.stack})
    }
}

/** get all accounttransactions */
const getAllaccounttransactions = async (req, res) => {
    try {
        res.send(await accounttransactions.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTTRANSACTIONS_STRINGS.ERROR_GETTING_ACCOUNTTRANSACTIONS, stack: err.stack})
    }
}

module.exports = {
    createaccounttransaction,
    getaccounttransaction,
    getAllaccounttransactions,
    updateOpeningBalance
}