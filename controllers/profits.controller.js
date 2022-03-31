const SaleProfits = require('../models/saleProfits.model');

const getCounterSaleProfitAmount = async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;

        let profit = await SaleProfits.getCounterSalesProfit(from, to);
        profit = profit[0];
        if (profit.amount == null) 
            profit.amount = 0.00;

        let returnObject = {
            amount: profit.amount,
            from: from,
            to: to,
        }

        res.send(returnObject);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}

const getSaleProfits = async (req, res) => {
    try {
        res.send(await SaleProfits.getSaleProfits(req.query.from, req.query.to));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}

module.exports = {
    getSaleProfits,
    getCounterSaleProfitAmount,
}