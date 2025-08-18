const { Op } = require('sequelize');
const { Payment, User, Plan, Subscription, Invoice } = require('../models');

// Get all payments
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, planId, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { identifier: { [Op.iLike]: `%${search}%` } },
        { referenceNumber: { [Op.iLike]: `%${search}%` } },
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (planId) {
      whereClause.planId = planId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['paymentDate', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'email']
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

    res.json({
      success: true,
      data: {
        payments: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get single payment
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Plan,
          as: 'plan'
        },
        {
          model: Subscription,
          as: 'subscription'
        },
        {
          model: Invoice,
          as: 'invoice'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const { 
      userId, 
      planId, 
      subscriptionId, 
      amount, 
      paymentMethod, 
      paymentDate, 
      identifier, 
      referenceNumber, 
      notes 
    } = req.body;

    const payment = await Payment.create({
      userId,
      planId,
      subscriptionId,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      identifier,
      referenceNumber,
      notes,
      status: 'pending'
    });

    // Fetch with relations
    const fullPayment = await Payment.findByPk(payment.id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan', attributes: ['name', 'fee'] },
        { model: Subscription, as: 'subscription', attributes: ['memberNumber'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: fullPayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount, 
      paymentMethod, 
      paymentDate, 
      identifier, 
      referenceNumber, 
      status, 
      notes 
    } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.update({
      amount,
      paymentMethod,
      paymentDate,
      identifier,
      referenceNumber,
      status,
      notes
    });

    // If payment is completed, update subscription status
    if (status === 'completed' && payment.status !== 'completed' && payment.subscriptionId) {
      await updateSubscriptionOnPayment(payment.subscriptionId);
    }

    const updatedPayment = await Payment.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan', attributes: ['name', 'fee'] },
        { model: Subscription, as: 'subscription', attributes: ['memberNumber'] }
      ]
    });

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.destroy();

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
};

// Helper function to update subscription when payment is completed
const updateSubscriptionOnPayment = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: Plan, as: 'plan' }]
    });

    if (!subscription) return;

    // Update subscription status to active
    if (subscription.status === 'pending' || subscription.status === 'past_due') {
      const startDate = subscription.startDate || new Date();
      let endDate;

      // Calculate end date based on plan renewal interval
      switch (subscription.plan.renewalInterval) {
        case 'monthly':
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate = null; // One-time payment
      }

      await subscription.update({
        status: 'active',
        startDate,
        endDate,
        renewalDate: endDate
      });
    }
  } catch (error) {
    console.error('Error updating subscription on payment:', error);
  }
};

module.exports = {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
};
