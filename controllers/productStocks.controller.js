const PRODUCT_STOCKS_STRINGS = require('../constants/productStocks.strings');
const APP_STRINGS = require('../constants/app.strings');
const ProductStocks = require('../models/productStocks.model');
const productsController = require('../controllers/products.controller');

/**creates a new product stock */
const createProductStock = async (req, res) => {
    try {
        if (!IsProductStockBodyValid(req.body, res))
            return;
        productNextLotNumber = await productsController.getNextLotNumber(req.body.productId);
        const productStock = await ProductStocks.create({
            productId: req.body.productId,
            quantity: req.body.initialQuantity,
            costPrice: req.body.costPrice,
            batchNumber: req.body.batchNumber,
            expiryDate: req.body.expiryDate,
            lotNumber: productNextLotNumber,
            purchaseId: req.body.purchaseId,
            initialQuantity: req.body.initialQuantity,
            notes: req.body.notes,
        })
        console.log("product stock created")
        res.send(productStock);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCT_STOCKS_STRINGS.ERROR_CREATING_PRODUCT_STOCK, stack: err.stack})
    }
}

const updateProductStock = async (req, res) => {
    try {
        if (!IsProductStockBodyValid(req.body, res))
            return;

        const existingStock = await ProductStocks.getByID(req.params.id)
        const diff = req.body.initialQuantity - existingStock.initialQuantity;
        req.body.quantity = existingStock.quantity + diff;

        await ProductStocks.update(req.body, req.params.id) ? 
        res.send({message: PRODUCT_STOCKS_STRINGS.PRODUCT_STOCK_UPDATED_SUCCESSFULLY}) : 
        res.status(400).send({message: `${PRODUCT_STOCKS_STRINGS.ERROR_UPDATING_PRODUCT_STOCK}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_UPDATING_COMPANY, stack: err.stack})
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
        res.status(400).send({message: PRODUCT_STOCKS_STRINGS.PRODUCT_ID_NULL});
        return false;
    }
    if (!body.initialQuantity) {
        res.status(400).send({message: PRODUCT_STOCKS_STRINGS.INITIAL_QUANTITY_NULL});
        return false;
    }
    if (!body.costPrice) {
        res.status(400).send({message: PRODUCT_STOCKS_STRINGS.COST_PRICE_NULL});
        return false;
    }
    return true
}

module.exports = {
    createProductStock,
    getProductStocks,
    getProductStockByID,
    updateProductStock,
}