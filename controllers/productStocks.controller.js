const PRODUCT_STOCKS_STRINGS = require('../constants/productStocks.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const ProductStocks = require('../models/productStocks.model');
const productsController = require('../controllers/products.controller');
const stockBooksController = require('../controllers/stockBooks.controller');

/**creates a new product stock */
const createProductStock = async (req, res) => {
    try {
        if (!IsProductStockBodyValid(req.body, res))
            return;

        let insertPurchaseId = req.body.purchaseId == 0 ? null : req.body.purchaseId;

        const productStock = await createProductStockWorker(
            req.body.productId,
            req.body.costPrice,
            req.body.batchNumber,
            req.body.invoiceNumber,
            insertPurchaseId,
            req.body.initialQuantity,
            req.body.notes,
            req.body.expiryDate,
        )
        res.send(productStock);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_CREATING_PRODUCT_STOCK, stack: err.stack})
    }
}

const createProductStockWorker = async (productId, costPrice, batchNumber, invoiceNumber, purchaseId, initialQuantity, notes, expiryDate) => {
    productNextLotNumber = await productsController.getNextLotNumber(productId);
    const productStock = await ProductStocks.create({
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

    await stockBooksController.addStockBookEntry(new Date(), "", "", invoiceNumber, initialQuantity, STOCK_BOOKS_STRINGS.TYPE.MANUAL_STOCK, "", productId, productStock.id);
    return productStock;
}

const updateProductStock = async (req, res) => {
    try {
        if (!IsProductStockBodyValid(req.body, res))
            return;

        const existingStock = await ProductStocks.getByID(req.params.id)
        const diff = req.body.initialQuantity - existingStock.initialQuantity;
        req.body.quantity = existingStock.quantity + diff;

        req.body.purchaseId = req.body.purchaseId == 0 ? null : req.body.purchaseId

        await ProductStocks.update(req.body, req.params.id) ? 
        res.send({message: PRODUCT_STOCKS_STRINGS.PRODUCT_STOCK_UPDATED_SUCCESSFULLY}) : 
        res.status(406).send({message: `${PRODUCT_STOCKS_STRINGS.ERROR_UPDATING_PRODUCT_STOCK}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_UPDATING_PRODUCT_STOCK, stack: err.stack})
    }
}

/** get all stocks for a particular product*/
const getProductStocks = async (req, res) => {
    try {
        res.send(await ProductStocks.getAllByID(req.params.productId))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_GETTING_PRODUCT_STOCKS, stack: err.stack})
    }
}

/** get a particular stock record*/
const getProductStockByID = async (req, res) => {
    try {
        res.send(await ProductStocks.getByID(req.params.id))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_GETTING_PRODUCT_STOCKS, stack: err.stack})
    }
}

const IsProductStockBodyValid = (body, res) => {
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
    createProductStock,
    getProductStocks,
    getProductStockByID,
    updateProductStock,
    createProductStockWorker,
}