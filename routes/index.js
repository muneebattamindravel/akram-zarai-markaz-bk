const companies = require('./companies.routes');
const categories = require('./categories.routes');
const units = require('./units.routes');
const contacts = require('./contacts.routes');
const products = require('./products.routes');
const images = require('./images.routes');
const productStocks = require('./productStocks.routes');
const purchases = require('./purchases.routes');

module.exports = {
    companies,
    categories,
    units,
    contacts,
    products,
    images,
    productStocks,
    purchases,
}