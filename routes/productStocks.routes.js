const app = require('../app');
const productstocksController = require('../controllers/productStocks.controller');

app.post('/productstocks',productstocksController.createproductstock);
app.get('/productstocks/:productId',productstocksController.getproductstocks);
app.get('/productstock/:id',productstocksController.getproductstockByID);
app.patch('/productstock/:id',productstocksController.updateproductstock);