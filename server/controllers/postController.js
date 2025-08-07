const { body } = require('express-validator');
const { Post, User, Space, Comment, Like, Membership } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Validation rules
const createPostValidation = [
  body('message')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post message must be between 1 and 5000 characters'),
  body('visibility')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('Visibility must be 0, 1, or 2'),
  body('spaceId')
    .optional()
    .isInt()
    .withMessage('Space ID must be a number'),
  body('attachmentUrl')
    .optional()
    .isString()
    .withMessage('Attachment URL must be a string'),
];

const createCommentValidation = [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

// Create new post
const createPost = async (req, res) => {
  try {
    const { message, visibility, spaceId, attachmentUrl } = req.body;

    // If posting to a space, check membership
    if (spaceId) {
      const space = await Space.findByPk(spaceId);
      if (!space || space.status !== 1) {
        return res.status(404).json({
          success: false,
          message: 'Space not found'
        });
      }

      const membership = await Membership.findOne({
        where: {
          userId: req.user.id,
          spaceId: spaceId,
          status: { [Op.in]: [1, 2, 3, 4] }, // Member, admin, moderator, or owner
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member to post in this space'
        });
      }
    }

    const post = await Post.create({
      message,
      visibility: visibility || 1,
      userId: req.user.id,
      spaceId: spaceId || null,
      attachmentUrl: attachmentUrl || null,
    });

    // Get post with author information
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'url', 'color'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: postWithAuthor,
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get posts feed
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const spaceId = req.query.spaceId;
    const userId = req.query.userId;
    const offset = (page - 1) * limit;

    let whereClause = {
      archived: false,
    };

    // Filter by space
    if (spaceId) {
      whereClause.spaceId = spaceId;
      
      // Check if user can view posts in this space
      const space = await Space.findByPk(spaceId);
      if (!space || space.status !== 1) {
        return res.status(404).json({
          success: false,
          message: 'Space not found'
        });
      }

      if (space.visibility === 0 && req.user) {
        const membership = await Membership.findOne({
          where: {
            userId: req.user.id,
            spaceId: spaceId,
          },
        });
        if (!membership) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }
    }

    // Filter by user
    if (userId) {
      whereClause.userId = userId;
    }

    // For personal feed, show posts from followed users/spaces and own posts
    if (!spaceId && !userId && req.user) {
      // This would need a more complex query for a real feed algorithm
      // For now, just show public posts and posts from spaces user is member of
      const userMemberships = await Membership.findAll({
        where: { userId: req.user.id },
        attributes: ['spaceId'],
      });
      
      const memberSpaceIds = userMemberships.map(m => m.spaceId);
      
      whereClause = {
        archived: false,
        [Op.or]: [
          { userId: req.user.id }, // Own posts
          { spaceId: { [Op.in]: memberSpaceIds } }, // Posts from member spaces
          { spaceId: null, visibility: { [Op.in]: [1, 2] } }, // Public personal posts
        ],
      };
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'url', 'color'],
        },
        {
          model: Comment,
          as: 'comments',
          limit: 3,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
            },
          ],
        },
      ],
    });

    // Get like counts and user's like status for each post
    const postsWithLikes = await Promise.all(posts.map(async (post) => {
      const likeCount = await Like.count({
        where: {
          objectModel: 'Post',
          objectId: post.id,
        },
      });

      let isLiked = false;
      if (req.user) {
        const userLike = await Like.findOne({
          where: {
            userId: req.user.id,
            objectModel: 'Post',
            objectId: post.id,
          },
        });
        isLiked = !!userLike;
      }

      const postData = post.toJSON();
      postData.likeCount = likeCount;
      postData.isLiked = isLiked;
      
      return postData;
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        posts: postsWithLikes,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'url', 'color'],
        },
        {
          model: Comment,
          as: 'comments',
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
            },
          ],
        },
      ],
    });

    if (!post || post.archived) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check access permissions
    if (post.spaceId) {
      const space = await Space.findByPk(post.spaceId);
      if (space.visibility === 0 && req.user) {
        const membership = await Membership.findOne({
          where: {
            userId: req.user.id,
            spaceId: post.spaceId,
          },
        });
        if (!membership) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }
    }

    // Get like count and user's like status
    const likeCount = await Like.count({
      where: {
        objectModel: 'Post',
        objectId: post.id,
      },
    });

    let isLiked = false;
    if (req.user) {
      const userLike = await Like.findOne({
        where: {
          userId: req.user.id,
          objectModel: 'Post',
          objectId: post.id,
        },
      });
      isLiked = !!userLike;
    }

    const postData = post.toJSON();
    postData.likeCount = likeCount;
    postData.isLiked = isLiked;

    res.json({
      success: true,
      data: {
        post: postData,
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Create comment
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;

    const post = await Post.findByPk(postId);
    if (!post || post.archived) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can comment (same logic as viewing post)
    if (post.spaceId) {
      const space = await Space.findByPk(post.spaceId);
      if (space.visibility === 0) {
        const membership = await Membership.findOne({
          where: {
            userId: req.user.id,
            spaceId: post.spaceId,
          },
        });
        if (!membership) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }
    }

    const comment = await Comment.create({
      message,
      userId: req.user.id,
      postId: postId,
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
      ],
    });

    // Send comment notification email to post author (if different user)
    if (post.userId !== req.user.id) {
      const postAuthor = await User.findByPk(post.userId);
      if (postAuthor) {
        emailService.sendCommentNotification(req.user, post, comment, postAuthor).catch(error => {
          console.error('Failed to send comment notification:', error);
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment: commentWithAuthor,
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Toggle like on post or comment
const toggleLike = async (req, res) => {
  try {
    const { objectModel, objectId } = req.params;
    
    if (!['Post', 'Comment'].includes(objectModel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid object model'
      });
    }

    // Check if object exists
    const Model = objectModel === 'Post' ? Post : Comment;
    const object = await Model.findByPk(objectId);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: `${objectModel} not found`
      });
    }

    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        objectModel,
        objectId,
      },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      res.json({
        success: true,
        message: `${objectModel} unliked successfully`,
        data: { isLiked: false }
      });
    } else {
      // Like
      await Like.create({
        userId: req.user.id,
        objectModel,
        objectId,
      });
      res.json({
        success: true,
        message: `${objectModel} liked successfully`,
        data: { isLiked: true }
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createPost: [createPostValidation, handleValidationErrors, createPost],
  getPosts,
  getPost,
  createComment: [createCommentValidation, handleValidationErrors, createComment],
  toggleLike,
};