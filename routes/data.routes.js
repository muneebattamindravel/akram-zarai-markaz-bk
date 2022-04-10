const app = require('../app');
// const dbBackup = require('../data-scripts/db-backup.js');
const dbBackupNew = require('../data-scripts/db-backup-new.js');

app.post('/data/backup/',dbBackupNew.backup);