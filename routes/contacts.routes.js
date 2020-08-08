const app = require('..');
const contactsController = require('../controllers/contacts.controller');

app.post('/contacts',contactsController.createContact);
app.patch('/contacts/:id',contactsController.updateContact);
app.get('/contacts',contactsController.getAllContacts);
app.get('/contacts/:id',contactsController.getContact);
app.delete('/contacts/:id',contactsController.deleteContact);
