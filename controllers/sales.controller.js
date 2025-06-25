const SALES_STRINGS = require('../constants/sales.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const Sales = require('../models/sales.model');
const salepayments = require('../models/salePayments.model');
const Products = require('../models/products.model');
const productstocks = require('../models/productStocks.model');
const saleitemsmodel = require('../models/saleItems.model');
const saleprofitsmodel = require('../models/saleProfits.model');
const Accounts = require('../models/accounts.model');
const Contacts = require('../models/contacts.model');
const accounttransactions = require('./accountTransactions.controller');
const accounttransactionsModel = require('../models/accountTransactions.model');
const stockbooksController = require('./stockBooks.controller');
const stockbooksModel = require('../models/stockBooks.model');
const accountsController = require('../controllers/accounts.controller');
const saleReturnsModel = require('../models/saleReturns.model');
const { Op } = require("sequelize");

/**creates a new sale */
const createSale = async (req, res) => {
    try {

        //first of all, double check that the total remaining stock is >= to the sold stock of each product in the saleItems
        let isAnythingWrong = false;
        for (let i = 0; i < req.body.saleitems.length; i++) {
            let saleitem = req.body.saleitems[i];
            // Get The Product
            const product = await Products.getByID(saleitem.product.id);

            let totalRemainingStockForProduct = 0;
            for (let j = 0; j < product.productstocks.length; j++) {
                let productstock = product.productstocks[j];
                totalRemainingStockForProduct += productstock.quantity;
            }

            if (totalRemainingStockForProduct < saleitem.quantity) {
                isAnythingWrong = true;
                break;
            }
        }

        if (isAnythingWrong) {
            res.status(500).send({raw: "ERROR", message: SALES_STRINGS.ERROR_CREATING_SALE, stack: ""})
            return;
        }

        if (!isAnythingWrong) {
            let saleDate = new Date(req.body.saleDate);

            const createdSale = await Sales.create({
                totalAmount: req.body.totalAmount,
                discount: req.body.discount,
                saleDate: saleDate,
                bookNumber: req.body.bookNumber,
                billNumber: req.body.billNumber,
                notes: req.body.notes,
                contactId: req.body.contactId == 0 ? null : req.body.contactId,
                returnApplied: req.body.returnApplied,
            })

            const defaultAccount = await Accounts.getDefaultAccount();

            await salepayments.create({
                receivedAmount: req.body.salepayment.receivedAmount,
                receivedDate: req.body.salepayment.receivedDate,
                paymentType: req.body.salepayment.paymentType,
                bookNumber: req.body.bookNumber,
                billNumber: req.body.billNumber,
                saleId: createdSale.id,
                accountId: req.body.salepayment.accountId == 0 ? defaultAccount.id : req.body.salepayment.accountId,
            });

            if (createdSale.contactId != null) {
                const where = {type: "Customer", referenceId: createdSale.contactId}
                const include = []
                const cutomerAccount = (await Accounts.getAll(where, include))[0];

                await accounttransactions.createaccounttransaction(
                    saleDate,
                    (req.body.totalAmount), 
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE,
                    "",
                    cutomerAccount.id,
                    createdSale.id,
                    req.body.bookNumber,
                    req.body.billNumber,
                    "",
                    ""
                );

                await accounttransactions.createaccounttransaction(
                    saleDate,
                    (req.body.salepayment.receivedAmount * -1), 
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT,
                    "",
                    cutomerAccount.id,
                    createdSale.id,
                    req.body.bookNumber,
                    req.body.billNumber,
                    "",
                    ""
                );
            }

            if (req.body.salepayment.paymentType == 0) {
                await accounttransactions.createaccounttransaction(
                    saleDate,
                    req.body.salepayment.receivedAmount, 
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT, 
                    "",
                    defaultAccount.id,
                    createdSale.id,
                    req.body.bookNumber,
                    req.body.billNumber,
                    "",
                    ""
                );
            }
            else if (req.body.salepayment.paymentType == 1) {
                await accounttransactions.createaccounttransaction(
                    saleDate,
                    req.body.salepayment.receivedAmount, 
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT, 
                    "",
                    req.body.salepayment.accountId,
                    createdSale.id,
                    req.body.bookNumber,
                    req.body.billNumber,
                    "",
                    ""
                );
            }

            for (let i = 0; i < req.body.saleitems.length; i++) {
                let saleitem = req.body.saleitems[i];
                // Get The Product
                const product = await Products.getByID(saleitem.product.id);

                //entry into the stock books
                await stockbooksController.
                    addstockbookEntry
                    (saleDate, req.body.bookNumber, req.body.billNumber, "", saleitem.quantity * -1, 
                    STOCK_BOOKS_STRINGS.TYPE.SALE, "", product.id, createdSale.id);

                // Create Sale Item
                const saleitemCreated = await saleitemsmodel.create({
                    salePrice: saleitem.salePrice,
                    quantity: saleitem.quantity,
                    productId: product.id, 
                    saleId: createdSale.id,
                });

                var quantityRemaining = saleitem.quantity;
                var lotsUsed = [];
                // Loop Through the Stocks and Post Profits
                for (let j = 0; j < product.productstocks.length; j++) {

                    let productstock = product.productstocks[j];
                    if (productstock.quantity > 0 && quantityRemaining > 0) {
                        //Case 1 - Existing Stock >= To Sold Stock
                        if (productstock.quantity >= quantityRemaining) {
                            let stockAmountUsed = quantityRemaining;
                            productstock.quantity -= stockAmountUsed;
                            quantityRemaining = 0;
                            lotsUsed.push({lotNumber: productstock.lotNumber, quantity: stockAmountUsed})
                            
                            await productstocks.update({
                                quantity: productstock.quantity,
                            }, productstock.id);
        
                            // Profit Calculation
                            let costPriceTotal = productstock.costPrice * stockAmountUsed;
                            let salePriceTotal = saleitem.salePrice * stockAmountUsed;
                            let profit = salePriceTotal - costPriceTotal;
        
                            await saleprofitsmodel.create({
                                amount: profit,
                                date: saleDate,
                                saleId: createdSale.id,
                                saleitemId: saleitemCreated.id
                            })
                        }
                        //Case 2 - Existing Stock Doesn't Fulfil
                        else {
                            let stockAmountUsed = productstock.quantity;
                            quantityRemaining -= stockAmountUsed;
                            lotsUsed.push({lotNumber: productstock.lotNumber, quantity: stockAmountUsed})
                            productstock.quantity = 0;

                            await productstocks.update({
                                quantity: productstock.quantity,
                            }, productstock.id);
        
                            // Profit Calculation
                            let costPriceTotal = productstock.costPrice * stockAmountUsed;
                            let salePriceTotal = saleitem.salePrice * stockAmountUsed;
                            let profit = salePriceTotal - costPriceTotal;
        
                            await saleprofitsmodel.create({
                                amount: profit,
                                date: saleDate,
                                saleId: createdSale.id,
                                saleitemId: saleitemCreated.id
                            })
                        }
                    }
                }

                saleitemCreated.lotsUsedJson = JSON.stringify(lotsUsed);
                await saleitemsmodel.update({lotsUsedJson: saleitemCreated.lotsUsedJson}, saleitemCreated.id);
            }
            
            res.send(createdSale);
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: SALES_STRINGS.ERROR_CREATING_SALE, stack: err.stack})
    }
}

/** get all sales */
const getAllSales = async (req, res) => {
    try {        
        var allSales = await Sales.getAll(req.query.from, req.query.to);
        var allSalesWithDetails = await Promise.all(
            allSales.map(async (sale) => {
                return await getSaleObject(sale.id, false);
            })
        )

        res.send(allSalesWithDetails)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: SALES_STRINGS.ERROR_GETTING_SALE, stack: err.stack})
    }
}

/** get sale */
const getSale = async (req, res) => {
    try {
        var saleObject = await getSaleObject(req.params.id, true);
        console.log(saleObject);
        res.send(saleObject)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: SALES_STRINGS.ERROR_GETTING_SALE, stack: err.stack})
    }
}

const getSaleObject = async(saleId, isComplete = false) => {
    const sale = await Sales.getById(saleId);
    const models = require('../models')
    const salePayments = await salepayments.getAll(
        {saleId: saleId},
        [{model: models.accounts}]
    );
    const totalProfit = await saleprofitsmodel.getTotalProfitAmountBySaleId(sale.id);
    const salepaymentsAmount = await salepayments.getTotalPaymentsReceivedAmount(sale.id);
    const contact = await Contacts.getByID(sale.contactId);

    const saleReturns = await saleReturnsModel.getBySaleId(saleId);

     var saleObject = {
        id : sale.id,
        totalAmount: sale.totalAmount,
        discount: sale.discount,
        saleDate: sale.saleDate,
        bookNumber: sale.bookNumber,
        billNumber: sale.billNumber,
        notes: sale.notes,
        returnApplied: sale.returnApplied,
        saleType: sale.saleType,
        createdAt: sale.createdAt,
        contactId: sale.contactId,
        contact: contact,
        profitAmount: totalProfit,
        receivedAmount: salepaymentsAmount[0].receivedAmount,
        salePayment: salePayments[0],
        salePayments: salePayments,
        saleReturns: saleReturns
    }

    if (isComplete) {
        const saleitems = await saleitemsmodel.getAll(
            {saleId: saleId},
            [{model: models.products}]
        );
        const saleprofits = await saleprofitsmodel.getAll({where: {saleId: saleId}});

        saleObject.saleitems = saleitems;
        saleObject.saleprofits = saleprofits;
    }

    return saleObject;
}

/** delete sale */
const deleteSale = async (req, res) => {
    try {

        let productIds = [];

        //First Of All, Add Product Stocks Back
        sale = await getSaleObject(req.params.id, true);
        for (let i = 0; i < sale.saleitems.length; i++) {
            const saleitem = sale.saleitems[i];
            // Get The Product
            const product = await Products.getByID(saleitem.productId);
            // Loop Through The Lots Used JSON
            const lotsUsed = JSON.parse(saleitem.lotsUsedJson);
            for (let j = 0; j < lotsUsed.length; j++) {
                const lotUsed = lotsUsed[j];
                // Get The Particular productstock of the Product
                const productstock = await productstocks.get({productId: product.id, lotNumber: lotUsed.lotNumber})
                // Put the stock back into the relevant lot
                productstock.quantity = (lotUsed.quantity + productstock.quantity);
                // Update the stock quantity again
                await productstocks.update({quantity: productstock.quantity}, productstock.id)
            }

            productIds.push(product.id);   
        }

        //Now delete from other tables
        await saleReturnsModel.DeleteSaleReturns(req.params.id);
        await salepayments.deletesalepayments(req.params.id);
        await saleprofitsmodel.deletesaleprofits(req.params.id);
        await saleitemsmodel.deletesaleitems(req.params.id);
        await Sales.deleteById(req.params.id);
        //Delete the account transactions as well
        await accounttransactionsModel.deleteByReference(sale.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE)
        await accounttransactionsModel.deleteByReference(sale.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT)
        await stockbooksModel.deleteByReference(sale.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE)

        const defaultAccount = await Accounts.getDefaultAccount();
        await accountsController.consolidateAccountStatementWorker(defaultAccount.id)
        if (sale.contact != null) {
            await accountsController.consolidateAccountStatementWorker(sale.contact.accountId);
        }

        await Promise.all(productIds.map(async (prId) => {
            await stockbooksController.consolidateStockBookWorker(prId);
        }));
        
        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: SALES_STRINGS.ERROR_GETTING_SALE, stack: err.stack})
    }
}

const getCounterSaleAmount = async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        res.send(await getCounterSaleAmountWorker(from, to));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}

const getCounterSaleAmountWorker = async(from, to) => {
    try {
        let sale = await Sales.getCounterSalesAmount(from, to);
        sale = sale[0];

        let returnAmount = sale.dataValues.amount;
        if (returnAmount == null) 
            returnAmount = 0.00;

        let returnObject = {
            amount: returnAmount,
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

const searchSales = async (req, res) => {
    try {
        const query = {};

        if (req.query.bookNumber) {
            query.bookNumber = { [Op.like]: `%${req.query.bookNumber.trim()}%` };
        }

        if (req.query.billNumber) {
            query.billNumber = { [Op.like]: `%${req.query.billNumber.trim()}%` };
        }

        if (req.query.totalAmount && !isNaN(req.query.totalAmount)) {
            query.totalAmount = parseFloat(req.query.totalAmount);
        }

        if (req.query.saleDate) {
            query.saleDate = req.query.saleDate;
        }

        console.log("*** On Server, Search Query =", query);

        // ✅ Just pass query, NOT { where: query }
        const sales = await Sales.search(query);

        const result = await Promise.all(
            sales.map(async sale => {
                const obj = await getSaleObject(sale.id, false);
                return obj || sale;
            })
        );

        res.send(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).send({
            raw: err.message.toString(),
            message: "ERROR_SEARCHING_SALES",
            stack: err.stack
        });
    }
};



module.exports = {
    createSale,
    getAllSales,
    getSale,
    deleteSale,
    getCounterSaleAmount,
    getCounterSaleAmountWorker,
    getSaleObject,
    searchSales
}