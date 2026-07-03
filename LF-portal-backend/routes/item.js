const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Item = require('../models/item');
const User = require('../models/user');
const Claim = require('../models/claim');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create item - defaults to 'pending' status
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
const { title, category, color, brand, description, location, date, type } = req.body;

    // Dashboard uses <input type="date" />, which should send YYYY-MM-DD.
    // If the field is missing or invalid, PostgreSQL DATE will reject it.
    let normalizedDate = date;
    if (typeof normalizedDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      normalizedDate = null;
    }
    
// Default to 'lost' if not provided
    const itemType = (type === 'found') ? 'found' : 'lost';
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // If admin posts item, skip pending status - no approval needed
    // If student posts item, require admin approval (default to 'pending')
    const itemStatus = (req.user.role === 'admin') ? itemType : 'pending';
    
    const item = await Item.create({
      title,
      category,
      color,
      brand,
      description,
      location,
      date: normalizedDate,
      itemType: itemType, // Store the original type (lost/found)
      status: itemStatus, // Admin items go live immediately, student items need approval
      imageUrl,
      userId: req.user.id
    });
    
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(400).json({
      message: 'Failed to create item',
      error: err.message,
      details: err.errors || err
    });
  }
});

// Get all items - only show approved items to public
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id; // Get current user if authenticated
    
// Only show items that are not yet under admin verification
    // (lost/found can be claimed, claimed/archived are already resolved)
    const items = await Item.findAll({
      where: { status: ['lost', 'found', 'claimed', 'archived'] },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'displayName', 'studentId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // If user is authenticated, check their claim status for each item
    // Override status for users who have pending claims
    if (userId) {
      const Claims = require('../models/claim');
      for (const item of items) {
        const userClaim = await Claims.findOne({
          where: { itemId: item.id, userId: userId, status: 'pending' }
        });
        if (userClaim) {
          // User has pending claim - set status directly on the data object
          // This will be included in the JSON response
          item.status = 'under_verification';
        }
      }
    }
    
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(400).json({ message: 'Failed to fetch items' });
  }
});

// Claim item - save answer to database (allows multiple users to claim)
router.post('/claim', authenticate, async (req, res) => {
  try {
    const { id, answer } = req.body;
    
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    // Allow claiming if status is lost or found
    if (item.status !== 'lost' && item.status !== 'found') {
      return res.status(400).json({ message: 'This item cannot be claimed' });
    }
    
    // Check if user already has a pending claim for this item
    const existingClaim = await Claim.findOne({
      where: { itemId: id, userId: req.user.id, status: 'pending' }
    });
    
    if (existingClaim) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }
    
// Create a new Claim record
    const claim = await Claim.create({
      itemId: id,
      userId: req.user.id,
      answer: answer,
      status: 'pending'
    });
    
    // DON'T change item status - keep it lost/found so OTHER users can still see and claim
    // Only the claimant will see "under_verification" via the GET endpoint override
    
    res.json({ message: 'Claim submitted successfully', claim });
  } catch (err) {
    console.error('Error claiming item:', err);
    res.status(400).json({ message: 'Failed to claim item', error: err.message });
  }
});

// Get my claims (for the current user)
router.get('/my-claims', authenticate, async (req, res) => {
  try {
    const claims = await Claim.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Item,
          as: 'Item',
          attributes: ['id', 'title', 'category', 'status', 'imageUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(claims);
  } catch (err) {
    console.error('Error fetching claims:', err);
    res.status(400).json({ message: 'Failed to fetch claims', error: err.message });
  }
});

// Get my posted items - INCLUDES pending items (visible only to the owner)
router.get('/my-posted-items', authenticate, async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching my items:', err);
    res.status(400).json({ message: 'Failed to fetch my items', error: err.message });
  }
});

module.exports = router;
