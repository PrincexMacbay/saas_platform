const { sequelize, User, Space, Post, Comment, Membership, Follow, Like, Job, JobApplication, SavedJob } = require('./models');

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Force sync to recreate all tables
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synced successfully');
    
    // Verify tables were created
    const [results] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    );
    
    console.log('\n📋 Tables created:');
    results.forEach(row => console.log(`- ${row.tablename}`));
    
    // Check for Career Center tables
    const careerTables = ['jobs', 'job_applications', 'saved_jobs'];
    const existingTables = results.map(row => row.tablename);
    
    console.log('\n🎯 Career Center tables:');
    careerTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`- ${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    // Create demo users
    console.log('\n👥 Creating demo users...');
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        about: 'System administrator',
        status: 1,
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        about: 'Software developer',
        status: 1,
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        about: 'Marketing professional',
        status: 1,
      },
    ], { individualHooks: true });
    
    console.log(`✅ Created ${users.length} demo users`);
    
    // Create demo spaces
    console.log('\n🏢 Creating demo spaces...');
    const spaces = await Space.bulkCreate([
      {
        name: 'General Discussion',
        description: 'A place for general discussions',
        about: 'Welcome to our main discussion space!',
        url: 'general',
        joinPolicy: 2,
        visibility: 2,
        ownerId: users[0].id,
      },
      {
        name: 'Development Team',
        description: 'Private space for development team',
        about: 'Development team collaboration space',
        url: 'dev-team',
        joinPolicy: 1,
        visibility: 1,
        ownerId: users[1].id,
      },
    ]);
    
    console.log(`✅ Created ${spaces.length} demo spaces`);
    
    // Create memberships
    console.log('\n👥 Creating memberships...');
    await Membership.bulkCreate([
      { userId: users[0].id, spaceId: spaces[0].id, status: 4 }, // Admin owner
      { userId: users[1].id, spaceId: spaces[1].id, status: 4 }, // John owner
      { userId: users[0].id, spaceId: spaces[1].id, status: 2 }, // Admin in dev team
      { userId: users[1].id, spaceId: spaces[0].id, status: 1 }, // John in general
      { userId: users[2].id, spaceId: spaces[0].id, status: 1 }, // Jane in general
    ]);
    
    console.log('✅ Created memberships');
    
    // Create demo posts
    console.log('\n📝 Creating demo posts...');
    const posts = await Post.bulkCreate([
      {
        message: 'Welcome to our new social platform! 🎉',
        visibility: 1,
        userId: users[0].id,
        spaceId: spaces[0].id,
      },
      {
        message: 'Just finished implementing the authentication system.',
        visibility: 1,
        userId: users[1].id,
        spaceId: spaces[1].id,
      },
      {
        message: 'Personal update: Learning React hooks!',
        visibility: 2,
        userId: users[1].id,
        spaceId: null,
      },
    ]);
    
    console.log(`✅ Created ${posts.length} demo posts`);
    
    // Create demo comments
    console.log('\n💬 Creating demo comments...');
    await Comment.bulkCreate([
      {
        message: 'Thanks for setting this up!',
        userId: users[1].id,
        postId: posts[0].id,
      },
      {
        message: 'Great work on the auth system!',
        userId: users[0].id,
        postId: posts[1].id,
      },
    ]);
    
    console.log('✅ Created demo comments');
    
    // Create demo jobs (Career Center)
    console.log('\n💼 Creating demo jobs...');
    const jobs = await Job.bulkCreate([
      {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer to join our team.',
        requirements: '5+ years experience, React, Node.js, PostgreSQL',
        benefits: 'Health insurance, remote work, flexible hours',
        category: 'Technology',
        jobType: 'full-time',
        location: 'New York, NY',
        salaryMin: 80000,
        salaryMax: 120000,
        experienceLevel: 'senior',
        remoteWork: true,
        userId: users[0].id,
      },
      {
        title: 'Marketing Specialist',
        description: 'Join our marketing team to help grow our brand.',
        requirements: '3+ years marketing experience, social media skills',
        benefits: 'Competitive salary, growth opportunities',
        category: 'Marketing',
        jobType: 'full-time',
        location: 'Los Angeles, CA',
        salaryMin: 50000,
        salaryMax: 70000,
        experienceLevel: 'mid',
        remoteWork: false,
        userId: users[2].id,
      },
    ]);
    
    console.log(`✅ Created ${jobs.length} demo jobs`);
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Demo accounts:');
    console.log('- admin@example.com / password123 (Admin)');
    console.log('- john@example.com / password123 (John Doe)');
    console.log('- jane@example.com / password123 (Jane Smith)');
    
    console.log('\n🚀 You can now start the server and test the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

initDatabase();
