const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true
  },
  renterId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
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
  totalDays: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true,
    default: 0
  },
  bookingStatus: {
    type: String,
    enum: ['pending_payment', 'pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending_payment'
  },
  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'captured', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
