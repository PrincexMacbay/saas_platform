const { User, Space, Post, Comment, Membership, Follow, Like, Job, JobApplication, SavedJob } = require('../models');
const bcrypt = require('bcryptjs');

class SeederService {
  constructor() {
    this.isSeeded = false;
  }

  async seedDatabase() {
    if (this.isSeeded) {
      console.log('Database already seeded, skipping...');
      return;
    }

    try {
      console.log('🌱 Starting database seeding...');

      // Check if we already have data
      const userCount = await User.count();
      if (userCount > 0) {
        console.log('✅ Database already has data, skipping seeding');
        this.isSeeded = true;
        return;
      }

      // Create demo users
      const users = await this.createUsers();
      console.log(`✅ Created ${users.length} users`);

      // Create demo spaces
      const spaces = await this.createSpaces(users);
      console.log(`✅ Created ${spaces.length} spaces`);

      // Create demo posts
      const posts = await this.createPosts(users, spaces);
      console.log(`✅ Created ${posts.length} posts`);

      // Create demo comments
      const comments = await this.createComments(users, posts);
      console.log(`✅ Created ${comments.length} comments`);

      // Create demo jobs
      const jobs = await this.createJobs(users);
      console.log(`✅ Created ${jobs.length} jobs`);

      // Create demo memberships
      const memberships = await this.createMemberships(users, spaces);
      console.log(`✅ Created ${memberships.length} memberships`);

      // Create demo follows
      const follows = await this.createFollows(users, spaces);
      console.log(`✅ Created ${follows.length} follows`);

      // Create demo likes
      const likes = await this.createLikes(users, posts, comments);
      console.log(`✅ Created ${likes.length} likes`);

      this.isSeeded = true;
      console.log('🎉 Database seeding completed successfully!');
      console.log('\n📋 Demo accounts:');
      console.log('- admin@example.com / password123 (Admin)');
      console.log('- john@example.com / password123 (John Doe)');
      console.log('- jane@example.com / password123 (Jane Smith)');
      console.log('- mike@example.com / password123 (Mike Johnson)');
      console.log('- sarah@example.com / password123 (Sarah Wilson)');

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async createUsers() {
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        about: 'System administrator and platform manager',
        status: 1,
        userType: 'individual',
      },
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        about: 'Software developer and tech enthusiast. Passionate about building great products.',
        status: 1,
        userType: 'individual',
        workExperience: '5+ years in software development',
        jobPreferences: 'Full-stack development, React, Node.js',
      },
      {
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        about: 'Marketing professional and content creator. Love connecting with people.',
        status: 1,
        userType: 'individual',
        workExperience: '3+ years in digital marketing',
        jobPreferences: 'Marketing, Content creation, Social media',
      },
      {
        username: 'mikejohnson',
        email: 'mike@example.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Johnson',
        about: 'Project manager and team lead. Focused on delivering results.',
        status: 1,
        userType: 'individual',
        workExperience: '7+ years in project management',
        jobPreferences: 'Project management, Team leadership',
      },
      {
        username: 'sarahwilson',
        email: 'sarah@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Wilson',
        about: 'UX/UI designer and creative professional.',
        status: 1,
        userType: 'individual',
        workExperience: '4+ years in UX/UI design',
        jobPreferences: 'UX/UI design, Creative direction',
      },
      {
        username: 'techcorp',
        email: 'hr@techcorp.com',
        password: 'password123',
        firstName: 'Tech',
        lastName: 'Corp',
        about: 'Leading technology company focused on innovation',
        status: 1,
        userType: 'company',
        companyName: 'TechCorp Solutions',
        industry: 'Technology',
        companySize: '100-500 employees',
        website: 'https://techcorp.com',
        location: 'San Francisco, CA',
      },
    ], { individualHooks: true });

    return users;
  }

  async createSpaces(users) {
    const spaces = await Space.bulkCreate([
      {
        name: 'General Discussion',
        description: 'A place for general discussions and announcements',
        about: 'Welcome to our main discussion space! Here you can share ideas, ask questions, and connect with other members.',
        url: 'general',
        joinPolicy: 2, // Free for all
        visibility: 2, // Public
        ownerId: users[0].id, // Admin
        color: '#3498db',
      },
      {
        name: 'Development Team',
        description: 'Private space for development team collaboration',
        about: 'This space is for our development team to collaborate on projects, share code snippets, and discuss technical challenges.',
        url: 'dev-team',
        joinPolicy: 1, // Application required
        visibility: 1, // Registered only
        ownerId: users[1].id, // John
        color: '#e74c3c',
      },
      {
        name: 'Marketing & Content',
        description: 'Marketing team coordination and content planning',
        about: 'Our marketing team uses this space to plan campaigns, share content ideas, and coordinate promotional activities.',
        url: 'marketing',
        joinPolicy: 2, // Free for all
        visibility: 1, // Registered only
        ownerId: users[2].id, // Jane
        color: '#f39c12',
      },
      {
        name: 'Career Development',
        description: 'Professional development and career growth discussions',
        about: 'Share career advice, discuss industry trends, and help each other grow professionally.',
        url: 'career-dev',
        joinPolicy: 2, // Free for all
        visibility: 2, // Public
        ownerId: users[3].id, // Mike
        color: '#27ae60',
      },
      {
        name: 'Design Community',
        description: 'Creative professionals and design enthusiasts',
        about: 'A space for designers, artists, and creative professionals to share work, get feedback, and discuss design trends.',
        url: 'design-community',
        joinPolicy: 2, // Free for all
        visibility: 2, // Public
        ownerId: users[4].id, // Sarah
        color: '#9b59b6',
      },
    ]);

    return spaces;
  }

  async createPosts(users, spaces) {
    const posts = await Post.bulkCreate([
      {
        message: 'Welcome to our new social platform! 🎉 Feel free to introduce yourself and let us know what you\'re working on. This is going to be an amazing community!',
        visibility: 1,
        userId: users[0].id, // Admin
        spaceId: spaces[0].id, // General Discussion
      },
      {
        message: 'Just finished implementing the new authentication system. The JWT tokens now expire after 7 days for better security. Anyone interested in the technical details?',
        visibility: 1,
        userId: users[1].id, // John
        spaceId: spaces[1].id, // Development Team
      },
      {
        message: 'Working on the new onboarding flow designs. Should we include a tutorial for new users? What do you think would be most helpful?',
        visibility: 1,
        userId: users[2].id, // Jane
        spaceId: spaces[2].id, // Marketing & Content
      },
      {
        message: 'Great team meeting today! Looking forward to the new features we discussed. The roadmap looks really promising.',
        visibility: 1,
        userId: users[3].id, // Mike
        spaceId: spaces[0].id, // General Discussion
      },
      {
        message: 'Personal update: Just started learning React hooks. Any good resources you\'d recommend? The documentation is great but I\'d love some practical examples.',
        visibility: 2, // Public
        userId: users[1].id, // John
        spaceId: null, // Personal post
      },
      {
        message: 'Sharing my latest design work - a new mobile app interface. Would love to get some feedback from the community!',
        visibility: 2, // Public
        userId: users[4].id, // Sarah
        spaceId: spaces[4].id, // Design Community
      },
      {
        message: 'Career tip: Always keep learning and stay updated with industry trends. What\'s the most valuable skill you\'ve learned recently?',
        visibility: 2, // Public
        userId: users[3].id, // Mike
        spaceId: spaces[3].id, // Career Development
      },
      {
        message: 'We\'re hiring! Looking for talented developers to join our team. Check out our latest job postings in the Career Center.',
        visibility: 1,
        userId: users[5].id, // TechCorp
        spaceId: spaces[0].id, // General Discussion
      },
    ]);

    return posts;
  }

  async createComments(users, posts) {
    const comments = await Comment.bulkCreate([
      {
        message: 'Thanks for setting this up! Excited to be here and connect with everyone.',
        userId: users[1].id, // John
        postId: posts[0].id, // Welcome post
      },
      {
        message: 'This looks great! Can\'t wait to explore all the features and meet new people.',
        userId: users[2].id, // Jane
        postId: posts[0].id, // Welcome post
      },
      {
        message: 'Good security improvement! How did you handle existing sessions?',
        userId: users[0].id, // Admin
        postId: posts[1].id, // Auth system post
      },
      {
        message: 'I think a tutorial would be helpful, especially for the space features. Maybe a quick walkthrough?',
        userId: users[1].id, // John
        postId: posts[2].id, // Onboarding post
      },
      {
        message: 'Check out the official React documentation - it\'s really well written! Also, try building a small project to practice.',
        userId: users[2].id, // Jane
        postId: posts[4].id, // React hooks post
      },
      {
        message: 'Love the design! The color scheme is really modern. What tools did you use?',
        userId: users[3].id, // Mike
        postId: posts[5].id, // Design work post
      },
      {
        message: 'Great advice! I\'ve been learning cloud technologies and it\'s been a game-changer.',
        userId: users[4].id, // Sarah
        postId: posts[6].id, // Career tip post
      },
    ]);

    return comments;
  }

  async createJobs(users) {
    const jobs = await Job.bulkCreate([
      {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer to join our team. You will be responsible for developing and maintaining our web applications.',
        requirements: '5+ years experience, React, Node.js, PostgreSQL, AWS experience preferred',
        benefits: 'Health insurance, remote work, flexible hours, competitive salary',
        category: 'Technology',
        jobType: 'full-time',
        location: 'San Francisco, CA',
        salaryMin: 80000,
        salaryMax: 120000,
        experienceLevel: 'senior',
        remoteWork: true,
        userId: users[5].id, // TechCorp
      },
      {
        title: 'Marketing Specialist',
        description: 'Join our marketing team to help grow our brand and reach new customers.',
        requirements: '3+ years marketing experience, social media management, content creation',
        benefits: 'Health insurance, flexible work environment, professional development',
        category: 'Marketing',
        jobType: 'full-time',
        location: 'New York, NY',
        salaryMin: 50000,
        salaryMax: 70000,
        experienceLevel: 'mid',
        remoteWork: false,
        userId: users[5].id, // TechCorp
      },
      {
        title: 'UX/UI Designer',
        description: 'We need a creative UX/UI designer to help us create amazing user experiences.',
        requirements: '3+ years design experience, Figma, Adobe Creative Suite, portfolio required',
        benefits: 'Health insurance, remote work, creative freedom',
        category: 'Design',
        jobType: 'full-time',
        location: 'Remote',
        salaryMin: 60000,
        salaryMax: 90000,
        experienceLevel: 'mid',
        remoteWork: true,
        userId: users[5].id, // TechCorp
      },
    ]);

    return jobs;
  }

  async createMemberships(users, spaces) {
    const memberships = await Membership.bulkCreate([
      // Admin is owner of General Discussion
      { userId: users[0].id, spaceId: spaces[0].id, status: 4 }, // Owner
      
      // John is owner of Development Team
      { userId: users[1].id, spaceId: spaces[1].id, status: 4 }, // Owner
      
      // Jane is owner of Marketing & Content
      { userId: users[2].id, spaceId: spaces[2].id, status: 4 }, // Owner
      
      // Mike is owner of Career Development
      { userId: users[3].id, spaceId: spaces[3].id, status: 4 }, // Owner
      
      // Sarah is owner of Design Community
      { userId: users[4].id, spaceId: spaces[4].id, status: 4 }, // Owner
      
      // Cross-memberships
      { userId: users[0].id, spaceId: spaces[1].id, status: 2 }, // Admin in dev team
      { userId: users[0].id, spaceId: spaces[2].id, status: 2 }, // Admin in marketing
      { userId: users[1].id, spaceId: spaces[0].id, status: 1 }, // John member of general
      { userId: users[2].id, spaceId: spaces[0].id, status: 1 }, // Jane member of general
      { userId: users[3].id, spaceId: spaces[0].id, status: 1 }, // Mike member of general
      { userId: users[4].id, spaceId: spaces[0].id, status: 1 }, // Sarah member of general
      { userId: users[1].id, spaceId: spaces[3].id, status: 1 }, // John in career dev
      { userId: users[2].id, spaceId: spaces[3].id, status: 1 }, // Jane in career dev
      { userId: users[4].id, spaceId: spaces[2].id, status: 1 }, // Sarah in marketing
    ]);

    return memberships;
  }

  async createFollows(users, spaces) {
    const follows = await Follow.bulkCreate([
      // User follows
      { userId: users[1].id, objectModel: 'User', objectId: users[0].id }, // John follows Admin
      { userId: users[2].id, objectModel: 'User', objectId: users[1].id }, // Jane follows John
      { userId: users[3].id, objectModel: 'User', objectId: users[2].id }, // Mike follows Jane
      { userId: users[4].id, objectModel: 'User', objectId: users[3].id }, // Sarah follows Mike
      
      // Space follows
      { userId: users[1].id, objectModel: 'Space', objectId: spaces[3].id }, // John follows Career Dev
      { userId: users[2].id, objectModel: 'Space', objectId: spaces[4].id }, // Jane follows Design Community
      { userId: users[4].id, objectModel: 'Space', objectId: spaces[2].id }, // Sarah follows Marketing
    ]);

    return follows;
  }

  async createLikes(users, posts, comments) {
    const likes = await Like.bulkCreate([
      // Post likes
      { userId: users[1].id, objectModel: 'Post', objectId: posts[0].id }, // John likes welcome post
      { userId: users[2].id, objectModel: 'Post', objectId: posts[0].id }, // Jane likes welcome post
      { userId: users[3].id, objectModel: 'Post', objectId: posts[0].id }, // Mike likes welcome post
      { userId: users[4].id, objectModel: 'Post', objectId: posts[0].id }, // Sarah likes welcome post
      { userId: users[0].id, objectModel: 'Post', objectId: posts[1].id }, // Admin likes auth post
      { userId: users[2].id, objectModel: 'Post', objectId: posts[4].id }, // Jane likes React post
      { userId: users[3].id, objectModel: 'Post', objectId: posts[5].id }, // Mike likes design post
      { userId: users[4].id, objectModel: 'Post', objectId: posts[6].id }, // Sarah likes career tip
      
      // Comment likes
      { userId: users[0].id, objectModel: 'Comment', objectId: comments[0].id }, // Admin likes John's comment
      { userId: users[1].id, objectModel: 'Comment', objectId: comments[1].id }, // John likes Jane's comment
      { userId: users[2].id, objectModel: 'Comment', objectId: comments[2].id }, // Jane likes Admin's comment
    ]);

    return likes;
  }
}

module.exports = new SeederService();
