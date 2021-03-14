const BOOKINGS_STRINGS = require('../constants/bookings.strings');
const Bookings = require('../models/bookings.model');
const ACCOUNTS_STRINGS = require('../constants/accounts.strings');
const AccountTransactions = require('../controllers/accountTransactions.controller');

/**creates a new booking */
const createBooking = async (req, res) => {
    try {
        if (!IsBookingBodyValid(req.body, res))
            return;

        const booking = await Bookings.create({
            totalAmount: req.body.totalAmount,
            draftNumber: req.body.draftNumber,
            bookingDate: req.body.bookingDate,
            draftImageURL: req.body.draftImageURL,
            notes: req.body.notes,
            companyId: req.body.companyId,
            fromAccountId: req.body.fromAccountId,
            companyAccountId: req.body.companyAccountId,
        })

        await AccountTransactions.createAccountTransaction((req.body.totalAmount * -1), ACCOUNTS_STRINGS.BOOKING, req.body.fromAccountId);
        await AccountTransactions.createAccountTransaction((req.body.totalAmount * 1), ACCOUNTS_STRINGS.BOOKING, req.body.companyAccountId);

        res.send(booking);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: BOOKINGS_STRINGS.ERROR_CREATING_BOOKING, stack: err.stack})
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
}