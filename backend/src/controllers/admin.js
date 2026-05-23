const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Deposit = require('../models/Deposit');
const VerificationRequest = require('../models/VerificationRequest');
const { refundPayment } = require('../services/paymentService');

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Total earnings from captured payments
    const payments = await Payment.find({ status: 'captured' });
    const totalEarnings = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Group users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Group listings by category
    const listingsByCategory = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        totalBookings,
        totalEarnings,
        usersByRole,
        listingsByCategory
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject verification document upload
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
exports.verifyUser = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either approved or rejected'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.verificationStatus = status;
    user.verificationRemarks = remarks || '';
    
    // Calculate new level
    updateVerificationLevel(user);
    await user.save();

    // Synchronize ID VerificationRequest record
    const reqLog = await VerificationRequest.findOne({
      userId: user._id,
      type: 'id_verification',
      status: 'pending'
    });

    if (reqLog) {
      reqLog.status = status;
      reqLog.remarks = remarks || '';
      await reqLog.save();
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all listings
// @route   GET /api/admin/listings
// @access  Private/Admin
exports.getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate listing (Deactivate or delete)
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
exports.moderateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Toggle availability or delete. Let's delete or mark unavailable.
    // Deleting listing outright is simpler and fits standard moderation needs.
    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing moderated and deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('listingId', 'title category pricePerDay')
      .populate('renterId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to update verification levels based on status checks
const updateVerificationLevel = (user) => {
  if (user.isVerified && user.isPhoneVerified) {
    if (user.verificationStatus === 'approved') {
      if (user.drivingLicenseStatus === 'approved') {
        user.verificationLevel = 'Trusted User';
      } else {
        user.verificationLevel = 'ID Verified';
      }
    } else {
      user.verificationLevel = 'Basic Verified';
    }
  } else {
    user.verificationLevel = 'none';
  }
};

// @desc    Get all verification requests
// @route   GET /api/admin/verification-requests
// @access  Private/Admin
exports.getVerificationRequests = async (req, res, next) => {
  try {
    const requests = await VerificationRequest.find()
      .populate('userId', 'name email avatar verificationLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate a verification request
// @route   PUT /api/admin/verification-requests/:id
// @access  Private/Admin
exports.verifyVerificationRequest = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    }

    const verificationReq = await VerificationRequest.findById(req.params.id);
    if (!verificationReq) {
      return res.status(404).json({ success: false, error: 'Verification request not found' });
    }

    verificationReq.status = status;
    verificationReq.remarks = remarks || '';
    await verificationReq.save();

    const user = await User.findById(verificationReq.userId);
    if (user) {
      if (verificationReq.type === 'id_verification') {
        user.verificationStatus = status;
        user.verificationRemarks = remarks || '';
      } else if (verificationReq.type === 'driving_license') {
        user.drivingLicenseStatus = status;
        user.drivingLicenseRemarks = remarks || '';
      }

      updateVerificationLevel(user);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Request marked as ${status} and user level updated.`,
      data: verificationReq
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all security deposits
// @route   GET /api/admin/deposits
// @access  Private/Admin
exports.getDeposits = async (req, res, next) => {
  try {
    const deposits = await Deposit.find()
      .populate('bookingId', 'totalAmount startDate endDate')
      .populate('renterId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deposits.length,
      data: deposits
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve a disputed deposit
// @route   PUT /api/admin/deposits/:id/resolve
// @access  Private/Admin
exports.resolveDepositDispute = async (req, res, next) => {
  try {
    const { resolution, remarks } = req.body;
    if (!['release_to_renter', 'payout_to_owner'].includes(resolution)) {
      return res.status(400).json({ success: false, error: 'Resolution must be release_to_renter or payout_to_owner' });
    }

    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ success: false, error: 'Deposit record not found' });
    }

    if (deposit.status !== 'disputed') {
      return res.status(400).json({ success: false, error: 'Only disputed deposits can be resolved' });
    }

    const booking = await Booking.findById(deposit.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Associated booking not found' });
    }

    if (resolution === 'release_to_renter') {
      // Issue Razorpay/Simulated refund of deposit back to renter
      if (booking.paymentId) {
        await refundPayment(booking.paymentId, deposit.amount);
      }
      deposit.status = 'released';
    } else {
      // Payout to owner (meaning deposit remains captured/transferred, status reflects admin resolution)
      deposit.status = 'released'; // Released to owner/escrowed out
    }

    deposit.resolvedRemarks = remarks || 'Resolved by admin';
    deposit.resolvedAt = Date.now();
    await deposit.save();

    // Log the transaction
    await Payment.create({
      bookingId: booking._id,
      userId: resolution === 'release_to_renter' ? deposit.renterId : deposit.ownerId,
      amount: deposit.amount,
      razorpayOrderId: 'dispute_resolution',
      status: 'refunded',
      type: 'refund'
    });

    // Notify parties
    await Notification.create({
      recipient: deposit.renterId,
      sender: req.user.id,
      type: 'completed',
      message: `The escrow deposit dispute has been resolved: ${resolution === 'release_to_renter' ? 'Refunded to you' : 'Paid out to the owner'}. Remarks: ${remarks || ''}`
    });

    await Notification.create({
      recipient: deposit.ownerId,
      sender: req.user.id,
      type: 'completed',
      message: `The escrow deposit dispute has been resolved: ${resolution === 'release_to_renter' ? 'Refunded to the renter' : 'Paid out to you'}. Remarks: ${remarks || ''}`
    });

    res.status(200).json({
      success: true,
      message: 'Deposit dispute resolved successfully.',
      deposit
    });
  } catch (err) {
    next(err);
  }
};
