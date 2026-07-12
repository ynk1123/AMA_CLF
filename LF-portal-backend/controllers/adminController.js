const Item = require('../models/item');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const Claim = require('../models/claim');


exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'studentId', 'displayName']
        }
      ],
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
    
    // Use the original type (lost/found) from itemType field when approving
    item.status = item.itemType || 'lost';
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
  const itemId = req.params.id;
  
  try {
    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    // Get the Claim model
    const Claim = require('../models/claim');
    
    // Delete claims (ignore errors if table doesn't exist yet)
    try {
      await Claim.destroy({ where: { itemId } });
    } catch (e) {
      console.log('No claims to delete or table not found');
    }
    
    // Delete appointments (ignore errors if table doesn't exist yet)
    try {
      await Appointment.destroy({ where: { itemId } });
    } catch (e) {
      console.log('No appointments to delete or table not found');
    }
    
    // Delete messages (ignore errors if table doesn't exist yet)
    try {
      const Message = require('../models/message');
      await Message.destroy({ where: { itemId } });
    } catch (e) {
      console.log('No messages to delete or table not found');
    }
    
    // Delete the item
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(400).json({ message: 'Failed to delete item', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.findAll({
      where: { is_verified: true },
      attributes: ['id', 'studentId', 'displayName', 'email', 'role', 'status', 'createdAt', 'is_verified']
    });

    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(400).json({ message: 'Failed to fetch users', error: err.message });
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
      // Revert to original type (lost/found) instead of hardcoded 'lost'
      item.status = item.itemType || 'lost';
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

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  const Message = require('../models/message');
  
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }
    
    // Delete all items posted by this user first
    const userItems = await Item.findAll({ where: { userId } });
    for (const item of userItems) {
      await item.destroy();
    }
    console.log(`Deleted ${userItems.length} items for user ${userId}`);
    
    // Delete all messages by this user
    const userMessages = await Message.findAll({ where: { userId } });
    for (const msg of userMessages) {
      await msg.destroy();
    }
    console.log(`Deleted ${userMessages.length} messages for user ${userId}`);
    
    // Delete the user
    await user.destroy();
    res.json({ message: 'User, their items, and messages deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(400).json({ message: 'Failed to delete user', error: err.message });
  }
};

// Suspend user (Admin only)
exports.suspendUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from suspending themselves
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot suspend your own account' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent suspending other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot suspend admin accounts' });
    }
    
    // Check if already suspended
    if (user.status === 'suspended') {
      return res.status(400).json({ message: 'User is already suspended' });
    }
    
    user.status = 'suspended';
    await user.save();
    res.json({ message: 'User suspended successfully', user });
  } catch (err) {
    console.error('Error suspending user:', err);
    res.status(400).json({ message: 'Failed to suspend user', error: err.message });
  }
};

// Reactivate user (Admin only)
exports.reactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if already active
    if (user.status === 'active') {
      return res.status(400).json({ message: 'User is already active' });
    }
    
    user.status = 'active';
    await user.save();
    res.json({ message: 'User reactivated successfully', user });
  } catch (err) {
    console.error('Error reactivating user:', err);
    res.status(400).json({ message: 'Failed to reactivate user', error: err.message });
  }
};

// Get all claims for an item (Admin)
exports.getItemClaims = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const claims = await Claim.findAll({
      where: { itemId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'studentId', 'displayName', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(claims);
  } catch (err) {
    console.error('Error fetching item claims:', err);
    res.status(400).json({ message: 'Failed to fetch claims', error: err.message });
  }
};

// Approve or reject a specific claim (Admin)
exports.approveOrRejectClaim = async (req, res) => {
  try {
    const { claimId, status } = req.body;
    
    const claim = await Claim.findByPk(claimId, {
      include: [{ model: Item, as: 'Item' }]
    });
    
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    
    // Update claim status
    claim.status = status;
    await claim.save();
    
    const item = claim.Item;
    
    if (status === 'approved') {
      // Approve this claim - mark item as claimed
      item.status = 'claimed';
      // Reject all other pending claims for this item
      await Claim.update(
        { status: 'rejected' },
        { where: { itemId: claim.itemId, status: 'pending', id: { [require('sequelize').Op.ne]: claimId } } }
      );
    } else if (status === 'rejected') {
      // Check if there are other pending claims
      const otherPendingClaims = await Claim.count({
        where: { itemId: claim.itemId, status: 'pending', id: { [require('sequelize').Op.ne]: claimId } }
      });
      
      if (otherPendingClaims > 0) {
        // Keep item as under_verification since there are other claims
        item.status = 'under_verification';
      } else {
        // No more pending claims - revert to original type
        item.status = item.itemType || 'lost';
      }
    }
    
    await item.save();
    
    res.json({ message: `Claim ${status}`, claim, item });
  } catch (err) {
    console.error('Error updating claim:', err);
    res.status(400).json({ message: 'Failed to update claim', error: err.message });
  }
};

// Get all pending claims across all items (Admin)
exports.getAllPendingClaims = async (req, res) => {
  try {
    // First check if Claim table has any records at all
    const totalClaims = await Claim.count();
    console.log(`[Admin] Total claims in database: ${totalClaims}`);
    
    const pendingCount = await Claim.count({ where: { status: 'pending' } });
    console.log(`[Admin] Pending claims count: ${pendingCount}`);
    
    const claims = await Claim.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Item,
          as: 'Item',
          attributes: ['id', 'title', 'category', 'status', 'imageUrl']
        },
        {
          model: User,
          as: 'User',
          attributes: ['id', 'studentId', 'displayName', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`[Admin] Returning ${claims.length} pending claims`);
    res.json(claims);
  } catch (err) {
    console.error('Error fetching all pending claims:', err);
    res.status(400).json({ message: 'Failed to fetch claims', error: err.message });
  }
};

// Get ALL claims across all items (Admin) - including approved/rejected
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.findAll({
      include: [
        {
          model: Item,
          as: 'Item',
          attributes: ['id', 'title', 'category', 'status', 'imageUrl']
        },
        {
          model: User,
          as: 'User',
          attributes: ['id', 'studentId', 'displayName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(claims);
  } catch (err) {
    console.error('Error fetching all claims:', err);
    res.status(400).json({ message: 'Failed to fetch all claims', error: err.message });
  }
};
