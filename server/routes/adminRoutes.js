const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const {
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
} = require('../controllers/adminController');

// All admin routes require authentication
router.use(authenticateAdmin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getUsers);
router.get('/users/:userId', getUserDetails);
router.get('/users/:userId/activity', getUserActivity);
router.get('/users/:userId/login-history', getUserLoginHistory);
router.get('/users/:userId/subscriptions', getUserSubscriptions);
router.get('/users/:userId/payments', getUserPayments);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/bulk-update', bulkUpdateUsers);
router.get('/users/export', exportUsers);
router.post('/users/mass-email', sendMassEmail);

// Financial management routes
router.get('/financial', getFinancialData);

// Job management routes
router.get('/jobs', getJobManagementData);

// Coupon management routes
router.get('/coupons', getCouponData);

module.exports = router;
