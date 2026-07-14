const express = require('express');
const router = express.Router();
const multer = require('multer');
const Item = require('../models/item');
const User = require('../models/user');
const Claim = require('../models/claim');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureCloudinaryConfigured = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET');
  }
};

// Use memory storage so we don't rely on Render's ephemeral filesystem
const upload = multer({ storage: multer.memoryStorage() });

// Create item - defaults to 'pending' status
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    ensureCloudinaryConfigured();

    const { title, category, color, brand, description, location, date, type } = req.body;

    // Required-field validation to prevent DB/Sequelize 500s.
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Missing/invalid title' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ message: 'Missing/invalid category' });
    }
    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ message: 'Missing/invalid location' });
    }
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Missing/invalid date. Expected YYYY-MM-DD.' });
    }
    if (type !== 'lost' && type !== 'found') {
      return res.status(400).json({ message: "Missing/invalid type. Expected 'lost' or 'found'." });
    }

    // Normalize date for DATEONLY
    let normalizedDate = date;
    if (typeof normalizedDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      normalizedDate = null;
    }

    // Default to 'lost' if not provided
    const itemType = type === 'found' ? 'found' : 'lost';

    let imageUrl = null;
    if (req.file) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: process.env.CLOUDINARY_FOLDER || undefined,
        resource_type: 'image',
      });
      imageUrl = uploadResult.secure_url;
    } else if (req.body?.image) {
      imageUrl = null;
    }

    // If admin posts item, skip pending status - no approval needed
    // If student posts item, require admin approval (default to 'pending')
    const itemStatus = req.user.role === 'admin' ? itemType : 'pending';

    const item = await Item.create({
      title,
      category,
      color,
      brand,
      description,
      location,
      date: normalizedDate,
      itemType: itemType,
      status: itemStatus,
      imageUrl,
      userId: req.user.id,
    });

    // DB-driven notifications for submissions waiting on approval.
    // - Student: notify themselves that their post is pending approval
    // - Admins: notify admins that a new post needs approval
    if (itemStatus === 'pending') {
      const Notification = require('../models/notification');
      const User = require('../models/user');

      // 1) Notify the item owner
      await Notification.create({
        user_id: req.user.id,
        title: item.title,
        message: 'Your post is waiting for approval. Status: pending',
      });

      // 2) Notify all admins
      const { Op } = require('sequelize');

      // IMPORTANT: Users.role is a Postgres ENUM. It can only contain values present in the enum.
      // The enum appears to be lowercase only ("admin"), so using "ADMIN" will crash the query.
      // We still keep a case-insensitive match by filtering on lowercase and skipping invalid enum values.
      const admins = await User.findAll({
        where: {
          role: {
            [Op.in]: ['admin']
          }
        },
        attributes: ['id']
      });
      const adminIds = admins.map((a) => a.id);

      // Avoid double-inserting for the rare case where the creator is also an admin.
      const distinctAdminIds = [...new Set(adminIds)].filter((id) => id !== req.user.id);

      if (distinctAdminIds.length > 0) {
        await Promise.all(
          distinctAdminIds.map((adminId) =>
            Notification.create({
              user_id: adminId,
              title: 'New Approval Required',
              message: `A user has posted "${item.title}". It is waiting for your approval.`,
            })
          )
        );
      }
    }

    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating item:', err);
    // Helpful for Render 400s debugging (validation / Cloudinary misconfig / multer issues)
    console.error('CreateItem req.user:', req.user);
    console.error('CreateItem req.body keys:', Object.keys(req.body || {}));
    if (req.file) console.error('CreateItem file:', { field: req.file.fieldname, mimetype: req.file.mimetype, size: req.file.size });

    res.status(400).json({
      message: 'Failed to create item',
      error: err.message,
      details: err.errors || err,
      reqBodyKeys: Object.keys(req.body || {}),
      cloudinaryConfigured: {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        folder: process.env.CLOUDINARY_FOLDER || null,
      },
    });
  }
});

// Get all items - only show approved items to public
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    const items = await Item.findAll({
      where: { status: ['lost', 'found', 'claimed', 'archived'] },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'displayName', 'studentId'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (userId) {
      const Claims = require('../models/claim');
      for (const item of items) {
        const userClaim = await Claims.findOne({
          where: { itemId: item.id, userId: userId, status: 'pending' },
        });

        if (userClaim) {
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

    if (item.status !== 'lost' && item.status !== 'found') {
      return res.status(400).json({ message: 'This item cannot be claimed' });
    }

    const existingClaim = await Claim.findOne({
      where: { itemId: id, userId: req.user.id, status: 'pending' },
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }

    const claim = await Claim.create({
      itemId: id,
      userId: req.user.id,
      answer: answer,
      status: 'pending',
    });

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
          attributes: ['id', 'title', 'category', 'status', 'imageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
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
      order: [['createdAt', 'DESC']],
    });

    res.json(items);
  } catch (err) {
    console.error('Error fetching my items:', err);
    res.status(400).json({ message: 'Failed to fetch my items', error: err.message });
  }
});

module.exports = router;

