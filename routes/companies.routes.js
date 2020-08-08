const app = require('..');
const companiesController = require('../controllers/companies.controller');

app.post('/companies',companiesController.createCompany);
app.patch('/companies/:id',companiesController.updateCompany);
app.get('/companies',companiesController.getAllCompanies);
app.get('/companies/:id',companiesController.getCompany);
app.delete('/companies/:id',companiesController.deleteCompany);
