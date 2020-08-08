const UNITS_STRINGS = require('../constants/units.strings');
const Units = require('../models/units.model');
const { Op } = require("sequelize");

/**creates a new unit */
const createUnit = async (req, res) => {
    try {
        if (!IsUnitBodyValid(req.body, res))
            return;
        const result = await Units.exists({name: req.body.name})
        if (result) {
            res.status(400).send({message: UNITS_STRINGS.DUPLICATE_UNIT_NAME})
            return;
        }
        const unit = await Units.create({
            name: req.body.name,
            description: req.body.description,
        })
        res.send(unit);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: UNITS_STRINGS.ERROR_CREATING_UNIT, stack: err.stack})
    }
}

/**update a unit by id*/
const updateUnit = async (req, res) => {
    try {
        if (!IsUnitBodyValid(req.body, res))
            return;
        const result = await Units.exists({name: req.body.name, id: {[Op.not]: req.params.id}})
        if (result) {
            res.status(400).send({message: UNITS_STRINGS.DUPLICATE_UNIT_NAME})
            return;
        }
        await Units.update(req.body,req.params.id) ? 
        res.send({message: UNITS_STRINGS.UNIT_UPDATED_SUCCESSFULLY}) : 
        res.status(400).send({message: `${UNITS_STRINGS.ERROR_UPDATING_UNIT}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: UNITS_STRINGS.ERROR_UPDATING_UNIT, stack: err.stack})
    }
}

/** get a unit with id */
const getUnit = async (req, res) => {
    try {
        const unit = await Units.getByID(req.params.id)
        unit? res.send(unit) : res.status(404).send({message: `${UNITS_STRINGS.UNIT_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: UNITS_STRINGS.ERROR_GETTING_UNIT, stack: err.stack})
    }
}

/** get all units */
const getAllUnits = async (req, res) => {
    try {
        res.send(await Units.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: UNITS_STRINGS.ERROR_GETTING_UNITS, stack: err.stack})
    }
}

/** delete unit by id */
const deleteUnit = async (req, res) => {
    try {
        const id = req.params.id;
        await Units.deleteById(req.params.id) ? res.send({message: UNITS_STRINGS.UNIT_DELETED}) : res.status(400).send({message: `${UNITS_STRINGS.UNIT_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: UNITS_STRINGS.UNIT_NOT_DELETED, stack: err.stack})
    }
}

const IsUnitBodyValid = (body, res) => {
    if (!body.name) {
        res.status(400).send({message: UNITS_STRINGS.UNIT_NAME_NULL});
        return false;
    }
    return true
}

module.exports = {
    createUnit,
    updateUnit,
    getUnit,
    getAllUnits,
    deleteUnit,
}