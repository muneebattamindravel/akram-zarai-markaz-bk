const app = require('..');
const unitsController = require('../controllers/units.controller');

app.post('/units',unitsController.createUnit);
app.patch('/units/:id',unitsController.updateUnit);
app.get('/units',unitsController.getAllUnits);
app.get('/units/:id',unitsController.getUnit);
app.delete('/units/:id',unitsController.deleteUnit);
