const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const useSsl = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'campus_lost_found',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'sibuyas',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {},
    logging: false
  }
);

module.exports = { sequelize };