const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        user_id: req.user.id,
        is_deleted: false,
      },
      order: [['created_at', 'DESC']],
    });

    // Normalize fields so frontend is consistent even if DB rows are missing columns.
    const normalized = notifications.map((n) => {
      const obj = n.toJSON ? n.toJSON() : n;
      return {
        ...obj,
        is_read: obj.is_read === true,
        created_at: obj.created_at || obj.createdAt || obj.time || null,
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(400).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        user_id: req.user.id,
        is_deleted: false,
      },
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.update({ is_read: true });
    res.json(notification);
  } catch (err) {
    console.error('markNotificationRead error:', err);
    res.status(400).json({ message: 'Failed to mark notification as read', error: err.message });
  }
};

exports.softDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        user_id: req.user.id,
        is_deleted: false,
      },
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.update({ is_deleted: true });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('softDeleteNotification error:', err);
    res.status(400).json({ message: 'Failed to delete notification', error: err.message });
  }
};

