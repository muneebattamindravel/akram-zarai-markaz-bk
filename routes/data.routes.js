const app = require('../app');
const dataBackUp = require('../data-scripts/data-backup.js');
const dataRestore = require('../data-scripts/data-restore.js');

app.post('/data/backup/',dataBackUp.backup);
app.post('/data/upload/',dataBackUp.upload);
app.post('/data/restore/',dataRestore.restore);