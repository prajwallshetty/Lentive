const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { listingId, startDate, endDate, paymentId, paymentStatus } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (!listing.isAvailable) {
      return res.status(400).json({ success: false, error: 'Listing is not available for rent' });
    }

    // Verify renter is not the owner
    if (listing.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot rent your own item' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid start or end date' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' });
    }

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      listingId,
      bookingStatus: { $in: ['pending', 'accepted', 'active', 'completed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlap) {
      return res.status(400).json({ success: false, error: 'Selected dates overlap with an existing booking' });
    }

    // Calculate total days
    const differenceInTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (totalDays <= 0) {
      return res.status(400).json({ success: false, error: 'Rental duration must be at least 1 day' });
    }

    const totalAmount = totalDays * listing.pricePerDay;
    const depositAmount = listing.securityDeposit || 0;

    const booking = await Booking.create({
      listingId,
      renterId: req.user.id,
      ownerId: listing.owner,
      startDate: start,
      endDate: end,
      totalDays,
      totalAmount,
      depositAmount,
      bookingStatus: 'pending',
      paymentId: paymentId || '',
      paymentStatus: paymentStatus || 'pending'
    });

    // Notify the listing owner
    await Notification.create({
      recipient: listing.owner,
      sender: req.user.id,
      type: 'requested',
      booking: booking._id,
      message: `You received a booking request for "${listing.title}" from ${req.user.name}.`
    });

    res.status(201).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings made by current logged in user (Renter)
// @route   GET /api/bookings/renter
// @access  Private
exports.getRenterBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ renterId: req.user.id })
      .populate({
        path: 'listingId',
        select: 'title category pricePerDay securityDeposit images address location'
      })
      .populate('ownerId', 'name email avatar address ratings')
      .sort({ createdAt: -1 });

    // Transform fields temporarily if frontend uses older field names mapping
    // frontend expects: listing, owner, totalPrice, securityDeposit, status
    const transformedBookings = bookings.map(b => {
      const obj = b.toObject();
      obj.listing = obj.listingId;
      obj.owner = obj.ownerId;
      obj.renter = obj.renterId;
      obj.totalPrice = obj.totalAmount;
      obj.securityDeposit = obj.depositAmount;
      obj.status = obj.bookingStatus;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: transformedBookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for items owned by current logged in user (Owner)
// @route   GET /api/bookings/owner
// @access  Private
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user.id })
      .populate({
        path: 'listingId',
        select: 'title category pricePerDay securityDeposit images address location'
      })
      .populate('renterId', 'name email avatar address ratings')
      .sort({ createdAt: -1 });

    const transformedBookings = bookings.map(b => {
      const obj = b.toObject();
      obj.listing = obj.listingId;
      obj.owner = obj.ownerId;
      obj.renter = obj.renterId;
      obj.totalPrice = obj.totalAmount;
      obj.securityDeposit = obj.depositAmount;
      obj.status = obj.bookingStatus;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: transformedBookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept a booking request
// @route   PATCH /api/bookings/:id/accept
// @access  Private
exports.acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listingId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to accept this booking' });
    }

    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({ success: false, error: `Booking is already in status: ${booking.bookingStatus}` });
    }

    booking.bookingStatus = 'accepted';
    await booking.save();

    // Create notification for renter
    await Notification.create({
      recipient: booking.renterId,
      sender: req.user.id,
      type: 'accepted',
      booking: booking._id,
      message: `Your booking request for "${booking.listingId.title}" has been accepted!`
    });

    res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject a booking request
// @route   PATCH /api/bookings/:id/reject
// @access  Private
exports.rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listingId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to reject this booking' });
    }

    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({ success: false, error: `Booking is already in status: ${booking.bookingStatus}` });
    }

    booking.bookingStatus = 'rejected';
    await booking.save();

    // Create notification for renter
    await Notification.create({
      recipient: booking.renterId,
      sender: req.user.id,
      type: 'rejected',
      booking: booking._id,
      message: `Your booking request for "${booking.listingId.title}" has been rejected.`
    });

    res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking (by Renter or Owner)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listingId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const isRenter = booking.renterId.toString() === req.user.id;
    const isOwner = booking.ownerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRenter && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to cancel this booking' });
    }

    // Cancel logic
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Notify the other party
    const recipient = isRenter ? booking.ownerId : booking.renterId;
    const cancellerName = req.user.name;

    await Notification.create({
      recipient,
      sender: req.user.id,
      type: 'rejected', // categorised under rejected style for UI alert red
      booking: booking._id,
      message: `Booking for "${booking.listingId.title}" has been cancelled by ${cancellerName}.`
    });

    res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status (generic status transition, e.g. for active or completed)
// @route   PATCH /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id).populate('listingId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const isRenter = booking.renterId.toString() === req.user.id;
    const isOwner = booking.ownerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRenter && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this booking' });
    }

    // Status transition rules
    if (status === 'accepted' && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Only the owner can accept the booking' });
    }

    if (status === 'active' && !isOwner && !isRenter && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to activate this booking' });
    }

    if (status === 'completed' && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Only the owner can mark booking as completed' });
    }

    booking.bookingStatus = status;
    await booking.save();

    // If marked completed, notify the renter to review
    if (status === 'completed') {
      await Notification.create({
        recipient: booking.renterId,
        sender: req.user.id,
        type: 'completed',
        booking: booking._id,
        message: `Your rental of "${booking.listingId.title}" is completed. Leave a review now!`
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};
