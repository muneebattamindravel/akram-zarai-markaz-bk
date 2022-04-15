const PRODUCT_STOCKS_STRINGS = require('../constants/productstocks.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockbooks.strings');
const productstocks = require('../models/productstocks.model');
const productsController = require('./products.controller');
const stockbooksController = require('./stockbooks.controller');
const stockbooksModel = require('../models/stockbooks.model');

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

const updateproductstock = async (req, res) => {
    try {
        if (!IsproductstockBodyValid(req.body, res))
            return;

        const existingStock = await productstocks.getByID(req.params.id)
        const diff = req.body.initialQuantity - existingStock.initialQuantity;
        req.body.quantity = existingStock.quantity + diff;

        req.body.purchaseId = req.body.purchaseId == 0 ? null : req.body.purchaseId

        const stockbookEntry = await stockbooksModel.getByReference(req.params.id, STOCK_BOOKS_STRINGS.TYPE.MANUAL_STOCK);
        await stockbooksModel.update({
            amount: req.body.quantity
        }, stockbookEntry.id);

        stockbooksController.consolidatestockbook(stockbookEntry.productId);

        await productstocks.update(req.body, req.params.id) ? 
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
}