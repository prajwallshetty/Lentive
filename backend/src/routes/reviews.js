const express = require('express');
const { getReviews, createReview } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

// Merge params to access parent route parameters (like listingId)
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, createReview);

module.exports = router;
