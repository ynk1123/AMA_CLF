const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Item = require('../models/item');
const User = require('../models/user');
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
    const { title, category, color, brand, description, location, date } = req.body;


    // Dashboard uses <input type="date" />, which should send YYYY-MM-DD.
    // If the field is missing or invalid, PostgreSQL DATE will reject it.
    let normalizedDate = date;
    if (typeof normalizedDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      normalizedDate = null;
    }
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const item = await Item.create({
      title,
      category,
      color,
      brand,
      description,
      location,
      date: normalizedDate,
      status: 'pending', // Default to pending for admin approval
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
    const items = await Item.findAll({
      where: { status: ['lost', 'found', 'under_verification', 'claimed', 'archived'] },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'displayName', 'studentId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(400).json({ message: 'Failed to fetch items' });
  }
});

// Claim item - save answer to database
router.post('/claim', authenticate, async (req, res) => {
  try {
    const { id, answer } = req.body;
    
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    if (item.status !== 'lost' && item.status !== 'found') {
      return res.status(400).json({ message: 'This item cannot be claimed' });
    }
    
    item.status = 'under_verification';
    item.claimAnswer = answer;
    item.claimStatus = 'pending';
    await item.save();
    
    res.json({ message: 'Claim submitted successfully', item });
  } catch (err) {
    console.error('Error claiming item:', err);
    res.status(400).json({ message: 'Failed to claim item', error: err.message });
  }
});

module.exports = router;