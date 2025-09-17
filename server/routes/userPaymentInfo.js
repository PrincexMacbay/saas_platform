const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userPaymentInfoController = require('../controllers/userPaymentInfoController');

// COMMENTED OUT - CAUSING SERVER CRASH ISSUES
// Get user's own payment info
// router.get('/my-payment-info', auth, async (req, res) => {
//   try {
//     req.params.userId = req.user.id;
//     await userPaymentInfoController.getUserPaymentInfo(req, res);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get payment information',
//       error: error.message
//     });
//   }
// });

// Create or update user's own payment info
// router.post('/my-payment-info', auth, async (req, res) => {
//   try {
//     req.params.userId = req.user.id;
//     await userPaymentInfoController.upsertUserPaymentInfo(req, res);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to save payment information',
//       error: error.message
//     });
//   }
// });

// Delete user's own payment info
// router.delete('/my-payment-info', auth, async (req, res) => {
//   try {
//     req.params.userId = req.user.id;
//     await userPaymentInfoController.deleteUserPaymentInfo(req, res);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete payment information',
//       error: error.message
//     });
//   }
// });

// Test payment gateway connection
// router.post('/test-gateway', auth, async (req, res) => {
//   try {
//     req.params.userId = req.user.id;
//     await userPaymentInfoController.testPaymentGateway(req, res);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to test payment gateway',
//       error: error.message
//     });
//   }
// });

// Get supported cryptocurrencies (public)
// router.get('/cryptocurrencies', userPaymentInfoController.getSupportedCryptocurrencies);

// Admin routes
// router.get('/admin/all', auth, userPaymentInfoController.getAllPaymentInfo);

// Get specific user's payment info (admin only)
// router.get('/admin/:userId', auth, userPaymentInfoController.getUserPaymentInfo);

// Update specific user's payment info (admin only)
// router.put('/admin/:userId', auth, userPaymentInfoController.upsertUserPaymentInfo);

// Delete specific user's payment info (admin only)
// router.delete('/admin/:userId', auth, userPaymentInfoController.deleteUserPaymentInfo);

// TEMPORARY PLACEHOLDER ROUTE - Remove this when fixing the payment info routes
router.get('/status', (req, res) => {
  res.json({ message: 'Payment info routes temporarily disabled for debugging' });
});

module.exports = router;
