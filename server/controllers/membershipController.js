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

    // Subscription stats
    const totalSubscriptions = await Subscription.count();
    const newSubscriptions = await Subscription.count({
      where: { createdAt: { [Op.gte]: thisMonth } }
    });
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });
    const pastDueSubscriptions = await Subscription.count({
      where: { status: 'past_due' }
    });

    // Payment stats
    const totalRevenue = await Payment.sum('amount', {
      where: { status: 'completed' }
    });
    const monthlyRevenue = await Payment.sum('amount', {
      where: { 
        status: 'completed',
        paymentDate: { [Op.gte]: thisMonth }
      }
    });

    // Recent activity
    const recentPayments = await Payment.findAll({
      limit: 10,
      order: [['paymentDate', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'username'] },
        { model: Plan, as: 'plan', attributes: ['name'] }
      ]
    });

    // Charts data - last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const subscriptions = await Subscription.count({
        where: { 
          createdAt: { 
            [Op.gte]: month,
            [Op.lt]: nextMonth
          }
        }
      });
      
      const revenue = await Payment.sum('amount', {
        where: { 
          status: 'completed',
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

module.exports = {
  getDashboard
};
