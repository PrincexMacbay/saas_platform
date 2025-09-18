const { ScheduledPayment, User, Plan } = require('../models');
const { Op } = require('sequelize');

// Get all scheduled payments - USER-ONLY ACCESS
const getScheduledPayments = async (req, res) => {
  try {
    // USER-ONLY ACCESS: Only show scheduled payments created by the current user
    const scheduledPayments = await ScheduledPayment.findAll({
      where: {
        userId: req.user.id // Only show payments created by the current user
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
          attributes: ['id', 'name', 'fee', 'createdBy'],
          where: {
            [Op.or]: [
              { createdBy: req.user.id }, // Plans created by current user
              { id: null } // Allow payments without plans (if planId is null)
            ]
          },
          required: false // Allow null plans
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    res.json({
      success: true,
      scheduledPayments
    });
  } catch (error) {
    console.error('Error fetching scheduled payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled payments'
    });
  }
};

// Create a new scheduled payment
const createScheduledPayment = async (req, res) => {
  try {
    const {
      amount,
      scheduledDate,
      frequency,
      description,
      planId
    } = req.body;

    const scheduledPayment = await ScheduledPayment.create({
      amount: parseFloat(amount),
      scheduledDate: new Date(scheduledDate),
      frequency,
      description,
      userId: req.user.id,
      planId: planId || null,
      status: 'pending'
    });

    const paymentWithAssociations = await ScheduledPayment.findByPk(scheduledPayment.id, {
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
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Scheduled payment created successfully',
      scheduledPayment: paymentWithAssociations
    });
  } catch (error) {
    console.error('Error creating scheduled payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduled payment'
    });
  }
};

// Delete a scheduled payment
const deleteScheduledPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scheduledPayment = await ScheduledPayment.findByPk(id);
    
    if (!scheduledPayment) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled payment not found'
      });
    }

    // Check if user owns this scheduled payment or is admin
    if (scheduledPayment.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this scheduled payment'
      });
    }

    await scheduledPayment.destroy();

    res.json({
      success: true,
      message: 'Scheduled payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheduled payment'
    });
  }
};

// Update scheduled payment status
const updateScheduledPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const scheduledPayment = await ScheduledPayment.findByPk(id);
    
    if (!scheduledPayment) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled payment not found'
      });
    }

    // Check if user owns this scheduled payment or is admin
    if (scheduledPayment.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this scheduled payment'
      });
    }

    await scheduledPayment.update({ status });

    res.json({
      success: true,
      message: 'Scheduled payment status updated successfully',
      scheduledPayment
    });
  } catch (error) {
    console.error('Error updating scheduled payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled payment status'
    });
  }
};

// Process scheduled payments (cron job or manual trigger)
const processScheduledPayments = async (req, res) => {
  try {
    const now = new Date();
    const pendingPayments = await ScheduledPayment.findAll({
      where: {
        status: 'pending',
        scheduledDate: {
          [Op.lte]: now
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    const processedPayments = [];
    const failedPayments = [];

    for (const payment of pendingPayments) {
      try {
        // Here you would integrate with your payment processor
        // For now, we'll simulate a successful payment
        await payment.update({ status: 'processed' });
        processedPayments.push(payment);
        
        // Send notification to user
        // await sendPaymentNotification(payment.user.email, payment);
        
      } catch (error) {
        console.error(`Failed to process payment ${payment.id}:`, error);
        await payment.update({ status: 'failed' });
        failedPayments.push(payment);
      }
    }

    res.json({
      success: true,
      message: `Processed ${processedPayments.length} payments, ${failedPayments.length} failed`,
      processed: processedPayments.length,
      failed: failedPayments.length
    });
  } catch (error) {
    console.error('Error processing scheduled payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process scheduled payments'
    });
  }
};

module.exports = {
  getScheduledPayments,
  createScheduledPayment,
  deleteScheduledPayment,
  updateScheduledPaymentStatus,
  processScheduledPayments
};


