const Item = require('../models/Item');
const User = require('../models/User');
const Appointment = require('../models/appointment');
const { Op } = require('sequelize');

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error('Error in getAllItems:', err);
    res.status(400).json({ message: 'Failed to fetch items', error: err.message });
  }
};

exports.approveItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.status = 'lost';
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to approve item' });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.status = status;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update item status' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete item' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'studentId', 'displayName', 'role', 'createdAt']
    });
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch users' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalItems = await Item.count();
    const totalLost = await Item.count({ where: { status: 'lost' } });
    const totalClaimed = await Item.count({ where: { status: 'claimed' } });
    const totalArchived = await Item.count({ where: { status: 'archived' } });
    const totalUsers = await User.count({ where: { role: 'student' } });
    const pendingAppointments = await Appointment.count({ where: { status: 'pending' } });
    
    res.json({
      totalItems,
      totalLost,
      totalClaimed,
      totalArchived,
      totalUsers,
      pendingAppointments
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    res.status(400).json({ message: 'Failed to fetch stats', error: err.message });
  }
};

exports.getLocationStats = async (req, res) => {
  try {
    const items = await Item.findAll({
      attributes: ['location']
    });
    
    const locationCounts = {};
    items.forEach(item => {
      const loc = item.location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    const result = Object.keys(locationCounts).map(location => ({
      location,
      count: locationCounts[location]
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error in getLocationStats:', err);
    res.status(400).json({ message: 'Failed to fetch location stats', error: err.message });
  }
};

exports.approveClaim = async (req, res) => {
  try {
    const { id, status } = req.body;
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    if (item.status !== 'under_verification') {
      return res.status(400).json({ message: 'Item is not under verification' });
    }
    
    item.claimStatus = status;
    if (status === 'approved') {
      item.status = 'claimed';
    } else if (status === 'rejected') {
      item.status = 'lost';
      item.claimAnswer = null;
      item.claimStatus = 'pending';
    }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update claim status' });
  }
};

exports.getPendingClaims = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { status: 'under_verification' },
      include: [{ model: User, as: 'User', attributes: ['studentId', 'displayName'] }]
    });
    res.json(items);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch pending claims' });
  }
};