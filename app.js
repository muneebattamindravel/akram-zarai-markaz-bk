const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '.env.production') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

const app = express();
module.exports = app;
console.log(process.pid)

app.use(fileUpload({
  createParentPath: true
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.header('origin')
    || req.header('x-forwarded-host') || req.header('referer') || req.header('host'));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type,cache-control, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', parameterLimit: 5000, extended: true }));

app.get('/', (req, res) => {
  res.send('OK');
});

const port = process.env.PORT || 6969;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('listening', () => {console.log(`Server started on port ${port}`)});

require('./routes');

const migrationScript = require('./migration-scripts/db-migration');
const db = require('./models');

force = false;
db.sequelize.sync({force}).then(() => {
  if (force)
    migrationScript.RunMigration();
})
