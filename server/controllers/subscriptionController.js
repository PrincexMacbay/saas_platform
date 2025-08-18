const { Op } = require('sequelize');
const { Subscription, User, Plan, Payment, Debt, DigitalCard, Organization } = require('../models');
const { generateMemberNumber } = require('../utils/memberUtils');

// Get user's own subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscriptions = await Subscription.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'renewalInterval', 'description', 'benefits'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id', 'name', 'logo']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user subscriptions',
      error: error.message
    });
  }
};

// Get all subscriptions (admin)
const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, planId } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { memberNumber: { [Op.iLike]: `%${search}%` } },
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (planId) {
      whereClause.planId = planId;
    }

    const { count, rows } = await Subscription.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'email']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'renewalInterval']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        subscriptions: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
};

// Get single subscription
const getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await Subscription.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'email']
        },
        {
          model: Plan,
          as: 'plan'
        },
        {
          model: Payment,
          as: 'payments',
          order: [['paymentDate', 'DESC']],
          limit: 10
        },
        {
          model: Debt,
          as: 'debts',
          where: { status: 'outstanding' },
          required: false
        },
        {
          model: DigitalCard,
          as: 'digitalCards',
          where: { isTemplate: false },
          required: false
        }
      ]
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const { userId, planId, startDate, endDate, autoRenew, notes } = req.body;

    // Check if user already has an active subscription for this plan
    const existingSubscription = await Subscription.findOne({
      where: {
        userId,
        planId,
        status: ['active', 'past_due']
      }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription for this plan'
      });
    }

    // Generate member number
    const memberNumber = await generateMemberNumber();

    const subscription = await Subscription.create({
      userId,
      planId,
      memberNumber,
      startDate,
      endDate,
      autoRenew,
      notes,
      status: 'pending'
    });

    // Fetch with relations
    const fullSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: fullSubscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, startDate, endDate, renewalDate, autoRenew, notes } = req.body;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await subscription.update({
      status,
      startDate,
      endDate,
      renewalDate,
      autoRenew,
      notes
    });

    // If subscription is activated, create digital card
    if (status === 'active' && subscription.status !== 'active') {
      await createDigitalCardForSubscription(subscription.id);
    }

    const updatedSubscription = await Subscription.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan' }
      ]
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
};

// Delete subscription
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await subscription.destroy();

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription',
      error: error.message
    });
  }
};

// Helper function to create digital card
const createDigitalCardForSubscription = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!subscription) return;

    // Get card template
    const template = await DigitalCard.findOne({
      where: { isTemplate: true }
    });

    // Create user-specific card
    await DigitalCard.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      logo: template?.logo,
      organizationName: template?.organizationName,
      cardTitle: template?.cardTitle || 'Membership Card',
      headerText: template?.headerText,
      footerText: template?.footerText,
      enableBarcode: template?.enableBarcode !== false,
      barcodeType: template?.barcodeType || 'qr',
      barcodeData: 'member_number',
      primaryColor: template?.primaryColor || '#3498db',
      secondaryColor: template?.secondaryColor || '#2c3e50',
      textColor: template?.textColor || '#ffffff',
      isTemplate: false,
      isGenerated: false
    });
  } catch (error) {
    console.error('Error creating digital card:', error);
  }
};

module.exports = {
  getUserSubscriptions,
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription
};
