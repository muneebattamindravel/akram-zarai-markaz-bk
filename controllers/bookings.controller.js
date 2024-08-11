const BOOKINGS_STRINGS = require('../constants/bookings.strings');
const Bookings = require('../models/bookings.model');
const accounttransactionsModel = require('../models/accountTransactions.model');
const ACCOUNT_TRANSACTION_STRINGS = require('../constants/accountTransactions.strings');
const accounttransactionsController = require('./accountTransactions.controller');
const accountsController = require('./accounts.controller');
const CompaniesModel = require('../models/companies.model');

/**creates a new booking */
const createBooking = async (req, res) => {
    try {
        if (!IsBookingBodyValid(req.body, res))
            return;

        const booking = await Bookings.create({
            totalAmount: req.body.totalAmount,
            prNumber: req.body.prNumber,
            bookingDate: req.body.bookingDate,
            notes: req.body.notes,
            companyId: req.body.companyId,
            fromAccountId: req.body.fromAccountId,
            policyName: req.body.policyName,
            policyPercentage: req.body.policyPercentage,
            netRate: req.body.netRate,
            bookingType: req.body.bookingType,
            policyType: req.body.policyType
        })

        await accounttransactionsController.createaccounttransaction(
            req.body.bookingDate,
            (req.body.totalAmount * -1), 
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.BOOKING,
            req.body.bookingType,
            req.body.fromAccountId,
            booking.id,
            "",
            "",
            "",
            req.body.prNumber
            );

        const company = await CompaniesModel.getByID(req.body.companyId);

        await accounttransactionsController.createaccounttransaction(
            req.body.bookingDate,
            (req.body.totalAmount * 1), 
            ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.BOOKING,
            req.body.bookingType,
            company.accountId,
            booking.id,
            "",
            "",
            "",
            req.body.prNumber
            );

        res.send(booking);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: BOOKINGS_STRINGS.ERROR_CREATING_BOOKING, stack: err.stack})
    }
}

/** delete booking */
const deleteBooking = async (req, res) => {
    try {
        var bookingId = req.params.id;
        const booking = await Bookings.getByID(bookingId);

        const fromAccountId = booking.fromAccountId;
        const company = await CompaniesModel.getByID(booking.companyId);
        const companyAccountId = company.accountId;

        await Bookings.deleteById(bookingId);
        await accounttransactionsModel.deleteByReference(bookingId, ACCOUNT_TRANSACTION_STRINGS.ACCOUNT_TRANSACTION_TYPE.BOOKING)

        await accountsController.consolidateAccountStatementWorker(fromAccountId);
        await accountsController.consolidateAccountStatementWorker(companyAccountId);

        res.status(200).send();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: "ERROR DELETING BOOKING", stack: err.stack})
    }
}

/** get a booking with id */
const getBooking = async (req, res) => {
    try {
        const booking = await Bookings.getByID(req.params.id)
        booking? res.send(booking) : res.status(404).send({message: `${BOOKINGS_STRINGS.BOOKING_NOT_FOUND} ,id=${req.params.id}`})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: BOOKINGS_STRINGS.ERROR_GETTING_BOOKING, stack: err.stack})
    }
}

/** get all bookings */
const getAllBookings = async (req, res) => {
    try {
        res.send(await Bookings.getAll())
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: BOOKINGS_STRINGS.ERROR_GETTING_BOOKINGS, stack: err.stack})
    }
}

const IsBookingBodyValid = (body, res) => {
    if (!body.totalAmount) {
        res.status(406).send({message: BOOKINGS_STRINGS.TOTAL_AMOUNT_NULL});
        return false;
    }
    if (!body.bookingDate) {
        res.status(406).send({message: BOOKINGS_STRINGS.BOOKING_DATE_NULL});
        return false;
    }
    if (!body.companyId) {
        res.status(406).send({message: BOOKINGS_STRINGS.COMPANY_NULL});
        return false;
    }

    return true
}

module.exports = {
    createBooking,
    getBooking,
    getAllBookings,
    deleteBooking
}