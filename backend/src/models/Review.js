const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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

// Prevent user from submitting more than one review per listing (optional, but good)
ReviewSchema.index({ listing: 1, reviewer: 1 }, { unique: true });

// Static method to get average rating of a listing
ReviewSchema.statics.getAverageRating = async function(listingId) {
  const obj = await this.aggregate([
    {
      $match: { listing: listingId }
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

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.listing);
});

// Call getAverageRating before delete
ReviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.getAverageRating(this.listing);
});

module.exports = mongoose.model('Review', ReviewSchema);
