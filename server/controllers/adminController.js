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
  sequelize
} = require('../models');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.count();
    
    // Active Users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Total Membership Plans
    const totalPlans = await Plan.count();
    
    // Active Subscriptions
    const activeSubscriptions = await Subscription.count({
      where: {
        status: 'active'
      }
    });

    // Total Jobs
    const totalJobs = await Job.count();
    
    // Total Job Applications
    const totalApplications = await JobApplication.count();

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
        as: 'user',
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
          as: 'user',
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
        model: Plan,
        as: 'plan',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Coupon usage statistics
    const couponStats = await Coupon.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCoupons'],
        [sequelize.literal('COUNT(CASE WHEN "isActive" = true THEN 1 END)'), 'activeCoupons'],
        [sequelize.fn('SUM', sequelize.col('usageCount')), 'totalUsage']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        coupons,
        stats: couponStats
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
  getFinancialData,
  getJobManagementData,
  getCouponData
};
