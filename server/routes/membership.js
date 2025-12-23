const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Import controllers
const membershipController = require('../controllers/membershipController');
const planController = require('../controllers/planController');
const subscriptionController = require('../controllers/subscriptionController');
const paymentController = require('../controllers/paymentController');
const applicationController = require('../controllers/applicationController');
const applicationFormController = require('../controllers/applicationFormController');
const scheduledPaymentController = require('../controllers/scheduledPaymentController');
const debtController = require('../controllers/debtController');
const reminderController = require('../controllers/reminderController');
const couponController = require('../controllers/couponController');
const digitalCardController = require('../controllers/digitalCardController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// =====================================================
// PLANS
// =====================================================
router.get('/plans', planController.getPlans);
router.post('/plans', planController.createPlan);
router.get('/plans/:id', planController.getPlan);
router.put('/plans/:id', planController.updatePlan);
router.delete('/plans/:id', planController.deletePlan);

// =====================================================
// SUBSCRIPTIONS
// =====================================================
router.get('/subscriptions', subscriptionController.getSubscriptions);
router.get('/subscriptions/user', subscriptionController.getUserSubscriptions);
router.post('/subscriptions', subscriptionController.createSubscription);
router.get('/subscriptions/:id', subscriptionController.getSubscription);
router.put('/subscriptions/:id', subscriptionController.updateSubscription);
router.delete('/subscriptions/:id', subscriptionController.deleteSubscription);
router.patch('/subscriptions/:id/status', subscriptionController.updateSubscriptionStatus);

// =====================================================
// PAYMENTS
// =====================================================
router.get('/payments', paymentController.getPayments);
router.post('/payments', paymentController.createPayment);
router.get('/payments/:id', paymentController.getPayment);
router.put('/payments/:id', paymentController.updatePayment);
router.delete('/payments/:id', paymentController.deletePayment);
router.patch('/payments/:id/status', paymentController.updatePaymentStatus);

// Crypto Payments
router.post('/payments/crypto', paymentController.createCryptoPayment);
router.get('/payments/crypto/:paymentId/status', paymentController.getCryptoPaymentStatus);
router.get('/payments/crypto/currencies', paymentController.getSupportedCryptocurrencies);
router.post('/payments/crypto/webhook', paymentController.cryptoPaymentWebhook);

// =====================================================
// APPLICATIONS
// =====================================================
router.get('/applications', applicationController.getApplications);
router.post('/applications', applicationController.createApplication);
router.get('/applications/:id', applicationController.getApplication);
router.put('/applications/:id', applicationController.updateApplication);
router.delete('/applications/:id', applicationController.deleteApplication);
router.patch('/applications/:id/status', applicationController.updateApplicationStatus);
router.post('/applications/:id/approve', applicationController.approveApplication);
router.post('/applications/:id/reject', applicationController.rejectApplication);

// =====================================================
// APPLICATION FORMS
// =====================================================
router.get('/application-forms', applicationFormController.getApplicationForms);
router.post('/application-forms', applicationFormController.createApplicationForm);
router.get('/application-forms/:id', applicationFormController.getApplicationFormById);
router.put('/application-forms/:id', applicationFormController.updateApplicationForm);
router.delete('/application-forms/:id', applicationFormController.deleteApplicationForm);
router.patch('/application-forms/:id/publish', applicationFormController.publishApplicationForm);
router.patch('/application-forms/:id/unpublish', applicationFormController.unpublishApplicationForm);



// =====================================================
// SCHEDULED PAYMENTS
// =====================================================
router.get('/scheduled-payments', scheduledPaymentController.getScheduledPayments);
router.post('/scheduled-payments', scheduledPaymentController.createScheduledPayment);
router.delete('/scheduled-payments/:id', scheduledPaymentController.deleteScheduledPayment);
router.patch('/scheduled-payments/:id/status', scheduledPaymentController.updateScheduledPaymentStatus);
router.post('/scheduled-payments/process', scheduledPaymentController.processScheduledPayments);

// =====================================================
// DEBTS
// =====================================================
router.get('/debts', debtController.getDebts);
router.post('/debts', debtController.createDebt);
router.delete('/debts/:id', debtController.deleteDebt);
router.patch('/debts/:id/status', debtController.updateDebtStatus);
router.get('/debts/user/:userId', debtController.getUserDebts);
router.get('/debts/outstanding-summary', debtController.getOutstandingDebtsSummary);

// =====================================================
// REMINDERS
// =====================================================
router.get('/reminders', reminderController.getReminders);
router.post('/reminders', reminderController.createReminder);
router.delete('/reminders/:id', reminderController.deleteReminder);
router.post('/reminders/:id/send', reminderController.sendReminder);
router.post('/reminders/process', reminderController.processReminders);
router.get('/reminders/user/:userId', reminderController.getUserReminders);
router.put('/reminders/:id', reminderController.updateReminder);

// =====================================================
// COUPONS
// =====================================================
router.get('/coupons', couponController.getCoupons);
router.post('/coupons', couponController.createCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);
router.patch('/coupons/:id', couponController.updateCoupon);
router.post('/coupons/validate', couponController.validateCoupon);
router.post('/coupons/redeem', couponController.redeemCoupon);
router.get('/coupons/stats', couponController.getCouponStats);

// =====================================================
// DIGITAL CARDS
// =====================================================
router.get('/digital-cards', digitalCardController.getDigitalCards);
router.get('/digital-cards/:subscriptionId', digitalCardController.getDigitalCard);
router.get('/digital-cards/plan/:planId/template', digitalCardController.getDigitalCardTemplateByPlan);
router.get('/digital-card/template', digitalCardController.getDigitalCardTemplate);
router.post('/digital-cards', digitalCardController.createDigitalCard);
router.post('/digital-card/template', digitalCardController.saveDigitalCardTemplate);
router.put('/digital-cards/:id', digitalCardController.updateDigitalCard);
router.delete('/digital-cards/:id', digitalCardController.deleteDigitalCard);

// =====================================================
// GENERAL MEMBERSHIP
// =====================================================
router.get('/dashboard', membershipController.getDashboard);
router.get('/settings', membershipController.getSettings);
router.put('/settings', membershipController.updateSettings);

module.exports = router;
