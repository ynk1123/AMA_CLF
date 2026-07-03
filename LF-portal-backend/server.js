const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');  // ← FIXED: require('dotenv')
const { sequelize } = require('./config/database');

// Require all models to ensure they're loaded and synced
require('./models/user');
require('./models/item');
require('./models/claim');
require('./models/appointment');
require('./models/message');
require('./models/contact');

dotenv.config();

const app = express();

// CORS FIRST
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://ama-clf-1.onrender.com')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⭐ STATIC IMAGES - SIMPLE & WORKING
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security
app.use(helmet({
  contentSecurityPolicy: false
}));

// Rate limiting - Global limiter for public routes
const globalLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests, please try again later'
});

// Apply global rate limit to most routes
app.use('/api/auth', globalLimiter);
app.use('/api/items', globalLimiter);
app.use('/api/messages', globalLimiter);
app.use('/api/appointments', globalLimiter);

// Admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Admin rate limit exceeded'
});
app.use('/api/admin', adminLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/item'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

// Note: Using simple sync() - the Claim table should already exist from previous runs
// If Claim table is missing, it will be created automatically
sequelize.sync().then(() => {
  console.log('✅ Database connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📁 Images: http://localhost:${PORT}/uploads`);
  });
}).catch(err => console.error('DB Error:', err));
