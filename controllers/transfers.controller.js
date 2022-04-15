/**creates a new transfer */
const transfersModel = require('../models/transfers.model');
const accountsModel = require('../models/accounts.model');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accounttransactions.strings');
const accounttransactions = require('../controllers/accounttransactions.controller');
const accounttransactionsModel = require('../models/accounttransactions.model');

const addTransfer = async (req, res) => {
    try {
        res.send(createTransferWorker(
            req.body.date,
            req.body.fromAccountId,
            req.body.toAccountId,
            req.body.bookNumber,
            req.body.billNumber,
            req.body.amount,
            req.body.notes
        ));
    }
    catch (err) {
    }
}

const createTransferWorker = async (date, fromAccountId, toAccountId, bookNumber, billNumber, amount, notes) => {
    const createdTransfer = await transfersModel.create({
        date: date,
        fromAccountId: fromAccountId,
        toAccountId: toAccountId,
        bookNumber: bookNumber,
        billNumber: billNumber,
        amount: amount,
        notes: notes,
    });

    await accounttransactions.createaccounttransaction(
        date,
        (amount * -1), 
        ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER,
        "",
        fromAccountId,
        createdTransfer.id,
        bookNumber,
        billNumber,
        "",
        ""
    );

    await accounttransactions.createaccounttransaction(
        date,
        (amount * 1), 
        ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER,
        "",
        toAccountId,
        createdTransfer.id,
        bookNumber,
        billNumber,
        "",
        ""
    );
}

/** get transfers */
const getTransfers = async (req, res) => {
    try {        
        var allTransfers = await transfersModel.getAll(req.query.from, req.query.to);

        await Promise.all(allTransfers.map(async (transfer) => {
            const fromAccount = await accountsModel.getByID(transfer.fromAccountId)
            const toAccount = await accountsModel.getByID(transfer.toAccountId)
            transfer.setDataValue('fromAccount', fromAccount);
            transfer.setDataValue('toAccount', toAccount);
        }));

        res.send(allTransfers)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Get Transfers Error", stack: err.stack})
    }
}

/** get transfer by id */
const getTransfer = async (req, res) => {
    try {
        let transfer = await transfersModel.getByID(req.params.id)
        if (transfer) {
            res.send(transfer)
        }
        else {
            res.status(404).send({message: 'Transfer Not Found'})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Error in getting trasnsfer', stack: err.stack})
    }
}

/** update transfer */
const updateTransfer = async (req, res) => {
    try {
        const transferId = req.params.id;
        await transfersModel.deleteById(transferId);
        await accounttransactionsModel.deleteByReference(transferId, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER)

        res.send(createTransferWorker(
            req.body.date,
            req.body.fromAccountId,
            req.body.toAccountId,
            req.body.bookNumber,
            req.body.billNumber,
            req.body.amount,
            req.body.notes
        ));
    }
    catch (err) {
        console.log(err)
    } 
}

module.exports = {
    addTransfer,
    getTransfers,
    updateTransfer,
    getTransfer
}