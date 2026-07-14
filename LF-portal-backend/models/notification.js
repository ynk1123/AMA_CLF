const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Persistent, DB-driven notifications.
// NOTE: Table name is explicitly set to match the provided SQL blueprint.
const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // Keep Sequelize from adding createdAt/updatedAt columns.
    // We manage created_at explicitly.
  },
  {
    tableName: 'Notifications',
    timestamps: false,
  }
);

module.exports = Notification;

