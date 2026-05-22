const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  messages: [MessageSchema]
}, {
  timestamps: true
});

// Index to quickly find chats by participant
ChatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
