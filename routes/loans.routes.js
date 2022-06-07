const app = require('../app');
const loansController = require('../controllers/loans.controller');

app.post('/loans',loansController.createLoan);
app.get('/loans',loansController.getLoans);
app.get('/loans/:id',loansController.getLoan);
app.delete('/loans/:id',loansController.deleteLoan);
