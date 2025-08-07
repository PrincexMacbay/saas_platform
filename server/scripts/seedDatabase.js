const { sequelize, User, Space, Post, Comment, Membership } = require('../models');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create demo users
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@humhub.test',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        about: 'System administrator',
        status: 1,
      },
      {
        username: 'johnhub',
        email: 'john@humhub.test',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        about: 'Software developer and tech enthusiast',
        status: 1,
      },
      {
        username: 'janehub',
        email: 'jane@humhub.test',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        about: 'Marketing professional and content creator',
        status: 1,
      },
      {
        username: 'mikehub',
        email: 'mike@humhub.test',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Johnson',
        about: 'Project manager and team lead',
        status: 1,
      },
    ], { individualHooks: true }); // Enable hooks to hash passwords

    console.log('Demo users created');

    // Create demo spaces
    const spaces = await Space.bulkCreate([
      {
        name: 'General Discussion',
        description: 'A place for general discussions and announcements',
        about: 'Welcome to our main discussion space! Here you can share ideas, ask questions, and connect with other members.',
        url: 'general',
        joinPolicy: 2, // Free for all
        visibility: 2, // Public
        ownerId: users[0].id,
      },
      {
        name: 'Development Team',
        description: 'Private space for development team collaboration',
        about: 'This space is for our development team to collaborate on projects, share code snippets, and discuss technical challenges.',
        url: 'dev-team',
        joinPolicy: 1, // Application required
        visibility: 1, // Registered only
        ownerId: users[1].id,
      },
      {
        name: 'Marketing & Content',
        description: 'Marketing team coordination and content planning',
        about: 'Our marketing team uses this space to plan campaigns, share content ideas, and coordinate promotional activities.',
        url: 'marketing',
        joinPolicy: 2, // Free for all
        visibility: 1, // Registered only
        ownerId: users[2].id,
      },
    ]);

    console.log('Demo spaces created');

    // Create memberships
    const memberships = await Membership.bulkCreate([
      // Admin is owner of General Discussion
      { userId: users[0].id, spaceId: spaces[0].id, status: 4 }, // Owner
      
      // John is owner of Development Team
      { userId: users[1].id, spaceId: spaces[1].id, status: 4 }, // Owner
      
      // Jane is owner of Marketing & Content
      { userId: users[2].id, spaceId: spaces[2].id, status: 4 }, // Owner
      
      // Cross-memberships
      { userId: users[0].id, spaceId: spaces[1].id, status: 2 }, // Admin in dev team
      { userId: users[0].id, spaceId: spaces[2].id, status: 2 }, // Admin in marketing
      { userId: users[1].id, spaceId: spaces[0].id, status: 1 }, // John member of general
      { userId: users[2].id, spaceId: spaces[0].id, status: 1 }, // Jane member of general
      { userId: users[3].id, spaceId: spaces[0].id, status: 1 }, // Mike member of general
      { userId: users[3].id, spaceId: spaces[1].id, status: 1 }, // Mike member of dev team
    ]);

    console.log('Demo memberships created');

    // Create demo posts
    const posts = await Post.bulkCreate([
      {
        message: 'Welcome to our new social platform! 🎉 Feel free to introduce yourself and let us know what you\'re working on.',
        visibility: 1,
        userId: users[0].id,
        spaceId: spaces[0].id,
      },
      {
        message: 'Just finished implementing the new authentication system. The JWT tokens now expire after 7 days for better security.',
        visibility: 1,
        userId: users[1].id,
        spaceId: spaces[1].id,
      },
      {
        message: 'Working on the new onboarding flow designs. Should we include a tutorial for new users?',
        visibility: 1,
        userId: users[2].id,
        spaceId: spaces[2].id,
      },
      {
        message: 'Great team meeting today! Looking forward to the new features we discussed.',
        visibility: 1,
        userId: users[3].id,
        spaceId: spaces[0].id,
      },
      {
        message: 'Personal update: Just started learning React hooks. Any good resources you\'d recommend?',
        visibility: 2, // Public
        userId: users[1].id,
        spaceId: null, // Personal post
      },
    ]);

    console.log('Demo posts created');

    // Create demo comments
    await Comment.bulkCreate([
      {
        message: 'Thanks for setting this up! Excited to be here.',
        userId: users[1].id,
        postId: posts[0].id,
      },
      {
        message: 'This looks great! Can\'t wait to explore all the features.',
        userId: users[2].id,
        postId: posts[0].id,
      },
      {
        message: 'Good security improvement! How did you handle existing sessions?',
        userId: users[0].id,
        postId: posts[1].id,
      },
      {
        message: 'I think a tutorial would be helpful, especially for the space features.',
        userId: users[1].id,
        postId: posts[2].id,
      },
      {
        message: 'Check out the official React documentation - it\'s really well written!',
        userId: users[2].id,
        postId: posts[4].id,
      },
    ]);

    console.log('Demo comments created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDemo accounts:');
    console.log('- admin@humhub.test / password123 (Admin)');
    console.log('- john@humhub.test / password123 (John Doe)');
    console.log('- jane@humhub.test / password123 (Jane Smith)');
    console.log('- mike@humhub.test / password123 (Mike Johnson)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;