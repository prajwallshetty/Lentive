const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { listingId, startDate, endDate } = req.body;

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

    // Calculate total days
    const differenceInTime = end.getTime() - start.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays <= 0) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' });
    }

    const totalPrice = differenceInDays * listing.pricePerDay;
    const securityDeposit = listing.securityDeposit || 0;

    const booking = await Booking.create({
      listing: listingId,
      renter: req.user.id,
      owner: listing.owner,
      startDate: start,
      endDate: end,
      totalPrice,
      securityDeposit,
      status: 'pending'
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
    const bookings = await Booking.find({ renter: req.user.id })
      .populate({
        path: 'listing',
        select: 'title category pricePerDay securityDeposit images address location'
      })
      .populate('owner', 'name email avatar address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
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
    const bookings = await Booking.find({ owner: req.user.id })
      .populate({
        path: 'listing',
        select: 'title category pricePerDay securityDeposit images address location'
      })
      .populate('renter', 'name email avatar address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status (Approve, Complete, Cancel, Decline)
// @route   PATCH /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['approved', 'active', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id).populate('listing');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const isRenter = booking.renter.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRenter && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this booking' });
    }

    // Status transition authorization checks
    if (status === 'approved' && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Only the owner can approve the booking' });
    }

    if (status === 'completed' && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, error: 'Only the owner can mark booking as completed' });
    }

    // Apply the status update
    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};
