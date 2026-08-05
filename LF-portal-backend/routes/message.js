const express = require('express');
const rateLimit = require('express-rate-limit');
const { getMessages, createMessage, deleteMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Anti-spam: limit how many messages a single IP can SEND.
// IMPORTANT: applied ONLY to POST (createMessage) so reading (GET) and
// deleting (DELETE) messages are NOT affected. Other features are untouched.
const messageCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // max 10 messages sent per minute per IP
  message: { message: 'Too many messages sent. Please wait a moment before sending more.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/:itemId', authenticate, getMessages);
router.post('/', authenticate, messageCreateLimiter, createMessage);
router.delete('/:id', authenticate, deleteMessage);

module.exports = router;
