/**creates a new loan */
const Accounts = require('../models/accounts.model');
const contactsModel = require('../models/contacts.model');
const loansModel = require('../models/loans.model');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const accountTransactionsController = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');
const accountsController = require('../controllers/accounts.controller');

const createLoan = async (req, res) => {
    try {
        const createdLoan = await loansModel.create({
            date: req.body.date,
            bookNumber: req.body.bookNumber,
            billNumber: req.body.billNumber,
            amount: req.body.amount,
            contactId: req.body.contactId,
            isReceived: req.body.isReceived,
            accountId: req.body.accountId
        });

        if (req.body.contactId != null) {
            const where = {type: "Customer", referenceId: req.body.contactId}
            const include = []
            const contactAccount = (await Accounts.getAll(where, include))[0];

            let contactAmount = req.body.amount;
            let amount = req.body.amount;
            let contactTransactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.LOAN_GIVEN;
            let transactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.LOAN_GIVEN;

            if (req.body.isReceived) {
                contactAmount = contactAmount * -1;
                transactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.LOAN_TAKEN;
            }
            else {
                amount = amount * -1;
                contactTransactionString = ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.LOAN_TAKEN;
            }

            await accountTransactionsController.createaccounttransaction(
                req.body.date,
                contactAmount,
                contactTransactionString,
                "",
                contactAccount.id,
                createdLoan.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );

            await accountTransactionsController.createaccounttransaction(
                req.body.date,
                amount, 
                transactionString, 
                "",
                req.body.accountId,
                createdLoan.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );
        }

        res.send(createdLoan);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Get Loans Error", stack: err.stack})
    }
}

/** get loans */
const getLoans = async (req, res) => {
    try {        
        var allLoans = await loansModel.getAll(req.query.from, req.query.to);
        res.send(allLoans)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Get Loans Error", stack: err.stack})
    }
}

/** get loan with id */
const getLoan = async (req, res) => {
    try {
        let loan = await loansModel.getByID(req.params.id)
        if (loan) {
            res.send(loan)
        }
        else {
            res.status(404).send({message: 'Loan Not Found'})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Loans Error', stack: err.stack})
    }
}

/** delete loan */
const deleteLoan = async (req, res) => {
    try {        
        const loan = await loansModel.getByID(req.params.id)
        let contact = await contactsModel.getByID(loan.contactId);

        await loansModel.deleteById(loan.id);
        await accounttransactionsModel.deleteByReference(loan.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.LOAN_GIVEN)
        await accounttransactionsModel.deleteByReference(loan.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.LOAN_TAKEN)
        await accountsController.consolidateAccountStatementWorker(loan.accountId)
        await accountsController.consolidateAccountStatementWorker(contact.accountId)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Delete Loan Error", stack: err.stack})
    }
}

module.exports = {
    createLoan,
    getLoans,
    getLoan,
    deleteLoan
}