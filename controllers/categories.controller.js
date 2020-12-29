const CATEGORIES_STRINGS = require('../constants/categories.strings');
const Categories = require('../models/categories.model');
const { Op } = require("sequelize");

/**creates a new category */
const createCategory = async (req, res) => {
    try {
        if (!IsCategoryBodyValid(req.body, res))
            return;
        const result = await Categories.exists({name: req.body.name})
        if (result) {
            res.status(406).send({message: CATEGORIES_STRINGS.DUPLICATE_CATEGORY_NAME})
            return;
        }
        const category = await Categories.create({
            name: req.body.name,
            description: req.body.description,
        })
        res.send(category);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: CATEGORIES_STRINGS.ERROR_CREATING_CATEGORY, stack: err.stack})
    }
}

/**update a category by id*/
const updateCategory = async (req, res) => {
    try {
        if (!IsCategoryBodyValid(req.body, res))
            return;
        const result = await Categories.exists({name: req.body.name, id: {[Op.not]: req.params.id}})
        if (result) {
            res.status(406).send({message: CATEGORIES_STRINGS.DUPLICATE_CATEGORY_NAME})
            return;
        }
        await Categories.update(req.body,req.params.id) ? 
        res.send({message: CATEGORIES_STRINGS.CATEGORY_UPDATED_SUCCESSFULLY}) : 
        res.status(406).send({message: `${CATEGORIES_STRINGS.ERROR_UPDATING_CATEGORY}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: CATEGORIES_STRINGS.ERROR_UPDATING_CATEGORY, stack: err.stack})
    }
}

/** get a category with id */
const getCategory = async (req, res) => {
    try {
        const category = await Categories.getByID(req.params.id)
        category? res.send(category) : res.status(404).send({message: `${CATEGORIES_STRINGS.CATEGORY_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: CATEGORIES_STRINGS.ERROR_GETTING_CATEGORY, stack: err.stack})
    }
}

/** get all categories */
const getAllCategories = async (req, res) => {
    try {
        res.send(await Categories.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: CATEGORIES_STRINGS.ERROR_GETTING_CATEGORIES, stack: err.stack})
    }
}

/** delete category by id */
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await Categories.deleteById(req.params.id) ? res.send({message: CATEGORIES_STRINGS.CATEGORY_DELETED}) : res.status(406).send({message: `${CATEGORIES_STRINGS.CATEGORY_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: CATEGORIES_STRINGS.CATEGORY_NOT_DELETED, stack: err.stack})
    }
}

const IsCategoryBodyValid = (body, res) => {
    if (!body.name) {
        res.status(406).send({message: CATEGORIES_STRINGS.CATEGORY_NAME_NULL});
        return false;
    }
    return true
}

module.exports = {
    createCategory,
    updateCategory,
    getCategory,
    getAllCategories,
    deleteCategory,
}