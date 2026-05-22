const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notifications');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all notification routes

router.route('/')
  .get(getNotifications);

router.route('/:id/read')
  .patch(markAsRead);

module.exports = router;
