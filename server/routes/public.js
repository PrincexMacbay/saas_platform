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

    // Validate required fields
    if (!applicationId || !planId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, plan ID, amount, and payment method are required'
      });
    }

    // Find the application
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Find the plan
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Validate amount matches the final amount (after coupon discount)
    const expectedAmount = application.finalAmount || parseFloat(plan.fee);
    if (parseFloat(amount) !== parseFloat(expectedAmount)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount does not match expected amount. Expected: $${expectedAmount}, Received: $${amount}`
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
    await application.update({
      paymentInfo: JSON.stringify({
        method: paymentMethod,
        amount: amount,
        transactionId: paymentResult.transactionId,
        paymentDetails: paymentDetails,
        processedAt: new Date().toISOString()
      }),
      status: 'pending'
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

// Get public application form for an organization
router.get('/application-form/:organizationId', applicationFormController.getApplicationForm);

// Get application form by plan-specific form ID
router.get('/application-form/plan/:formId', applicationFormController.getApplicationFormByPlan);

// Get default application form (when no organization is specified)
router.get('/application-form', async (req, res) => {
  try {
    // Create a mock request with null organizationId
    const mockReq = { params: { organizationId: 'null' } };
    await applicationFormController.getApplicationForm(mockReq, res);
  } catch (error) {
    console.error('Get default application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application form',
      error: error.message
    });
  }
});

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
