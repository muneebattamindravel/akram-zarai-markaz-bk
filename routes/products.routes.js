const app = require('..');
const productsController = require('../controllers/products.controller');
const stockbooksController = require('../controllers/stockbooks.controller');

app.post('/products',productsController.createProduct);
app.patch('/products/:id',productsController.updateProduct);
app.get('/products',productsController.getAllProducts);
app.get('/products/:id',productsController.getProduct);
app.delete('/products/:id',productsController.deleteProduct);
app.get('/products/stockbook/:id',stockbooksController.getstockbook);
