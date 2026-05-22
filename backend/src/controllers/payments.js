const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const {
  createPaymentOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
} = require('../services/paymentService');

// @desc    Initialize Razorpay order
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listingId');
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const { order, isSimulated, keyId } = await createPaymentOrder(booking._id, booking.totalAmount);

    // Log the payment in DB
    await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      amount: booking.totalAmount,
      razorpayOrderId: order.id,
      status: 'pending',
      type: 'booking'
    });

    res.status(200).json({
      success: true,
      order,
      isSimulated,
      keyId
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    let isVerified = false;
    try {
      isVerified = verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });
    } catch (verifError) {
      return res.status(400).json({
        success: false,
        error: verifError.message
      });
    }

    if (!isVerified) {
      payment.status = 'failed';
      await payment.save();

      booking.paymentStatus = 'failed';
      await booking.save();

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    // Capture payment in Database
    payment.status = 'captured';
    payment.razorpayPaymentId = razorpayPaymentId || `pay_simulated_${crypto.randomBytes(8).toString('hex')}`;
    payment.razorpaySignature = razorpaySignature || `sig_simulated_${crypto.randomBytes(16).toString('hex')}`;
    await payment.save();

    // Update booking status
    booking.paymentStatus = 'captured';
    booking.paymentId = payment.razorpayPaymentId;
    // When payment completes successfully, transition booking to accepted/confirmed
    booking.bookingStatus = 'accepted';
    await booking.save();

    // Notify owner about payment and booking confirmation
    await Notification.create({
      recipient: booking.ownerId,
      sender: booking.renterId,
      type: 'accepted',
      booking: booking._id,
      message: `Payment confirmed for booking of listing! Status updated to Accepted.`
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and captured successfully',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Razorpay Webhook handler
// @route   POST /api/payments/webhook
// @access  Public
exports.razorpayWebhook = async (req, res, next) => {
  try {
    const isValid = verifyWebhookSignature(req.body, req.headers['x-razorpay-signature']);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const event = req.body.event;

    if (event === 'payment.captured') {
      const payload = req.body.payload.payment.entity;
      const razorpayOrderId = payload.order_id;
      const razorpayPaymentId = payload.id;

      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment && payment.status !== 'captured') {
        payment.status = 'captured';
        payment.razorpayPaymentId = razorpayPaymentId;
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = 'captured';
          booking.paymentId = razorpayPaymentId;
          booking.bookingStatus = 'accepted';
          await booking.save();
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment history for user (both as owner/renter)
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    // 1. Find all bookings involving the user
    const bookings = await Booking.find({
      $or: [
        { renterId: req.user._id },
        { ownerId: req.user._id }
      ]
    }).select('_id');

    const bookingIds = bookings.map(b => b._id);

    // 2. Find payments for these bookings
    const payments = await Payment.find({
      bookingId: { $in: bookingIds }
    })
    .populate({
      path: 'bookingId',
      populate: [
        { path: 'listingId', select: 'title images pricePerDay' },
        { path: 'renterId', select: 'name email' },
        { path: 'ownerId', select: 'name email' }
      ]
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (err) {
    next(err);
  }
};
