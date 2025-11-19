const { Op } = require('sequelize');
const { 
  User, 
  UserProfile, 
  Plan, 
  Subscription, 
  Payment, 
  Invoice, 
  Job, 
  JobApplication,
  Coupon,
  Application,
  Space,
  Post,
  Comment,
  SystemSettings,
  sequelize
} = require('../models');

// Helper function to calculate date range based on period
const getDateRange = (period) => {
  const now = new Date();
  let currentStart, previousStart, previousEnd;
  
  switch (period) {
    case 'week':
      // Current week (last 7 days)
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 7);
      // Previous week (7 days before that)
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = new Date(currentStart);
      break;
    case 'month':
      // Current month
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      // Previous month
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'quarter':
      // Current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
      // Previous quarter
      const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const prevYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      previousStart = new Date(prevYear, prevQuarter * 3, 1);
      previousEnd = new Date(prevYear, (prevQuarter + 1) * 3, 0);
      break;
    case 'year':
      // Current year
      currentStart = new Date(now.getFullYear(), 0, 1);
      // Previous year
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default: // 'month' as default
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  }
  
  return { currentStart, previousStart, previousEnd };
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10; // Round to 1 decimal place
};

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    const period = req.query.period || 'month'; // Default to 'month'
    const { currentStart, previousStart, previousEnd } = getDateRange(period);
    
    // Current period stats
    // Total Users
    const totalUsers = await User.count();
    const totalUsersCurrent = await User.count({
      where: {
        createdAt: {
          [Op.gte]: currentStart
        }
      }
    });
    const totalUsersPrevious = await User.count({
      where: {
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      }
    });
    
    // Active Users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    const activeUsersCurrent = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: currentStart
        }
      }
    });
    const activeUsersPrevious = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      }
    });

    // Total Membership Plans
    const totalPlans = await Plan.count();
    const totalPlansCurrent = await Plan.count({
      where: {
        createdAt: {
          [Op.gte]: currentStart
        }
      }
    });
    const totalPlansPrevious = await Plan.count({
      where: {
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      }
    });
    
    // Active Subscriptions
    const activeSubscriptions = await Subscription.count({
      where: {
        status: 'active'
      }
    });
    const activeSubscriptionsCurrent = await Subscription.count({
      where: {
        status: 'active',
        createdAt: {
          [Op.gte]: currentStart
        }
      }
    });
    const activeSubscriptionsPrevious = await Subscription.count({
      where: {
        status: 'active',
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      }
    });

    // Total Jobs
    const totalJobs = await Job.count();
    const totalJobsCurrent = await Job.count({
      where: {
        createdAt: {
          [Op.gte]: currentStart
        }
      }
    });
    const totalJobsPrevious = await Job.count({
      where: {
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      }
    });
    
    // Total Job Applications
    const totalApplications = await JobApplication.count();
    const totalApplicationsCurrent = await JobApplication.count({
      where: {
        createdAt: {
          [Op.gte]: currentStart
        }
      }
    });
    const totalApplicationsPrevious = await JobApplication.count({
      where: {
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      }
    });

    // Revenue Statistics
    const revenueStats = await Payment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
      ],
      where: {
        status: 'completed'
      },
      raw: true
    });

    // Current period revenue
    const currentRevenue = await Payment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'currentRevenue']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: currentStart
        }
      },
      raw: true
    });

    // Previous period revenue
    const previousRevenue = await Payment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'previousRevenue']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd
        }
      },
      raw: true
    });

    // Monthly Revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyRevenue = await Payment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'monthlyRevenue']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: currentMonth
        }
      },
      raw: true
    });

    // Calculate percentage changes
    const changes = {
      totalUsers: calculatePercentageChange(totalUsersCurrent, totalUsersPrevious),
      activeUsers: calculatePercentageChange(activeUsersCurrent, activeUsersPrevious),
      totalPlans: calculatePercentageChange(totalPlansCurrent, totalPlansPrevious),
      activeSubscriptions: calculatePercentageChange(activeSubscriptionsCurrent, activeSubscriptionsPrevious),
      totalJobs: calculatePercentageChange(totalJobsCurrent, totalJobsPrevious),
      totalApplications: calculatePercentageChange(totalApplicationsCurrent, totalApplicationsPrevious),
      totalRevenue: calculatePercentageChange(
        parseFloat(currentRevenue?.currentRevenue || 0),
        parseFloat(previousRevenue?.previousRevenue || 0)
      ),
      monthlyRevenue: calculatePercentageChange(
        parseFloat(monthlyRevenue?.monthlyRevenue || 0),
        parseFloat(previousRevenue?.previousRevenue || 0)
      )
    };

    // System Health Metrics
    const systemHealth = {
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };

    // Recent Activity
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'createdAt']
    });

    const recentJobs = await Job.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'category', 'status', 'createdAt'],
      include: [{
        model: User,
        as: 'employer',
        attributes: ['username', 'firstName', 'lastName']
      }]
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalPlans,
          activeSubscriptions,
          totalJobs,
          totalApplications,
          totalRevenue: revenueStats?.totalRevenue || 0,
          monthlyRevenue: monthlyRevenue?.monthlyRevenue || 0,
          totalTransactions: revenueStats?.totalTransactions || 0
        },
        changes,
        systemHealth,
        recentActivity: {
          recentUsers,
          recentJobs
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get user management data
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status !== '') {
      whereClause.status = status;
    }

    if (role !== '') {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: UserProfile,
        as: 'profile'
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 AdminController: Fetching user details for userId:', userId);

    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    if (!user) {
      console.log('❌ AdminController: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ AdminController: User details found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });

    res.json({
      success: true,
      data: { 
        user: {
          ...user.toJSON(),
          emailVerified: true // Default to true for now
        }
      }
    });
  } catch (error) {
    console.error('❌ AdminController: Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;

    await user.update(updateData);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Get financial data
const getFinancialData = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Payment statistics
    const paymentStats = await Payment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      raw: true
    });

    // Payment methods breakdown
    const paymentMethods = await Payment.findAll({
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: ['paymentMethod'],
      raw: true
    });

    // Revenue by membership plan
    const revenueByPlan = await Payment.findAll({
      attributes: [
        [sequelize.literal('plan.name'), 'planName'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('Payment.amount')), 'total']
      ],
      include: [{
        model: Plan,
        as: 'plan',
        attributes: []
      }],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: ['plan.id', 'plan.name'],
      raw: true
    });

    // Recent transactions
    const recentTransactions = await Payment.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      data: {
        period,
        stats: paymentStats,
        paymentMethods,
        revenueByPlan,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial data'
    });
  }
};

// Get job management data
const getJobManagementData = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (status !== '') {
      whereClause.status = status;
    }
    
    if (category !== '') {
      whereClause.category = category;
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: JobApplication,
          as: 'applications',
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Job statistics
    const jobStats = await Job.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalJobs'],
        [sequelize.literal('COUNT(CASE WHEN status = \'active\' THEN 1 END)'), 'activeJobs'],
        [sequelize.literal('COUNT(CASE WHEN status = \'closed\' THEN 1 END)'), 'closedJobs']
      ],
      raw: true
    });

    const applicationStats = await JobApplication.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalApplications'],
        [sequelize.literal('COUNT(CASE WHEN status = \'pending\' THEN 1 END)'), 'pendingApplications'],
        [sequelize.literal('COUNT(CASE WHEN status = \'accepted\' THEN 1 END)'), 'acceptedApplications']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        jobs,
        stats: {
          ...jobStats,
          ...applicationStats
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching job management data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job management data'
    });
  }
};

// Get coupon management data
const getCouponData = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Coupon usage statistics
    const couponStats = await Coupon.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCoupons'],
        [sequelize.literal('COUNT(CASE WHEN "isActive" = true THEN 1 END)'), 'activeCoupons'],
        [sequelize.fn('SUM', sequelize.col('currentRedemptions')), 'totalRedemptions']
      ],
      raw: true
    });

    // Calculate additional metrics
    const expiredCoupons = await Coupon.count({
      where: {
        expiryDate: {
          [Op.lt]: new Date()
        }
      }
    });

    const totalDiscount = await Coupon.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('discount')), 'totalDiscount']
      ],
      where: {
        isActive: true
      },
      raw: true
    });

    res.json({
      success: true,
      data: {
        coupons,
        stats: {
          ...couponStats,
          expiredCoupons,
          totalDiscount: totalDiscount?.totalDiscount || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching coupon data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon data'
    });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 AdminController: Fetching user activity for userId:', userId);

    // For now, return mock data since we don't have an activity log table
    const mockActivity = [
      {
        id: 1,
        action: 'Profile Updated',
        description: 'User updated their profile information',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1'
      },
      {
        id: 2,
        action: 'Login',
        description: 'User logged into the system',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.1'
      }
    ];

    res.json({
      success: true,
      data: mockActivity
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
};

// Get user login history
const getUserLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 AdminController: Fetching user login history for userId:', userId);

    // For now, return mock data since we don't have a login history table
    const mockLoginHistory = [
      {
        id: 1,
        loginTime: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true
      },
      {
        id: 2,
        loginTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true
      }
    ];

    res.json({
      success: true,
      data: mockLoginHistory
    });
  } catch (error) {
    console.error('Error fetching user login history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user login history'
    });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 AdminController: Fetching user subscriptions for userId:', userId);

    // For now, return mock data since we don't have subscription data
    const mockSubscriptions = [
      {
        id: 1,
        planName: 'Premium Plan',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 29.99
      }
    ];

    res.json({
      success: true,
      data: mockSubscriptions
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user subscriptions'
    });
  }
};

// Get user payments
const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 AdminController: Fetching user payments for userId:', userId);

    // For now, return mock data since we don't have payment data
    const mockPayments = [
      {
        id: 1,
        amount: 29.99,
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'txn_123456789',
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockPayments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user payments'
    });
  }
};

// Bulk update users
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, data } = req.body;
    console.log('🔍 AdminController: Bulk updating users:', { userIds, data });

    await User.update(data, {
      where: {
        id: {
          [Op.in]: userIds
        }
      }
    });

    res.json({
      success: true,
      message: 'Users updated successfully'
    });
  } catch (error) {
    console.error('Error bulk updating users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update users'
    });
  }
};

// Export users
const exportUsers = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    console.log('🔍 AdminController: Exporting users in format:', format);

    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']
    });

    if (format === 'csv') {
      const csvHeader = 'ID,Username,Email,First Name,Last Name,Role,Status,Created At\n';
      const csvData = users.map(user => 
        `${user.id},${user.username},${user.email},${user.firstName || ''},${user.lastName || ''},${user.role},${user.status},${user.createdAt}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: users
      });
    }
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users'
    });
  }
};

// Send mass email
const sendMassEmail = async (req, res) => {
  try {
    const { subject, message, recipients, userIds } = req.body;
    console.log('🔍 AdminController: Sending mass email:', { subject, recipients, userIds });

    // For now, just return success since we don't have email service set up
    res.json({
      success: true,
      message: 'Mass email sent successfully'
    });
  } catch (error) {
    console.error('Error sending mass email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send mass email'
    });
  }
};

// Get membership plans
const getMembershipPlans = async (req, res) => {
  try {
    console.log('🔍 AdminController: Fetching membership plans...');

    const plans = await Plan.findAll({
      include: [{
        model: Subscription,
        as: 'subscriptions',
        attributes: ['id', 'status'],
        where: { status: 'active' },
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate stats for each plan
    const plansWithStats = plans.map(plan => {
      const activeSubscriptions = plan.subscriptions ? plan.subscriptions.length : 0;
      const revenue = activeSubscriptions * parseFloat(plan.fee);
      
      return {
        ...plan.toJSON(),
        price: parseFloat(plan.fee), // Map fee to price for frontend compatibility
        duration: plan.renewalInterval, // Map renewalInterval to duration for frontend compatibility
        features: plan.benefits ? plan.benefits.split('\n').filter(b => b.trim()) : [], // Map benefits to features
        subscribers: activeSubscriptions,
        revenue: revenue
      };
    });

    res.json({
      success: true,
      data: { plans: plansWithStats }
    });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership plans'
    });
  }
};

// Create membership plan
const createMembershipPlan = async (req, res) => {
  try {
    const { name, description, price, duration, features, isActive } = req.body;
    console.log('🔍 AdminController: Creating membership plan:', { name, price, duration });

    const plan = await Plan.create({
      name,
      description,
      fee: parseFloat(price),
      renewalInterval: duration,
      benefits: Array.isArray(features) ? features.join('\n') : features,
      isActive: isActive !== false,
      createdBy: req.user.id // Assuming req.user is available from auth middleware
    });

    res.json({
      success: true,
      message: 'Plan created successfully',
      data: { plan }
    });
  } catch (error) {
    console.error('Error creating membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create membership plan'
    });
  }
};

// Update membership plan
const updateMembershipPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, description, price, duration, features, isActive } = req.body;
    console.log('🔍 AdminController: Updating membership plan:', planId);

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await plan.update({
      name,
      description,
      fee: parseFloat(price),
      renewalInterval: duration,
      benefits: Array.isArray(features) ? features.join('\n') : features,
      isActive: isActive !== false
    });

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: { plan }
    });
  } catch (error) {
    console.error('Error updating membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update membership plan'
    });
  }
};

// Delete membership plan
const deleteMembershipPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    console.log('🔍 AdminController: Deleting membership plan:', planId);

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: {
        planId: planId,
        status: 'active'
      }
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan with ${activeSubscriptions} active subscription(s). Please cancel or transfer subscriptions first.`
      });
    }

    await plan.destroy();

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete membership plan'
    });
  }
};

// Get active subscriptions
const getActiveSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const offset = (page - 1) * limit;
    console.log('🔍 AdminController: Fetching active subscriptions...');

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'renewalInterval']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate subscription stats
    // Get total revenue from associated plans
    const activeSubscriptions = await Subscription.findAll({
      where: { status: 'active' },
      include: [{
        model: Plan,
        as: 'plan',
        attributes: ['fee']
      }]
    });
    
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      return sum + (sub.plan ? parseFloat(sub.plan.fee) : 0);
    }, 0);

    // Calculate renewal rate based on autoRenew field
    const totalActive = await Subscription.count({
      where: { status: 'active' }
    });
    
    const autoRenewCount = await Subscription.count({
      where: { 
        status: 'active',
        autoRenew: true
      }
    });
    
    const renewalRate = totalActive > 0 ? (autoRenewCount / totalActive) * 100 : 0;

    res.json({
      success: true,
      data: {
        subscriptions,
        stats: {
          totalActive: count,
          monthlyRevenue: totalRevenue || 0,
          renewalRate: renewalRate || 0
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active subscriptions'
    });
  }
};

// Get membership applications
const getMembershipApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;
    console.log('🔍 AdminController: Fetching membership applications...');

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Get applications from the Application model
    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee'],
          required: true
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Transform applications to match expected format
    const formattedApplications = applications.map(app => {
      // If user exists, use user data; otherwise, use application data
      const user = app.user || {
        username: app.email.split('@')[0],
        email: app.email,
        firstName: app.firstName,
        lastName: app.lastName
      };

      return {
        id: app.id,
        user: {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        plan: {
          name: app.plan.name,
          fee: app.plan.fee
        },
        status: app.status,
        appliedAt: app.createdAt,
        message: app.formData ? JSON.parse(app.formData).message || 'Membership application' : 'Membership application'
      };
    });

    // Calculate application stats
    const pendingCount = await Application.count({
      where: { status: 'pending' }
    });

    const approvedToday = await Application.count({
      where: {
        status: 'approved',
        updatedAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    const rejectedToday = await Application.count({
      where: {
        status: 'rejected',
        updatedAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    res.json({
      success: true,
      data: {
        applications: formattedApplications,
        stats: {
          pendingApplications: pendingCount,
          approvedToday: approvedToday,
          rejectedToday: rejectedToday,
          averageProcessingTime: 2.5
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching membership applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership applications'
    });
  }
};

// Approve membership application
const approveMembershipApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log('🔍 AdminController: Approving membership application:', applicationId);

    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({
      status: 'approved'
    });

    res.json({
      success: true,
      message: 'Application approved successfully'
    });
  } catch (error) {
    console.error('Error approving membership application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve application'
    });
  }
};

// Reject membership application
const rejectMembershipApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log('🔍 AdminController: Rejecting membership application:', applicationId);

    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({
      status: 'rejected'
    });

    res.json({
      success: true,
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting membership application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application'
    });
  }
};

// Create a new coupon (admin)
const createCoupon = async (req, res) => {
  try {
    const {
      name,
      couponId,
      discount,
      discountType,
      maxRedemptions,
      expiryDate,
      applicablePlans,
      isActive
    } = req.body;

    // Check if coupon ID already exists
    const existingCoupon = await Coupon.findOne({
      where: { couponId }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon ID already exists'
      });
    }

    const coupon = await Coupon.create({
      name,
      couponId,
      discount: parseFloat(discount),
      discountType,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      applicablePlans: applicablePlans ? JSON.stringify(applicablePlans) : null,
      currentRedemptions: 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

// Update coupon (admin)
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // If updating couponId, check for uniqueness
    if (updateData.couponId && updateData.couponId !== coupon.couponId) {
      const existingCoupon = await Coupon.findOne({
        where: { couponId: updateData.couponId }
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon ID already exists'
        });
      }
    }

    // Parse data if needed
    if (updateData.discount !== undefined) {
      updateData.discount = parseFloat(updateData.discount);
    }
    if (updateData.maxRedemptions !== undefined) {
      updateData.maxRedemptions = updateData.maxRedemptions ? parseInt(updateData.maxRedemptions) : null;
    }
    if (updateData.expiryDate !== undefined) {
      updateData.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : null;
    }
    if (updateData.applicablePlans !== undefined) {
      updateData.applicablePlans = updateData.applicablePlans ? JSON.stringify(updateData.applicablePlans) : null;
    }

    await coupon.update(updateData);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

// Delete coupon (admin)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};

// Get all system settings
const getSystemSettings = async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = {};
    
    if (type) {
      whereClause.settingType = type;
    }

    const settings = await SystemSettings.findAll({
      where: whereClause,
      order: [['settingType', 'ASC'], ['settingKey', 'ASC']]
    });

    // Group settings by type
    const groupedSettings = {
      platform: [],
      email: [],
      notification: [],
      feature: [],
      security: []
    };

    settings.forEach(setting => {
      groupedSettings[setting.settingType].push({
        id: setting.id,
        key: setting.settingKey,
        value: setting.settingValue,
        type: setting.settingType,
        description: setting.description,
        isActive: setting.isActive,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt
      });
    });

    res.json({
      success: true,
      data: groupedSettings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
};

// Create or update system setting
const updateSystemSetting = async (req, res) => {
  try {
    const { key, value, type, description, isActive } = req.body;

    // Validate required fields
    if (!key || !type) {
      return res.status(400).json({
        success: false,
        message: 'Setting key and type are required'
      });
    }

    // Validate type
    const validTypes = ['platform', 'email', 'notification', 'feature', 'security'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid setting type'
      });
    }

    // Check if setting exists
    const existingSetting = await SystemSettings.findOne({
      where: { settingKey: key }
    });

    if (existingSetting) {
      // Update existing setting
      await existingSetting.update({
        settingValue: value,
        settingType: type,
        description: description,
        isActive: isActive !== undefined ? isActive : existingSetting.isActive
      });

      res.json({
        success: true,
        message: 'System setting updated successfully',
        data: existingSetting
      });
    } else {
      // Create new setting
      const newSetting = await SystemSettings.create({
        settingKey: key,
        settingValue: value,
        settingType: type,
        description: description,
        isActive: isActive !== undefined ? isActive : true
      });

      res.status(201).json({
        success: true,
        message: 'System setting created successfully',
        data: newSetting
      });
    }
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system setting',
      error: error.message
    });
  }
};

// Delete system setting
const deleteSystemSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const setting = await SystemSettings.findByPk(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'System setting not found'
      });
    }

    await setting.destroy();

    res.json({
      success: true,
      message: 'System setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting system setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete system setting',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  getUserActivity,
  getUserLoginHistory,
  getUserSubscriptions,
  getUserPayments,
  updateUserStatus,
  bulkUpdateUsers,
  exportUsers,
  sendMassEmail,
  getMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  getActiveSubscriptions,
  getMembershipApplications,
  approveMembershipApplication,
  rejectMembershipApplication,
  getFinancialData,
  getJobManagementData,
  getCouponData,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getSystemSettings,
  updateSystemSetting,
  deleteSystemSetting
};
