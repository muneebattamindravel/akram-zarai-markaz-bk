const PURCHASES_STRINGS = require('../constants/purchases.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockbooks.strings');
const Purchases = require('../models/purchases.model');
const productstocks = require('../models/productstocks.model');
const ProductsController = require('../controllers/products.controller');
const accounttransactions = require('../controllers/accounttransactions.controller');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accounttransactions.strings');
const CompaniesModel = require('../models/companies.model');
const stockbooksController = require('../controllers/stockbooks.controller');

/**creates a new purchase */
const createPurchase = async (req, res) => {
    try {
        if (!IsPurchaseBodyValid(req.body, res))
            return;

        const createdPurchase = await Purchases.create({
            companyId: req.body.companyId,
            contactId: req.body.contactId,
            invoiceNumber: req.body.invoiceNumber,
            purchaseType: req.body.purchaseType,
            invoiceDate: req.body.invoiceDate,
            notes: req.body.notes,
            totalAmount: req.body.totalAmount,
        })

        Promise.all(req.body.purchasedproductstocks.map(async (productstock) => {
            const productNextLotNumber = await ProductsController.getNextLotNumber(productstock.productId);
            await productstocks.create({
                lotNumber: productNextLotNumber,
                batchNumber: productstock.batchNumber,
                expiryDate: productstock.expiryDate,
                invoiceNumber: req.body.invoiceNumber,
                costPrice: productstock.costPrice,
                quantity: productstock.initialQuantity,
                initialQuantity: productstock.initialQuantity,
                notes: productstock.notes,
                productId: productstock.productId,
                purchaseId: createdPurchase.id,
            })

            await stockbooksController.addstockbookEntry(req.body.invoiceDate, "", "", req.body.invoiceNumber, productstock.initialQuantity, STOCK_BOOKS_STRINGS.TYPE.PURCHASE_STOCK, productstock.notes, productstock.productId, createdPurchase.id);
        }));

        const company = await CompaniesModel.getByID(req.body.companyId);
        await accounttransactions.createaccounttransaction(
            req.body.invoiceDate,
            (req.body.totalAmount * -1), 
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.PURCHASE,
            req.body.purchaseType,
            company.accountId,
            createdPurchase.id,
            "",
            "",
            req.body.invoiceNumber,
            ""
        );

        res.send(createdPurchase);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PURCHASES_STRINGS.ERROR_CREATING_PURCHASE, stack: err.stack})
    }
}

/** get all purchases */
const getAllPurchases = async (req, res) => {
    try {
        res.send(await Purchases.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: PURCHASES_STRINGS.ERROR_GETTING_PURCHASES, stack: err.stack})
    }
}

const IsPurchaseBodyValid = (body, res) => {
    if (!body.contactId) {
        res.status(406).send({message: PURCHASES_STRINGS.CONTACT_NULL});
        return false;
    }
    if (!body.invoiceNumber) {
        res.status(406).send({message: PURCHASES_STRINGS.INVOICE_NUMBER_NULL});
        return false;
    }
    if (!body.invoiceDate) {
        res.status(406).send({message: PURCHASES_STRINGS.INVOICE_DATE_NULL});
        return false;
    }
    if (body.purchasedproductstocks.length <= 0) {
        res.status(406).send({message: PURCHASES_STRINGS.PURCHASE_PRODUCT_STOCKS_EMPTY});
        return false;
    }
    if (!body.totalAmount) {
        res.status(406).send({message: PURCHASES_STRINGS.INVALID_TOTAL_AMOUNT});
        return false;
    }
    if (body.totalAmount <= 0) {

    }
    return true
}

module.exports = {
    createPurchase,
    getAllPurchases,
}