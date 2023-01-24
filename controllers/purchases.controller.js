const PURCHASES_STRINGS = require('../constants/purchases.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const Purchases = require('../models/purchases.model');
const productstocks = require('../models/productStocks.model');
const stockbooksModel = require('../models/stockBooks.model');
const ProductsController = require('../controllers/products.controller');
const accounttransactions = require('./accountTransactions.controller');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const CompaniesModel = require('../models/companies.model');
const stockbooksController = require('./stockBooks.controller');
const accountsController = require('./accounts.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');

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

/** delete purchase */
const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchases.getByID(req.params.id)
        const models = require('../models');

        const where = {"purchaseId": purchase.id}
        const include = [{model: models.products}]
        
        await stockbooksModel.deleteByReference(purchase.id, STOCK_BOOKS_STRINGS.TYPE.PURCHASE_STOCK)
        const allProductStocksOfThisPurchase = await productstocks.getAll(where, include);
        await Promise.all(allProductStocksOfThisPurchase.map(async (prs) => {
            await stockbooksController.consolidateStockBookWorker(prs.product.id);
        }));     

        await productstocks.deleteAll({"purchaseId": purchase.id})
        
        await accounttransactionsModel.deleteByReference(purchase.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.PURCHASE)
        await accountsController.consolidateAccountStatementWorker(purchase.company.accountId)
        
        await Purchases.deleteById(req.params.id)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error in deleting purchase", stack: err.stack})
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


/** get purchases */
const getPurchase = async (req, res) => {
    try {
        res.send(await Purchases.getByID(req.params.id))
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
    getPurchase,
    deletePurchase
}