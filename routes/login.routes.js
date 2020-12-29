const app = require('..');
const loginController = require('../controllers/login.controller');

app.post('/login',loginController.validateCredentials);
