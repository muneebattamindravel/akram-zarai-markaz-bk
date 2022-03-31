const app = require('../app');
const expensesController = require('../controllers/expenses.controller');

app.post('/expenses',expensesController.createExpense);
app.get('/expenses',expensesController.getAllExpenses);
app.get('/expenses/:id',expensesController.getExpense);
app.patch('/expenses/:id',expensesController.updateExpense);