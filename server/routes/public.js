const express = require('express');
const router = express.Router();
const { Plan, Organization, Application } = require('../models');
const applicationFormController = require('../controllers/applicationFormController');
const { Op } = require('sequelize');

// Get public membership plans
router.get('/plans', async (req, res) => {
  try {
    const { organizationId, search } = req.query;
    
    const whereClause = {
      isActive: true
    };
    
    if (organizationId) {
      whereClause.organizationId = organizationId;
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
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name', 'description', 'logo', 'website']
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
      formData 
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
      status: 'pending'
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

    // Validate amount matches plan fee
    if (parseFloat(amount) !== parseFloat(plan.fee)) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match plan fee'
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
      status: 'payment_received'
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

// Get organizations with public plans
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      where: { isActive: true },
      include: [
        {
          model: Plan,
          as: 'plans',
          where: { 
            isActive: true 
          },
          attributes: ['id', 'name', 'fee', 'renewalInterval'],
          required: true
        }
      ],
      attributes: ['id', 'name', 'description', 'logo', 'website']
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

module.exports = router;
