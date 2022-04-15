/**creates a new recovery */
const Accounts = require('../models/accounts.model');
const recoveriesModel = require('../models/recoveries.model');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accounttransactions.strings');
const accounttransactions = require('../controllers/accounttransactions.controller');
const accounttransactionsModel = require('../models/accounttransactions.model');
const accountsController = require('../controllers/accounts.controller');

const addRecovery = async (req, res) => {
    try {
        const defaultAccount = await Accounts.getDefaultAccount();

        const createdRecovery = await recoveriesModel.create({
            date: req.body.date,
            paymentType: req.body.paymentType,
            bookNumber: req.body.bookNumber,
            billNumber: req.body.billNumber,
            amount: req.body.amount,
            contactId: req.body.contactId,
            accountId: req.body.accountId == 0 ? defaultAccount.id : req.body.accountId,
        });

        if (req.body.contactId != null) {
            const where = {type: "Customer", referenceId: req.body.contactId}
            const include = []
            const cutomerAccount = (await Accounts.getAll(where, include))[0];

            await accounttransactions.createaccounttransaction(
                req.body.date,
                (req.body.amount * -1), 
                ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY,
                "",
                cutomerAccount.id,
                createdRecovery.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );

            if (req.body.paymentType == 0) {
                await accounttransactions.createaccounttransaction(
                    req.body.date,
                    req.body.amount, 
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY, 
                    "",
                    defaultAccount.id,
                    createdRecovery.id,
                    req.body.bookNumber,
                    req.body.billNumber,
                    "",
                    ""
                );
            }
            else if (req.body.paymentType == 1) {
                await accounttransactions.createaccounttransaction(
                    req.body.date,
                    req.body.amount, 
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY, 
                    "",
                    req.body.accountId,
                    createdRecovery.id,
                    req.body.bookNumber,
                    req.body.billNumber,
                    "",
                    ""
                );
            }
        }

        res.send(createdRecovery);
    }
    catch (err) {
    }
}

/** delete recovery */
const deleteRecovery = async (req, res) => {
    try {        
        const recovery = await recoveriesModel.getByID(req.params.id)
        await recoveriesModel.deleteById(recovery.id);
        await accounttransactionsModel.deleteByReference(recovery.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.RECOVERY)
        await accountsController.consolidateAccountStatementWorker(recovery.accountId)
        await accountsController.consolidateAccountStatementWorker(recovery.contact.accountId)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Delete Recoveries Error", stack: err.stack})
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
        res.status(500).send({raw: err.message.toString(), message: "Get Recoveries Error", stack: err.stack})
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
            res.status(404).send({message: 'Recovery Not Found'})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Recoveries Error', stack: err.stack})
    }
}

module.exports = {
    addRecovery,
    getRecoveries,
    getRecovery,
    deleteRecovery
}