const app = require('..');
const salePaymentsController = require('../controllers/salePayments.controller');

app.post('/salePayments',salePaymentsController.createSalePayment);
app.get('/salePayments/:saleId',salePaymentsController.getSalePayments);
