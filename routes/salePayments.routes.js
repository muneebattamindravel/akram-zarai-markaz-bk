const app = require('../app');
const salepaymentsController = require('../controllers/salePayments.controller');

app.post('/salepayments',salepaymentsController.createsalepayment);
app.get('/salepayments/:saleId',salepaymentsController.getsalepayments);
