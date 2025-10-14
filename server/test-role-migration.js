const { User, sequelize } = require('./models');
require('dotenv').config();

async function testRoleMigration() {
  try {
    console.log('🧪 Testing role migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if role column exists
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (results.length > 0) {
      console.log('✅ Role column exists:', results[0]);
    } else {
      console.log('❌ Role column does not exist');
    }
    
    // Test User model
    const userCount = await User.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Test role field
    const usersWithRoles = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
      limit: 5
    });
    
    console.log('👥 Sample users with roles:');
    usersWithRoles.forEach(user => {
      console.log(`  - ${user.username} (${user.email}): ${user.role || 'NULL'}`);
    });
    
    console.log('🎉 Role migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing role migration:', error);
  } finally {
    await sequelize.close();
  }
}

// Run test if called directly
if (require.main === module) {
  testRoleMigration();
}

module.exports = testRoleMigration;
