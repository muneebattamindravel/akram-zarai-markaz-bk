/**creates a new recovery */
const Accounts = require('../models/accounts.model');
const recoveriesModel = require('../models/recoveries.model');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const accounttransactions = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');
const accountsController = require('../controllers/accounts.controller');

const addRecovery = async (req, res) => {
    try {
        const defaultAccount = await Accounts.getDefaultAccount();

        const createdRecovery = await recoveriesModel.create({
            date: req.body.date,
            bookNumber: req.body.bookNumber,
            billNumber: req.body.billNumber,
            amount: req.body.amount,
            contactId: req.body.contactId,
            isReceived: req.body.isReceived,
            accountId: req.body.accountId,
        });

        if (req.body.contactId != null) {
            const where = { type: "Customer", referenceId: req.body.contactId }
            const include = []
            const cutomerAccount = (await Accounts.getAll(where, include))[0];

            let contactAmount = req.body.amount;
            let amount = req.body.amount;
            let contactTransactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY_GIVEN;
            let transactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY_GIVEN;

            if (req.body.isReceived) {
                contactAmount = contactAmount * -1;
                transactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY_TAKEN;
            }
            else {
                amount = amount * -1;
                contactTransactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY_GIVEN;
            }

            await accounttransactions.createaccounttransaction(
                req.body.date,
                contactAmount,
                contactTransactionString,
                "",
                cutomerAccount.id,
                createdRecovery.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );

            await accounttransactions.createaccounttransaction(
                req.body.date,
                amount,
                transactionString,
                "",
                req.body.accountId,
                createdRecovery.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );
        }

        res.send(createdRecovery);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ raw: err.message?.toString(), message: "Create Recovery Error", stack: err.stack });
    }
}

/** delete recovery */
const deleteRecovery = async (req, res) => {
    try {
        const recovery = await recoveriesModel.getByID(req.params.id)
        await recoveriesModel.deleteById(recovery.id);
        await accounttransactionsModel.deleteByReference(recovery.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY_GIVEN)
        await accounttransactionsModel.deleteByReference(recovery.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY_TAKEN)
        await accountsController.consolidateAccountStatementWorker(recovery.accountId)
        await accountsController.consolidateAccountStatementWorker(recovery.contact.accountId)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ raw: err.message.toString(), message: "Delete Recoveries Error", stack: err.stack })
    }
}

/** get recoveries */
const getRecoveries = async (req, res) => {
    try {
        var allRecoveries = await recoveriesModel.getAll(req.query.from, req.query.to);
        res.send(allRecoveries)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ raw: err.message.toString(), message: "Get Recoveries Error", stack: err.stack })
    }
}

/** get recovery with id */
const getRecovery = async (req, res) => {
    try {
        let recovery = await recoveriesModel.getByID(req.params.id)
        if (recovery) {
            res.send(recovery)
        }
        else {
            res.status(404).send({ message: 'Recovery Not Found' })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ raw: err.message.toString(), message: 'Recoveries Error', stack: err.stack })
    }
}

module.exports = {
    addRecovery,
    getRecoveries,
    getRecovery,
    deleteRecovery
}