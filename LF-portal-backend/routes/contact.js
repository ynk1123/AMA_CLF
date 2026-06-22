const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

// STRICT RATE LIMIT for contact form: 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 contact form submissions per window
  message: { message: 'Too many submissions from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no auth required)

// POST /api/contact - Submit contact form (public, rate limited)
router.post('/', contactLimiter, contactController.submitContact);

// Export the router
module.exports = router;
