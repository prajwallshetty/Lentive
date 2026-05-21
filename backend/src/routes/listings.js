const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing
} = require('../controllers/listings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getListings)
  .post(protect, authorize('owner', 'admin'), createListing);

router
  .route('/:id')
  .get(getListing)
  .put(protect, authorize('owner', 'admin'), updateListing)
  .delete(protect, authorize('owner', 'admin'), deleteListing);

module.exports = router;

