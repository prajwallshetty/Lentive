const express = require('express');
const { getChats, getChatWithUser, sendMessage } = require('../controllers/chats');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChats)
  .post(sendMessage);

router.route('/:userId')
  .get(getChatWithUser);

module.exports = router;
