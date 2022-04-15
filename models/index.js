const Sequelize = require('sequelize');

const dbnName = process.env.DB_NAME || 'akram-zarai-markaz';
const dbUser = process.env.DB_USER || 'azmuser1';
const dbPassword = process.env.DB_PASS || 'azmuser1';
const dbInstance = process.env.DB_INSTANCE || 'localhost';
// const includeDialectOptions = process.env.INCLUDE_DIALECT_OPTIONS || false;

let sequelize = null;
// if (includeDialectOptions) {npm 
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
const productstocks = require('./productstocks.model');
const Purchases = require('./purchases.model');
const Users = require('./users.model');
const Accounts = require('./accounts.model');
const accounttransactions = require('./accounttransactions.model');
const Bookings = require('./bookings.model');
const Sales = require('./sales.model');
const saleitems = require('./saleitems.model');
const saleprofits = require('./saleprofits.model');
const salepayments = require('./salepayments.model');
const stockbooks = require('./stockbooks.model');
const Expenses = require('./expenses.model');
const Recoveries = require('./recoveries.model');
const Transfers = require('./transfers.model');

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
db.saleitems = saleitems.initialize(sequelize,Sequelize);
db.saleprofits = saleprofits.initialize(sequelize,Sequelize);
db.salepayments = salepayments.initialize(sequelize,Sequelize);
db.stockbooks = stockbooks.initialize(sequelize,Sequelize);
db.expenses = Expenses.initialize(sequelize,Sequelize);
db.recoveries = Recoveries.initialize(sequelize,Sequelize);
db.transfers = Transfers.initialize(sequelize,Sequelize);

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
saleitems.setAssociations(db)
saleprofits.setAssociations(db)
salepayments.setAssociations(db)
stockbooks.setAssociations(db)
Expenses.setAssociations(db)
Recoveries.setAssociations(db)
Transfers.setAssociations(db)

module.exports = db;
