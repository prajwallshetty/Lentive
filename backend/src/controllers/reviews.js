const Review = require('../models/Review');
const Listing = require('../models/Listing');

// @desc    Get reviews for a listing
// @route   GET /api/listings/:listingId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('reviewer', 'name email avatar')
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

// @desc    Create a review for a listing
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

    // Optional: check if user has already reviewed
    const existingReview = await Review.findOne({
      listing: listingId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this item' });
    }

    const review = await Review.create({
      listing: listingId,
      reviewer: req.user.id,
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
