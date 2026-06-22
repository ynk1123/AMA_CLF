const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
role: {
    type: DataTypes.ENUM('student', 'admin'),
    defaultValue: 'student',
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active',
  },
});

module.exports = User;