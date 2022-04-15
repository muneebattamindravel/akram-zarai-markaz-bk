const stockbooksModel = require('../models/stockbooks.model');
const STOCK_BOOKS_STRINGS = require('../constants/stockbooks.strings');

/**creates a new stock book entry */
const addstockbookEntry = async (date, bookNumber, billNumber, invoiceNumber, amount, type, notes, productId, referenceId) => {
    try {

        let lastTransaction = await stockbooksModel.getLastTransaction(productId);
        if (lastTransaction) {
            await stockbooksModel.create({
                date: date,
                bookNumber: bookNumber,
                billNumber: billNumber,
                invoiceNumber: invoiceNumber,
                type: type,
                notes: notes,
                amount: amount,
                productId: productId,
                closing: (parseFloat(lastTransaction.closing) + parseFloat(amount)),
                referenceId: referenceId
            })
        }
        else {
            await stockbooksModel.create({
                date: date,
                bookNumber: bookNumber,
                billNumber: billNumber,
                invoiceNumber: invoiceNumber,
                type: type,
                notes: notes,
                amount: amount,
                productId: productId,
                closing: amount,
                referenceId: referenceId
            })
        }
    }
    catch (err) {
        console.log(err)
    }
}

/** get stockbook by productId */
const getstockbook = async (req, res) => {
    try {
        const { Op } = require("sequelize");
        const models = require('../models');

        const where = {
            "productId": req.params.id,
            "date" : {
                [Op.between]: [req.query.from, req.query.to]
            }
        }

        const include = [
            {
                model: models.products,
                include: [
                    {
                        model: models.companies
                    }
                ]
            }
        ] 

        res.send(await getstockbookWorker(where, include));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: STOCK_BOOKS_STRINGS.ERROR_GETTING_STOCK_BOOK, stack: err.stack})
    }
}

const getstockbookWorker = async(where, include) => {
    const stockbook = await stockbooksModel.getAll(
        where, include
    );

    return stockbook;
}

const consolidatestockbook = async(productId) => {
    const where = {
        "productId": productId,
    }
    const models = require('../models');

    const include = [
        {
            model: models.products,
            include: [
                {
                    model: models.companies
                }
            ]
        }
    ] 

    const stockbookTransactions = await getstockbookWorker(where, include)

    let closingBalance = stockbookTransactions[0].amount;
    stockbookTransactions.shift();
    await Promise.all(stockbookTransactions.map(async (stockbookTransaction) => {
        closingBalance = closingBalance + stockbookTransaction.amount;
        const updateBody = {
            'closing': closingBalance
        }
        await stockbooksModel.update(updateBody, stockbookTransaction.id);
    }));

    return stockbookTransactions;
}

module.exports = {
    addstockbookEntry,
    getstockbook,
    consolidatestockbook
}