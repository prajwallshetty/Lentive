const Review = require('../models/Review');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

// @desc    Get reviews for a listing (shows all renter reviews)
// @route   GET /api/listings/:listingId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId, type: 'renter' })
      .populate('reviewer', 'name email avatar verificationLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a review for a listing (Backwards-compatible renter review)
// @route   POST /api/listings/:listingId/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const listingId = req.params.listingId;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Security check: Must have completed booking for this listing
    const booking = await Booking.findOne({
      listingId,
      renterId: req.user.id,
      bookingStatus: 'completed'
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        error: 'You can only leave a review after completing a rental booking for this item.'
      });
    }

    // Check if user has already reviewed this booking
    const existingReview = await Review.findOne({
      booking: booking._id,
      type: 'renter'
    });

    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this booking.' });
    }

    const review = await Review.create({
      booking: booking._id,
      listing: listingId,
      reviewer: req.user.id,
      reviewee: listing.owner,
      type: 'renter',
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create review for a booking (renter reviews listing/owner, owner reviews renter)
// @route   POST /api/reviews/booking/:bookingId
// @access  Private
exports.createBookingReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const bookingId = req.params.bookingId;

    const booking = await Booking.findById(bookingId).populate('listingId');
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ success: false, error: 'You can only review completed rentals.' });
    }

    const isRenter = booking.renterId.toString() === req.user.id;
    const isOwner = booking.ownerId.toString() === req.user.id;

    if (!isRenter && !isOwner) {
      return res.status(401).json({ success: false, error: 'Not authorized to review this booking' });
    }

    const reviewType = isRenter ? 'renter' : 'owner';
    const reviewee = isRenter ? booking.ownerId : booking.renterId;

    // Check if already reviewed for this booking and type
    const existing = await Review.findOne({ booking: bookingId, type: reviewType });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already submitted your review for this booking.' });
    }

    const review = await Review.create({
      booking: bookingId,
      listing: booking.listingId._id,
      reviewer: req.user.id,
      reviewee,
      type: reviewType,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (err) {
    next(err);
  }
};
