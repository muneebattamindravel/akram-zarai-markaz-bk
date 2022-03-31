const companies = require('./companies.routes');
const categories = require('./categories.routes');
const units = require('./units.routes');
const contacts = require('./contacts.routes');
const products = require('./products.routes');
const images = require('./images.routes');
const productStocks = require('./productStocks.routes');
const purchases = require('./purchases.routes');
const users = require('./users.routes');
const accounts = require('./accounts.routes');
const accountTransactions = require('./accounts.routes');
const bookings = require('./bookings.routes');
const sales = require('./sales.routes');
const profits = require('./profits.routes');
const salePayments = require('./salePayments.routes');
const expenses = require('./expenses.routes');
const recoveries = require('./recoveries.routes');
const transfers = require('./transfers.routes');

module.exports = {
    companies,
    categories,
    units,
    contacts,
    products,
    images,
    productStocks,
    purchases,
    users,
    accounts,
    accountTransactions,
    bookings,
    sales,
    profits,
    salePayments,
    expenses,
    recoveries,
    transfers
}