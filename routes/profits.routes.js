const app = require('..');
const profitsController = require('../controllers/profits.controller');

app.get('/profits/saleprofits',profitsController.getsaleprofits);
app.get('/profits/counterSalesProfit',profitsController.getCountersaleprofitAmount);