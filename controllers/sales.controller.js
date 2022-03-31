const SALES_STRINGS = require('../constants/sales.strings');
const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const Sales = require('../models/sales.model');
const SalePayments = require('../models/salePayments.model');
const Products = require('../models/products.model');
const ProductStocks = require('../models/productStocks.model');
const SaleItems = require('../models/saleItems.model');
const SaleProfits = require('../models/saleProfits.model');
const Accounts = require('../models/accounts.model');
const Contacts = require('../models/contacts.model');
const AccountTransactions = require('../controllers/accountTransactions.controller');
const AccountTransactionsModel = require('../models/accountTransactions.model');
const stockBooksController = require('../controllers/stockBooks.controller');
const stockBooksModel = require('../models/stockBooks.model');

/**creates a new sale */
const createSale = async (req, res) => {
    try {
        let saleDate = new Date(req.body.saleDate);

        const createdSale = await Sales.create({
            totalAmount: req.body.totalAmount,
            discount: req.body.discount,
            saleDate: saleDate,
            bookNumber: req.body.bookNumber,
            billNumber: req.body.billNumber,
            contactId: req.body.contactId == 0 ? null : req.body.contactId,
        })

        const defaultAccount = await Accounts.getDefaultAccount();

        await SalePayments.create({
            receivedAmount: req.body.salePayment.receivedAmount,
            receivedDate: req.body.salePayment.receivedDate,
            paymentType: req.body.salePayment.paymentType,
            bookNumber: req.body.bookNumber,
            billNumber: req.body.billNumber,
            saleId: createdSale.id,
            accountId: req.body.salePayment.accountId == 0 ? defaultAccount.id : req.body.salePayment.accountId,
        });

        if (createdSale.contactId != null) {
            const where = {type: "Customer", referenceId: createdSale.contactId}
            const include = []
            const cutomerAccount = (await Accounts.getAll(where, include))[0];

            await AccountTransactions.createAccountTransaction(
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

            await AccountTransactions.createAccountTransaction(
                saleDate,
                (req.body.salePayment.receivedAmount * -1), 
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

        if (req.body.salePayment.paymentType == 0) {
            await AccountTransactions.createAccountTransaction(
                saleDate,
                req.body.salePayment.receivedAmount, 
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
        else if (req.body.salePayment.paymentType == 1) {
            await AccountTransactions.createAccountTransaction(
                saleDate,
                req.body.salePayment.receivedAmount, 
                ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT, 
                "",
                req.body.salePayment.accountId,
                createdSale.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );
        }

        for (let i = 0; i < req.body.saleItems.length; i++) {
            let saleItem = req.body.saleItems[i];
            // Get The Product
            const product = await Products.getByID(saleItem.product.id);

            //entry into the stock books
            await stockBooksController.
                addStockBookEntry
                (saleDate, req.body.bookNumber, req.body.billNumber, "", saleItem.quantity * -1, 
                STOCK_BOOKS_STRINGS.TYPE.SALE, "", product.id, createdSale.id);

            // Create Sale Item
            const saleItemCreated = await SaleItems.create({
                salePrice: saleItem.salePrice,
                quantity: saleItem.quantity,
                productId: product.id, 
                saleId: createdSale.id,
            });

            var quantityRemaining = saleItem.quantity;
            var lotsUsed = [];
            // Loop Through the Stocks and Post Profits
            for (let j = 0; j < product.productStocks.length; j++) {

                let productStock = product.productStocks[j];
                if (productStock.quantity > 0 && quantityRemaining > 0) {
                    //Case 1 - Existing Stock >= To Sold Stock
                    if (productStock.quantity >= quantityRemaining) {
                        let stockAmountUsed = quantityRemaining;
                        productStock.quantity -= stockAmountUsed;
                        quantityRemaining = 0;
                        lotsUsed.push({lotNumber: productStock.lotNumber, quantity: stockAmountUsed})
                        
                        await ProductStocks.update({
                            quantity: productStock.quantity,
                        }, productStock.id);
    
                        // Profit Calculation
                        let costPriceTotal = productStock.costPrice * stockAmountUsed;
                        let salePriceTotal = saleItem.salePrice * stockAmountUsed;
                        let profit = salePriceTotal - costPriceTotal;
    
                        await SaleProfits.create({
                            amount: profit,
                            date: saleDate,
                            saleId: createdSale.id,
                            saleItemId: saleItemCreated.id
                        })
                    }
                    //Case 2 - Existing Stock Doesn't Fulfil
                    else {
                        let stockAmountUsed = productStock.quantity;
                        quantityRemaining -= stockAmountUsed;
                        lotsUsed.push({lotNumber: productStock.lotNumber, quantity: stockAmountUsed})
                        productStock.quantity = 0;

                        await ProductStocks.update({
                            quantity: productStock.quantity,
                        }, productStock.id);
    
                        // Profit Calculation
                        let costPriceTotal = productStock.costPrice * stockAmountUsed;
                        let salePriceTotal = saleItem.salePrice * stockAmountUsed;
                        let profit = salePriceTotal - costPriceTotal;
    
                        await SaleProfits.create({
                            amount: profit,
                            date: saleDate,
                            saleId: createdSale.id,
                            saleItemId: saleItemCreated.id
                        })
                    }
                }
            }

            saleItemCreated.lotsUsedJson = JSON.stringify(lotsUsed);
            await SaleItems.update({lotsUsedJson: saleItemCreated.lotsUsedJson}, saleItemCreated.id);
        }
        
        res.send(createdSale);
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
        res.send(await getSaleObject(req.params.id, true))
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: COMPANIES_STRINGS.ERROR_GETTING_COMPANIES, stack: err.stack})
    }
}

const getSaleObject = async(saleId, isComplete = false) => {
    const sale = await Sales.getById(saleId);
    const totalProfit = await SaleProfits.getTotalProfitAmountBySaleId(sale.id);
    const salePaymentsAmount = await SalePayments.getTotalPaymentsReceivedAmount(sale.id);
    const contact = await Contacts.getByID(sale.contactId);

     var saleObject = {
        id : sale.id,
        totalAmount: sale.totalAmount,
        discount: sale.discount,
        saleDate: sale.saleDate,
        bookNumber: sale.bookNumber,
        billNumber: sale.billNumber,
        saleType: sale.saleType,
        createdAt: sale.createdAt,
        contactId: sale.contactId,
        contact: contact,
        profitAmount: totalProfit,
        receivedAmount: salePaymentsAmount[0].receivedAmount
    }

    if (isComplete) {
        const models = require('../models')
        const saleItems = await SaleItems.getAll(
            {saleId: saleId},
            [{model: models.products}]
        );
        const saleProfits = await SaleProfits.getAll({where: {saleId: saleId}});

        saleObject.saleItems = saleItems;
        saleObject.saleProfits = saleProfits;
    }

    return saleObject;
}

/** delete sale */
const deleteSale = async (req, res) => {
    try {
        //First Of All, Add Product Stocks Back
        sale = await getSaleObject(req.params.id, true);
        for (let i = 0; i < sale.saleItems.length; i++) {
            const saleItem = sale.saleItems[i];
            // Get The Product
            const product = await Products.getByID(saleItem.productId);
            // Loop Through The Lots Used JSON
            const lotsUsed = JSON.parse(saleItem.lotsUsedJson);
            for (let j = 0; j < lotsUsed.length; j++) {
                const lotUsed = lotsUsed[j];
                // Get The Particular ProductStock of the Product
                const productStock = await ProductStocks.get({productId: product.id, lotNumber: lotUsed.lotNumber})
                // Put the stock back into the relevant lot
                productStock.quantity = (lotUsed.quantity + productStock.quantity);
                // Update the stock quantity again
                await ProductStocks.update({quantity: productStock.quantity}, productStock.id)
            }
        }

        //Now delete from other tables
        await SalePayments.deleteSalePayments(req.params.id);
        await SaleProfits.deleteSaleProfits(req.params.id);
        await SaleItems.deleteSaleItems(req.params.id);
        await Sales.deleteById(req.params.id);
        //Delete the account transactions as well
        await AccountTransactionsModel.deleteByReference(sale.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE)
        await AccountTransactionsModel.deleteByReference(sale.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT)
        await stockBooksModel.deleteByReference(sale.id, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE)

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

        res.send(returnObject);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: "EXCEPTION", stack: err.stack})
    }
}

module.exports = {
    createSale,
    getAllSales,
    getSale,
    deleteSale,
    getCounterSaleAmount
}