const app = require('../app');
const accounttransactionsController = require('../controllers/accounttransactions.controller');

app.get('/accounttransactions',accounttransactionsController.getAllaccounttransactions);
app.get('/accounttransactions/:id',accounttransactionsController.getaccounttransaction);
