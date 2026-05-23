const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['renter', 'owner'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user cannot submit multiple reviews of the same type for a booking
ReviewSchema.index({ booking: 1, type: 1 }, { unique: true });

// Static method to get average rating of a listing (based on renter reviews)
ReviewSchema.statics.getAverageRatingForListing = async function(listingId) {
  const obj = await this.aggregate([
    {
      $match: { listing: listingId, type: 'renter' }
    },
    {
      $group: {
        _id: '$listing',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Listing').findByIdAndUpdate(listingId, {
        'ratings.average': Math.round(obj[0].averageRating * 10) / 10,
        'ratings.count': obj[0].count
      });
    } else {
      await this.model('Listing').findByIdAndUpdate(listingId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Static method to get average rating of a user
ReviewSchema.statics.getAverageRatingForUser = async function(userId) {
  const obj = await this.aggregate([
    {
      $match: { reviewee: userId }
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('User').findByIdAndUpdate(userId, {
        'ratings.average': Math.round(obj[0].averageRating * 10) / 10,
        'ratings.count': obj[0].count
      });
    } else {
      await this.model('User').findByIdAndUpdate(userId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call aggregations after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRatingForListing(this.listing);
  this.constructor.getAverageRatingForUser(this.reviewee);
});

// Call aggregations before delete
ReviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.getAverageRatingForListing(this.listing);
  this.constructor.getAverageRatingForUser(this.reviewee);
});

module.exports = mongoose.model('Review', ReviewSchema);
