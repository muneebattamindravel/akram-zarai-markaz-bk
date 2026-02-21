const STOCK_BOOKS_STRINGS = require('../constants/stockBooks.strings');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const Sales = require('../models/sales.model');
const productstocks = require('../models/productStocks.model');
const saleitemsmodel = require('../models/saleItems.model');
const salePaymentsModel = require('../models/salePayments.model');
const saleprofitsmodel = require('../models/saleProfits.model');
const Accounts = require('../models/accounts.model');
const accounttransactions = require('./accountTransactions.controller');
const stockbooksController = require('./stockBooks.controller');
const accountsController = require('./accounts.controller');
const saleReturnsModel = require('../models/saleReturns.model');
const salesController = require('./sales.controller');

const returnSaleItems = async (req, res) => {
  try {
    const returnItems = req.body.returnItems;
    const sale = await salesController.getSaleObject(req.params.saleId);

    let totalRefundAmount = 0;

    // ✅ define once (use everywhere)
    const returnDateNow = new Date(req.body.returnDate);

    // Loop through return items and process each
    for (let i = 0; i < returnItems.length; i++) {
      const returnItem = returnItems[i];
      const saleItem = await saleitemsmodel.getAll({ id: returnItem.id });

      if (!saleItem || saleItem[0].saleId !== returnItem.saleId) {
        return res.status(400).send({
          message: `Invalid return item. Sale Item ID ${returnItem.id} doesn't match Sale ID ${returnItem.saleId}.`
        });
      }

      // Verify that returned quantity doesn't exceed the originally sold quantity
      if (returnItem.quantity > saleItem[0].quantity) {
        return res.status(400).send({
          message: `Returned quantity exceeds the sold quantity for product ID ${returnItem.product.id}.`
        });
      }

      // Process lots for the sale in reverse order (LIFO)
      let lotsUsed = JSON.parse(returnItem.lotsUsedJson);
      lotsUsed.reverse();

      let quantityRemaining = returnItem.quantity;
      const lotsReturned = [];

      for (let j = 0; j < lotsUsed.length && quantityRemaining > 0; j++) {
        const lotUsed = lotsUsed[j];
        const productstock = await productstocks.getByLotNumber(returnItem.product.id, lotUsed.lotNumber);

        if (!productstock) {
          return res.status(400).send({ message: `Stock for lot number ${lotUsed.lotNumber} not found.` });
        }

        const returnQuantity = Math.min(quantityRemaining, lotUsed.quantity);

        // Update product stock (adding the returned quantity back to the lot)
        productstock.quantity += returnQuantity;
        await productstocks.update({ quantity: productstock.quantity }, productstock.id);

        // Reverse the profit calculation for the returned quantity
        const costPriceTotal = productstock.costPrice * returnQuantity;

        // (Keeping your current calculation method)
        const salePriceTotal = returnItem.salePrice * returnQuantity;
        const profit = salePriceTotal - costPriceTotal;

        // ✅ Log profit reversal on RETURN date (not sale.saleDate)
        await saleprofitsmodel.create({
          amount: -profit,
          date: returnDateNow,
          saleId: returnItem.saleId,
          saleitemId: returnItem.id
        });

        // Add stock book entry for the return
        await stockbooksController.addstockbookEntry(
          returnDateNow,
          req.body.bookNumber,
          req.body.billNumber,
          '',
          returnQuantity,
          STOCK_BOOKS_STRINGS.TYPE.SALE_RETURN,
          '',
          returnItem.product.id,
          sale.id
        );

        quantityRemaining -= returnQuantity;

        lotsReturned.push({
          lotNumber: lotUsed.lotNumber,
          quantity: returnQuantity
        });

        // Update the lotUsedJson with the updated quantity for this lot
        lotUsed.quantity -= returnQuantity;
      }

      // Filter out any lots with quantity <= 0
      lotsUsed = lotsUsed.filter(lot => lot.quantity > 0);

      // Update lotsUsedJson in saleItems table
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
        returnAmount: refundAmount,
        lotsReturnedToJson: JSON.stringify(lotsReturned),
        quantity: returnItem.quantity,
        saleId: returnItem.saleId,
        productId: returnItem.product.id,
        bookNumber: req.body.bookNumber,
        billNumber: req.body.billNumber,
        returnDate: returnDateNow
      });
    }

    const defaultAccount = await Accounts.getDefaultAccount();

    if (totalRefundAmount > 0) {
      const salePayment = sale.salePayments?.[0];
      let cashRefundPaid = 0; // ✅ ONLY cash/defaultAccount payout

      if (sale.contactId) {
        const customerAccount = await getCustomerAccount(sale.contactId);
        const customerAccountBalanceObj = await accountsController.getAccountBalanceWorker(customerAccount.id);

        const customerBalance = Number(customerAccountBalanceObj.amount) || 0;
        const refundAmount = Number(totalRefundAmount) || 0;

        console.log("Customer Account Balance =", customerBalance, "Refund =", refundAmount);

        const customerDebt = customerBalance < 0 ? Math.abs(customerBalance) : 0;

        if (customerBalance > 0) {
          // Customer has credit -> use credit first
          const balanceAdjustment = Math.min(customerBalance, refundAmount);
          const cashToGive = refundAmount - balanceAdjustment;

          await createTransactionForSaleReturn(
            balanceAdjustment,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
            customerAccount.id,
            sale.id,
            req.body.bookNumber,
            req.body.billNumber
          );

          if (cashToGive > 0) {
            cashRefundPaid = cashToGive;

            await createTransactionForSaleReturn(
              cashToGive,
              ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
              defaultAccount.id,
              sale.id,
              req.body.bookNumber,
              req.body.billNumber
            );
          }

        } else if (customerBalance < 0) {
          // Customer owes us -> reduce debt first
          const debtReduction = Math.min(customerDebt, refundAmount);
          const cashToGive = refundAmount - debtReduction;

          await createTransactionForSaleReturn(
            debtReduction,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
            customerAccount.id,
            sale.id,
            req.body.bookNumber,
            req.body.billNumber
          );

          if (cashToGive > 0) {
            cashRefundPaid = cashToGive;

            await createTransactionForSaleReturn(
              cashToGive,
              ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
              defaultAccount.id,
              sale.id,
              req.body.bookNumber,
              req.body.billNumber
            );
          }

        } else {
          // Balance is exactly 0 -> full refund from cash
          cashRefundPaid = refundAmount;

          await createTransactionForSaleReturn(
            refundAmount,
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
            defaultAccount.id,
            sale.id,
            req.body.bookNumber,
            req.body.billNumber
          );
        }

      } else {
        // No customer selected -> full refund from cash
        cashRefundPaid = Number(totalRefundAmount) || 0;

        await createTransactionForSaleReturn(
          totalRefundAmount,
          ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.SALE_RETURN,
          defaultAccount.id,
          sale.id,
          req.body.bookNumber,
          req.body.billNumber
        );
      }

      // ✅ NEW: record the refund in salePayments (ONLY cash outflow)
      if (cashRefundPaid > 0) {
        await salePaymentsModel.create({
          receivedAmount: cashRefundPaid * -1,
          receivedDate: returnDateNow,
          paymentType: salePayment?.paymentType ?? '0',
          bookNumber: req.body.bookNumber,
          billNumber: req.body.billNumber,
          saleId: sale.id,
          accountId: defaultAccount.id
        });
      }
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

    res.send(req.body);

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

/** get all sales */
const getAllSaleReturns = async (req, res) => {
    try {
        var allSaleReturns = await saleReturnsModel.getAll(req.query.from, req.query.to);
        res.send(allSaleReturns)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ raw: err.message.toString(), message: "ERROR GETTING SALE RETURNS", stack: err.stack })
    }
}

module.exports = {
    returnSaleItems,
    getAllSaleReturns
};