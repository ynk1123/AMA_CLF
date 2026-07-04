const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Render Postgres typically requires SSL.
// DB_SSL can be set to 'true' to force SSL, but we also auto-enable when using a non-local DB.
const envDbHost = (process.env.DB_HOST || '').toLowerCase();
const useSsl =
  process.env.DB_SSL === 'true' ||
  (envDbHost && envDbHost !== 'localhost' && envDbHost !== '127.0.0.1');

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