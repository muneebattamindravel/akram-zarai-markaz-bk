/**creates a new transfer */
const transfersModel = require('../models/transfers.model');
const accountsModel = require('../models/accounts.model');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const accounttransactions = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');
const accountsController = require('../controllers/accounts.controller');

const addTransfer = async (req, res) => {
  try {
    const result = await createTransferWorker(
      req.body.date,
      req.body.fromAccountId,
      req.body.toAccountId,
      req.body.bookNumber,
      req.body.billNumber,
      req.body.amount,
      req.body.notes,
      req.body.details
    );

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ raw: err.message?.toString(), message: "Create Transfer Error", stack: err.stack });
  }
};

const createTransferWorker = async (date, fromAccountId, toAccountId, bookNumber, billNumber, amount, notes, details) => {
    const createdTransfer = await transfersModel.create({
        date: date,
        fromAccountId: fromAccountId,
        toAccountId: toAccountId,
        bookNumber: bookNumber,
        billNumber: billNumber,
        amount: amount,
        notes: notes,
    });

    let fromAccountAmount = (amount * -1)
    await accounttransactions.createaccounttransaction(
        date,
        fromAccountAmount, 
        ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER,
        details,
        fromAccountId,
        createdTransfer.id,
        bookNumber,
        billNumber,
        "",
        ""
    );

    let toAccountAmount = (amount * 1)
    if (details === "CAPITAL_WITHDRAWN")
        toAccountAmount = (amount * -1)

    await accounttransactions.createaccounttransaction(
        date,
        toAccountAmount, 
        ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER,
        details,
        toAccountId,
        createdTransfer.id,
        bookNumber,
        billNumber,
        "",
        ""
    );

    return createdTransfer;
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
    await accounttransactionsModel.deleteByReference(
      transferId,
      ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER
    );

    const result = await createTransferWorker(
      req.body.date,
      req.body.fromAccountId,
      req.body.toAccountId,
      req.body.bookNumber,
      req.body.billNumber,
      req.body.amount,
      req.body.notes,
      req.body.details
    );

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ raw: err.message?.toString(), message: "Update Transfer Error", stack: err.stack });
  }
};


/** delete Transfer */
const deleteTransfer = async (req, res) => {
    try {        
        const transfer = await transfersModel.getByID(req.params.id)
        await transfersModel.deleteById(transfer.id);

        await accounttransactionsModel.deleteByReference(transfer.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.TRANSFER)
        await accountsController.consolidateAccountStatementWorker(transfer.fromAccountId)
        await accountsController.consolidateAccountStatementWorker(transfer.toAccountId)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Delete Transfer Error", stack: err.stack})
    }
}

module.exports = {
    addTransfer,
    getTransfers,
    updateTransfer,
    getTransfer,
    deleteTransfer
}