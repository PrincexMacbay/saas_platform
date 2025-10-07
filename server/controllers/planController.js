const { Op } = require('sequelize');
const { Plan, Subscription, User, UserProfile, ApplicationForm } = require('../models');

// Get all plans
const getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // USER-ONLY ACCESS: Only show plans created by the current user
    whereClause.createdBy = req.user.id;
    
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

    // Security check: Ensure user can only view plans they created
    if (plan.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view plans you created'
      });
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
    const { name, description, fee, renewalInterval, benefits, maxMembers, applicationFormId, useDefaultForm } = req.body;
    
    console.log('Creating plan with data:', {
      name,
      description,
      fee,
      renewalInterval,
      benefits,
      maxMembers,
      applicationFormId,
      useDefaultForm
    });

    // Get user's organization from UserProfile
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    // Validate form selection
    if (!useDefaultForm && !applicationFormId) {
      return res.status(400).json({
        success: false,
        message: 'You must either select a specific application form or use the default form'
      });
    }

    // If using a specific form, validate it exists and is published
    if (applicationFormId && !useDefaultForm) {
      console.log('Validating application form:', {
        applicationFormId,
        useDefaultForm,
        userProfile: userProfile ? userProfile.organizationId : null
      });

      // First, just check if the form exists and is published
      const form = await ApplicationForm.findOne({
        where: { 
          id: applicationFormId,
          isPublished: true
        }
      });

      console.log('Found form:', form ? form.id : 'not found');

      if (!form) {
        return res.status(400).json({
          success: false,
          message: 'Selected application form not found or not published. Please create and publish a form first.'
        });
      }

      // If user has an organization, also check that the form belongs to their organization
      if (userProfile && userProfile.organizationId) {
        if (form.organizationId !== userProfile.organizationId) {
          return res.status(400).json({
            success: false,
            message: 'You can only use application forms from your organization.'
          });
        }
      }
    }

    const plan = await Plan.create({
      name,
      description,
      fee,
      renewalInterval,
      benefits: JSON.stringify(benefits || []),
      maxMembers,
      isActive: true,
      createdBy: req.user.id,
      applicationFormId: useDefaultForm ? null : applicationFormId,
      useDefaultForm: useDefaultForm || false
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
    const { name, description, fee, renewalInterval, benefits, maxMembers, isActive, applicationFormId, useDefaultForm } = req.body;

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

    // Security check: Ensure user can only update plans they created
    if (plan.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update plans you created'
      });
    }

    // Validate form selection if provided
    if (applicationFormId !== undefined || useDefaultForm !== undefined) {
      if (!useDefaultForm && !applicationFormId) {
        return res.status(400).json({
          success: false,
          message: 'You must either select a specific application form or use the default form'
        });
      }

      // If using a specific form, validate it exists and is published
      if (applicationFormId && !useDefaultForm) {
        const form = await ApplicationForm.findOne({
          where: { 
            id: applicationFormId,
            isPublished: true
          }
        });

        if (!form) {
          return res.status(400).json({
            success: false,
            message: 'Selected application form not found or not published. Please create and publish a form first.'
          });
        }

        // If user has an organization, also check that the form belongs to their organization
        if (userProfile && userProfile.organizationId) {
          if (form.organizationId !== userProfile.organizationId) {
            return res.status(400).json({
              success: false,
              message: 'You can only use application forms from your organization.'
            });
          }
        }
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

    const updateData = {
      name,
      description,
      fee,
      renewalInterval,
      benefits: benefitsToStore,
      maxMembers,
      isActive
    };

    // Add form-related fields if provided
    if (applicationFormId !== undefined) {
      updateData.applicationFormId = useDefaultForm ? null : applicationFormId;
    }
    if (useDefaultForm !== undefined) {
      updateData.useDefaultForm = useDefaultForm;
    }

    await plan.update(updateData);

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

    // Security check: Ensure user can only delete plans they created
    if (plan.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete plans you created'
      });
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
