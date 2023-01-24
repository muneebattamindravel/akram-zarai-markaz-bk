const app = require('../app');
const transfersController = require('../controllers/transfers.controller');

app.post('/transfers',transfersController.addTransfer);
app.get('/transfers',transfersController.getTransfers);
app.get('/transfers/:id',transfersController.getTransfer);
app.patch('/transfers/:id',transfersController.updateTransfer);
app.delete('/transfers/:id',transfersController.deleteTransfer);
