const app = require('../app');
const productstocksController = require('../controllers/productStocks.controller');

app.post('/productstocks',productstocksController.createproductstock);
app.post('/productstocks/return',productstocksController.returnProductStock);
app.post('/productstocks/returnManual',productstocksController.returnManualProductStock);
app.get('/productstocks/:productId',productstocksController.getproductstocks);
app.get('/productstocksbypurchaseid/:purchaseId',productstocksController.getProductStocksByPurchaseId);
app.get('/productstock/:id',productstocksController.getproductstockByID);
app.patch('/productstock/:id',productstocksController.updateproductstock);