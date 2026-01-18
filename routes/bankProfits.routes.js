const app = require('../app');
const bankProfitsController = require('../controllers/bankProfits.controller');

app.post('/bankprofits',bankProfitsController.createBankProfit);
app.get('/bankprofits',bankProfitsController.getBankProfits);
app.get('/bankprofits/:id',bankProfitsController.getBankProfit);
app.delete('/bankprofits/:id',bankProfitsController.deleteBankProfit);
