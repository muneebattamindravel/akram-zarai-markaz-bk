const app = require('../app');
const dbBackup = require('../data-scripts/db-backup.js');
const dbRestore = require('../data-scripts/db-restore.js');

app.post('/data/backup/',dbBackup.backup);
app.post('/data/restore/',dbRestore.restore);