const app = require('..');
const productStocksController = require('../controllers/productStocks.controller');

app.post('/productStocks',productStocksController.createProductStock);
app.get('/productStocks/:productId',productStocksController.getProductStocks);
app.get('/productStock/:id',productStocksController.getProductStockByID);
app.patch('/productStock/:id',productStocksController.updateProductStock);