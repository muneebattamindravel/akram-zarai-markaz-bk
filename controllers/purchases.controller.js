const PURCHASES_STRINGS = require('../constants/purchases.strings');
const Purchases = require('../models/purchases.model');
const ProductStocks = require('../models/productStocks.model');
const ProductsController = require('../controllers/products.controller');

/**creates a new purchase */
const createPurchase = async (req, res) => {
    try {
        if (!IsPurchaseBodyValid(req.body, res))
            return;
        const createdPurchase = await Purchases.create({
            contactId: req.body.contactId,
            invoiceDate: req.body.invoiceDate,
            invoiceNumber: req.body.invoiceNumber,
            imageURL: req.body.imageURL,
        })
        Promise.all(req.body.purchasedProductStocks.map(async (productStock) => {
            const productNextLotNumber = await ProductsController.getNextLotNumber(productStock.productId);
            console.log("Product Next Lot Number # "+productStock.productId+" Is = "+productNextLotNumber);
            ProductStocks.create({
                lotNumber: productNextLotNumber,
                batchNumber: productStock.batchNumber,
                expiryDate: productStock.expiryDate,
                costPrice: productStock.costPrice,
                quantity: productStock.initialQuantity,
                initialQuantity: productStock.initialQuantity,
                notes: productStock.notes,
                productId: productStock.productId,
                purchaseId: createdPurchase.id,
            })
        }));
        res.send(createdPurchase);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_CREATING_PRODUCT, stack: err.stack})
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
    if (body.purchasedProductStocks.length <= 0) {
        res.status(406).send({message: PURCHASES_STRINGS.PURCHASE_PRODUCT_STOCKS_EMPTY});
        return false;
    }
    return true
}

module.exports = {
    createPurchase,
}