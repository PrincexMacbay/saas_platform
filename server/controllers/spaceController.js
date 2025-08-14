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

    // Add membership information for each space if user is logged in
    if (req.user) {
      const spaceIds = spaces.map(space => space.id);
      const memberships = await Membership.findAll({
        where: {
          userId: req.user.id,
          spaceId: { [Op.in]: spaceIds },
        },
      });

      const follows = await Follow.findAll({
        where: {
          userId: req.user.id,
          objectModel: 'Space',
          objectId: { [Op.in]: spaceIds },
        },
      });

      const membershipMap = new Map(memberships.map(m => [m.spaceId, m]));
      const followMap = new Map(follows.map(f => [f.objectId, f]));

      spaces.forEach(space => {
        const membership = membershipMap.get(space.id);
        const follow = followMap.get(space.id);
        
        space.dataValues.isMember = !!membership;
        space.dataValues.membershipStatus = membership ? membership.status : null;
        space.dataValues.isFollowing = !!follow;
      });
    }

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
    const { identifier } = req.params;
    
    console.log(`User ${req.user.id} attempting to join space ${identifier}`);
    
    // Find space by ID or URL
    const isNumeric = /^\d+$/.test(identifier);
    const space = await Space.findOne({
      where: isNumeric ? { id: identifier } : { url: identifier }
    });
    
    if (!space || space.status !== 1) {
      console.log(`Space ${identifier} not found or not active`);
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if already a member
    const existingMembership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: space.id,
      },
    });

    if (existingMembership) {
      console.log(`User ${req.user.id} already member of space ${space.id} with status ${existingMembership.status}`);
      
      // If user is already a member (status > 0), return success
      if (existingMembership.status > 0) {
        return res.status(200).json({
          success: true,
          message: 'You are already a member of this space',
          data: {
            membershipStatus: existingMembership.status,
            alreadyMember: true,
            membership: existingMembership.toJSON(),
          }
        });
      }
      
      // If user has a pending request (status = 0), return appropriate message
      if (existingMembership.status === 0) {
        return res.status(200).json({
          success: true,
          message: 'Your membership request is pending approval',
          data: {
            membershipStatus: 0,
            pending: true,
            membership: existingMembership.toJSON(),
          }
        });
      }
    }

    // Check join policy
    if (space.joinPolicy === 0) {
      console.log(`Space ${space.id} does not allow self-joining`);
      return res.status(403).json({
        success: false,
        message: 'This space does not allow self-joining'
      });
    }

    // Determine membership status based on join policy
    // joinPolicy: 0 = no self join, 1 = application required, 2 = free join
    const membershipStatus = space.joinPolicy === 2 ? 1 : 0; // Free join vs application required

    console.log(`Creating membership for user ${req.user.id} in space ${space.id} with status ${membershipStatus}`);

    const membership = await Membership.create({
      userId: req.user.id,
      spaceId: space.id,
      status: membershipStatus,
    });

    // Send notification to space owner if it's a request
    if (membershipStatus === 0 && space.ownerId !== req.user.id) {
      try {
        const spaceOwner = await User.findByPk(space.ownerId);
        const emailService = require('../services/emailService');
        emailService.sendSpaceJoinRequestNotification(req.user, space, spaceOwner).catch(error => {
          console.error('Failed to send space join request notification:', error);
        });
      } catch (error) {
        console.error('Error sending space join notification:', error);
      }
    }

    const message = membershipStatus === 1 
      ? 'Joined space successfully' 
      : 'Application submitted successfully';

    console.log(`Membership created successfully: ${message}`);

    res.json({
      success: true,
      message,
      data: {
        membershipStatus,
        membership: membership.toJSON(),
        isMember: membershipStatus > 0,
        isPending: membershipStatus === 0,
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
    const { identifier } = req.params;
    
    const space = await Space.findByPk(identifier);
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
        spaceId: identifier,
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
    const { identifier } = req.params;
    
    const space = await Space.findByPk(identifier);
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
        spaceId: identifier,
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
        objectId: identifier,
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
        objectId: identifier,
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

// Get space members
const getSpaceMembers = async (req, res) => {
  try {
    const { identifier } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Find space by ID or URL
    const isNumeric = /^\d+$/.test(identifier);
    const space = await Space.findOne({
      where: isNumeric ? { id: identifier } : { url: identifier }
    });
    
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if user has permission to view members
    if (req.user) {
      const membership = await Membership.findOne({
        where: {
          userId: req.user.id,
          spaceId: space.id,
        },
      });
      
      if (!membership && space.visibility === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const { count, rows: members } = await Membership.findAndCountAll({
      where: {
        spaceId: space.id,
        status: { [Op.gte]: 1 }, // Only approved members
      },
      limit,
      offset,
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          currentPage: page,
          totalPages,
          totalMembers: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    console.error('Get space members error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get pending membership requests
const getPendingRequests = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Find space by ID or URL
    const isNumeric = /^\d+$/.test(identifier);
    const space = await Space.findOne({
      where: isNumeric ? { id: identifier } : { url: identifier }
    });
    
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if user is space owner or admin
    const membership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: space.id,
      },
    });
    
    if (!membership || membership.status < 2) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pendingRequests = await Membership.findAll({
      where: {
        spaceId: space.id,
        status: 0, // Pending requests
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        pendingRequests,
      }
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Approve or reject membership request
const handleMembershipRequest = async (req, res) => {
  try {
    const { identifier, userId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
    
    // Find space by ID or URL
    const isNumeric = /^\d+$/.test(identifier);
    const space = await Space.findOne({
      where: isNumeric ? { id: identifier } : { url: identifier }
    });
    
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if user is space owner or admin
    const membership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: space.id,
      },
    });
    
    if (!membership || membership.status < 2) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the membership request
    const requestMembership = await Membership.findOne({
      where: {
        userId: parseInt(userId),
        spaceId: space.id,
        status: 0,
      },
    });
    
    if (!requestMembership) {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found'
      });
    }

    if (action === 'approve') {
      await requestMembership.update({ status: 1 });
      
      // Send notification to user
      try {
        const user = await User.findByPk(userId);
        const emailService = require('../services/emailService');
        emailService.sendSpaceJoinApprovalNotification(user, space).catch(error => {
          console.error('Failed to send space join approval notification:', error);
        });
      } catch (error) {
        console.error('Error sending approval notification:', error);
      }
      
      res.json({
        success: true,
        message: 'Membership request approved',
        data: {
          membership: requestMembership.toJSON(),
        }
      });
    } else {
      // Delete the membership request
      await requestMembership.destroy();
      
      // Send notification to user
      try {
        const user = await User.findByPk(userId);
        const emailService = require('../services/emailService');
        emailService.sendSpaceJoinRejectionNotification(user, space).catch(error => {
          console.error('Failed to send space join rejection notification:', error);
        });
      } catch (error) {
        console.error('Error sending rejection notification:', error);
      }
      
      res.json({
        success: true,
        message: 'Membership request rejected',
      });
    }
  } catch (error) {
    console.error('Handle membership request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Remove member from space
const removeMember = async (req, res) => {
  try {
    const { identifier, userId } = req.params;
    
    // Find space by ID or URL
    const isNumeric = /^\d+$/.test(identifier);
    const space = await Space.findOne({
      where: isNumeric ? { id: identifier } : { url: identifier }
    });
    
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }

    // Check if user is space owner or admin
    const membership = await Membership.findOne({
      where: {
        userId: req.user.id,
        spaceId: space.id,
      },
    });
    
    if (!membership || membership.status < 2) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the member to remove
    const memberMembership = await Membership.findOne({
      where: {
        userId: parseInt(userId),
        spaceId: space.id,
      },
    });
    
    if (!memberMembership) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Prevent removing owner
    if (memberMembership.status === 4) {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove space owner'
      });
    }

    // Prevent removing yourself if you're not the owner
    if (parseInt(userId) === req.user.id && membership.status < 4) {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove yourself'
      });
    }

    await memberMembership.destroy();
    
    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
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
  getSpaceMembers,
  getPendingRequests,
  handleMembershipRequest,
  removeMember,
};