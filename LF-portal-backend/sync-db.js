const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

const User = require('./models/user');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

const ensureAdminUser = async () => {
  // If an admin row already exists, do nothing.
  const existingAdmin = await User.findOne({ where: { role: 'admin' } });
  if (existingAdmin) return;

  // Only seed if we have credentials.
  // (Admin login uses ADMIN_USERNAME / ADMIN_PASSWORD, so we should seed that username.)
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.warn(
      'No admin seed created: ADMIN_USERNAME / ADMIN_PASSWORD env vars are not set.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    studentId: String(ADMIN_USERNAME),
    displayName: 'Admin',
    password: passwordHash,
    email: String(ADMIN_USERNAME) + '@campus.edu',
    role: 'admin'
  });

  console.log('✅ Seeded initial admin user row');
};

const syncDatabase = async () => {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    await ensureAdminUser();
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
};

syncDatabase();
