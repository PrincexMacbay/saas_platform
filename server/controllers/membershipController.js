const { Op } = require('sequelize');
const { 
  Plan, 
  Subscription, 
  Payment, 
  Invoice, 
  ScheduledPayment, 
  Debt, 
  Reminder, 
  Application, 
  Coupon, 
  MembershipSettings, 
  ApplicationForm, 
  DigitalCard,
  User 
} = require('../models');

// Dashboard KPIs and statistics
const getDashboard = async (req, res) => {
  try {
    const currentDate = new Date();
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // SECURITY FIX: Only show data for plans created by the current user
    // Organization members should NOT see payment data - only plan creators/admins should
    const userFilter = {
      createdBy: req.user.id // Only plans created by current user
    };

    // Get plans that the user has access to
    const userPlans = await Plan.findAll({
      where: userFilter,
      attributes: ['id']
    });
    const userPlanIds = userPlans.map(plan => plan.id);

    if (userPlanIds.length === 0) {
      // User has no plans, return empty dashboard
      return res.json({
        success: true,
        data: {
          stats: {
            totalSubscriptions: 0,
            newSubscriptions: 0,
            activeSubscriptions: 0,
            pastDueSubscriptions: 0,
            totalRevenue: 0,
            monthlyRevenue: 0
          },
          recentPayments: [],
          chartData: []
        }
      });
    }

    // Subscription stats - only for user's plans
    const totalSubscriptions = await Subscription.count({
      where: { planId: { [Op.in]: userPlanIds } }
    });
    const newSubscriptions = await Subscription.count({
      where: { 
        planId: { [Op.in]: userPlanIds },
        createdAt: { [Op.gte]: thisMonth } 
      }
    });
    const activeSubscriptions = await Subscription.count({
      where: { 
        planId: { [Op.in]: userPlanIds },
        status: 'active' 
      }
    });
    const pastDueSubscriptions = await Subscription.count({
      where: { 
        planId: { [Op.in]: userPlanIds },
        status: 'past_due' 
      }
    });

    // Payment stats - only for user's plans
    const totalRevenue = await Payment.sum('amount', {
      where: { 
        status: 'completed',
        planId: { [Op.in]: userPlanIds }
      }
    });
    const monthlyRevenue = await Payment.sum('amount', {
      where: { 
        status: 'completed',
        planId: { [Op.in]: userPlanIds },
        paymentDate: { [Op.gte]: thisMonth }
      }
    });

    // Recent activity - only for user's plans
    const recentPayments = await Payment.findAll({
      limit: 10,
      order: [['paymentDate', 'DESC']],
      where: { planId: { [Op.in]: userPlanIds } },
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'username'] },
        { model: Plan, as: 'plan', attributes: ['name'] }
      ]
    });

    // Charts data - last 6 months (filtered by user's plans)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const subscriptions = await Subscription.count({
        where: { 
          planId: { [Op.in]: userPlanIds },
          createdAt: { 
            [Op.gte]: month,
            [Op.lt]: nextMonth
          }
        }
      });
      
      const revenue = await Payment.sum('amount', {
        where: { 
          status: 'completed',
          planId: { [Op.in]: userPlanIds },
          paymentDate: { 
            [Op.gte]: month,
            [Op.lt]: nextMonth
          }
        }
      });

      chartData.push({
        month: month.toISOString().slice(0, 7),
        subscriptions,
        revenue: revenue || 0
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalSubscriptions,
          newSubscriptions,
          activeSubscriptions,
          pastDueSubscriptions,
          totalRevenue: totalRevenue || 0,
          monthlyRevenue: monthlyRevenue || 0
        },
        recentPayments,
        chartData
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get membership settings
const getSettings = async (req, res) => {
  try {
    const settings = await MembershipSettings.findOne();
    
    res.json({
      success: true,
      data: settings || {}
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// Update membership settings
const updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    let settings = await MembershipSettings.findOne();
    
    if (settings) {
      await settings.update(updateData);
    } else {
      settings = await MembershipSettings.create(updateData);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getSettings,
  updateSettings
};
