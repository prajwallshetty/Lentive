const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
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
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['held', 'released', 'disputed', 'refunded'],
    default: 'held'
  },
  disputeReason: {
    type: String,
    default: ''
  },
  resolvedRemarks: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deposit', DepositSchema);
