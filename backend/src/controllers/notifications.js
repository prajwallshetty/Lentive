const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name avatar')
      .populate({
        path: 'booking',
        populate: {
          path: 'listingId',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Make sure it belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      notification
    });
  } catch (err) {
    next(err);
  }
};
