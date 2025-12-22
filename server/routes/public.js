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
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name', 'description', 'logo', 'website', 'email', 'phone']
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
        // If parsing fails, assume coupon is applicable to all plans
      }
    }

    if (!isApplicable) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not valid for the selected plan'
      });
    }

    // Get plan details for validation
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
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
      }
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
        // Check if coupon has expired
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
            validatedCoupon = coupon;
            if (coupon.discountType === 'percentage') {
              discountAmount = (originalAmount * parseFloat(coupon.discount)) / 100;
            } else if (coupon.discountType === 'fixed') {
              discountAmount = parseFloat(coupon.discount);
            }
            finalAmount = Math.max(0, originalAmount - discountAmount);
          }
        }
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

    // Find the plan
    const plan = await Plan.findByPk(planId);
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

    // Recalculate expected amount based on application's coupon to ensure consistency
    // This handles cases where the application was created with a coupon but the stored finalAmount might differ
    let expectedAmount = parseFloat(plan.fee);
    
    // If application has a coupon, recalculate the discount
    if (application.couponId || application.couponCode) {
      const { Coupon } = require('../models');
      const coupon = await Coupon.findOne({
        where: {
          [Op.or]: [
            { id: application.couponId },
            { couponId: application.couponCode }
          ],
          isActive: true
        }
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
          }
        }
      }
    } else {
      // No coupon - use stored finalAmount or plan fee
      expectedAmount = application.finalAmount !== null && application.finalAmount !== undefined 
        ? parseFloat(application.finalAmount) 
        : parseFloat(plan.fee);
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

    if (Math.abs(expectedAmount - receivedAmount) > tolerance) {
      console.log('❌ Amount mismatch:', {
        expected: expectedAmount,
        received: receivedAmount,
        difference: Math.abs(expectedAmount - receivedAmount)
      });
      return res.status(400).json({
        success: false,
        message: `Payment amount does not match expected amount. Expected: $${expectedAmount.toFixed(2)}, Received: $${receivedAmount.toFixed(2)}`
      });
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
