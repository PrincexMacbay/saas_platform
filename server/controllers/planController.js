const { Op } = require('sequelize');
const { Plan, Subscription, User, UserProfile } = require('../models');

// Get all plans
const getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Get user's organization from UserProfile
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });
    
    // Filter by organization if user has one
    if (userProfile && userProfile.organizationId) {
      whereClause.organizationId = userProfile.organizationId;
    } else {
      // If user has no organization, show plans with no organization
      whereClause.organizationId = null;
    }
    
    if (search) {
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      });
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows } = await Plan.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          attributes: ['id', 'status'],
          required: false
        }
      ]
    });

    // Add subscription counts
    const plansWithCounts = rows.map(plan => {
      const plainPlan = plan.toJSON();
      const activeSubscriptions = plainPlan.subscriptions.filter(sub => sub.status === 'active').length;
      const totalSubscriptions = plainPlan.subscriptions.length;
      
      return {
        ...plainPlan,
        activeSubscriptions,
        totalSubscriptions,
        subscriptions: undefined // Remove the detailed subscriptions array
      };
    });

    res.json({
      success: true,
      data: {
        plans: plansWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
};

// Get single plan
const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user's organization from UserProfile
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });
    
    const plan = await Plan.findByPk(id, {
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          attributes: ['id', 'status', 'memberNumber', 'startDate', 'endDate'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'username', 'email']
            }
          ]
        }
      ]
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Security check: Ensure user can only view plans from their organization
    if (userProfile && userProfile.organizationId) {
      if (plan.organizationId !== userProfile.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view plans from your organization'
        });
      }
    } else {
      // If user has no organization, they can only view plans with no organization
      if (plan.organizationId !== null) {
        return res.status(403).json({
          success: false,
          message: 'You can only view plans from your organization'
        });
      }
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan',
      error: error.message
    });
  }
};

// Create plan
const createPlan = async (req, res) => {
  try {
    const { name, description, fee, renewalInterval, benefits, maxMembers } = req.body;

    // Get user's organization from UserProfile
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    const plan = await Plan.create({
      name,
      description,
      fee,
      renewalInterval,
      benefits: JSON.stringify(benefits || []),
      maxMembers,
      isActive: true,
      organizationId: userProfile ? userProfile.organizationId : null
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create plan',
      error: error.message
    });
  }
};

// Update plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, fee, renewalInterval, benefits, maxMembers, isActive } = req.body;

    // Get user's organization from UserProfile
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    const plan = await Plan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Security check: Ensure user can only update plans from their organization
    if (userProfile && userProfile.organizationId) {
      if (plan.organizationId !== userProfile.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update plans from your organization'
        });
      }
    } else {
      // If user has no organization, they can only update plans with no organization
      if (plan.organizationId !== null) {
        return res.status(403).json({
          success: false,
          message: 'You can only update plans from your organization'
        });
      }
    }

    // Handle benefits field carefully to avoid double-encoding
    let benefitsToStore = plan.benefits; // Keep existing benefits by default
    
    if (benefits !== undefined) {
      if (typeof benefits === 'string') {
        // If it's already a string, use it directly
        benefitsToStore = benefits;
      } else if (Array.isArray(benefits)) {
        // If it's an array, stringify it
        benefitsToStore = JSON.stringify(benefits);
      } else {
        // For other types, try to stringify
        benefitsToStore = JSON.stringify(benefits || []);
      }
    }

    await plan.update({
      name,
      description,
      fee,
      renewalInterval,
      benefits: benefitsToStore,
      maxMembers,
      isActive
    });

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message
    });
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user's organization from UserProfile
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    const plan = await Plan.findByPk(id, {
      include: [{ model: Subscription, as: 'subscriptions' }]
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Security check: Ensure user can only delete plans from their organization
    if (userProfile && userProfile.organizationId) {
      if (plan.organizationId !== userProfile.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete plans from your organization'
        });
      }
    } else {
      // If user has no organization, they can only delete plans with no organization
      if (plan.organizationId !== null) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete plans from your organization'
        });
      }
    }

    // Check if plan has active subscriptions
    const hasActiveSubscriptions = plan.subscriptions.some(sub => 
      ['active', 'past_due'].includes(sub.status)
    );

    if (hasActiveSubscriptions) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with active subscriptions'
      });
    }

    await plan.destroy();

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message
    });
  }
};

module.exports = {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
};
