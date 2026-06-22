const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000]
    }
  },
  // Honeypot field - hidden from users, bots may fill it
  website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null
  },
  // Status for admin management
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied'),
    defaultValue: 'new'
  },
  // IP address for spam blocking (stored hashed)
  ipHash: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  // User agent for spam analysis
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Hash IP for privacy
Contact.prototype.getIpHash = function(ip) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(ip + process.env.SECRET_KEY || 'default').digest('hex');
};

module.exports = Contact;
