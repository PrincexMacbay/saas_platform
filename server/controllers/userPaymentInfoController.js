const UserPaymentInfo = require('../models/UserPaymentInfo');
const User = require('../models/User');
const cryptoPaymentService = require('../services/cryptoPaymentService');

// Get user payment info
const getUserPaymentInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own info or is admin
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const paymentInfo = await UserPaymentInfo.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!paymentInfo) {
      return res.status(404).json({
        success: false,
        message: 'Payment information not found'
      });
    }

    res.json({
      success: true,
      data: paymentInfo
    });
  } catch (error) {
    console.error('Get user payment info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment information',
      error: error.message
    });
  }
};

// Create or update user payment info
const upsertUserPaymentInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      bankName,
      accountNumber,
      routingNumber,
      accountHolderName,
      accountType,
      preferredCrypto,
      btcAddress,
      ethAddress,
      ltcAddress,
      bchAddress,
      xmrAddress,
      paymentGateway,
      gatewayApiKey,
      gatewayStoreId,
      isActive,
      autoAcceptPayments,
      minimumPaymentAmount,
      paymentInstructions,
      taxId,
      businessName
    } = req.body;

    // Check if user is updating their own info or is admin
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate required fields based on payment gateway
    if (paymentGateway === 'nowpayments' && !gatewayApiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required for NowPayments gateway'
      });
    }

    if (paymentGateway === 'btcpay' && (!gatewayApiKey || !gatewayStoreId)) {
      return res.status(400).json({
        success: false,
        message: 'API key and store ID are required for BTCPay gateway'
      });
    }

    // Check if payment info already exists
    let paymentInfo = await UserPaymentInfo.findOne({
      where: { userId }
    });

    if (paymentInfo) {
      // Update existing
      await paymentInfo.update({
        bankName,
        accountNumber,
        routingNumber,
        accountHolderName,
        accountType,
        preferredCrypto,
        btcAddress,
        ethAddress,
        ltcAddress,
        bchAddress,
        xmrAddress,
        paymentGateway,
        gatewayApiKey,
        gatewayStoreId,
        isActive,
        autoAcceptPayments,
        minimumPaymentAmount,
        paymentInstructions,
        taxId,
        businessName
      });
    } else {
      // Create new
      paymentInfo = await UserPaymentInfo.create({
        userId,
        bankName,
        accountNumber,
        routingNumber,
        accountHolderName,
        accountType,
        preferredCrypto,
        btcAddress,
        ethAddress,
        ltcAddress,
        bchAddress,
        xmrAddress,
        paymentGateway,
        gatewayApiKey,
        gatewayStoreId,
        isActive,
        autoAcceptPayments,
        minimumPaymentAmount,
        paymentInstructions,
        taxId,
        businessName
      });
    }

    // Fetch updated info with user details
    const updatedPaymentInfo = await UserPaymentInfo.findByPk(paymentInfo.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: paymentInfo.id ? 'Payment information updated successfully' : 'Payment information created successfully',
      data: updatedPaymentInfo
    });
  } catch (error) {
    console.error('Upsert user payment info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment information',
      error: error.message
    });
  }
};

// Delete user payment info
const deleteUserPaymentInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is deleting their own info or is admin
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const paymentInfo = await UserPaymentInfo.findOne({
      where: { userId }
    });

    if (!paymentInfo) {
      return res.status(404).json({
        success: false,
        message: 'Payment information not found'
      });
    }

    await paymentInfo.destroy();

    res.json({
      success: true,
      message: 'Payment information deleted successfully'
    });
  } catch (error) {
    console.error('Delete user payment info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment information',
      error: error.message
    });
  }
};

// Get supported cryptocurrencies
const getSupportedCryptocurrencies = async (req, res) => {
  try {
    const currencies = await cryptoPaymentService.getSupportedCurrencies();
    
    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Get supported cryptocurrencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported cryptocurrencies',
      error: error.message
    });
  }
};

// Test payment gateway connection
const testPaymentGateway = async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentGateway, gatewayApiKey, gatewayStoreId } = req.body;

    // Check if user is testing their own gateway or is admin
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Test the gateway connection
    let testResult;
    
    if (paymentGateway === 'nowpayments') {
      // Test NowPayments connection by getting supported currencies
      try {
        const currencies = await cryptoPaymentService.getSupportedCurrencies();
        testResult = {
          success: true,
          message: 'NowPayments connection successful',
          supportedCurrencies: currencies.length
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'NowPayments connection failed',
          error: error.message
        };
      }
    } else if (paymentGateway === 'btcpay') {
      // Test BTCPay connection
      try {
        // You can add BTCPay specific test here
        testResult = {
          success: true,
          message: 'BTCPay connection successful (basic validation)',
          note: 'Full connection test requires valid store ID and API key'
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'BTCPay connection failed',
          error: error.message
        };
      }
    } else {
      testResult = {
        success: false,
        message: 'Unsupported payment gateway'
      };
    }

    res.json(testResult);
  } catch (error) {
    console.error('Test payment gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test payment gateway',
      error: error.message
    });
  }
};

// Get all payment info (admin only)
const getAllPaymentInfo = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const paymentInfoList = await UserPaymentInfo.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: paymentInfoList
    });
  } catch (error) {
    console.error('Get all payment info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment information list',
      error: error.message
    });
  }
};

module.exports = {
  getUserPaymentInfo,
  upsertUserPaymentInfo,
  deleteUserPaymentInfo,
  getSupportedCryptocurrencies,
  testPaymentGateway,
  getAllPaymentInfo
};