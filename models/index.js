const { Sequelize } = require('sequelize');

require('dotenv').config();
console.log("Environment Variables:");
console.log("DATABASE: " + process.env.DB_NAME);
console.log("USERNAME: " + process.env.DB_USER);
console.log("PASSWORD: " + process.env.DB_PASSWORD);
console.log("HOST: " + process.env.DB_HOST);

// Create a new Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

// Function to authenticate and connect to the database
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
};

// Connect to the database
connectToDatabase();


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

const Companies = require('./companies.model');
const Categories = require('./categories.model');
const Units = require('./units.model');
const Contacts = require('./contacts.model');
const Products = require('./products.model');
const productstocks = require('./productStocks.model');
const Purchases = require('./purchases.model');
const Users = require('./users.model');
const Accounts = require('./accounts.model');
const accounttransactions = require('./accountTransactions.model');
const Bookings = require('./bookings.model');
const Sales = require('./sales.model');
const SaleReturns = require('./saleReturns.model');
const saleitems = require('./saleItems.model');
const salereturns = require('./saleReturns.model');
const saleprofits = require('./saleProfits.model');
const salepayments = require('./salePayments.model');
const stockbooks = require('./stockBooks.model');
const Expenses = require('./expenses.model');
const Recoveries = require('./recoveries.model');
const Transfers = require('./transfers.model');
const Loans = require('./loans.model');
const Incentives = require('./incentives.model');

db.companies = Companies.initialize(sequelize,Sequelize);
db.categories = Categories.initialize(sequelize,Sequelize);
db.units = Units.initialize(sequelize,Sequelize);
db.contacts = Contacts.initialize(sequelize,Sequelize);
db.products = Products.initialize(sequelize,Sequelize);
db.productstocks = productstocks.initialize(sequelize,Sequelize);
db.purchases = Purchases.initialize(sequelize,Sequelize);
db.users = Users.initialize(sequelize,Sequelize);
db.accounts = Accounts.initialize(sequelize,Sequelize);
db.accounttransactions = accounttransactions.initialize(sequelize,Sequelize);
db.bookings = Bookings.initialize(sequelize,Sequelize);
db.sales = Sales.initialize(sequelize,Sequelize);
db.salereturns = salereturns.initialize(sequelize,Sequelize);
db.saleitems = saleitems.initialize(sequelize,Sequelize);
db.saleprofits = saleprofits.initialize(sequelize,Sequelize);
db.salepayments = salepayments.initialize(sequelize,Sequelize);
db.stockbooks = stockbooks.initialize(sequelize,Sequelize);
db.expenses = Expenses.initialize(sequelize,Sequelize);
db.recoveries = Recoveries.initialize(sequelize,Sequelize);
db.transfers = Transfers.initialize(sequelize,Sequelize);
db.loans = Loans.initialize(sequelize,Sequelize);
db.incentives = Incentives.initialize(sequelize,Sequelize);

//Associations
Companies.setAssociations(db)
Categories.setAssociations(db)
Units.setAssociations(db)
Contacts.setAssociations(db);
Products.setAssociations(db)
productstocks.setAssociations(db)
Purchases.setAssociations(db)
Accounts.setAssociations(db)
accounttransactions.setAssociations(db)
Bookings.setAssociations(db)
Sales.setAssociations(db)
SaleReturns.setAssociations(db)
saleitems.setAssociations(db)
saleprofits.setAssociations(db)
salepayments.setAssociations(db)
stockbooks.setAssociations(db)
Expenses.setAssociations(db)
Recoveries.setAssociations(db)
Transfers.setAssociations(db)
Loans.setAssociations(db)
Incentives.setAssociations(db)

module.exports = db;