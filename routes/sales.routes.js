const app = require('../app');
const salesController = require('../controllers/sales.controller');

app.post('/sales',salesController.createSale);
app.get('/sales',salesController.getAllSales);
app.get('/sales/:id',salesController.getSale);
app.delete('/sales/:id',salesController.deleteSale);
app.get('/sales/counterSalesAmount/range',salesController.getCounterSaleAmount);
app.get('/sales/search/multiple', salesController.searchSales);

