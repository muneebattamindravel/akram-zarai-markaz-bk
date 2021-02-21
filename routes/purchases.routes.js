const app = require('..');
const purchasesController = require('../controllers/purchases.controller');

app.post('/purchases',purchasesController.createPurchase);
app.get('/purchases',purchasesController.getAllPurchases);
