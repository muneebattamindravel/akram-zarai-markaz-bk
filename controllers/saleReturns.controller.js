const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const Sales = require('../models/sales.model');
const productstocks = require('../models/productStocks.model');
const saleitemsmodel = require('../models/saleItems.model');
const saleprofitsmodel = require('../models/saleProfits.model');
const Accounts = require('../models/accounts.model');
const salePaymentsModel = require('../models/salePayments.model');
const accounttransactions = require('./accountTransactions.controller');
const stockbooksController = require('./stockBooks.controller');
const saleReturnsModel = require('../models/saleReturns.model');
const salesController = require('./sales.controller');

/** returns sold products */
const returnSaleItems = async (req, res) => {
    try {
        const returnItems = req.body;
        const sale = await salesController.getSaleObject(req.params.saleId);
        let totalRefundAmount = 0;

        // Loop through return items and process each
        for (let i = 0; i < returnItems.length; i++) {
            const returnItem = returnItems[i];
            const saleItem = await saleitemsmodel.getAll({ id: returnItem.id });

            if (!saleItem || saleItem[0].saleId !== returnItem.saleId) {
                return res.status(400).send({ message: `Invalid return item. Sale Item ID ${returnItem.id} doesn't match Sale ID ${returnItem.saleId}.` });
            }

            // Verify that returned quantity doesn't exceed the originally sold quantity
            if (returnItem.quantity > saleItem[0].quantity) {
                return res.status(400).send({ message: `Returned quantity exceeds the sold quantity for product ID ${returnItem.productId}.` });
            }

            // Process lots for the sale in reverse order (LIFO)
            let lotsUsed = JSON.parse(returnItem.lotsUsedJson);
            lotsUsed.reverse(); // Reverse the order of lots used to handle the return in LIFO order

            let quantityRemaining = returnItem.quantity;  // Remaining quantity to be returned

            for (let j = 0; j < lotsUsed.length && quantityRemaining > 0; j++) {
                const lotUsed = lotsUsed[j];
                const productstock = await productstocks.getByLotNumber(returnItem.product.id, lotUsed.lotNumber);

                if (!productstock) {
                    return res.status(400).send({ message: `Stock for lot number ${lotUsed.lotNumber} not found.` });
                }

                // Calculate how much we can return to this lot
                let returnQuantity = Math.min(quantityRemaining, lotUsed.quantity);

                // Update product stock (adding the returned quantity back to the lot)
                productstock.quantity += returnQuantity;
                await productstocks.update({ quantity: productstock.quantity }, productstock.id);

                // Reverse the profit calculation for the returned quantity
                const costPriceTotal = productstock.costPrice * returnQuantity;
                const salePriceTotal = returnItem.salePrice * returnQuantity;
                const profit = salePriceTotal - costPriceTotal;

                // Log the profit reversal in sale profits
                await saleprofitsmodel.create({
                    amount: -profit,  // Reverse the profit
                    date: new Date(),
                    saleId: returnItem.saleId,
                    saleitemId: returnItem.id
                });

                // Add stock book entry for the return
                await stockbooksController.addstockbookEntry(
                    new Date(),
                    sale.bookNumber,
                    sale.billNumber,
                    '',
                    returnQuantity,  // Positive value for return
                    STOCK_BOOKS_STRINGS.TYPE.SALE_RETURN,  // Different stock type for return
                    '',
                    returnItem.product.id,
                    sale.id
                );

                // Adjust the quantity remaining for the return
                quantityRemaining -= returnQuantity;

                // Update the lotUsedJson with the updated quantity for this lot
                lotUsed.quantity -= returnQuantity;
            }

            // Filter out any lots with quantity <= 0
            lotsUsed = lotsUsed.filter(lot => lot.quantity > 0);

            // Update the lotsUsedJson in the saleItems table with the new array
            saleItem[0].lotsUsedJson = JSON.stringify(lotsUsed);
            await saleitemsmodel.update({ lotsUsedJson: saleItem[0].lotsUsedJson }, saleItem[0].id);

            // Update the sale item quantity after the return
            const updatedQuantity = saleItem[0].quantity - returnItem.quantity;
            await saleitemsmodel.update({ quantity: updatedQuantity }, saleItem[0].id);

            // Calculate refund amount for this item
            const refundAmount = returnItem.salePrice * returnItem.quantity;
            totalRefundAmount += refundAmount;

            // Make an entry in the saleReturns table for tracking
            await saleReturnsModel.create({
                returnAmount: refundAmount,  // The amount refunded for this return
                lotsReturnedToJson: JSON.stringify(lotsUsed),  // Store the returned lots in JSON format
                quantity: returnItem.quantity,  // The quantity returned
                saleId: returnItem.saleId,  // Link to the original sale
                productId: returnItem.productId  // Link to the returned product
            });
        }

        // Handle the financial transactions based on cash or credit sale
        const salePayment = sale.salePayments[0];
        const defaultAccount = await Accounts.getDefaultAccount();

        const isCashSale = salePayment.receivedAmount == sale.totalAmount ? true : false;

        if (totalRefundAmount > 0) {
            if (isCashSale) {  // Cash sale
                await createTransactionForSaleReturn(
                    totalRefundAmount,
                    ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
                    defaultAccount.id,
                    sale.id,
                    sale.bookNumber,
                    sale.billNumber
                );
            } else if (!isCashSale && sale.contactId) {  // Credit sale
                const customerAccount = await getCustomerAccount(sale.contactId);
                if (customerAccount) {
                    await createTransactionForSaleReturn(
                        totalRefundAmount,
                        ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
                        customerAccount.id,
                        sale.id,
                        sale.bookNumber,
                        sale.billNumber
                    );
                } else {
                    return res.status(400).send({ message: `Customer account not found for contact ID ${sale.contactId}.` });
                }
            }

            // Record the refund as an entry in the sale payments table
            await salePaymentsModel.create({
                receivedAmount: totalRefundAmount * -1,  // Negative for refund
                receivedDate: new Date(),
                paymentType: salePayment.paymentType,  // Same payment type as original sale
                bookNumber: sale.bookNumber,
                billNumber: sale.billNumber,
                saleId: sale.id,
                accountId: salePayment.paymentType === '0' 
                    ? defaultAccount.id  // Deduct from default account if cash sale
                    : (await getCustomerAccount(sale.contactId)).id  // Adjust in customer's account if credit sale
            });
        }

        // Update the Sales table to reflect the total refund and mark returnApplied
        const updatedTotalAmount = sale.totalAmount - totalRefundAmount;
        const saleUpdateSuccess = await Sales.update(
            { totalAmount: updatedTotalAmount, returnApplied: 1 },
            sale.id
        );

        if (!saleUpdateSuccess) {
            return res.status(500).send({ message: 'Failed to update sales record.' });
        }

        res.send({ message: 'Return processed successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: 'Error processing return.',
            raw: err.message,
            stack: err.stack
        });
    }
};

/**
 * Helper function to create a transaction for the sale return
 */
const createTransactionForSaleReturn = async (amount, transactionType, accountId, saleId, bookNumber, billNumber) => {
    await accounttransactions.createaccounttransaction(
        new Date(),
        amount * -1,  // Negative for refund
        transactionType,
        '',
        accountId,
        saleId,
        bookNumber,
        billNumber,
        '',
        ''
    );
};

/**
 * Helper function to get customer account
 */
const getCustomerAccount = async (contactId) => {
    const where = { type: "Customer", referenceId: contactId };
    const include = [];
    return (await Accounts.getAll(where, include))[0];
};

module.exports = {
    returnSaleItems
};



// const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
// const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
// const Sales = require('../models/sales.model');
// const productstocks = require('../models/productStocks.model');
// const saleitemsmodel = require('../models/saleItems.model');
// const saleprofitsmodel = require('../models/saleProfits.model');
// const Accounts = require('../models/accounts.model');
// const salePaymentsModel = require('../models/salePayments.model');
// const accounttransactions = require('./accountTransactions.controller');
// const stockbooksController = require('./stockBooks.controller');
// const saleReturnsModel = require('../models/saleReturns.model');
// const salesController = require('./sales.controller');

// /** returns sold products */
// const returnSaleItems = async (req, res) => {
//     try {
//         const returnItems = req.body;
//         const sale = await salesController.getSaleObject(req.params.saleId);
//         let totalRefundAmount = 0;

//         // Loop through return items and process each
//         for (let i = 0; i < returnItems.length; i++) {
//             const returnItem = returnItems[i];
//             const saleItem = await saleitemsmodel.getAll({ id: returnItem.id });

//             if (!saleItem || saleItem[0].saleId !== returnItem.saleId) {
//                 return res.status(400).send({ message: `Invalid return item. Sale Item ID ${returnItem.id} doesn't match Sale ID ${returnItem.saleId}.` });
//             }

//             // Verify that returned quantity doesn't exceed the originally sold quantity
//             if (returnItem.quantity > saleItem[0].quantity) {
//                 return res.status(400).send({ message: `Returned quantity exceeds the sold quantity for product ID ${returnItem.productId}.` });
//             }

//             // Process lots for the sale in reverse order (LIFO)
//             let lotsUsed = JSON.parse(returnItem.lotsUsedJson);
//             lotsUsed.reverse(); // Reverse the order of lots used to handle the return in LIFO order

//             let quantityRemaining = returnItem.quantity;  // Remaining quantity to be returned

//             for (let j = 0; j < lotsUsed.length && quantityRemaining > 0; j++) {
//                 const lotUsed = lotsUsed[j];
//                 const productstock = await productstocks.getByLotNumber(returnItem.product.id, lotUsed.lotNumber);

//                 if (!productstock) {
//                     return res.status(400).send({ message: `Stock for lot number ${lotUsed.lotNumber} not found.` });
//                 }

//                 // Calculate how much we can return to this lot
//                 let returnQuantity = Math.min(quantityRemaining, lotUsed.quantity);

//                 // Update product stock (adding the returned quantity back to the lot)
//                 productstock.quantity += returnQuantity;
//                 await productstocks.update({ quantity: productstock.quantity }, productstock.id);

//                 // Reverse the profit calculation for the returned quantity
//                 const costPriceTotal = productstock.costPrice * returnQuantity;
//                 const salePriceTotal = returnItem.salePrice * returnQuantity;
//                 const profit = salePriceTotal - costPriceTotal;

//                 // Log the profit reversal in sale profits
//                 await saleprofitsmodel.create({
//                     amount: -profit,  // Reverse the profit
//                     date: new Date(),
//                     saleId: returnItem.saleId,
//                     saleitemId: returnItem.id
//                 });

//                 // Add stock book entry for the return
//                 await stockbooksController.addstockbookEntry(
//                     new Date(),
//                     sale.bookNumber,
//                     sale.billNumber,
//                     '',
//                     returnQuantity,  // Positive value for return
//                     STOCK_BOOKS_STRINGS.TYPE.SALE_RETURN,  // Different stock type for return
//                     '',
//                     returnItem.product.id,
//                     sale.id
//                 );

//                 // Adjust the quantity remaining for the return
//                 quantityRemaining -= returnQuantity;

//                 // Update the lotUsedJson with the updated quantity for this lot
//                 lotUsed.quantity -= returnQuantity;
//             }

//             // Filter out any lots with quantity <= 0
//             lotsUsed = lotsUsed.filter(lot => lot.quantity > 0);

//             // Update the lotsUsedJson in the saleItems table with the new array
//             saleItem[0].lotsUsedJson = JSON.stringify(lotsUsed);
//             await saleitemsmodel.update({ lotsUsedJson: saleItem[0].lotsUsedJson }, saleItem[0].id);

//             // Update the sale item quantity after the return
//             const updatedQuantity = saleItem[0].quantity - returnItem.quantity;
//             await saleitemsmodel.update({ quantity: updatedQuantity }, saleItem[0].id);

//             // Calculate refund amount for this item
//             const refundAmount = returnItem.salePrice * returnItem.quantity;
//             totalRefundAmount += refundAmount;

//             // Make an entry in the saleReturns table for tracking
//             await saleReturnsModel.create({
//                 returnAmount: refundAmount,  // The amount refunded for this return
//                 lotsReturnedToJson: JSON.stringify(lotsUsed),  // Store the returned lots in JSON format
//                 quantity: returnItem.quantity,  // The quantity returned
//                 saleId: returnItem.saleId,  // Link to the original sale
//                 productId: returnItem.productId  // Link to the returned product
//             });
//         }

//         // Handle the financial transactions (cash or credit sales)
//         if (totalRefundAmount > 0) {
//             const salePayment = sale.salePayments[0];
//             const defaultAccount = await Accounts.getDefaultAccount();

//             // Cash sale: refund to the default account
//             if (salePayment.paymentType === '0') {
//                 await createTransactionForSaleReturn(
//                     totalRefundAmount,
//                     ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
//                     defaultAccount.id,
//                     sale.id,
//                     sale.bookNumber,
//                     sale.billNumber
//                 );
//             }

//             const customerAccount = await getCustomerAccount(sale.contactId);
//             // Credit sale: credit to the customer's account
//             if (salePayment.paymentType === '1' && sale.contactId) {
//                 if (customerAccount) {
//                     await createTransactionForSaleReturn(
//                         totalRefundAmount,
//                         ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
//                         customerAccount.id,
//                         sale.id,
//                         sale.bookNumber,
//                         sale.billNumber
//                     );
//                 } else {
//                     return res.status(400).send({ message: `Customer account not found for contact ID ${sale.contactId}.` });
//                 }
//             }

//             // Create a new entry in the sale payments table for the refund or credit
//             await salePaymentsModel.create({
//                 receivedAmount: totalRefundAmount * -1,  // Negative value for refund
//                 receivedDate: new Date(),
//                 paymentType: salePayment.paymentType,  // Same payment type as original sale
//                 bookNumber: sale.bookNumber,
//                 billNumber: sale.billNumber,
//                 saleId: sale.id,  // Link to original sale
//                 accountId: salePayment.paymentType === '0' 
//                     ? defaultAccount.id  // Cash refund goes to default account
//                     : customerAccount.id  // Credit refund goes to customer account
//             });
//         }

//         // Update the Sales table to reflect the total refund and mark returnApplied
//         const updatedTotalAmount = sale.totalAmount - totalRefundAmount;
//         await Sales.update(
//             { totalAmount: updatedTotalAmount, returnApplied: 1 },
//             sale.id  // Pass only the id as the second argument
//         );

//         res.send();
//     } catch (err) {
//         console.error(err);
//         res.status(500).send({
//             message: 'Error processing return.',
//             raw: err.message,
//             stack: err.stack
//         });
//     }
// };

// /**
//  * Helper function to create a transaction for the sale return
//  */
// const createTransactionForSaleReturn = async (amount, transactionType, accountId, saleId, bookNumber, billNumber) => {
//     await accounttransactions.createaccounttransaction(
//         new Date(),
//         amount * -1,  // Negative for refund
//         transactionType,
//         '',
//         accountId,
//         saleId,
//         bookNumber,
//         billNumber,
//         '',
//         ''
//     );
// };

// /**
//  * Helper function to get customer account
//  */
// const getCustomerAccount = async (contactId) => {
//     const where = { type: "Customer", referenceId: contactId };
//     const include = [];
//     return (await Accounts.getAll(where, include))[0];
// };

// module.exports = {
//     returnSaleItems
// };
