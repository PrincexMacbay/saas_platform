const { sequelize, User, Space, Follow, Membership } = require('../models');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    console.log('\nTesting table synchronization...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');

    console.log('\nTesting model queries...');
    
    // Test User model
    const userCount = await User.count();
    console.log(`✅ Users table: ${userCount} records`);

    // Test Space model
    const spaceCount = await Space.count();
    console.log(`✅ Spaces table: ${spaceCount} records`);

    // Test Follow model
    const followCount = await Follow.count();
    console.log(`✅ Follows table: ${followCount} records`);

    // Test Membership model
    const membershipCount = await Membership.count();
    console.log(`✅ Memberships table: ${membershipCount} records`);

    console.log('\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testDatabase();
