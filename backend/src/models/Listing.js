const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a listing title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Tools', 'Electronics', 'Vehicles', 'Fashion', 'Outdoor', 'Party Supplies', 'Other']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please add rental price per day']
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  address: {
    type: String,
    required: [true, 'Please add an address/location name']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true // [longitude, latitude]
    }
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for location queries
ListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', ListingSchema);
