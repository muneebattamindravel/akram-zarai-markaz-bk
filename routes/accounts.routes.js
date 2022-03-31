const app = require('../app');
const accountsController = require('../controllers/accounts.controller');

app.post('/accounts',accountsController.createAccount);
app.patch('/accounts/:id',accountsController.updateAccount);
app.get('/accounts',accountsController.getAllAccounts);
app.get('/accounts/statement/:id',accountsController.getAccountStatement);
app.get('/accounts/:id',accountsController.getAccount);
app.get('/accounts/defaultAccount/balance',accountsController.getDefaultAccountBalance);
app.delete('/accounts/:id',accountsController.deleteAccount);
