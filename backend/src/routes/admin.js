const express = require('express');
const {
  getAnalytics,
  getUsers,
  verifyUser,
  getListings,
  moderateListing,
  getBookings,
  getVerificationRequests,
  verifyVerificationRequest,
  getDeposits,
  resolveDepositDispute
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
router.get('/verification-requests', getVerificationRequests);
router.put('/verification-requests/:id', verifyVerificationRequest);
router.get('/deposits', getDeposits);
router.put('/deposits/:id/resolve', resolveDepositDispute);

module.exports = router;
