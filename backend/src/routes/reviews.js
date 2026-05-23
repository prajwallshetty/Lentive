const express = require('express');
const { getReviews, createReview, createBookingReview } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

// Merge params to access parent route parameters (like listingId)
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, createReview);

router.post('/booking/:bookingId', protect, createBookingReview);

module.exports = router;
