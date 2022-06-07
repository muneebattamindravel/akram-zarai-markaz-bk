const app = require('../app');
const incentivesController = require('../controllers/incentives.controller');

app.post('/incentives',incentivesController.createIncentive);
app.get('/incentives',incentivesController.getIncentives);
app.get('/incentives/:id',incentivesController.getIncentive);
app.delete('/incentives/:id',incentivesController.deleteIncentive);
