const Sequelize = require('sequelize');

const dbnName = process.env.DB_NAME || 'akram-zarai-markaz';
const dbUser = process.env.DB_USER || 'azmuser1';
const dbPassword = process.env.DB_PASS || 'azmuser1';
const dbInstance = process.env.DB_INSTANCE || 'localhost';
// const includeDialectOptions = process.env.INCLUDE_DIALECT_OPTIONS || false;

let sequelize = null;
// if (includeDialectOptions) {
//   sequelize = new Sequelize(
//     dbnName, 
//     dbUser, 
//     dbPassword, 
//     {
//       host: dbInstance,
//       dialect: 'mysql',
//       dialectOptions: {
//         socketPath: dbInstance,
//       },
//     });
// }
// else {
  sequelize = new Sequelize(
    dbnName, 
    dbUser, 
    dbPassword, 
    {
      host: dbInstance,
      dialect: 'mysql',
    });
// }

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

const Companies = require('./companies.model');
const Categories = require('./categories.model');
const Units = require('./units.model');
const Contacts = require('./contacts.model');
const Products = require('./products.model');
const ProductStocks = require('./productStocks.model');
const Purchases = require('./purchases.model');
const Users = require('./users.model');
const Accounts = require('./accounts.model');
const AccountTransactions = require('./accountTransactions.model');
const Bookings = require('./bookings.model');
const Sales = require('./sales.model');
const SaleItems = require('./saleItems.model');
const SaleProfits = require('./saleProfits.model');
const SalePayments = require('./salePayments.model');
const StockBooks = require('./stockBooks.model');
const Expenses = require('./expenses.model');
const Recoveries = require('./recoveries.model');
const Transfers = require('./transfers.model');

db.companies = Companies.initialize(sequelize,Sequelize);
db.categories = Categories.initialize(sequelize,Sequelize);
db.units = Units.initialize(sequelize,Sequelize);
db.contacts = Contacts.initialize(sequelize,Sequelize);
db.products = Products.initialize(sequelize,Sequelize);
db.productStocks = ProductStocks.initialize(sequelize,Sequelize);
db.purchases = Purchases.initialize(sequelize,Sequelize);
db.users = Users.initialize(sequelize,Sequelize);
db.accounts = Accounts.initialize(sequelize,Sequelize);
db.accountTransactions = AccountTransactions.initialize(sequelize,Sequelize);
db.bookings = Bookings.initialize(sequelize,Sequelize);
db.sales = Sales.initialize(sequelize,Sequelize);
db.saleItems = SaleItems.initialize(sequelize,Sequelize);
db.saleProfits = SaleProfits.initialize(sequelize,Sequelize);
db.salePayments = SalePayments.initialize(sequelize,Sequelize);
db.stockBooks = StockBooks.initialize(sequelize,Sequelize);
db.expenses = Expenses.initialize(sequelize,Sequelize);
db.recoveries = Recoveries.initialize(sequelize,Sequelize);
db.transfers = Transfers.initialize(sequelize,Sequelize);

//Associations
Companies.setAssociations(db)
Categories.setAssociations(db)
Units.setAssociations(db)
Contacts.setAssociations(db);
Products.setAssociations(db)
ProductStocks.setAssociations(db)
Purchases.setAssociations(db)
Accounts.setAssociations(db)
AccountTransactions.setAssociations(db)
Bookings.setAssociations(db)
Sales.setAssociations(db)
SaleItems.setAssociations(db)
SaleProfits.setAssociations(db)
SalePayments.setAssociations(db)
StockBooks.setAssociations(db)
Expenses.setAssociations(db)
Recoveries.setAssociations(db)
Transfers.setAssociations(db)

module.exports = db;
