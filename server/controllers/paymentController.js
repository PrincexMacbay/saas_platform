const { Op } = require('sequelize');
const { Payment, User, Plan, Subscription, Invoice, DigitalCard } = require('../models');
const cryptoPaymentService = require('../services/cryptoPaymentService');
const { generateMemberNumber } = require('../utils/memberUtils');

// Helper function to check if user has access to a payment
const checkPaymentAccess = async (paymentId, userId) => {
  // SECURITY FIX: Only allow access to payments for plans created by the current user
  // Organization members should NOT see payment data - only plan creators/admins should
  const planFilter = {
    createdBy: userId // Only plans created by current user
  };

  const payment = await Payment.findOne({
    where: { id: paymentId },
    include: [
      {
        model: Plan,
        as: 'plan',
        where: planFilter,
        required: true
      }
    ]
  });

  return payment;
};

// Get all payments - SECURITY FIXED: Only show payments for plans user created
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, planId, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { identifier: { [Op.iLike]: `%${search}%` } },
        { referenceNumber: { [Op.iLike]: `%${search}%` } },
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (planId) {
      whereClause.planId = planId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // SECURITY FIX: Only show payments for plans created by the current user
    // Organization members should NOT see payment data - only plan creators/admins should
    const planFilter = {
      createdBy: req.user.id // Only plans created by current user
    };

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['paymentDate', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'email']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'createdBy'],
          where: planFilter,
          required: true
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'memberNumber', 'status']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        payments: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get single payment - SECURITY FIXED: Only allow access to payments for plans user created
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // SECURITY FIX: Only allow access to payments for plans created by the current user
    // Organization members should NOT see payment data - only plan creators/admins should
    const planFilter = {
      createdBy: req.user.id // Only plans created by current user
    };

    const payment = await Payment.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Plan,
          as: 'plan',
          where: planFilter,
          required: true
        },
        {
          model: Subscription,
          as: 'subscription'
        },
        {
          model: Invoice,
          as: 'invoice'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const { 
      userId, 
      planId, 
      subscriptionId, 
      amount, 
      paymentMethod, 
      paymentDate, 
      identifier, 
      referenceNumber, 
      notes 
    } = req.body;

    const payment = await Payment.create({
      userId,
      planId,
      subscriptionId,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      identifier,
      referenceNumber,
      notes,
      status: 'pending'
    });

    // Fetch with relations
    const fullPayment = await Payment.findByPk(payment.id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan', attributes: ['name', 'fee'] },
        { model: Subscription, as: 'subscription', attributes: ['memberNumber'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: fullPayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount, 
      paymentMethod, 
      paymentDate, 
      identifier, 
      referenceNumber, 
      status, 
      notes 
    } = req.body;

    // SECURITY FIX: Check if user has access to this payment
    const payment = await checkPaymentAccess(id, req.user.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied'
      });
    }

    await payment.update({
      amount,
      paymentMethod,
      paymentDate,
      identifier,
      referenceNumber,
      status,
      notes
    });

    // If payment is completed, update subscription status
    if (status === 'completed' && payment.status !== 'completed' && payment.subscriptionId) {
      await updateSubscriptionOnPayment(payment.subscriptionId);
    }

    const updatedPayment = await Payment.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan', attributes: ['name', 'fee'] },
        { model: Subscription, as: 'subscription', attributes: ['memberNumber'] }
      ]
    });

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // SECURITY FIX: Check if user has access to this payment
    const payment = await checkPaymentAccess(id, req.user.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied'
      });
    }

    await payment.update({ status });

    // If payment is completed, update subscription
    if (status === 'completed' && payment.subscriptionId) {
      await updateSubscriptionOnPayment(payment.subscriptionId);
    }

    const updatedPayment = await Payment.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { model: Plan, as: 'plan' },
        { model: Subscription, as: 'subscription', attributes: ['memberNumber'] }
      ]
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Check if user has access to this payment
    const payment = await checkPaymentAccess(id, req.user.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied'
      });
    }

    await payment.destroy();

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
};

// Helper function to update subscription when payment is completed
const updateSubscriptionOnPayment = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: Plan, as: 'plan' }]
    });

    if (!subscription) return;

    // Update subscription status to active
    if (subscription.status === 'pending' || subscription.status === 'past_due') {
      const startDate = subscription.startDate || new Date();
      let endDate;

      // Calculate end date based on plan renewal interval
      switch (subscription.plan.renewalInterval) {
        case 'monthly':
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate = null; // One-time payment
      }

      await subscription.update({
        status: 'active',
        startDate,
        endDate,
        renewalDate: endDate
      });

      // Create digital card for the member when subscription becomes active
      try {
        // Check if card already exists
        const existingCard = await DigitalCard.findOne({
          where: {
            userId: subscription.userId,
            subscriptionId: subscription.id
          }
        });

        if (!existingCard) {
          // Get the plan creator's template
          const plan = await Plan.findByPk(subscription.planId);
          if (plan) {
            const template = await DigitalCard.findOne({
              where: {
                userId: plan.createdBy,
                isTemplate: true
              }
            });

            if (template) {
              // Create user-specific card based on template
              await DigitalCard.create({
                userId: subscription.userId,
                subscriptionId: subscription.id,
                logo: template.logo,
                organizationName: template.organizationName,
                cardTitle: template.cardTitle || 'Membership Card',
                headerText: template.headerText,
                footerText: template.footerText,
                enableBarcode: template.enableBarcode !== false,
                barcodeType: template.barcodeType || 'qr',
                barcodeData: 'member_number',
                primaryColor: template.primaryColor || '#3498db',
                secondaryColor: template.secondaryColor || '#2c3e50',
                textColor: template.textColor || '#ffffff',
                isTemplate: false,
                isGenerated: false
              });
              console.log('✅ Digital card created when subscription activated:', {
                subscriptionId: subscription.id,
                userId: subscription.userId
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error creating digital card on payment:', error);
        // Don't fail payment processing if card creation fails
      }
    }
  } catch (error) {
    console.error('Error updating subscription on payment:', error);
  }
};

// Create crypto payment invoice
const createCryptoPayment = async (req, res) => {
  try {
    const { amount, currency, planId, subscriptionId, description } = req.body;
    const userId = req.user.id;

    // Create payment record
    const payment = await Payment.create({
      amount: parseFloat(amount),
      paymentMethod: 'crypto',
      paymentDate: new Date(),
      status: 'pending',
      userId: userId,
      planId: planId,
      subscriptionId: subscriptionId,
      notes: `Crypto payment for ${description}`
    });

    // Create crypto invoice
    const invoiceResult = await cryptoPaymentService.createInvoice(
      parseFloat(amount),
      currency || 'USD',
      payment.id.toString(),
      description || 'Membership Payment'
    );

    if (!invoiceResult.success) {
      await payment.update({ status: 'failed', notes: invoiceResult.error });
      return res.status(400).json({
        success: false,
        message: 'Failed to create crypto payment',
        error: invoiceResult.error
      });
    }

    // Update payment with crypto details
    await payment.update({
      identifier: invoiceResult.invoiceId,
      referenceNumber: `CRYPTO-${payment.id}`
    });

    res.json({
      success: true,
      message: 'Crypto payment invoice created',
      data: {
        payment: payment,
        cryptoInvoice: {
          invoiceId: invoiceResult.invoiceId,
          paymentUrl: invoiceResult.paymentUrl,
          paymentAddress: invoiceResult.paymentAddress,
          amount: invoiceResult.amount,
          currency: invoiceResult.currency,
          status: invoiceResult.status
        }
      }
    });
  } catch (error) {
    console.error('Create crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create crypto payment',
      error: error.message
    });
  }
};

// Get crypto payment status
const getCryptoPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // SECURITY FIX: Check if user has access to this payment
    const payment = await checkPaymentAccess(paymentId, req.user.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied'
      });
    }

    if (!payment.identifier) {
      return res.status(400).json({
        success: false,
        message: 'No crypto invoice found for this payment'
      });
    }

    const statusResult = await cryptoPaymentService.getInvoiceStatus(payment.identifier);

    if (!statusResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get crypto payment status',
        error: statusResult.error
      });
    }

    // Update payment status if it has changed
    if (statusResult.paid && payment.status !== 'completed') {
      await payment.update({ status: 'completed' });
      await updateSubscriptionOnPayment(payment.subscriptionId);
    } else if (statusResult.status === 'Expired' && payment.status !== 'failed') {
      await payment.update({ status: 'failed' });
    }

    res.json({
      success: true,
      data: {
        payment: payment,
        cryptoStatus: statusResult
      }
    });
  } catch (error) {
    console.error('Get crypto payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crypto payment status',
      error: error.message
    });
  }
};

// Crypto payment webhook
const cryptoPaymentWebhook = async (req, res) => {
  try {
    // Handle both BTCPay and NowPayments webhook signatures
    const btcpaySignature = req.headers['btcpay-sig'];
    const nowpaymentsSignature = req.headers['x-nowpayments-sig'];
    
    const signature = btcpaySignature || nowpaymentsSignature;
    const payload = JSON.stringify(req.body);
    
    // Determine gateway from signature header
    const gateway = btcpaySignature ? 'btcpay' : 'nowpayments';

    const webhookResult = await cryptoPaymentService.processWebhook(payload, signature, gateway);

    if (!webhookResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Handle payment completion
    if (webhookResult.event === 'payment_completed') {
      const payment = await Payment.findOne({
        where: { identifier: webhookResult.invoiceId }
      });

      if (payment) {
        await payment.update({
          status: 'completed',
          notes: `Crypto payment completed via webhook`
        });

        // Create subscription if this is a membership payment
        if (payment.planId && !payment.subscriptionId) {
          const plan = await Plan.findByPk(payment.planId);
          if (plan) {
            const memberNumber = await generateMemberNumber();
            const subscription = await Subscription.create({
              memberNumber: memberNumber,
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              autoRenew: true,
              userId: payment.userId,
              planId: payment.planId
            });

            await payment.update({ subscriptionId: subscription.id });

            // Create digital card for the new subscription
            try {
              const plan = await Plan.findByPk(payment.planId);
              if (plan) {
                const template = await DigitalCard.findOne({
                  where: {
                    userId: plan.createdBy,
                    isTemplate: true
                  }
                });

                if (template) {
                  await DigitalCard.create({
                    userId: payment.userId,
                    subscriptionId: subscription.id,
                    logo: template.logo,
                    organizationName: template.organizationName,
                    cardTitle: template.cardTitle || 'Membership Card',
                    headerText: template.headerText,
                    footerText: template.footerText,
                    enableBarcode: template.enableBarcode !== false,
                    barcodeType: template.barcodeType || 'qr',
                    barcodeData: 'member_number',
                    primaryColor: template.primaryColor || '#3498db',
                    secondaryColor: template.secondaryColor || '#2c3e50',
                    textColor: template.textColor || '#ffffff',
                    isTemplate: false,
                    isGenerated: false
                  });
                  console.log('✅ Digital card created from webhook payment:', {
                    subscriptionId: subscription.id,
                    userId: payment.userId
                  });
                }
              }
            } catch (error) {
              console.error('❌ Error creating digital card from webhook:', error);
            }
          }
        } else if (payment.subscriptionId) {
          await updateSubscriptionOnPayment(payment.subscriptionId);
        }
      }
    }

    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Crypto payment webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
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
    console.error('Get cryptocurrencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported cryptocurrencies',
      error: error.message
    });
  }
};

module.exports = {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  createCryptoPayment,
  getCryptoPaymentStatus,
  cryptoPaymentWebhook,
  getSupportedCryptocurrencies
};
