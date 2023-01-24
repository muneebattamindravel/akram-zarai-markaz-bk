const saleprofits = require('../models/saleProfits.model');

const getCounterSaleProfitAmount = async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;

        res.send(await getCounterSaleProfitAmountWorker(from, to));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}
const getCounterSaleProfitAmountWorker = async (from, to) => {
    try {

        let profit = await saleprofits.getCounterSalesProfit(from, to);
        profit = profit[0];
        if (profit.amount == null) 
            profit.amount = 0.00;

        let returnObject = {
            amount: profit.amount,
            from: from,
            to: to,
        }

        return returnObject;
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}

const getsaleprofits = async (req, res) => {
    try {
        res.send(await saleprofits.getsaleprofits(req.query.from, req.query.to));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}

module.exports = {
    getsaleprofits,
    getCounterSaleProfitAmount,
    getCounterSaleProfitAmountWorker
}