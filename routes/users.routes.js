const app = require('../app');
const usersController = require('../controllers/users.controller');

app.post('/login',usersController.validateCredentials);
