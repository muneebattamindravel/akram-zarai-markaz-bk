const app = require('..');
const bookingsController = require('../controllers/bookings.controller');

app.post('/bookings',bookingsController.createBooking);
app.get('/bookings',bookingsController.getAllBookings);
app.get('/bookings/:id',bookingsController.getBooking);
