const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
  },
  brand: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  itemType: {
    type: DataTypes.ENUM('lost', 'found'),
    defaultValue: 'lost',
  },
  status: {
    type: DataTypes.ENUM('pending', 'lost', 'found', 'under_verification', 'claimed', 'archived'),
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  claimAnswer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  claimStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  // When the post was created (server-side timestamp)
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Association for admin claims include (Item -> User)
const User = require('./user');
Item.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = Item;
