const app = require('..');
const dashboardController = require('../controllers/dashboard.controller');
app.get('/dashboard/topbar',dashboardController.getTopBarData);
app.get('/dashboard/businessreport',dashboardController.getBusinessReport);
app.get('/dashboard/toploans',dashboardController.getTopLoans);
