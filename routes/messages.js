const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// @route   POST /api/messages
router.post('/', auth, sendMessage);

// @route   GET /api/messages/:ticketId
router.get('/:ticketId', auth, getMessages);

module.exports = router;