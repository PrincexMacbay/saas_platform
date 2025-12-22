const express = require('express');
const router = express.Router();
const { Plan, User, Application, Coupon } = require('../models');
const applicationFormController = require('../controllers/applicationFormController');
const { Op } = require('sequelize');

// Get public membership plans
router.get('/plans', async (req, res) => {
  try {
    const { createdBy, search } = req.query;
    
    const whereClause = {
      isActive: true
    };
    
    if (createdBy) {
      whereClause.createdBy = createdBy;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const plans = await Plan.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'organizationName', 'organizationDescription', 'organizationLogo', 'organizationWebsite'],
          where: {
            isOrganization: true
          },
          required: false
        },
        {
          model: Coupon,
          as: 'coupon',
          attributes: ['id', 'name', 'couponId', 'discount', 'discountType', 'expiryDate', 'isActive'],
          required: false
        }
      ],
      order: [['fee', 'ASC']]
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get public plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

// Get single public plan
router.get('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await Plan.findOne({
      where: {
        id,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'organizationName', 'organizationDescription', 'organizationLogo', 'organizationWebsite'],
          required: false
        },
        {
          model: Coupon,
          as: 'coupon',
          attributes: ['id', 'name', 'couponId', 'discount', 'discountType', 'expiryDate', 'isActive'],
          required: false
        }
      ]
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or not available'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get public plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan',
      error: error.message
    });
  }
});

// Validate coupon code (public endpoint)
router.post('/validate-coupon', async (req, res) => {
  try {
    const { couponCode, planId } = req.body;

    if (!couponCode || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and plan ID are required'
      });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({
      where: {
        couponId: couponCode.trim(),
        isActive: true
      }
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon has expired
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check if coupon has reached max redemptions
    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    // Get plan details for validation (with coupon association)
    const plan = await Plan.findByPk(planId, {
      include: [{
        model: Coupon,
        as: 'coupon',
        required: false
      }]
    });
    
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    // NEW: Check if plan has an associated coupon - if so, the code must match
    if (plan.couponId) {
      if (plan.couponId !== coupon.id) {
        return res.status(400).json({
          success: false,
          message: 'This coupon code is not valid for the selected plan. Please use the coupon code associated with this plan.'
        });
      }
      // Coupon matches plan's associated coupon - proceed
      console.log('✅ Coupon code matches plan\'s associated coupon');
    } else {
      // Plan doesn't have an associated coupon - check if coupon is applicable via applicablePlans (legacy support)
      let isApplicable = true;
      if (coupon.applicablePlans) {
        try {
          const applicablePlans = JSON.parse(coupon.applicablePlans);
          if (Array.isArray(applicablePlans) && applicablePlans.length > 0) {
            isApplicable = applicablePlans.includes(parseInt(planId));
          }
        } catch (parseError) {
          console.error('Error parsing applicablePlans:', parseError);
          // If parsing fails, assume coupon is applicable to all plans
        }
      }

      if (!isApplicable) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not valid for the selected plan'
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (parseFloat(plan.fee) * parseFloat(coupon.discount)) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = parseFloat(coupon.discount);
    }

    const finalAmount = Math.max(0, parseFloat(plan.fee) - discountAmount);

    res.json({
      success: true,
      message: 'Coupon is valid',
      coupon: {
        id: coupon.id,
        name: coupon.name,
        couponId: coupon.couponId,
        discount: coupon.discount,
        discountType: coupon.discountType,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        originalAmount: parseFloat(plan.fee)
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
});

// Submit membership application (public endpoint)
router.post('/apply', async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      referral, 
      studentId, 
      planId, 
      applicationFee, 
      paymentInfo, 
      formData,
      couponCode,
      couponId
    } = req.body;

    // Parse formData if it's a JSON string
    let parsedFormData = null;
    let extractedEmail = email;
    let extractedFirstName = firstName;
    let extractedLastName = lastName;
    let extractedPhone = phone;

    if (formData) {
      try {
        parsedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;
        
        // Extract common fields from formData if they're not provided at top level
        if (!extractedEmail && parsedFormData.email) {
          extractedEmail = parsedFormData.email;
        }
        if (!extractedFirstName && parsedFormData.firstName) {
          extractedFirstName = parsedFormData.firstName;
        }
        if (!extractedLastName && parsedFormData.lastName) {
          extractedLastName = parsedFormData.lastName;
        }
        if (!extractedPhone && parsedFormData.phone) {
          extractedPhone = parsedFormData.phone;
        }
      } catch (parseError) {
        console.error('Error parsing formData:', parseError);
        // Continue with original values if parsing fails
      }
    }

    // Validate required fields
    if (!extractedEmail || !extractedFirstName || !extractedLastName || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, last name, and plan ID are required'
      });
    }

    // Validate plan exists and is public
    const plan = await Plan.findOne({
      where: {
        id: planId,
        isActive: true
      },
      include: [{
        model: Coupon,
        as: 'coupon',
        required: false
      }]
    });

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unavailable plan'
      });
    }

    // Check if email already has a pending/approved application for this plan
    const existingApplication = await Application.findOne({
      where: { 
        email: extractedEmail, 
        planId, 
        status: ['pending', 'approved'] 
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'An application for this plan already exists with this email'
      });
    }

    // Check if there's an incomplete application for this email and plan
    const incompleteApplication = await Application.findOne({
      where: { 
        email: extractedEmail, 
        planId, 
        status: 'incomplete' 
      }
    });

    if (incompleteApplication) {
      // Return the incomplete application so user can continue
      return res.status(200).json({
        success: true,
        message: 'Found incomplete application. You can continue with your previous submission.',
        data: {
          applicationId: incompleteApplication.id,
          status: incompleteApplication.status,
          planName: plan.name,
          isIncomplete: true
        }
      });
    }

    // Calculate coupon discount if coupon is provided
    let originalAmount = parseFloat(plan.fee);
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let validatedCoupon = null;

    // Get plan with coupon association
    const planWithCoupon = await Plan.findByPk(planId, {
      include: [{
        model: Coupon,
        as: 'coupon',
        required: false
      }]
    });

    if (couponCode && couponId) {
      // Validate the coupon again to ensure it's still valid
      const coupon = await Coupon.findOne({
        where: {
          id: couponId,
          couponId: couponCode,
          isActive: true
        }
      });

      if (coupon) {
        // NEW: Check if plan has an associated coupon - if so, the code must match
        if (planWithCoupon.couponId) {
          if (planWithCoupon.couponId !== coupon.id) {
            return res.status(400).json({
              success: false,
              message: 'This coupon code is not valid for the selected plan. Please use the coupon code associated with this plan.'
            });
          }
          console.log('✅ Coupon code matches plan\'s associated coupon');
        } else {
          // Plan doesn't have an associated coupon - check if coupon is applicable via applicablePlans (legacy)
          let isApplicable = true;
          if (coupon.applicablePlans) {
            try {
              const applicablePlans = JSON.parse(coupon.applicablePlans);
              if (Array.isArray(applicablePlans) && applicablePlans.length > 0) {
                isApplicable = applicablePlans.includes(parseInt(planId));
              }
            } catch (parseError) {
              console.error('Error parsing applicablePlans:', parseError);
            }
          }

          if (!isApplicable) {
            return res.status(400).json({
              success: false,
              message: 'This coupon is not valid for the selected plan'
            });
          }
        }

        // Check if coupon has expired
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
        const isMaxRedemptionsReached = coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions;
        
        if (!isExpired && !isMaxRedemptionsReached) {
          validatedCoupon = coupon;
          if (coupon.discountType === 'percentage') {
            discountAmount = (originalAmount * parseFloat(coupon.discount)) / 100;
          } else if (coupon.discountType === 'fixed') {
            discountAmount = parseFloat(coupon.discount);
          }
          finalAmount = Math.max(0, originalAmount - discountAmount);
        } else {
          return res.status(400).json({
            success: false,
            message: isExpired ? 'This coupon has expired' : 'This coupon has reached its usage limit'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }
    }

    const application = await Application.create({
      email: extractedEmail,
      firstName: extractedFirstName,
      lastName: extractedLastName,
      phone: extractedPhone,
      referral,
      studentId,
      planId,
      applicationFee,
      paymentInfo: paymentInfo ? JSON.stringify(paymentInfo) : null,
      formData: parsedFormData ? JSON.stringify(parsedFormData) : null,
      status: 'incomplete',
      couponId: validatedCoupon ? validatedCoupon.id : null,
      couponCode: validatedCoupon ? validatedCoupon.couponId : null,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount
    });

    console.log('✅ Application created:', {
      applicationId: application.id,
      planId: planId,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      couponId: validatedCoupon ? validatedCoupon.id : null,
      couponCode: validatedCoupon ? validatedCoupon.couponId : null,
      hasCoupon: !!validatedCoupon
    });

    // TODO: Send notification email to organization admins

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. You will be notified once it is reviewed.',
      data: {
        applicationId: application.id,
        status: application.status,
        planName: plan.name
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// Process application payment (public endpoint)
router.post('/application-payment', async (req, res) => {
  try {
    const { 
      applicationId, 
      planId, 
      amount, 
      paymentMethod, 
      paymentDetails 
    } = req.body;

    console.log('🔍 Application Payment Request:', {
      applicationId,
      planId,
      amount,
      paymentMethod,
      hasPaymentDetails: !!paymentDetails
    });

    // Validate required fields
    // Allow amount to be 0 (free plans), but not undefined or null
    if (!applicationId || !planId || amount === undefined || amount === null || !paymentMethod) {
      console.log('❌ Missing required fields:', {
        hasApplicationId: !!applicationId,
        hasPlanId: !!planId,
        hasAmount: amount !== undefined && amount !== null,
        amountValue: amount,
        hasPaymentMethod: !!paymentMethod
      });
      return res.status(400).json({
        success: false,
        message: 'Application ID, plan ID, amount, and payment method are required'
      });
    }

    // Find the application
    const application = await Application.findByPk(applicationId);
    if (!application) {
      console.log('❌ Application not found:', applicationId);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Find the plan (with coupon association)
    const plan = await Plan.findByPk(planId, {
      include: [{
        model: Coupon,
        as: 'coupon',
        required: false
      }]
    });
    if (!plan) {
      console.log('❌ Plan not found:', planId);
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Validate amount is a valid number
    const receivedAmount = parseFloat(amount);
    if (isNaN(receivedAmount) || receivedAmount < 0) {
      console.log('❌ Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount. Amount must be a valid number greater than or equal to 0.'
      });
    }

    // Recalculate expected amount based on plan's associated coupon or application's coupon
    // Priority: 1) Plan's associated coupon, 2) Application's coupon, 3) Stored finalAmount
    let expectedAmount = parseFloat(plan.fee);
    
    // NEW: First check if plan has an associated coupon
    if (plan.couponId) {
      const planCoupon = await Coupon.findByPk(plan.couponId);
      if (planCoupon && planCoupon.isActive) {
        // Check if coupon is still valid
        const isExpired = planCoupon.expiryDate && new Date(planCoupon.expiryDate) < new Date();
        const isMaxRedemptionsReached = planCoupon.maxRedemptions && planCoupon.currentRedemptions >= planCoupon.maxRedemptions;
        
        if (!isExpired && !isMaxRedemptionsReached) {
          // Check if the application's coupon code matches the plan's coupon
          if (application.couponCode === planCoupon.couponId) {
            const originalAmount = parseFloat(plan.fee);
            let discountAmount = 0;
            
            if (planCoupon.discountType === 'percentage') {
              discountAmount = (originalAmount * parseFloat(planCoupon.discount)) / 100;
            } else if (planCoupon.discountType === 'fixed') {
              discountAmount = parseFloat(planCoupon.discount);
            }
            
            expectedAmount = Math.max(0, originalAmount - discountAmount);
            console.log('💰 Using plan\'s associated coupon:', {
              couponCode: planCoupon.couponId,
              discountAmount,
              expectedAmount
            });
          } else {
            console.log('⚠️ Application coupon code does not match plan\'s associated coupon');
          }
        } else {
          console.log('⚠️ Plan\'s associated coupon is expired or max redemptions reached');
        }
      }
    }
    
    // If plan doesn't have a coupon or it didn't match, fall back to application's coupon
    if (expectedAmount === parseFloat(plan.fee) && (application.couponId || application.couponCode)) {
      const { Coupon } = require('../models');
      
      // Build coupon lookup - handle both couponId (numeric ID) and couponCode (string code)
      let coupon = null;
      
      if (application.couponId) {
        // Try to find by numeric ID first
        coupon = await Coupon.findOne({
          where: {
            id: application.couponId,
            isActive: true
          }
        });
        console.log('🔍 Looking up coupon by ID:', {
          couponId: application.couponId,
          found: !!coupon
        });
      }
      
      // If not found by ID, try by coupon code
      if (!coupon && application.couponCode) {
        coupon = await Coupon.findOne({
          where: {
            couponId: application.couponCode,
            isActive: true
          }
        });
        console.log('🔍 Looking up coupon by code:', {
          couponCode: application.couponCode,
          found: !!coupon
        });
      }

      console.log('🔍 Coupon lookup result:', {
        found: !!coupon,
        couponId: coupon?.id,
        couponCode: coupon?.couponId,
        discount: coupon?.discount,
        discountType: coupon?.discountType
      });

      if (coupon) {
        // Check if coupon is still valid
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
        const isMaxRedemptionsReached = coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions;
        
        if (!isExpired && !isMaxRedemptionsReached) {
          // Check if coupon is applicable to this plan
          let isApplicable = true;
          if (coupon.applicablePlans) {
            try {
              const applicablePlans = JSON.parse(coupon.applicablePlans);
              if (Array.isArray(applicablePlans) && applicablePlans.length > 0) {
                isApplicable = applicablePlans.includes(parseInt(planId));
              }
            } catch (parseError) {
              console.error('Error parsing applicablePlans:', parseError);
            }
          }

          if (isApplicable) {
            const originalAmount = parseFloat(plan.fee);
            let discountAmount = 0;
            
            if (coupon.discountType === 'percentage') {
              discountAmount = (originalAmount * parseFloat(coupon.discount)) / 100;
            } else if (coupon.discountType === 'fixed') {
              discountAmount = parseFloat(coupon.discount);
            }
            
            expectedAmount = Math.max(0, originalAmount - discountAmount);
            console.log('💰 Recalculated amount with coupon:', {
              originalAmount,
              discountAmount,
              expectedAmount,
              couponCode: coupon.couponId,
              discountType: coupon.discountType,
              discount: coupon.discount
            });
          } else {
            console.log('⚠️ Coupon not applicable to this plan');
          }
        } else {
          console.log('⚠️ Coupon expired or max redemptions reached');
        }
      } else {
        console.log('⚠️ Coupon not found in database');
        // Coupon not found, but if we have a stored finalAmount that differs from plan fee, use it
        // This handles cases where coupon was deleted but application still has discount
        if (application.finalAmount !== null && application.finalAmount !== undefined) {
          const storedFinalAmount = parseFloat(application.finalAmount);
          const planFee = parseFloat(plan.fee);
          // If stored amount is different from plan fee, it likely had a discount
          if (Math.abs(storedFinalAmount - planFee) > 0.01) {
            expectedAmount = storedFinalAmount;
            console.log('💰 Using stored finalAmount (likely had discount):', {
              storedFinalAmount,
              planFee,
              expectedAmount
            });
          } else {
            console.log('💰 Stored finalAmount matches plan fee, no discount applied');
          }
        } else {
          console.log('⚠️ No stored finalAmount, using plan fee');
        }
      }
    } else {
      // No coupon code/ID in application, but check if stored finalAmount differs from plan fee
      // This handles edge cases where coupon info wasn't saved but discount was applied
      if (application.finalAmount !== null && application.finalAmount !== undefined) {
        const storedFinalAmount = parseFloat(application.finalAmount);
        const planFee = parseFloat(plan.fee);
        if (Math.abs(storedFinalAmount - planFee) > 0.01) {
          expectedAmount = storedFinalAmount;
          console.log('💰 No coupon info but stored finalAmount differs, using it:', {
            storedFinalAmount,
            planFee,
            expectedAmount
          });
        } else {
          // Stored amount matches plan fee, use it
          expectedAmount = storedFinalAmount;
        }
      } else {
        // No coupon and no stored finalAmount - use plan fee
        expectedAmount = parseFloat(plan.fee);
      }
    }
    
    const tolerance = 0.01; // Allow 1 cent difference due to floating point precision
    
    console.log('💰 Amount validation:', {
      expectedAmount,
      receivedAmount,
      applicationFinalAmount: application.finalAmount,
      applicationCouponId: application.couponId,
      applicationCouponCode: application.couponCode,
      planFee: plan.fee,
      difference: Math.abs(expectedAmount - receivedAmount),
      tolerance
    });

    // If there's a significant mismatch, check if the received amount is a valid discount
    // This handles cases where coupon was deleted or lookup failed, but frontend calculated correctly
    if (Math.abs(expectedAmount - receivedAmount) > tolerance) {
      const planFee = parseFloat(plan.fee);
      const isReceivedLessThanPlanFee = receivedAmount < planFee;
      const discountPercentage = ((planFee - receivedAmount) / planFee) * 100;
      
      console.log('⚠️ Amount mismatch detected:', {
        expected: expectedAmount,
        received: receivedAmount,
        planFee: planFee,
        difference: Math.abs(expectedAmount - receivedAmount),
        isReceivedLessThanPlanFee,
        discountPercentage: discountPercentage.toFixed(2) + '%'
      });
      
      // If received amount is less than plan fee (discount applied) and reasonable (not more than 100% off)
      // AND the application has a coupon code, accept the frontend's calculation
      // This handles cases where coupon lookup failed but frontend has the correct discount
      if (isReceivedLessThanPlanFee && receivedAmount >= 0 && discountPercentage <= 100) {
        if (application.couponId || application.couponCode) {
          console.log('✅ Accepting frontend-calculated discount amount (coupon applied but lookup failed):', {
            receivedAmount,
            planFee,
            discountPercentage: discountPercentage.toFixed(2) + '%',
            couponCode: application.couponCode
          });
          // Accept the received amount and update expectedAmount
          expectedAmount = receivedAmount;
        } else {
          // No coupon but amount is different - reject
          console.log('❌ Amount mismatch with no coupon:', {
            expected: expectedAmount,
            received: receivedAmount
          });
          return res.status(400).json({
            success: false,
            message: `Payment amount does not match expected amount. Expected: $${expectedAmount.toFixed(2)}, Received: $${receivedAmount.toFixed(2)}`
          });
        }
      } else {
        // Received amount is greater than plan fee or invalid - reject
        console.log('❌ Invalid amount (greater than plan fee or negative):', {
          expected: expectedAmount,
          received: receivedAmount,
          planFee
        });
        return res.status(400).json({
          success: false,
          message: `Payment amount does not match expected amount. Expected: $${expectedAmount.toFixed(2)}, Received: $${receivedAmount.toFixed(2)}`
        });
      }
    }

    // Process payment based on method
    let paymentResult = { success: true, transactionId: null };
    
    if (paymentMethod === 'card') {
      // TODO: Integrate with actual payment processor (Stripe, etc.)
      paymentResult = {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method: 'card'
      };
    } else if (paymentMethod === 'crypto') {
      // TODO: Integrate with cryptocurrency payment processor
      paymentResult = {
        success: true,
        transactionId: `CRYPTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method: 'crypto'
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported payment method'
      });
    }

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed'
      });
    }

    // Update application with payment information
    // Also update finalAmount to match what was actually paid (in case there was a mismatch)
    await application.update({
      paymentInfo: JSON.stringify({
        method: paymentMethod,
        amount: receivedAmount, // Use the validated amount
        transactionId: paymentResult.transactionId,
        paymentDetails: paymentDetails,
        processedAt: new Date().toISOString()
      }),
      finalAmount: receivedAmount, // Update to match what was actually paid
      status: 'pending'
    });
    
    console.log('✅ Payment processed successfully:', {
      applicationId: application.id,
      transactionId: paymentResult.transactionId,
      amount: receivedAmount,
      method: paymentMethod
    });

    // TODO: Send notification emails to organization admins and applicant

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        applicationId: application.id,
        transactionId: paymentResult.transactionId,
        status: application.status
      }
    });
  } catch (error) {
    console.error('Application payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

// Get application form by plan-specific form ID (must come before other application-form routes)
router.get('/application-form/plan/:formId', applicationFormController.getApplicationFormByPlan);

// Get default application form (when no organization is specified) - must come before parameterized route
router.get('/application-form', async (req, res) => {
  try {
    console.log('🔍 GET /public/application-form - Fetching default application form');
    
    // Get any published application form
    const { ApplicationForm } = require('../models');
    const form = await ApplicationForm.findOne({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']] // Get the most recent published form
    });

    if (!form) {
      console.log('⚠️ No published application form found');
      // Return a default form structure instead of 404 to prevent frontend errors
      return res.json({
        success: true,
        data: {
          id: null,
          name: 'Default Application Form',
          description: 'Default membership application form',
          fields: [
            {
              name: 'firstName',
              label: 'First Name',
              type: 'text',
              required: true
            },
            {
              name: 'lastName',
              label: 'Last Name',
              type: 'text',
              required: true
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true
            },
            {
              name: 'phone',
              label: 'Phone Number',
              type: 'tel',
              required: false
            }
          ],
          isPublished: true,
          isDefault: true
        }
      });
    }

    console.log('✅ Found application form:', form.id);
    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
    });
  } catch (error) {
    console.error('❌ Get default application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application form',
      error: error.message
    });
  }
});

// Get public application form for an organization (must come after non-parameterized routes)
router.get('/application-form/:organizationId', applicationFormController.getApplicationForm);

// Get organizations with public plans (now returns users who are organizations)
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await User.findAll({
      where: { 
        isOrganization: true,
        status: 1 // Active users
      },
      attributes: ['id', 'organizationName', 'organizationLogo', 'organizationDescription', 'organizationWebsite'],
      order: [['organizationName', 'ASC']]
    });

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
});

// Check for incomplete applications by email
router.get('/incomplete-applications/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const incompleteApplications = await Application.findAll({
      where: {
        email: email,
        status: 'incomplete'
      },
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        applications: incompleteApplications,
        count: incompleteApplications.length
      }
    });
  } catch (error) {
    console.error('Get incomplete applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incomplete applications',
      error: error.message
    });
  }
});

module.exports = router;
