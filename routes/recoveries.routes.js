const app = require('../app');
const recoveriesController = require('../controllers/recoveries.controller');

app.post('/recoveries',recoveriesController.addRecovery);
app.get('/recoveries',recoveriesController.getRecoveries);
app.get('/recoveries/:id',recoveriesController.getRecovery);
app.delete('/recoveries/:id',recoveriesController.deleteRecovery);
