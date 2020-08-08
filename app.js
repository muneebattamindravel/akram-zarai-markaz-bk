const express = require('express');
const app = express();
const db = require('./models');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.header('origin')
    || req.header('x-forwarded-host') || req.header('referer') || req.header('host'));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type,cache-control, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', parameterLimit: 5000, extended: true }));

app.get('/', (req, res) => {
  res.send('OK');
});

db.sequelize.sync({force:false})

module.exports = app;
console.log(process.pid)