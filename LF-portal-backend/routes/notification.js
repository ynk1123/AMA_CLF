const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationRead,
  softDeleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markNotificationRead);
router.delete('/:id', authenticate, softDeleteNotification);

module.exports = router;

