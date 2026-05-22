const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get all chats for logged-in user
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar role isVerified verificationStatus')
      .populate('messages.sender', 'name avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chat message history with another user
// @route   GET /api/chats/:userId
// @access  Private
exports.getChatWithUser = async (req, res, next) => {
  try {
    const recipientId = req.params.userId;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient user not found'
      });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] }
    })
      .populate('participants', 'name avatar role isVerified verificationStatus')
      .populate('messages.sender', 'name avatar');

    // If no chat exists yet, we return an empty chat template or success response
    if (!chat) {
      return res.status(200).json({
        success: true,
        data: {
          participants: [req.user, recipient],
          messages: []
        }
      });
    }

    // Mark other user's messages as read
    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message (Create or append to chat)
// @route   POST /api/chats
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide recipientId and message'
      });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot message yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient user not found'
      });
    }

    // Find existing chat or create new
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] }
    });

    const newMessage = {
      sender: req.user._id,
      message,
      isRead: false,
      createdAt: new Date()
    };

    if (chat) {
      chat.messages.push(newMessage);
      // Touch the updatedAt field
      chat.markModified('messages');
      await chat.save();
    } else {
      chat = await Chat.create({
        participants: [req.user._id, recipientId],
        messages: [newMessage]
      });
    }

    // Populate and return updated chat
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar role isVerified verificationStatus')
      .populate('messages.sender', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedChat
    });
  } catch (err) {
    next(err);
  }
};
