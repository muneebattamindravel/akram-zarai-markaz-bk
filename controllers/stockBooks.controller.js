const stockbooksModel = require('../models/stockBooks.model');
const productsModel = require('../models/products.model');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');

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

// const conslidateStockBooksForAll = async (req, res) => {
//     try {
//         let allProducts = await productsModel.getAll();
        
//         await Promise.all(allProducts.map(async (product) => {
//             console.log(product.id)
//             await consolidateStockBookWorker(product.id)
//         }));

//         console.log("Products Length = " + allProducts.length)
//         res.send('Success');
//     }
//     catch (err) {
//         console.log(err)
//         res.status(500).send({raw: err.message.toString(), message: 'Error Consolidating Stock Book For All Products', stack: err.stack})
//     }
// }

const conslidateStockBooksForAll = async (req, res) => {
  try {
    const allProducts = await productsModel.getAll();

    const concurrency = 5;
    let idx = 0;

    let ok = 0;
    let failed = 0;
    const errors = [];

    async function worker() {
      while (idx < allProducts.length) {
        const currentIndex = idx++;
        const product = allProducts[currentIndex];

        try {
          console.log("Consolidating productId:", product.id);
          await consolidateStockBookWorker(product.id);
          ok++;
        } catch (e) {
          failed++;
          errors.push({ id: product.id, error: e.message || String(e) });
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));

    return res.send({
      message: "Done",
      scope: "stockBooks",
      total: allProducts.length,
      ok,
      failed,
      errors,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error Consolidating Stock Book For All Products",
      scope: "stockBooks",
      total: 0,
      ok: 0,
      failed: 0,
      errors: [{ id: -1, error: err.message || String(err) }],
    });
  }
};


const consolidateStockBookWorker = async(productId) => {
    const where = {"productId": productId}
    const include = []
    const stockBookTransactions = await stockbooksModel.getAll(where, include);
    if (stockBookTransactions.length > 0) {
        let closingBalance = stockBookTransactions[0].amount;
        const updateBody = {
            'closing': closingBalance
        }
        await stockbooksModel.update(updateBody, stockBookTransactions[0].id);

        stockBookTransactions.shift();
        await Promise.all(stockBookTransactions.map(async (stockBookTransaction) => {
            closingBalance = closingBalance + stockBookTransaction.amount;
            const updateBody = {
                'closing': closingBalance
            }
            await stockbooksModel.update(updateBody, stockBookTransaction.id);
        }));
    }

    return stockBookTransactions;
}



const checkAllFaultyDates = async (req, res) => {
    try {
        let finalLog = "Dates Check Data";

        const referenceDate = new Date(req.params.date)


        finalLog += await CheckDates(referenceDate, "accounts", "createdDate")
        finalLog += await CheckDates(referenceDate, "accounttransactions", "transactionDate")
        finalLog += await CheckDates(referenceDate, "bookings", "bookingDate")
        finalLog += await CheckDates(referenceDate, "expenses", "date")
        finalLog += await CheckDates(referenceDate, "incentives", "bookingDate")
        finalLog += await CheckDates(referenceDate, "loans", "bookingDate")
        finalLog += await CheckDates(referenceDate, "purchases", "invoiceDate")
        finalLog += await CheckDates(referenceDate, "recoveries", "date")
        finalLog += await CheckDates(referenceDate, "sales", "saleDate")
        finalLog += await CheckDates(referenceDate, "salepayments", "receivedDate")
        finalLog += await CheckDates(referenceDate, "saleprofits", "date")
        finalLog += await CheckDates(referenceDate, "stockbooks", "date")
        finalLog += await CheckDates(referenceDate, "transfers", "date")
        
        console.log(finalLog)
        res.send(finalLog);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Error Consolidating Stock Book For All Products', stack: err.stack})
    }
}

async function CheckDates(referenceDate, tableName, propertyName) {
    let log = "\n------------------------\n"
    log += "checking " + tableName + "\n"
    const path = "../models/" + tableName + ".model";
    const model = require(path);
    const list = await model.getAllAdmin();
    await Promise.all(list.map(async (item) => {
        const dateToCheck = new Date(getPropertyValue(item, propertyName));
        if (dateToCheck >= referenceDate)
            log += "\nIssue in " + tableName + " id ("+item.id+") date ("+dateToCheck+")"
    }));

    return log
}

function getPropertyValue(obj, propName) {
    if (obj.dataValues.hasOwnProperty(propName)) {
      return obj.dataValues[propName];
    } else {
      return undefined;
    }
  }

const checkAllFaultyProductStocks = async (req, res) => {
    try {
        let reply = ''

        const allProducts = await productsModel.getAll()

        await Promise.all(allProducts.map(async (_product) => {

            let totalStock = 0.0;
            _product.productstocks.map((_productStock) => {
                totalStock += _productStock.quantity
            })
            
            const lastStockBookEntry = await stockbooksModel.getLastTransaction(_product.id);
            if (lastStockBookEntry) {
                if (totalStock != lastStockBookEntry.closing)
                    reply += `\nProduct (${_product.id}) totalStock = ${totalStock}, lastStockBookEntry ${lastStockBookEntry.closing}`;
            }
        }));

        res.send(reply);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: 'Error Consolidating Stock Book For All Products', stack: err.stack})
    }
}

module.exports = {
    addstockbookEntry,
    getstockbook,
    consolidatestockbook,
    consolidateStockBookWorker,
    conslidateStockBooksForAll,
    checkAllFaultyDates,
    checkAllFaultyProductStocks
}