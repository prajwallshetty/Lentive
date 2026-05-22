const express = require('express');
const {
  getAnalytics,
  getUsers,
  verifyUser,
  getListings,
  moderateListing,
  getBookings
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.get('/listings', getListings);
router.delete('/listings/:id', moderateListing);
router.get('/bookings', getBookings);

module.exports = router;
