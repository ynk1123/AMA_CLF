const express = require('express');
const { getMessages, createMessage, deleteMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/:itemId', authenticate, getMessages);
router.post('/', authenticate, createMessage);
router.delete('/:id', authenticate, deleteMessage);

module.exports = router;   