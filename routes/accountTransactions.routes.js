const app = require('../app');
const accountTransactionsController = require('../controllers/accountTransactions.controller');

app.get('/accountTransactions',accountTransactionsController.getAllAccountTransactions);
app.get('/accountTransactions/:id',accountTransactionsController.getAccountTransaction);
