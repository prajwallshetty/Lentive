const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getListingAvailability
} = require('../controllers/listings');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const reviewsRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:listingId/reviews', reviewsRouter);

router
  .route('/')
  .get(getListings)
  .post(protect, authorize('owner', 'admin'), createListing);

router.get('/:id/availability', getListingAvailability);

router
  .route('/:id')
  .get(getListing)
  .put(protect, authorize('owner', 'admin'), updateListing)
  .delete(protect, authorize('owner', 'admin'), deleteListing);

module.exports = router;

