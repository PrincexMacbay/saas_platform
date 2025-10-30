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
  deleteCoupon
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

// Membership management routes
router.get('/membership/plans', getMembershipPlans);
router.post('/membership/plans', createMembershipPlan);
router.put('/membership/plans/:planId', updateMembershipPlan);
router.delete('/membership/plans/:planId', deleteMembershipPlan);
router.get('/membership/subscriptions', getActiveSubscriptions);
router.get('/membership/applications', getMembershipApplications);
router.post('/membership/applications/:applicationId/approve', approveMembershipApplication);
router.post('/membership/applications/:applicationId/reject', rejectMembershipApplication);

// Financial management routes
router.get('/financial', getFinancialData);

// Job management routes
router.get('/jobs', getJobManagementData);

// Coupon management routes
router.get('/coupons', getCouponData);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
