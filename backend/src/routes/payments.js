const express = require('express');
const { createOrder, verifyPayment, razorpayWebhook, getPaymentHistory } = require('../controllers/payments');
const { protect } = require('../middleware/auth');
const { validateCreateOrder, validateVerifyPayment } = require('../middleware/validation');

const router = express.Router();

// Public webhook route (called by Razorpay)
router.post('/webhook', razorpayWebhook);

// Protected payment verification and creation routes
router.use(protect);
router.post('/order', validateCreateOrder, createOrder);
router.post('/verify', validateVerifyPayment, verifyPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
