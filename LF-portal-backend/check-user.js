const User = require('./models/user');

async function checkUser() {
  try {
    // Get all users with their emails
    const results = await User.findAll({ 
      attributes: ['studentId', 'email']
    });
    console.log('All users:');
    results.forEach(r => {
      console.log(`  ${r.studentId} -> ${r.email || '(no email)'}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkUser();
