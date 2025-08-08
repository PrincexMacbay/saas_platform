const sequelize = require('../config/database');
const User = require('./User');
const Space = require('./Space');
const Post = require('./Post');
const Comment = require('./Comment');
const Membership = require('./Membership');
const Follow = require('./Follow');
const Like = require('./Like');
const Job = require('./Job');
const JobApplication = require('./JobApplication');
const SavedJob = require('./SavedJob');

// Define associations
User.hasMany(Space, { 
  foreignKey: 'ownerId', 
  as: 'ownedSpaces',
  onDelete: 'CASCADE'
});
Space.belongsTo(User, { 
  foreignKey: 'ownerId', 
  as: 'owner'
});

// User-Space membership relationships
User.belongsToMany(Space, { 
  through: Membership, 
  foreignKey: 'userId',
  otherKey: 'spaceId',
  as: 'memberSpaces'
});
Space.belongsToMany(User, { 
  through: Membership, 
  foreignKey: 'spaceId',
  otherKey: 'userId',
  as: 'members'
});

// Direct membership associations
User.hasMany(Membership, { 
  foreignKey: 'userId',
  as: 'memberships',
  onDelete: 'CASCADE'
});
Space.hasMany(Membership, { 
  foreignKey: 'spaceId',
  as: 'memberships',
  onDelete: 'CASCADE'
});
Membership.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});
Membership.belongsTo(Space, { 
  foreignKey: 'spaceId',
  as: 'space'
});

// Post relationships
User.hasMany(Post, { 
  foreignKey: 'userId',
  as: 'posts',
  onDelete: 'CASCADE'
});
Post.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'author'
});

Space.hasMany(Post, { 
  foreignKey: 'spaceId',
  as: 'posts',
  onDelete: 'CASCADE'
});
Post.belongsTo(Space, { 
  foreignKey: 'spaceId',
  as: 'space'
});

// Comment relationships
User.hasMany(Comment, { 
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'author'
});

Post.hasMany(Comment, { 
  foreignKey: 'postId',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Post, { 
  foreignKey: 'postId',
  as: 'post'
});

// Follow relationships
User.hasMany(Follow, { 
  foreignKey: 'userId',
  as: 'following',
  onDelete: 'CASCADE'
});
Follow.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'follower'
});

// Like relationships
User.hasMany(Like, { 
  foreignKey: 'userId',
  as: 'likes',
  onDelete: 'CASCADE'
});
Like.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

// Career Center relationships
// Job relationships
User.hasMany(Job, { 
  foreignKey: 'userId',
  as: 'postedJobs',
  onDelete: 'CASCADE'
});
Job.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'employer'
});

// Job Application relationships
User.hasMany(JobApplication, { 
  foreignKey: 'applicantId',
  as: 'jobApplications',
  onDelete: 'CASCADE'
});
JobApplication.belongsTo(User, { 
  foreignKey: 'applicantId',
  as: 'applicant'
});

Job.hasMany(JobApplication, { 
  foreignKey: 'jobId',
  as: 'applications',
  onDelete: 'CASCADE'
});
JobApplication.belongsTo(Job, { 
  foreignKey: 'jobId',
  as: 'job'
});

// Saved Job relationships
User.belongsToMany(Job, { 
  through: SavedJob, 
  foreignKey: 'userId',
  otherKey: 'jobId',
  as: 'savedJobs'
});
Job.belongsToMany(User, { 
  through: SavedJob, 
  foreignKey: 'jobId',
  otherKey: 'userId',
  as: 'savedByUsers'
});

module.exports = {
  sequelize,
  User,
  Space,
  Post,
  Comment,
  Membership,
  Follow,
  Like,
  Job,
  JobApplication,
  SavedJob,
};