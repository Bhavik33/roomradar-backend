const express = require('express');
const { getConversation, sendMessage, getMessages, getUserConversations, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/conversation').post(protect, getConversation);
router.route('/conversations').get(protect, getUserConversations);
router.route('/message').post(protect, sendMessage);
router.route('/messages/:conversationId').get(protect, getMessages);
router.route('/unread-count').get(protect, getUnreadCount);

module.exports = router;
