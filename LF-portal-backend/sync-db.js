const { sequelize } = require('./config/database');
const Item = require('./models/Item');
const Appointment = require('./models/appointment');
const Message = require('./models/Message');

const syncDatabase = async () => {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
};

syncDatabase();