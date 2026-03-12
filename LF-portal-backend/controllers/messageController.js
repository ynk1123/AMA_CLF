const Message = require('../models/Message');
const User = require('../models/User');
const Item = require('../models/Item');

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
    const userId = req.user.id;
    
    const message = await Message.create({
      content,
      itemId,
      userId,
      timestamp: new Date()
    });
    
    const messageWithUser = await Message.findOne({
      where: { id: message.id },
      include: [
        { model: User, as: 'User', attributes: ['studentId', 'displayName'] }
      ]
    });
    
    res.status(201).json(messageWithUser);
  } catch (err) {
    console.error('Error in createMessage:', err);
    res.status(400).json({ message: 'Failed to create message', error: err.message });
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