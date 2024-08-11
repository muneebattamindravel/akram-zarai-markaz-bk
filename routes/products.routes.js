const app = require('..');
const productsController = require('../controllers/products.controller');
const stockbooksController = require('../controllers/stockBooks.controller');

app.post('/products',productsController.createProduct);
app.patch('/products/:id',productsController.updateProduct);
app.get('/products',productsController.getAllProducts);
app.get('/products/bynamefilter/:filter',productsController.getAllProductsByNameFilter);
app.get('/products/:id',productsController.getProduct);
app.delete('/products/:id',productsController.deleteProduct);
app.get('/products/stockbook/:id',stockbooksController.getstockbook);

app.get('/products/consolidate/stockbooks',stockbooksController.conslidateStockBooksForAll);

app.get('/admin/checkdates/:date',stockbooksController.checkAllFaultyDates);
