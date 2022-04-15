const companies = require('./companies.routes');
const categories = require('./categories.routes');
const units = require('./units.routes');
const contacts = require('./contacts.routes');
const products = require('./products.routes');
const images = require('./images.routes');
const productstocks = require('./productStocks.routes');
const purchases = require('./purchases.routes');
const users = require('./users.routes');
const accounts = require('./accounts.routes');
const accounttransactions = require('./accounts.routes');
const bookings = require('./bookings.routes');
const sales = require('./sales.routes');
const profits = require('./profits.routes');
const salepayments = require('./salepayments.routes');
const expenses = require('./expenses.routes');
const recoveries = require('./recoveries.routes');
const transfers = require('./transfers.routes');
const data = require('./data.routes');

module.exports = {
    companies,
    categories,
    units,
    contacts,
    products,
    images,
    productstocks,
    purchases,
    users,
    accounts,
    accounttransactions,
    bookings,
    sales,
    profits,
    salepayments,
    expenses,
    recoveries,
    transfers,
    data
}