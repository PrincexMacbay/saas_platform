const { Reminder, User, Plan, Subscription } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Get all reminders - USER-ONLY ACCESS
const getReminders = async (req, res) => {
  try {
    // USER-ONLY ACCESS: Only show reminders created by the current user
    const reminders = await Reminder.findAll({
      where: {
        userId: req.user.id // Only show reminders created by the current user
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
              { id: null } // Allow reminders without plans (if planId is null)
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
      order: [['reminderDate', 'ASC']]
    });

    res.json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
};

// Create a new reminder
const createReminder = async (req, res) => {
  try {
    const {
      name,
      type,
      reminderDate,
      message,
      planId,
      subscriptionId
    } = req.body;

    const reminder = await Reminder.create({
      name,
      type,
      reminderDate: new Date(reminderDate),
      message,
      userId: req.user.id,
      planId: planId || null,
      subscriptionId: subscriptionId || null,
      status: 'pending'
    });

    const reminderWithAssociations = await Reminder.findByPk(reminder.id, {
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
      message: 'Reminder created successfully',
      reminder: reminderWithAssociations
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reminder'
    });
  }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reminder = await Reminder.findByPk(id);
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check if user owns this reminder or is admin
    if (reminder.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reminder'
      });
    }

    await reminder.destroy();

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder'
    });
  }
};

// Send reminder manually
const sendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reminder = await Reminder.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check if user owns this reminder or is admin
    if (reminder.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send this reminder'
      });
    }

    try {
      // Send email reminder
      await emailService.sendReminderEmail(reminder.user.email, {
        name: reminder.name,
        message: reminder.message,
        type: reminder.type,
        reminderDate: reminder.reminderDate
      });

      await reminder.update({ status: 'sent' });

      res.json({
        success: true,
        message: 'Reminder sent successfully'
      });
    } catch (emailError) {
      console.error('Error sending reminder email:', emailError);
      await reminder.update({ status: 'failed' });
      
      res.status(500).json({
        success: false,
        message: 'Failed to send reminder email'
      });
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder'
    });
  }
};

// Process pending reminders (cron job or manual trigger)
const processReminders = async (req, res) => {
  try {
    const now = new Date();
    const pendingReminders = await Reminder.findAll({
      where: {
        status: 'pending',
        reminderDate: {
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

    const sentReminders = [];
    const failedReminders = [];

    for (const reminder of pendingReminders) {
      try {
        // Send email reminder
        await emailService.sendReminderEmail(reminder.user.email, {
          name: reminder.name,
          message: reminder.message,
          type: reminder.type,
          reminderDate: reminder.reminderDate
        });

        await reminder.update({ status: 'sent' });
        sentReminders.push(reminder);
        
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        await reminder.update({ status: 'failed' });
        failedReminders.push(reminder);
      }
    }

    res.json({
      success: true,
      message: `Sent ${sentReminders.length} reminders, ${failedReminders.length} failed`,
      sent: sentReminders.length,
      failed: failedReminders.length
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reminders'
    });
  }
};

// Get reminders by user
const getUserReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reminders = await Reminder.findAll({
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
      order: [['reminderDate', 'ASC']]
    });

    res.json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Error fetching user reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reminders'
    });
  }
};

// Update reminder
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const reminder = await Reminder.findByPk(id);
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check if user owns this reminder or is admin
    if (reminder.userId !== req.user.id && req.user.profile?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reminder'
      });
    }

    await reminder.update(updateData);

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder'
    });
  }
};

module.exports = {
  getReminders,
  createReminder,
  deleteReminder,
  sendReminder,
  processReminders,
  getUserReminders,
  updateReminder
};


