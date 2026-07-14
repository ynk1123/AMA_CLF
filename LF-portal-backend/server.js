const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');  // ← FIXED: require('dotenv')
const { sequelize } = require('./config/database');

// Require all models to ensure they're loaded and synced
require('./models/user');
require('./models/item');
require('./models/claim');
require('./models/appointment');
require('./models/message');
require('./models/contact');
require('./models/notification');

dotenv.config();


const app = express();

// Render and proxy-aware header support
app.set('trust proxy', 1);

// CORS FIRST
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ama-clf.onrender.com',
  'https://ama-clf-1.onrender.com'
];
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⭐ STATIC IMAGES - SIMPLE & WORKING
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend build when available
const frontendBuildPath = path.join(__dirname, '../portal-frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

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
app.use('/api/notifications', require('./routes/notification'));

// Serve frontend index.html for all non-API routes when build exists

if (fs.existsSync(frontendBuildPath)) {
  // Use explicit route patterns to avoid Express/Path-to-RegExp issues with Node 24.
  app.get(/^\/(?!api\/)[\s\S]*$/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}


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
