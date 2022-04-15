const app = require('../app');
const dataBackUp = require('../data-scripts/data-backup.js');

app.post('/data/backup',dataBackUp.backup);