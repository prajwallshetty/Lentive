const Listing = require('../models/Listing');

// @desc    Get all listings (optionally filtered by location, category, search query)
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res, next) => {
  try {
    const { lng, lat, distance, category, query, minPrice, maxPrice } = req.query;
    let findQuery = {};

    // 1. Geolocation Proximity Search (Hyperlocal)
    if (lng && lat) {
      const radiusInKm = Number(distance) || 10; // Default 10km radius
      const maxDistanceInMeters = radiusInKm * 1000;

      findQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: maxDistanceInMeters
        }
      };
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      findQuery.category = category;
    }

    // 3. Text Search Query
    if (query) {
      findQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // 4. Price range Filter
    if (minPrice || maxPrice) {
      findQuery.pricePerDay = {};
      if (minPrice) findQuery.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) findQuery.pricePerDay.$lte = Number(maxPrice);
    }

    // Always query only available listings
    findQuery.isAvailable = true;

    // Fetch listings
    const listings = await Listing.find(findQuery)
      .populate('owner', 'name email avatar ratings address')
      .sort(lng && lat ? null : { createdAt: -1 }); // Near queries sort by distance automatically

    res.status(200).json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email avatar ratings address location');

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      listing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
exports.createListing = async (req, res, next) => {
  try {
    const { title, description, category, pricePerDay, securityDeposit, images, address, coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, error: 'Please provide valid coordinates [longitude, latitude]' });
    }

    const listing = await Listing.create({
      title,
      description,
      category,
      pricePerDay,
      securityDeposit: securityDeposit || 0,
      images: images || [],
      address,
      location: {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])] // [lng, lat]
      },
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      listing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Make sure user is listing owner or admin
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'User not authorized to update this listing' });
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (req.body.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: [Number(req.body.coordinates[0]), Number(req.body.coordinates[1])]
      };
      delete updateData.coordinates;
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      listing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Make sure user is listing owner or admin
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'User not authorized to delete this listing' });
    }

    await Listing.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
