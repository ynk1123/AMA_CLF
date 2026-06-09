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

const cleanupDuplicateEmails = async () => {
  try {
    // Find all users with non-null emails
    const users = await User.findAll({ 
      where: { 
        email: { 
          [require('sequelize').Op.ne]: null 
        } 
      } 
    });
    
    const emailCounts = {};
    for (const user of users) {
      if (user.email) {
        if (emailCounts[user.email]) {
          // Duplicate found - clear the email for the later user
          console.log(`Clearing duplicate email: ${user.email} for user ${user.studentId}`);
          await user.update({ email: null });
        } else {
          emailCounts[user.email] = true;
        }
      }
    }
    console.log('Cleaned up duplicate emails');
  } catch (err) {
    console.error('Error cleaning up emails:', err);
  }
};

// Migrate itemType from existing items
const migrateItemType = async () => {
  try {
    const Item = require('./models/item');
    // First force sync to ensure column exists
    await sequelize.sync({ alter: true });
    
// Get all items without itemType (null or undefined)
    const items = await Item.findAll({ 
      where: { 
        itemType: { 
          [require('sequelize').Op.or]: [null, undefined]
        } 
      } 
    });
    
    for (const item of items) {
      // For existing items, determine itemType based on current status
      let newItemType = 'lost';
      if (item.status === 'found') {
        newItemType = 'found';
      }
      // Items with status 'lost', 'pending', etc. default to 'lost'
      await item.update({ itemType: newItemType });
    }
    
    if (items.length > 0) {
      console.log(`Migrated ${items.length} items to populate itemType field`);
    }
  } catch (err) {
    console.error('Error migrating itemType:', err.message);
  }
};

const syncDatabase = async () => {
  try {
    console.log('Syncing database...');
    // First sync without constraints to clean duplicate emails
    await sequelize.sync({ alter: true });
    
    // Now clean up duplicates
    await cleanupDuplicateEmails();
    
    // Force sync again to add the unique constraint after cleanup
    await sequelize.sync({ alter: true });
    
    // Migrate itemType for existing items
    await migrateItemType();
    
    await ensureAdminUser();
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
};

syncDatabase();
