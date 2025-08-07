const { body } = require('express-validator');
const { User, Follow, Space, Membership } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  body('about')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('About section must be less than 1000 characters'),
  body('visibility')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Visibility must be 1, 2, or 3'),
];

// Get user by ID or username
const getUser = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is numeric (ID) or string (username)
    const isNumeric = /^\d+$/.test(identifier);
    
    const user = await User.findOne({
      where: isNumeric 
        ? { id: identifier }
        : { username: identifier },
      include: [
        {
          model: Space,
          as: 'ownedSpaces',
          attributes: ['id', 'name', 'url', 'visibility'],
          where: { status: 1 },
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.visibility === 3 && (!req.user || req.user.id !== user.id)) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get follow status if authenticated
    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const follow = await Follow.findOne({
        where: {
          userId: req.user.id,
          objectModel: 'User',
          objectId: user.id,
        },
      });
      isFollowing = !!follow;
    }

    const userData = user.toJSON();
    userData.isFollowing = isFollowing;

    res.json({
      success: true,
      data: {
        user: userData,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, about, visibility } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (about !== undefined) updateData.about = about;
    if (visibility !== undefined) updateData.visibility = visibility;

    await req.user.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.toJSON(),
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get list of users with pagination and search
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const whereClause = {
      status: 1,
      visibility: { [Op.in]: [1, 2] }, // Exclude hidden users
    };

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Follow/unfollow user
const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        userId: req.user.id,
        objectModel: 'User',
        objectId: userId,
      },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      res.json({
        success: true,
        message: 'User unfollowed successfully',
        data: { isFollowing: false }
      });
    } else {
      // Follow
      await Follow.create({
        userId: req.user.id,
        objectModel: 'User',
        objectId: userId,
      });

      // Send follow notification email (async, don't wait for it)
      emailService.sendFollowerNotification(req.user, targetUser).catch(error => {
        console.error('Failed to send follower notification:', error);
      });

      res.json({
        success: true,
        message: 'User followed successfully',
        data: { isFollowing: true }
      });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getUser,
  updateProfile: [updateProfileValidation, handleValidationErrors, updateProfile],
  getUsers,
  toggleFollow,
};