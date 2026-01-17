const app = require('../app');
const accountsController = require('../controllers/accounts.controller');

app.post('/accounts',accountsController.createAccount);
app.post('/accounts/capital',accountsController.addCapital);
app.post('/accounts/profit',accountsController.addProfit);
app.patch('/accounts/:id',accountsController.updateAccount);
app.get('/accounts',accountsController.getAllAccounts);

app.get('/accounts/:id',accountsController.getAccount);
app.get('/accounts/defaultAccount/balance',accountsController.getDefaultAccountBalance);
app.delete('/accounts/:id',accountsController.deleteAccount);

app.get('/accounts/statement/:id',accountsController.getAccountStatement);
app.post('/accounts/consolidate/:id',accountsController.consolidateAccountStatement);
app.get('/accounts/consolidate/all',accountsController.consolidateAccountStatementForAll);

app.get('/accounts/validate-account-ledger/:id',accountsController.validateAccountLedger);
