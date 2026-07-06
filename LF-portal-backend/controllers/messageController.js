const Message = require('../models/message');
const User = require('../models/user');
const Item = require('../models/item');

exports.getMessages = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const messages = await Message.findAll({
      where: { itemId: itemId },
      include: [
        { model: User, as: 'User', attributes: ['studentId', 'displayName'] }
      ],
      order: [['timestamp', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    console.error('Error in getMessages:', err);
    res.status(400).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { content, itemId } = req.body;

    // req.user is normalized in middleware/auth.js
    const resolvedUserId = req.user?.role === 'admin' ? 0 : req.user?.id;

    // Validate inputs explicitly so frontend gets a clear error (not just 400)
    if (resolvedUserId == null) {
      return res.status(401).json({ message: 'Missing/invalid token (no user id)' });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Invalid content' });
    }
    if (!itemId) {
      return res.status(400).json({ message: 'Missing itemId' });
    }

    // For admin messages we use userId = 0, but DB has FK constraint to Users.
    // Ensure we attach to a real admin user row (role='admin') if available.
    let finalUserId = resolvedUserId;
    if (req.user?.role === 'admin') {
      const adminUser = await User.findOne({ where: { role: 'admin' } });
      if (adminUser) finalUserId = adminUser.id;
    }

    const message = await Message.create({
      content: content.trim(),
      itemId,
      userId: finalUserId,
      timestamp: new Date()
    });

    // Avoid extra DB roundtrip: fetch only when needed.
    // (If your Sequelize setup supports it, consider using `Message.findByPk(..., { include })` only in that case.)
    const messageWithUser = {
      ...message.toJSON(),
      User: { studentId: req.user?.studentId, displayName: req.user?.displayName }
    };

    // Fallback: if req.user doesn't carry display fields, do the include query.
    if (!messageWithUser.User?.studentId || !messageWithUser.User?.displayName) {
      const fetched = await Message.findOne({
        where: { id: message.id },
        include: [{ model: User, as: 'User', attributes: ['studentId', 'displayName'] }]
      });
      return res.status(201).json(fetched);
    }

    return res.status(201).json(messageWithUser);
  } catch (err) {
    console.error('Error in createMessage:', err);

    // Provide richer error details for admin/student debugging.
    // Sequelize errors can have: err.errors, err.parent, etc.
    return res.status(400).json({
      message: 'Failed to create message',
      error: err.message,
      name: err.name,
      details: err.errors || err.parent || null
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    await message.destroy();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete message' });
  }
};