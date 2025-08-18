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

// Dashboard route
router.get('/dashboard', authenticateToken, membershipController.getDashboard);

// Plan routes
router.get('/plans', authenticateToken, planController.getPlans);
router.get('/plans/:id', authenticateToken, planController.getPlan);
router.post('/plans', authenticateToken, planController.createPlan);
router.put('/plans/:id', authenticateToken, planController.updatePlan);
router.delete('/plans/:id', authenticateToken, planController.deletePlan);

// Subscription routes
router.get('/subscriptions/my', authenticateToken, subscriptionController.getUserSubscriptions); // User's own subscriptions
router.get('/subscriptions', authenticateToken, subscriptionController.getSubscriptions);
router.get('/subscriptions/:id', authenticateToken, subscriptionController.getSubscription);
router.post('/subscriptions', authenticateToken, subscriptionController.createSubscription);
router.put('/subscriptions/:id', authenticateToken, subscriptionController.updateSubscription);
router.delete('/subscriptions/:id', authenticateToken, subscriptionController.deleteSubscription);

// Payment routes
router.get('/payments', authenticateToken, paymentController.getPayments);
router.get('/payments/:id', authenticateToken, paymentController.getPayment);
router.post('/payments', authenticateToken, paymentController.createPayment);
router.put('/payments/:id', authenticateToken, paymentController.updatePayment);
router.delete('/payments/:id', authenticateToken, paymentController.deletePayment);

// Application routes
router.get('/applications', authenticateToken, applicationController.getApplications);
router.get('/applications/:id', authenticateToken, applicationController.getApplication);
router.post('/applications', applicationController.createApplication); // Allow public access for form submission
router.post('/applications/:id/approve', authenticateToken, applicationController.approveApplication);
router.post('/applications/:id/reject', authenticateToken, applicationController.rejectApplication);
router.delete('/applications/:id', authenticateToken, applicationController.deleteApplication);

// Application Form routes
router.get('/application-form', authenticateToken, applicationFormController.getOrganizationForm);
router.post('/application-form', authenticateToken, applicationFormController.saveApplicationForm);
router.post('/application-form/publish', authenticateToken, applicationFormController.publishApplicationForm);
router.post('/application-form/unpublish', authenticateToken, applicationFormController.unpublishApplicationForm);

module.exports = router;
