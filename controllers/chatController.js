const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Start/Get conversation between two users
// @route   POST /api/chats/conversation
// @access  Private
const getConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('participants', 'name email avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
      conversation = await conversation.populate('participants', 'name email avatar');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chats/message
// @access  Private
const sendMessage = async (req, res) => {
  const { conversationId, receiverId, text } = req.body;
  const senderId = req.user._id;

  try {
    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      text
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages for a conversation
// @route   GET /api/chats/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });

    // Mark as read for the current user
    await Message.updateMany(
      { conversationId: req.params.conversationId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unread messages count for user
// @route   GET /api/chats/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for user
// @route   GET /api/chats/conversations
// @access  Private
const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] }
    })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversation, sendMessage, getMessages, getUserConversations, getUnreadCount };
