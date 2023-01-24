const PRODUCTS_STRINGS = require('../constants/products.strings');
const APP_STRINGS = require('../constants/app.strings');
const Products = require('../models/products.model');
const stockBooksModel = require('../models/stockBooks.model');
const imagesController = require('../controllers/images.controller');

/**creates a new product */
const createProduct = async (req, res) => {
    try {
        if (!IsProductBodyValid(req.body, res))
            return;
        const product = await Products.create({
            name: req.body.name,
            description: req.body.description,
            alertQuantity: req.body.alertQuantity == '' ? 5 : req.body.alertQuantity,
            imageURL: req.body.imageURL,
            salePrice: req.body.salePrice == '' ? 0.00 : req.body.salePrice,
            currentStock: 0.00,
            companyId: req.body.companyId,
            unitId: req.body.unitId,
            categoryId: req.body.categoryId,
        })
        res.send(product);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_CREATING_PRODUCT, stack: err.stack})
    }
}

/**update a product by id*/
const updateProduct = async (req, res) => {
    try {
        if (!IsProductBodyValid(req.body, res))
            return;
        await Products.update(req.body,req.params.id) ? 
        res.send({message: PRODUCTS_STRINGS.PRODUCT_UPDATED_SUCCESSFULLY}) : 
        res.send({error: `${PRODUCTS_STRINGS.ERROR_UPDATING_PRODUCT}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_UPDATING_PRODUCT, stack: err.stack})
    }
}

/** get a product with id */
const getProduct = async (req, res) => {
    try {
        const product = await Products.getByID(req.params.id)
        product? res.send(product) : res.send({error: PRODUCTS_STRINGS.PRODUCT_NOT_FOUND, message: `${PRODUCTS_STRINGS.PRODUCT_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCT, stack: err.stack})
    }
}

const getproducttocks = async (req, res) => {
    try {
        const product = await Products.getByID(req.params.id)
        product? res.send(product) : res.send({error: PRODUCTS_STRINGS.PRODUCT_NOT_FOUND, message: `${PRODUCTS_STRINGS.PRODUCT_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCT, stack: err.stack})
    }
}

/** get product current lot number with id */
const getNextLotNumber = async (id) => {
    try {
        product = await Products.getByID(id)
        const nextLotNumber = product.nextLotNumber
        await Products.update({nextLotNumber: (nextLotNumber + 1)}, id)
        return nextLotNumber
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCT, stack: err.stack})
    }
}

/** get all products */
const getAllProducts = async (req, res) => {
    try {
        const allProducts = await Products.getAll()

        // await Promise.all(allProducts.map(async (prod) => {
        //     currentStock = await stockBooksModel.getCurrentStock(prod.id);
        //     prod.setDataValue('currentStock', currentStock);
        // }));

        res.send(allProducts)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCTS, stack: err.stack})
    }
}

/** delete product by id */
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        product = await Products.getByID(req.params.id)
        deleteSuccess = await Products.deleteById(req.params.id)
        if (deleteSuccess) {
            await imagesController.deleteImageInternal(`./images/${APP_STRINGS.PRODUCTS_LC}-${product.id}-${product.imageURL}`)
            res.send({message: PRODUCTS_STRINGS.PRODUCT_DELETED})
        } else {
            res.send({error: `${PRODUCTS_STRINGS.PRODUCT_NOT_DELETED}, id=${req.params.id}`})
        } 
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: PRODUCTS_STRINGS.PRODUCT_NOT_DELETED, stack: err.stack})
    }
}

const IsProductBodyValid = (body, res) => {
    if (!body.name) {
        res.status(406).send({message: PRODUCTS_STRINGS.PRODUCT_NAME_NULL});
        return false;
    }
    if (!body.companyId) {
        res.status(406).send({message: PRODUCTS_STRINGS.PRODUCT_COMPANYID_NULL});
        return false;
    }
    if (!body.unitId) {
        res.status(406).send({message: PRODUCTS_STRINGS.PRODUCT_UNITID_NULL});
        return false;
    }
    if (!body.categoryId) {
        res.status(406).send({message: PRODUCTS_STRINGS.PRODUCT_CATEGORYID_NULL});
        return false;
    }
    return true
}

module.exports = {
    createProduct,
    updateProduct,
    getProduct,
    getAllProducts,
    deleteProduct,
    getNextLotNumber,
}