const app = require('..');
const profitsController = require('../controllers/profits.controller');

app.get('/profits/saleProfits',profitsController.getSaleProfits);
app.get('/profits/counterSalesProfit',profitsController.getCounterSaleProfitAmount);