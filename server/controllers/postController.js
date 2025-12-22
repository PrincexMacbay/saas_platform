const { body } = require('express-validator');
const { Post, User, Space, Comment, Like, Membership } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

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

const updatePostValidation = [
  body('message')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post message must be between 1 and 5000 characters'),
];

// Create new post
const createPost = async (req, res) => {
  try {
    console.log('=== CREATE POST DEBUG ===');
    console.log('Request body:', req.body);
    console.log('attachmentUrl from request:', req.body.attachmentUrl);
    
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

    console.log('Creating post with attachmentUrl:', attachmentUrl);
    
    const post = await Post.create({
      message,
      visibility: visibility || 1,
      userId: req.user.id,
      spaceId: spaceId || null,
      attachmentUrl: attachmentUrl || null,
    });
    
    console.log('Post created with ID:', post.id);
    console.log('Saved attachmentUrl:', post.attachmentUrl);

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
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('=== GET POSTS DEBUG ===');
        console.log('userId:', userId);
        console.log('userId type:', typeof userId);
      }
      
      // Check if userId is numeric (ID) or string (username)
      const isNumeric = /^\d+$/.test(userId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Is numeric:', isNumeric);
      }
      
      if (isNumeric) {
        // It's a numeric ID, use it directly
        whereClause.userId = userId;
      } else {
        // It's a username, find the user first
        const user = await User.findOne({
          where: { username: userId },
          attributes: ['id']
        });
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        
        whereClause.userId = user.id;
      }
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
    const { postid } = req.params;
    
    const post = await Post.findByPk(postid, {
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
    const { postid } = req.params;
    const { message } = req.body;

    const post = await Post.findByPk(postid);
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
      postId: postid,
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
      
      // Send real-time notification
      notificationService.notifyNewComment(postid, comment.id, req.user.id).catch(error => {
        console.error('Failed to send real-time notification:', error);
      });
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
    const { objectmodel, objectid } = req.params;
    
    if (!['Post', 'Comment'].includes(objectmodel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid object model'
      });
    }

    // Check if object exists
    const Model = objectmodel === 'Post' ? Post : Comment;
    const object = await Model.findByPk(objectid);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: `${objectmodel} not found`
      });
    }

    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        objectModel: objectmodel,
        objectId: objectid,
      },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      res.json({
        success: true,
        message: `${objectmodel} unliked successfully`,
        data: { isLiked: false }
      });
    } else {
      // Like
      await Like.create({
        userId: req.user.id,
        objectModel: objectmodel,
        objectId: objectid,
      });
      
      // Send notification if it's a post (not a comment)
      if (objectmodel === 'Post' && object.userId !== req.user.id) {
        notificationService.notifyPostLiked(objectid, req.user.id).catch(error => {
          console.error('Failed to send like notification:', error);
        });
      }
      
      res.json({
        success: true,
        message: `${objectmodel} liked successfully`,
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

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Find the post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }

    // Update the post
    await post.update({ message });

    // Get updated post with author information
    const updatedPost = await Post.findByPk(id, {
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
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    // Add like status for current user
    const like = await Like.findOne({
      where: {
        userId: req.user.id,
        objectModel: 'Post',
        objectId: id,
      },
    });

    const likeCount = await Like.count({
      where: {
        objectModel: 'Post',
        objectId: id,
      },
    });

    const postData = {
      ...updatedPost.toJSON(),
      isLiked: !!like,
      likeCount,
    };

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post: postData }
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete the post (this will also cascade delete comments and likes due to foreign key constraints)
    await post.destroy();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
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
  updatePost: [updatePostValidation, handleValidationErrors, updatePost],
  deletePost,
  createComment: [createCommentValidation, handleValidationErrors, createComment],
  toggleLike,
};