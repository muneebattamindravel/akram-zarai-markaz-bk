const COMPANIES_STRINGS = require('../constants/companies.strings');
const Companies = require('../models/companies.model');
const { Op } = require("sequelize");

/**creates a new company */
const createCompany = async (req, res) => {
    try {
        if (!IsCompanyBodyValid(req.body, res))
            return;
        const result = await Companies.exists({name: req.body.name})
        if (result) {
            res.status(400).send({message: COMPANIES_STRINGS.DUPLICATE_COMPANY_NAME})
            return;
        }
        const company = await Companies.create({
            name: req.body.name,
            description: req.body.description,
        })
        res.send(company);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_CREATING_COMPANY, stack: err.stack})
    }
}

/**update a company by id*/
const updateCompany = async (req, res) => {
    try {
        if (!IsCompanyBodyValid(req.body, res))
            return;
        const result = await Companies.exists({name: req.body.name, id: {[Op.not]: req.params.id}})
        if (result) {
            res.status(400).send({message: COMPANIES_STRINGS.DUPLICATE_COMPANY_NAME})
            return;
        }    
        await Companies.update(req.body,req.params.id) ? 
        res.send({message: COMPANIES_STRINGS.COMPANY_UPDATED_SUCCESSFULLY}) : 
        res.status(400).send({message: `${COMPANIES_STRINGS.ERROR_UPDATING_COMPANY}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_UPDATING_COMPANY, stack: err.stack})
    }
}

/** get a company with id */
const getCompany = async (req, res) => {
    try {
        const company = await Companies.getByID(req.params.id)
        company? res.send(company) : res.status(404).send({message: `${COMPANIES_STRINGS.COMPANY_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_GETTING_COMPANY, stack: err.stack})
    }
}

/** get all companies */
const getAllCompanies = async (req, res) => {
    try {
        res.send(await Companies.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_GETTING_COMPANIES, stack: err.stack})
    }
}

/** delete company by id */
const deleteCompany = async (req, res) => {
    try {
        const id = req.params.id;
        await Companies.deleteById(req.params.id) ? res.send({message: COMPANIES_STRINGS.COMPANY_DELETED}) : res.status(400).send({message: `${COMPANIES_STRINGS.COMPANY_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: COMPANIES_STRINGS.COMPANY_NOT_DELETED, stack: err.stack})
    }
}

const IsCompanyBodyValid = (body, res) => {
    if (!body.name) {
        res.status(400).send({message: COMPANIES_STRINGS.COMPANY_NAME_NULL});
        return false;
    }
    return true
}

module.exports = {
    createCompany,
    updateCompany,
    getCompany,
    getAllCompanies,
    deleteCompany,
}