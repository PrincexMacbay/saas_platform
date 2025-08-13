const { sequelize, User } = require('../models');
require('dotenv').config();

const checkAndAddUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check existing users
    const existingUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'firstName', 'lastName']
    });

    console.log('\n📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`- ${user.username} (${user.firstName} ${user.lastName}) - ${user.email}`);
    });

    // Check if Queen exists
    const queenUser = await User.findOne({
      where: { username: 'Queen' }
    });

    if (!queenUser) {
      console.log('\n👑 Creating Queen user...');
      const newQueen = await User.create({
        username: 'Queen',
        email: 'queen@humhub.test',
        password: 'password123',
        firstName: 'Queen',
        lastName: 'Elizabeth',
        about: 'Royal user for testing purposes',
        status: 1,
      });
      console.log('✅ Queen user created successfully');
    } else {
      console.log('\n👑 Queen user already exists');
    }

    console.log('\n🎉 User check completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

checkAndAddUsers();
