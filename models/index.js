const dbConfig = require('../config/database.config');
const Sequelize = require('sequelize');

const Companies = require('./companies.model');
const Categories = require('./categories.model');
const Units = require('./units.model');
const Contacts = require('./contacts.model');
const Products = require('./products.model');
const ProductStocks = require('./productStocks.model');
const Purchases = require('./purchases.model');

const sequelize = new Sequelize(
  dbConfig.DB, 
  dbConfig.USER, 
  dbConfig.PASSWORD, 
  {
    host: dbConfig.HOST,dialect: dbConfig.dialect,
    pool: {max: dbConfig.pool.max,min: dbConfig.pool.min,acquire: dbConfig.pool.acquire,idle: dbConfig.pool.idle}
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.companies = Companies.initialize(sequelize,Sequelize);
db.categories = Categories.initialize(sequelize,Sequelize);
db.units = Units.initialize(sequelize,Sequelize);
db.contacts = Contacts.initialize(sequelize,Sequelize);
db.products = Products.initialize(sequelize,Sequelize);
db.productStocks = ProductStocks.initialize(sequelize,Sequelize);
db.purchases = Purchases.initialize(sequelize,Sequelize);

//Associations
Companies.setAssociations(db)
Categories.setAssociations(db)
Units.setAssociations(db)
Products.setAssociations(db)
ProductStocks.setAssociations(db)
Purchases.setAssociations(db)

module.exports = db;
