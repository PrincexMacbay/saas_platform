const { body } = require('express-validator');
const { User, UserProfile, IndividualProfile, CompanyProfile, Follow, Space, Membership } = require('../models');
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
    
    console.log(`=== GET USER DEBUG ===`);
    console.log(`Looking for user: ${identifier}`);
    console.log(`Identifier type: ${typeof identifier}`);
    
    // Check if identifier is numeric (ID) or string (username)
    const isNumeric = /^\d+$/.test(identifier);
    console.log(`Is numeric: ${isNumeric}`);
    
    // Build the where clause
    const whereClause = isNumeric 
      ? { id: parseInt(identifier) }
      : { username: identifier };
    
    console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    
    // First, try to find the user without includes to see if the user exists
    const basicUser = await User.findOne({
      where: whereClause,
    });
    
    if (!basicUser) {
      console.log(`User not found with identifier: ${identifier}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`Found basic user: ${basicUser.username} (ID: ${basicUser.id})`);
    
    // Now try with includes
    const user = await User.findOne({
      where: whereClause,
      include: [
        {
          model: UserProfile,
          as: 'profile',
        },
        {
          model: IndividualProfile,
          as: 'individualProfile'
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        },
        {
          model: Space,
          as: 'ownedSpaces',
          attributes: ['id', 'name', 'url', 'visibility'],
          where: { status: 1 },
          required: false,
        },
      ],
    });

    console.log(`Found user with includes: ${user ? user.username : 'null'}`);

    // Check privacy settings
    if (user.visibility === 3 && (!req.user || req.user.id !== user.id)) {
      console.log(`User ${user.username} has private visibility`);
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

    console.log(`Successfully returning user data for: ${user.username}`);
    res.json({
      success: true,
      data: {
        user: userData,
      }
    });
  } catch (error) {
    console.error('=== GET USER ERROR ===');
    console.error('Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      }),
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
    const { userid } = req.params;
    
    console.log(`User ${req.user.id} attempting to follow/unfollow user ${userid}`);
    
    if (parseInt(userid) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const targetUser = await User.findByPk(userid);
    if (!targetUser) {
      console.log(`Target user ${userid} not found`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        userId: req.user.id,
        objectModel: 'User',
        objectId: userid,
      },
    });

    if (existingFollow) {
      // Unfollow
      console.log(`User ${req.user.id} unfollowing user ${userid}`);
      await existingFollow.destroy();
      res.json({
        success: true,
        message: 'User unfollowed successfully',
        data: { isFollowing: false }
      });
    } else {
      // Follow
      console.log(`User ${req.user.id} following user ${userid}`);
      await Follow.create({
        userId: req.user.id,
        objectModel: 'User',
        objectId: userid,
      });

      // Send follow notification email (async, don't wait for it)
      if (emailService && emailService.sendFollowerNotification) {
        emailService.sendFollowerNotification(req.user, targetUser).catch(error => {
          console.error('Failed to send follower notification:', error);
        });
      }

      res.json({
        success: true,
        message: 'User followed successfully',
        data: { isFollowing: true }
      });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      }),
    });
  }
};

// Get user's followers
const getFollowers = async (req, res) => {
  try {
    const { userid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const followers = await Follow.findAll({
      where: {
        objectModel: 'User',
        objectId: userid,
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Get the actual user data for each follower
    const followerIds = followers.map(follow => follow.userId);
    const followerUsers = await User.findAll({
      where: {
        id: followerIds
      },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        },
        {
          model: IndividualProfile,
          as: 'individualProfile'
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ],
      attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
    });

    res.json({
      success: true,
      data: {
        followers: followerUsers,
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get users that the user is following
const getFollowing = async (req, res) => {
  try {
    const { userid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const following = await Follow.findAll({
      where: {
        userId: userid,
        objectModel: 'User',
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Get the actual user data for each followed user
    const followedIds = following.map(follow => follow.objectId);
    const followedUsers = await User.findAll({
      where: {
        id: followedIds
      },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        },
        {
          model: IndividualProfile,
          as: 'individualProfile'
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ],
      attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
    });

    res.json({
      success: true,
      data: {
        following: followedUsers,
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
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
  getFollowers,
  getFollowing,
};