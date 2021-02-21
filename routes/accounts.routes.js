const app = require('../app');
const accountsController = require('../controllers/accounts.controller');

app.post('/accounts',accountsController.createAccount);
app.patch('/accounts/:id',accountsController.updateAccount);
app.get('/accounts',accountsController.getAllAccounts);
app.get('/accounts/:id',accountsController.getAccount);
app.delete('/accounts/:id',accountsController.deleteAccount);
