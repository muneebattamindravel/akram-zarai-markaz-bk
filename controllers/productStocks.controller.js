const PRODUCT_STOCKS_STRINGS = require('../constants/productStocks.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const productstocks = require('../models/productStocks.model');
const productsController = require('./products.controller');
const accounttransactionsController = require('./accountTransactions.controller');
const stockbooksController = require('./stockBooks.controller');
const stockbooksModel = require('../models/stockBooks.model');

/**creates a new product stock */
const createproductstock = async (req, res) => {
    try {
        if (!IsproductstockBodyValid(req.body, res))
            return;

        let insertPurchaseId = req.body.purchaseId == 0 ? null : req.body.purchaseId;

        const productstock = await createproductstockWorker(
            req.body.productId,
            req.body.costPrice,
            req.body.batchNumber,
            req.body.invoiceNumber,
            insertPurchaseId,
            req.body.initialQuantity,
            req.body.notes,
            req.body.expiryDate,
        )
        res.send(productstock);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_CREATING_PRODUCT_STOCK, stack: err.stack})
    }
}

/**return product stock */
const returnProductStock = async (req, res) => {
    try {
        const existingStock = await productstocks.getByID(req.body.productStockId)
        const remainingStock = existingStock.quantity - req.body.returnQuantity;
        const returnStockAmount = req.body.returnQuantity * existingStock.costPrice;

        let updateBody = {
            quantity: remainingStock
        }

        await stockbooksController.addstockbookEntry(
            req.body.returnDate, "", "", req.body.invoiceNumber, -req.body.returnQuantity, STOCK_BOOKS_STRINGS.TYPE.STOCK_RETURN, req.body.details, existingStock.productId, existingStock.id);

        await accounttransactionsController.createaccounttransaction(
            req.body.returnDate,
            returnStockAmount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.STOCK_RETURN,
            req.body.details,
            req.body.companyAccountId,
            req.body.companyAccountId,
            "", 
            "",
            req.body.invoiceNumber,
            "");
        
        await productstocks.update(updateBody, req.body.productStockId) ?
        res.send({message: PRODUCT_STOCKS_STRINGS.PRODUCT_STOCK_UPDATED_SUCCESSFULLY}) :
        res.status(406).send({message: `${PRODUCT_STOCKS_STRINGS.ERROR_UPDATING_PRODUCT_STOCK}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_CREATING_PRODUCT_STOCK, stack: err.stack})
    }
}

const createproductstockWorker = async (productId, costPrice, batchNumber, invoiceNumber, purchaseId, initialQuantity, notes, expiryDate) => {
    productNextLotNumber = await productsController.getNextLotNumber(productId);
    const productstock = await productstocks.create({
        productId: productId,
        quantity: initialQuantity,
        costPrice: costPrice,
        batchNumber: batchNumber,
        invoiceNumber: invoiceNumber,
        lotNumber: productNextLotNumber,
        purchaseId: purchaseId,
        initialQuantity: initialQuantity,
        notes: notes,
        expiryDate: expiryDate
    })

    await stockbooksController.addstockbookEntry(new Date(), "", "", invoiceNumber, initialQuantity, STOCK_BOOKS_STRINGS.TYPE.MANUAL_STOCK, "", productId, productstock.id);
    return productstock;
}

//this is buggy mess of shit, check all sceanrios
const updateproductstock = async (req, res) => {
    try {
        if (!IsproductstockBodyValid(req.body, res))
            return;

        const existingStock = await productstocks.getByID(req.params.id)
        const diff = req.body.initialQuantity - existingStock.initialQuantity;
        const newQuantity = existingStock.quantity + diff;

        req.body.purchaseId = req.body.purchaseId == 0 ? null : req.body.purchaseId

        const stockbookEntry = await stockbooksModel.getByReference(req.params.id, STOCK_BOOKS_STRINGS.TYPE.MANUAL_STOCK);
        await stockbooksModel.update({
            amount: newQuantity
        }, stockbookEntry.id);

        await stockbooksController.consolidateStockBookWorker(req.params.id)

        let updateBody = {
            "quantity": newQuantity,
            "initialQuantity": req.body.initialQuantity
        }

        await productstocks.update(updateBody, req.params.id) ? 
        res.send({message: PRODUCT_STOCKS_STRINGS.PRODUCT_STOCK_UPDATED_SUCCESSFULLY}) : 
        res.status(406).send({message: `${PRODUCT_STOCKS_STRINGS.ERROR_UPDATING_PRODUCT_STOCK}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_UPDATING_PRODUCT_STOCK, stack: err.stack})
    }
}

/** get all stocks for a particular product*/
const getproductstocks = async (req, res) => {
    try {
        res.send(await productstocks.getAllByID(req.params.productId))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_GETTING_PRODUCT_STOCKS, stack: err.stack})
    }
}

/** get all stocks for a particular purchase*/
const getProductStocksByPurchaseId = async (req, res) => {
    try {
        let where = {purchaseId: req.params.purchaseId}
        const models = require('../models')
        const include = [
            {model: models.products, include: [models.units]}
        ]

        res.send(await productstocks.getAll(
            where,include
        ))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_GETTING_PRODUCT_STOCKS, stack: err.stack})
    }
}

/** get a particular stock record*/
const getproductstockByID = async (req, res) => {
    try {
        res.send(await productstocks.getByID(req.params.id))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_GETTING_PRODUCT_STOCKS, stack: err.stack})
    }
}

const IsproductstockBodyValid = (body, res) => {
    if (!body.productId) {
        res.status(406).send({message: PRODUCT_STOCKS_STRINGS.PRODUCT_ID_NULL});
        return false;
    }
    if (!body.initialQuantity) {
        res.status(406).send({message: PRODUCT_STOCKS_STRINGS.INITIAL_QUANTITY_NULL});
        return false;
    }
    if (!body.costPrice) {
        res.status(406).send({message: PRODUCT_STOCKS_STRINGS.COST_PRICE_NULL});
        return false;
    }
    return true
}

module.exports = {
    createproductstock,
    getproductstocks,
    getproductstockByID,
    updateproductstock,
    createproductstockWorker,
    getProductStocksByPurchaseId,
    returnProductStock,
}