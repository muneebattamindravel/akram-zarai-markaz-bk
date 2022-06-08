const app = require('../app');
const dataBackUp = require('../data-scripts/data-backup.js');

app.post('/data/backup',dataBackUp.backup);
app.post('/data/upload',dataBackUp.upload);
app.post('/data/sendSMS',dataBackUp.sendSMS);