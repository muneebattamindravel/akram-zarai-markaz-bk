const COMPANIES_STRINGS = require('../constants/companies.strings');
const Companies = require('../models/companies.model');
const Accounts = require('../models/accounts.model');
const AccountsController = require('../controllers/accounts.controller');
const { Op } = require("sequelize");
const accounttransactionsController = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');

/**creates a new company */
const createCompany = async (req, res) => {
    try {
        if (!IsCompanyBodyValid(req.body, res))
            return;
        const result = await Companies.exists({name: req.body.name})
        if (result) {
            res.status(406).send({message: COMPANIES_STRINGS.DUPLICATE_COMPANY_NAME})
            return;
        }
        const createdCompany = await Companies.create({
            name: req.body.name,
            description: req.body.description,
            number: req.body.number,
        })

        const createdAccount = await AccountsController.createAccountDBMigration(new Date(), req.body.name + " Account", "", "Company", req.body.openingBalance, createdCompany.id, "","", false); 

        updatedCompanyObject = {
            accountId: createdAccount.id
        }

        await Companies.update(updatedCompanyObject, createdCompany.id)
        res.send(createdCompany);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_CREATING_COMPANY, stack: err.stack})
    }
}

/**creates a new company for DB Migration*/
const createCompanyDBMigration = async (name, description, number) => {
    try {
        const result = await Companies.exists({name: name})
        if (result) {
            res.status(406).send({message: COMPANIES_STRINGS.DUPLICATE_COMPANY_NAME})
            return;
        }
        let createdCompany = await Companies.create({
            name: name,
            description: description,
            number: number,
        })

        const createdAccount = await AccountsController.createAccountDBMigration(new Date("01-01-2022"), name + " Account", "", "Company", 0.00, createdCompany.id, "","", false); 

        updatedCompanyObject = {
            accountId: createdAccount.id
        }

        await Companies.update(updatedCompanyObject, createdCompany.id)
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
            res.status(406).send({message: COMPANIES_STRINGS.DUPLICATE_COMPANY_NAME})
            return;
        }

        let updatedAccountObject = {
            name: req.body.name + " Account"
        }
        await Accounts.update(updatedAccountObject, req.body.accountId)

        const updated = await Companies.update(req.body,req.params.id)
        if (updated) {
            await accounttransactionsController.updateOpeningBalance(req.body.accountId, req.body.openingBalance);
            res.send({message: COMPANIES_STRINGS.COMPANY_UPDATED_SUCCESSFULLY})
        }
        else {
            res.status(406).send({message: `${COMPANIES_STRINGS.ERROR_UPDATING_COMPANY}, id=${req.params.id}`})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_UPDATING_COMPANY, stack: err.stack})
    }
}

/** get a company with id */
const getCompany = async (req, res) => {
    try {
        let company = await Companies.getByID(req.params.id)
        if (company) {
            let opening = (await accounttransactionsModel.getFirstTransaction(company.accountId)).amount;
            company.setDataValue("openingBalance", opening);

            res.send(company)
        }
        else {
            res.status(404).send({message: `${COMPANIES_STRINGS.COMPANY_NOT_FOUND} ,id=${req.params.id}`})
        }
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
        await Companies.deleteById(req.params.id) ? res.send({message: COMPANIES_STRINGS.COMPANY_DELETED}) : res.status(406).send({message: `${COMPANIES_STRINGS.COMPANY_NOT_DELETED}, id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: COMPANIES_STRINGS.COMPANY_NOT_DELETED, stack: err.stack})
    }
}

const IsCompanyBodyValid = (body, res) => {
    if (!body.name) {
        res.status(406).send({message: COMPANIES_STRINGS.COMPANY_NAME_NULL});
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
    createCompanyDBMigration
}