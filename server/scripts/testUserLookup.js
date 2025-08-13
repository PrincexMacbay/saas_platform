const { sequelize, User } = require('../models');
require('dotenv').config();

const testUserLookup = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Test 1: Direct username lookup
    console.log('\n🔍 Test 1: Direct username lookup');
    const user1 = await User.findOne({
      where: { username: 'Queen' }
    });
    console.log('User found:', user1 ? 'Yes' : 'No');
    if (user1) {
      console.log('User data:', {
        id: user1.id,
        username: user1.username,
        email: user1.email,
        firstName: user1.firstName,
        lastName: user1.lastName
      });
    }

    // Test 2: Check if identifier is numeric
    console.log('\n🔍 Test 2: Check numeric identifier logic');
    const identifier = 'Queen';
    const isNumeric = /^\d+$/.test(identifier);
    console.log('Identifier:', identifier);
    console.log('Is numeric:', isNumeric);

    // Test 3: Simulate the user controller logic
    console.log('\n🔍 Test 3: Simulate user controller logic');
    const user2 = await User.findOne({
      where: isNumeric 
        ? { id: identifier }
        : { username: identifier }
    });
    console.log('User found with controller logic:', user2 ? 'Yes' : 'No');

    // Test 4: Check all users
    console.log('\n🔍 Test 4: Check all users');
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'email']
    });
    console.log('All users:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });

    console.log('\n🎉 Test completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

testUserLookup();
