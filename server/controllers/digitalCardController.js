const { DigitalCard, Subscription, User, Organization, Plan, UserProfile } = require('../models');

// Get digital card template for a specific plan
const getDigitalCardTemplateByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    // Get the plan to check its digital card template configuration
    const plan = await Plan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    let digitalCardTemplate = null;

    if (plan.digitalCardTemplateId && !plan.useDefaultCardTemplate) {
      // Use plan-specific template
      digitalCardTemplate = await DigitalCard.findOne({
        where: { 
          id: plan.digitalCardTemplateId,
          isTemplate: true 
        }
      });
    } else {
      // Use organization's default template (via user profile)
      const userProfile = await UserProfile.findOne({
        where: { userId: req.user.id }
      });
      
      if (userProfile && userProfile.organizationId) {
        digitalCardTemplate = await DigitalCard.findOne({
          where: { 
            organizationId: userProfile.organizationId,
            isTemplate: true 
          }
        });
      }
    }

    if (!digitalCardTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Digital card template not found'
      });
    }

    res.json({
      success: true,
      data: digitalCardTemplate
    });
  } catch (error) {
    console.error('Get digital card template by plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch digital card template',
      error: error.message
    });
  }
};

// Get all digital cards for the current user
const getDigitalCards = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const digitalCards = await DigitalCard.findAll({
      where: { userId },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'username', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: digitalCards
    });
  } catch (error) {
    console.error('Get digital cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch digital cards',
      error: error.message
    });
  }
};

// Get digital card for a specific subscription
const getDigitalCard = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;
    
    const digitalCard = await DigitalCard.findOne({
      where: { 
        subscriptionId,
        userId 
      },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'username', 'email']
            }
          ]
        }
      ]
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    res.json({
      success: true,
      data: digitalCard
    });
  } catch (error) {
    console.error('Get digital card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch digital card',
      error: error.message
    });
  }
};

// Create a new digital card
const createDigitalCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId, ...cardData } = req.body;
    
    // Verify the subscription belongs to the user
    const subscription = await Subscription.findOne({
      where: { 
        id: subscriptionId,
        userId 
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const digitalCard = await DigitalCard.create({
      userId,
      subscriptionId,
      ...cardData
    });

    res.status(201).json({
      success: true,
      data: digitalCard
    });
  } catch (error) {
    console.error('Create digital card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create digital card',
      error: error.message
    });
  }
};

// Update a digital card
const updateDigitalCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    const digitalCard = await DigitalCard.findOne({
      where: { 
        id,
        userId 
      }
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    await digitalCard.update(updateData);

    res.json({
      success: true,
      data: digitalCard
    });
  } catch (error) {
    console.error('Update digital card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update digital card',
      error: error.message
    });
  }
};

// Delete a digital card
const deleteDigitalCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const digitalCard = await DigitalCard.findOne({
      where: { 
        id,
        userId 
      }
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    await digitalCard.destroy();

    res.json({
      success: true,
      message: 'Digital card deleted successfully'
    });
  } catch (error) {
    console.error('Delete digital card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete digital card',
      error: error.message
    });
  }
};

module.exports = {
  getDigitalCards,
  getDigitalCard,
  createDigitalCard,
  updateDigitalCard,
  deleteDigitalCard,
  getDigitalCardTemplateByPlan
};
