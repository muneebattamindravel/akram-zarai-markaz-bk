const PRODUCTS_STRINGS = require('../constants/products.strings');
const APP_STRINGS = require('../constants/app.strings');
const Products = require('../models/products.model');
const imagesController = require('../controllers/images.controller');
const db = require("../models");
const { QueryTypes } = require("sequelize");

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
        const product = await Products.getByID(req.params.id);

        if (!product) {
            return res.send({
                error: PRODUCTS_STRINGS.PRODUCT_NOT_FOUND,
                message: `${PRODUCTS_STRINGS.PRODUCT_NOT_FOUND} ,id=${req.params.id}`
            });
        }

        const merged = await attachStockSummaryToProducts(product);
        return res.send(merged);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            error: err.message.toString(),
            message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCT,
            stack: err.stack
        });
    }
};


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
        const allProducts = await Products.getAll();
        const merged = await attachStockSummaryToProducts(allProducts);
        res.send(merged);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            error: err.message.toString(),
            message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCTS,
            stack: err.stack
        });
    }
};


/** get all products */
const getAllProductsByNameFilter = async (req, res) => {
    try {
        const allProducts = await Products.getAllByNameFilter(req.params.filter);
        const merged = await attachStockSummaryToProducts(allProducts);
        res.send(merged);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            error: err.message.toString(),
            message: PRODUCTS_STRINGS.ERROR_GETTING_PRODUCTS,
            stack: err.stack
        });
    }
};


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

async function attachStockSummaryToProducts(products) {
    // products can be a single Sequelize instance or array
    const list = Array.isArray(products) ? products : (products ? [products] : []);

    const ids = list
        .map(p => (p?.id ?? p?.dataValues?.id))
        .filter(id => id !== undefined && id !== null);

    if (ids.length === 0) {
        return Array.isArray(products) ? [] : null;
    }

    // NOTE:
    // - quantity: 3 decimals (you can change)
    // - amount: 3 decimals (or 2 if money)
    const summaries = await db.sequelize.query(
        `
        SELECT
            productId,
            ROUND(SUM(quantity), 3) AS currentStock,
            ROUND(SUM(quantity * costPrice), 3) AS currentStockAmount
        FROM productstocks
        WHERE productId IN (:ids)
        GROUP BY productId
        `,
        {
            replacements: { ids },
            type: QueryTypes.SELECT
        }
    );

    const map = {};
    for (const s of summaries) {
        map[s.productId] = {
            currentStock: Number(s.currentStock || 0),
            currentStockAmount: Number(s.currentStockAmount || 0),
        };
    }

    const merged = list.map(p => {
        const obj = p?.toJSON ? p.toJSON() : p;
        const extra = map[obj.id] || { currentStock: 0, currentStockAmount: 0 };
        return { ...obj, ...extra };
    });

    return Array.isArray(products) ? merged : merged[0];
}

module.exports = {
    createProduct,
    updateProduct,
    getProduct,
    getAllProducts,
    deleteProduct,
    getNextLotNumber,
    getAllProductsByNameFilter
}