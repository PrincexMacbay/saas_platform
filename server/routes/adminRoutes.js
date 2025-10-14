const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
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
router.put('/users/:userId/status', updateUserStatus);

// Financial management routes
router.get('/financial', getFinancialData);

// Job management routes
router.get('/jobs', getJobManagementData);

// Coupon management routes
router.get('/coupons', getCouponData);

module.exports = router;
