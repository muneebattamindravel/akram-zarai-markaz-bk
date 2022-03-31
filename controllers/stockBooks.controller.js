const stockBooksModel = require('../models/stockBooks.model');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');

/**creates a new stock book entry */
const addStockBookEntry = async (date, bookNumber, billNumber, invoiceNumber, amount, type, notes, productId, referenceId) => {
    try {

        let lastTransaction = await stockBooksModel.getLastTransaction(productId);
        if (lastTransaction) {
            await stockBooksModel.create({
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
            await stockBooksModel.create({
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

/** get stockBook by productId */
const getStockBook = async (req, res) => {
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

        const stockBook = await stockBooksModel.getAll(
            where, []
        );

        res.send(stockBook);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: STOCK_BOOKS_STRINGS.ERROR_GETTING_STOCK_BOOK, stack: err.stack})
    }
}

module.exports = {
    addStockBookEntry,
    getStockBook
}