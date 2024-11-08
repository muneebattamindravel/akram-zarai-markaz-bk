const app = require('..');
const saleReturnsController = require('../controllers/saleReturns.controller');

app.post('/saleReturns/:saleId',saleReturnsController.returnSaleItems);
app.get('/saleReturns',saleReturnsController.getAllSaleReturns);
