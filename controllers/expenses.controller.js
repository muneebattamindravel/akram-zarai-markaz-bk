const expensesModel = require('../models/expenses.model');
const AccountTransactions = require('../controllers/accountTransactions.controller');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const AccountTransactionsModel = require('../models/accountTransactions.model');

/**creates a new expense */
const createExpense = async (req, res) => {
    try {
        res.send(createExpenseWorker(
            req.body.date,
            req.body.type,
            req.body.description,
            req.body.bookNumber,
            req.body.billNumber,
            req.body.accountId,
            req.body.amount
        ));
    }
    catch (err) {
        console.log(err)
    }
}

const createExpenseWorker = async (date, type, description, bookNumber, billNumber, accountId, amount) => {
    const expense = await expensesModel.create({
        date: date,
        type: type,
        description: description,
        bookNumber: bookNumber,
        billNumber: billNumber,
        accountId: accountId,
        amount: amount,
    })

    await AccountTransactions.createAccountTransaction(
        date,
        (amount * -1), 
        ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.EXPENSE,
        type,
        accountId,
        expense.id,
        bookNumber,
        billNumber,
        "",
        ""
    );

    return expense;
}

/** update expense */
const updateExpense = async (req, res) => {
    try {        
        const expenseId = req.params.id;
        await expensesModel.deleteById(expenseId);
        await AccountTransactionsModel.deleteByReference(expenseId, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.EXPENSE)

        res.send(createExpenseWorker(
            req.body.date,
            req.body.type,
            req.body.description,
            req.body.bookNumber,
            req.body.billNumber,
            req.body.accountId,
            req.body.amount
        ));
    }
    catch (err) {
        console.log(err)
    }
}

/** get all expenses */
const getAllExpenses = async (req, res) => {
    try {        
        var allExpenses = await expensesModel.getAll(req.query.from, req.query.to);
        res.send(allExpenses)
    }
    catch (err) {
        console.log(err)
    }
}

/** get an expense with id */
const getExpense = async (req, res) => {
    try {
        let expense = await expensesModel.getByID(req.params.id)
        if (expense) {
            res.send(expense)
        }
        else {
            res.status(404).send({message: 'Expense Not Found'})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_GETTING_COMPANY, stack: err.stack})
    }
}

module.exports = {
    createExpense,
    getAllExpenses,
    updateExpense,
    getExpense
}