const SALES_STRINGS = require('../constants/sales.strings');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const SalePayments = require('../models/salePayments.model');
const Accounts = require('../models/accounts.model');
const AccountTransactions = require('../controllers/accountTransactions.controller');
const Sales = require('../models/sales.model');

/**creates a new sale payment */
const createSalePayment = async (req, res) => {
    try {
        const defaultAccount = await Accounts.getDefaultAccount();

        const createdSalePayment = await SalePayments.create({
            receivedAmount: req.body.receivedAmount,
            receivedDate: req.body.receivedDate,
            paymentType: req.body.paymentType,
            bookNumber: req.body.bookNumber,
            billNumber: req.body.billNumber,
            saleId: req.body.saleId,
            accountId: req.body.accountId == 0 ? defaultAccount.id : req.body.accountId,
        });

        const sale = await Sales.getById(req.body.saleId);
        if (sale.contactId != null) {
            const where = {type: "Customer", referenceId: sale.contactId}
            const include = []
            const cutomerAccount = (await Accounts.getAll(where, include))[0];

            await AccountTransactions.createAccountTransaction(
                req.body.receivedDate,
                (req.body.receivedAmount * -1), 
                ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT,
                "",
                cutomerAccount.id,
                sale.id,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );
        }

        if (req.body.paymentType == 0) {
            await AccountTransactions.createAccountTransaction(
                req.body.receivedDate,
                req.body.receivedAmount, 
                ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT, 
                "",
                defaultAccount.id,
                req.body.saleId,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );
        }
        else if (req.body.paymentType == 1) {
            await AccountTransactions.createAccountTransaction(
                req.body.receivedDate,
                req.body.receivedAmount, 
                ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_PAYMENT, 
                "",
                req.body.accountId,
                req.body.saleId,
                req.body.bookNumber,
                req.body.billNumber,
                "",
                ""
            );
        }

        res.send(createdSalePayment);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: SALES_STRINGS.ERROR_CREATING_SALE_PAYMENT, stack: err.stack})
    }
}

/** get sale payments */
const getSalePayments = async (req, res) => {
    try {
        const models = require('../models');
        const where = {"saleId": req.params.saleId}
        const include = [
            {model: models.accounts}
        ]

        res.send(await SalePayments.getAll(where, include));
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: ACCOUNTS_STRINGS.ERROR_GETTING_ACCOUNTS, stack: err.stack})
    }
}

module.exports = {
    createSalePayment,
    getSalePayments
}