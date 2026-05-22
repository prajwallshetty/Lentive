const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getListingAvailability,
  getMyListings
} = require('../controllers/listings');
const { protect, authorize } = require('../middleware/auth');
const { validateListing } = require('../middleware/validation');

// Include other resource routers
const reviewsRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:listingId/reviews', reviewsRouter);

router
  .route('/')
  .get(getListings)
  .post(protect, validateListing, createListing);

router.get('/my', protect, getMyListings);

router.get('/:id/availability', getListingAvailability);

router
  .route('/:id')
  .get(getListing)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

module.exports = router;

