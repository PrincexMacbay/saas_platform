const { body } = require('express-validator');
const { Space, User, Membership, Post, Follow } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { Op } = require('sequelize');

// Validation rules
const createSpaceValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Space name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('about')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('About section must be less than 1000 characters'),
  body('url')
    .optional()
    .isLength({ min: 2, max: 45 })
    .withMessage('URL must be between 2 and 45 characters')
    .isAlphanumeric()
    .withMessage('URL must contain only letters and numbers'),
  body('joinPolicy')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('Join policy must be 0, 1, or 2'),
  body('visibility')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('Visibility must be 0, 1, or 2'),
];

// Create new space
const createSpace = async (req, res) => {
  try {
    const { name, description, about, url, joinPolicy, visibility, color } = req.body;

    // Check if URL is already taken
    if (url) {
      const existingSpace = await Space.findOne({ where: { url } });
      if (existingSpace) {
        return res.status(400).json({
          success: false,
          message: 'URL already taken'
        });
      }
    }

    // Create space
    const space = await Space.create({
      name,
      description,
      about,
      url,
      joinPolicy: joinPolicy || 1,
      visibility: visibility || 1,
      color: color || '#3498db',
      ownerId: req.user.id,
    });

    // Add creator as admin member
    await Membership.create({
      userId: req.user.id,
      spaceId: space.id,
      status: 4, // owner
    });

    // Include owner information
    const spaceWithOwner = await Space.findByPk(space.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Space created successfully',
      data: {
        space: spaceWithOwner,
      }
    });
  } catch (error) {
    console.error('Create space error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get space by ID or URL
const getSpace = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is numeric (ID) or string (URL)
    const isNumeric = /^\d+$/.test(identifier);
    
    const space = await Space.findOne({
      where: isNumeric 
        ? { id: identifier }
        : { url: identifier },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
          through: {
            attributes: ['status', 'createdAt'],
          },
          limit: 10, // Show first 10 members
        },
      ],
    });

    if (!space || space.status !== 1) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if user can view this space
    let membership = null;
    let isFollowing = false;
    
    if (req.user) {
      membership = await Membership.findOne({
        where: {
          userId: req.user.id,
          spaceId: space.id,
        },
      });

      if (!membership) {
        const follow = await Follow.findOne({
          where: {
            userId: req.user.id,
            objectModel: 'Space',
            objectId: space.id,
          },
        });
        isFollowing = !!follow;
      }
    }

    // Check visibility permissions
    if (space.visibility === 0 && !membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const spaceData = space.toJSON();
    spaceData.isMember = !!membership;
    spaceData.membershipStatus = membership ? membership.status : null;
    spaceData.isFollowing = isFollowing;

    res.json({
      success: true,
      data: {
        space: spaceData,
      }
    });
  } catch (error) {
    console.error('Get space error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get list of spaces
const getSpaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const whereClause = {
      status: 1,
      visibility: { [Op.in]: req.user ? [1, 2] : [2] }, // Public or registered-only if logged in
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: spaces } = await Space.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        spaces,
        pagination: {
          currentPage: page,
          totalPages,
          totalSpaces: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    console.error('Get spaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Join space
const joinSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const space = await Space.findByPk(spaceId);
    if (!space || space.status !== 1) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if already a member
    const existingMembership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: spaceId,
      },
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this space'
      });
    }

    // Check join policy
    if (space.joinPolicy === 0) {
      return res.status(403).json({
        success: false,
        message: 'This space does not allow self-joining'
      });
    }

    const membershipStatus = space.joinPolicy === 2 ? 1 : 0; // Free join vs application required

    await Membership.create({
      userId: req.user.id,
      spaceId: spaceId,
      status: membershipStatus,
    });

    const message = membershipStatus === 1 
      ? 'Joined space successfully' 
      : 'Application submitted successfully';

    res.json({
      success: true,
      message,
      data: {
        membershipStatus,
      }
    });
  } catch (error) {
    console.error('Join space error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Leave space
const leaveSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const space = await Space.findByPk(spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if owner (owners cannot leave their own space)
    if (space.ownerId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Space owners cannot leave their own space'
      });
    }

    const membership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: spaceId,
      },
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this space'
      });
    }

    await membership.destroy();

    res.json({
      success: true,
      message: 'Left space successfully'
    });
  } catch (error) {
    console.error('Leave space error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Follow/unfollow space
const toggleFollowSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const space = await Space.findByPk(spaceId);
    if (!space || space.status !== 1) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if already a member (members don't need to follow)
    const membership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: spaceId,
      },
    });

    if (membership) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow a space you are a member of'
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        userId: req.user.id,
        objectModel: 'Space',
        objectId: spaceId,
      },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      res.json({
        success: true,
        message: 'Space unfollowed successfully',
        data: { isFollowing: false }
      });
    } else {
      // Follow
      await Follow.create({
        userId: req.user.id,
        objectModel: 'Space',
        objectId: spaceId,
      });
      res.json({
        success: true,
        message: 'Space followed successfully',
        data: { isFollowing: true }
      });
    }
  } catch (error) {
    console.error('Toggle follow space error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createSpace: [createSpaceValidation, handleValidationErrors, createSpace],
  getSpace,
  getSpaces,
  joinSpace,
  leaveSpace,
  toggleFollowSpace,
};