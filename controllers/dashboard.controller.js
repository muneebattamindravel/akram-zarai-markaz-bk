const salesController = require('./sales.controller');
const profitsController = require('./profits.controller');
const accountsController = require('./accounts.controller');
const productStocksModel = require('../models/productStocks.model');

const getTopBarData = async (req, res) => {
    try {
        const todaySale = await salesController.getCounterSaleAmountWorker(req.query.from, req.query.to);
        const todayProfit = await profitsController.getCounterSaleProfitAmountWorker(req.query.from, req.query.to);
        const cashAmount = await accountsController.getDefaultAccountBalanceWorker();
        let topBarData = {
            "todaySale": todaySale.amount,
            "todayProfit": todayProfit.amount,
            "totalCash": cashAmount.amount
        }
        res.send(topBarData);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Fetching Top Bar Data", stack: err.stack})
    }
}

const getBusinessReport = async (req, res) => {
    try {
        let accounts = await accountsController.getAllAccountsWorker();
        let totalCashAmount = 0.00;
        let amountInCompanies = 0.00;
        let customerLoansAmount = 0.00;
        let totalCapitalAmount = 0.00;

        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].type === "Cash" || accounts[i].type === "Online") 
                totalCashAmount += parseFloat(accounts[i].dataValues.balance);
            else if (accounts[i].type === "Company") 
                amountInCompanies += parseFloat(accounts[i].dataValues.balance);
            else if (accounts[i].type === "Customer") 
                customerLoansAmount += parseFloat(accounts[i].dataValues.balance);
            else if (accounts[i].type === "Partner") 
                totalCapitalAmount += parseFloat(accounts[i].dataValues.balance);
        }
    
        const productStocks = await productStocksModel.getAll({}, []);
        let totalStockAmount = 0;
        for (let i = 0; i < productStocks.length; i++) {
            totalStockAmount += (productStocks[i].costPrice * productStocks[i].quantity);
        }

        let businessReport = {
            "totalCashAmount": totalCashAmount,
            "amountInCompanies": amountInCompanies,
            "customerLoansAmount": customerLoansAmount,
            "totalStockAmount": totalStockAmount,
            "totalCapitalAmount": totalCapitalAmount
        }
        
        res.send(businessReport);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Fetching Business Report", stack: err.stack})
    }
}

const getTopLoans = async (req, res) => {
    try {
        let accounts = await accountsController.getAllAccountsWorker();
        accounts = accounts.filter(CustomerFilter);
        res.send(accounts);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "Error Fetching Business Report", stack: err.stack})
    }
}

function CustomerFilter(account) {
    return account.type === "Customer"
}

module.exports = {
    getTopBarData,
    getBusinessReport,
    getTopLoans
}