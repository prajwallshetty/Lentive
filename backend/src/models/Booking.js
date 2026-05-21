const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true
  },
  renter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
