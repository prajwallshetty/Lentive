const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing
} = require('../controllers/listings');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getListings)
  .post(protect, createListing);

router
  .route('/:id')
  .get(getListing)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

module.exports = router;
