const { Op } = require('sequelize');
const { Debt, User, Plan, Subscription, sequelize } = require('../models');

// Get all debts - USER-ONLY ACCESS
const getDebts = async (req, res) => {
  try {
    // USER-ONLY ACCESS: Only show debts created by the current user
    const debts = await Debt.findAll({
      where: {
        userId: req.user.id // Only show debts created by the current user
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'createdBy', 'organizationId'],
          where: {
            [Op.or]: [
              { createdBy: req.user.id }, // Plans created by current user
              { id: null } // Allow debts without plans (if planId is null)
            ]
          },
          required: false // Allow null plans
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'memberNumber', 'status'],
          required: false // Allow null subscriptions
        }
      ],
      order: [['issuedOn', 'DESC']]
    });

    res.json({
      success: true,
      debts
    });
  } catch (error) {
    console.error('Error fetching debts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debts'
    });
  }
};

// Create a new debt
const createDebt = async (req, res) => {
  try {
    const {
      amount,
      description,
      dataType,
      issuedOn,
      isManualEntry,
      planId,
      subscriptionId
    } = req.body;

    const debt = await Debt.create({
      amount: parseFloat(amount),
      description,
      dataType,
      issuedOn: issuedOn ? new Date(issuedOn) : new Date(),
      isManualEntry: isManualEntry || false,
      userId: req.user.id,
      planId: planId || null,
      subscriptionId: subscriptionId || null,
      status: 'outstanding'
    });

    const debtWithAssociations = await Debt.findByPk(debt.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'memberNumber', 'status']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Debt created successfully',
      debt: debtWithAssociations
    });
  } catch (error) {
    console.error('Error creating debt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create debt'
    });
  }
};

// Delete a debt
const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;
    
    const debt = await Debt.findByPk(id);
    
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Check if user owns this debt or is admin
    if (debt.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this debt'
      });
    }

    await debt.destroy();

    res.json({
      success: true,
      message: 'Debt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete debt'
    });
  }
};

// Update debt status
const updateDebtStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const debt = await Debt.findByPk(id);
    
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    // Check if user owns this debt or is admin
    if (debt.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this debt'
      });
    }

    await debt.update({ status });

    res.json({
      success: true,
      message: 'Debt status updated successfully',
      debt
    });
  } catch (error) {
    console.error('Error updating debt status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update debt status'
    });
  }
};

// Get debts by user
const getUserDebts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const debts = await Debt.findAll({
      where: { userId },
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'memberNumber', 'status']
        }
      ],
      order: [['issuedOn', 'DESC']]
    });

    res.json({
      success: true,
      debts
    });
  } catch (error) {
    console.error('Error fetching user debts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user debts'
    });
  }
};

// Get outstanding debts summary
const getOutstandingDebtsSummary = async (req, res) => {
  try {
    const summary = await Debt.findAll({
      where: { status: 'outstanding' },
      attributes: [
        'userId',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'debtCount']
      ],
      group: ['userId'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching outstanding debts summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outstanding debts summary'
    });
  }
};

module.exports = {
  getDebts,
  createDebt,
  deleteDebt,
  updateDebtStatus,
  getUserDebts,
  getOutstandingDebtsSummary
};


