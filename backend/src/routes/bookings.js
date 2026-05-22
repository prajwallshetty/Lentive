const express = require('express');
const {
  createBooking,
  getRenterBookings,
  getOwnerBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  updateBookingStatus
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All booking routes are protected

router.route('/')
  .post(createBooking);

router.route('/renter')
  .get(getRenterBookings);

router.route('/owner')
  .get(getOwnerBookings);

router.route('/:id/accept')
  .patch(acceptBooking);

router.route('/:id/reject')
  .patch(rejectBooking);

router.route('/:id/cancel')
  .patch(cancelBooking);

router.route('/:id/status')
  .patch(updateBookingStatus);

module.exports = router;
