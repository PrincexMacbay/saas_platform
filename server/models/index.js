const sequelize = require('../config/database');
const User = require('./User');
const Space = require('./Space');
const Post = require('./Post');
const Comment = require('./Comment');
const Membership = require('./Membership');
const Follow = require('./Follow');
const Like = require('./Like');

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

module.exports = {
  sequelize,
  User,
  Space,
  Post,
  Comment,
  Membership,
  Follow,
  Like,
};