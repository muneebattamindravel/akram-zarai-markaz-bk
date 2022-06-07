/**creates a new Incentive */
const accountsModel = require('../models/accounts.model');
const companiesModel = require('../models/companies.model');
const incentivesModel = require('../models/incentives.model');
const accountTransactionsController = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');
const accountsController = require('../controllers/accounts.controller');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');

const createIncentive = async (req, res) => {
    try {
        const createdIncentive = await incentivesModel.create({
            date: req.body.date,
            notes: req.body.notes,
            amount: req.body.amount,
            type: req.body.type,
            companyId: req.body.companyId
        });

        const where = {type: "Company", referenceId: req.body.companyId}
        const include = []
        const companyAccount = (await accountsModel.getAll(where, include))[0];

        await accountTransactionsController.createaccounttransaction(
            req.body.date,
            req.body.amount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.INCENTIVE,
            req.body.type,
            companyAccount.id,
            createdIncentive.id,
            "",
            "",
            "",
            ""
        );

        res.send(createdIncentive);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Create Incentives Error", stack: err.stack})
    }
}

/** get Incentives */
const getIncentives = async (req, res) => {
    try {        
        var allIncentives = await incentivesModel.getAll(req.query.from, req.query.to);
        res.send(allIncentives)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Get Incentives Error", stack: err.stack})
    }
}

/** get Incentive with id */
const getIncentive = async (req, res) => {
    try {
        let Incentive = await incentivesModel.getByID(req.params.id)
        if (Incentive) {
            res.send(Incentive)
        }
        else {
            res.status(404).send({message: 'Incentive Not Found'})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Incentives Error', stack: err.stack})
    }
}

/** delete Incentive */
const deleteIncentive = async (req, res) => {
    try {        
        const incentive = await incentivesModel.getByID(req.params.id)
        await incentivesModel.deleteById(incentive.id);
        let company = await companiesModel.getByID(incentive.companyId);

        await accounttransactionsModel.deleteByReference(incentive.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.INCENTIVE)
        await accountsController.consolidateAccountStatementWorker(company.accountId)

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Delete Incentive Error", stack: err.stack})
    }
}

module.exports = {
    createIncentive,
    getIncentives,
    getIncentive,
    deleteIncentive
}