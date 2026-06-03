const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');  // ← FIXED: require('dotenv')
const { sequelize } = require('./config/database');

dotenv.config();

const app = express();

// CORS FIRST
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/item'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/admin', require('./routes/admin'));

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log('✅ Database connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📁 Images: http://localhost:${PORT}/uploads`);
  });
}).catch(err => console.error('DB Error:', err));