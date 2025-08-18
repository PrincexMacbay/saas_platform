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
      isActive: true,
      isPublic: true
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
          as: 'organization',
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
        isActive: true,
        isPublic: true
      },
      include: [
        {
          model: Organization,
          as: 'organization',
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

    // Validate plan exists and is public
    const plan = await Plan.findOne({
      where: {
        id: planId,
        isActive: true,
        isPublic: true
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
        email, 
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
      email,
      firstName,
      lastName,
      phone,
      referral,
      studentId,
      planId,
      applicationFee,
      paymentInfo: paymentInfo ? JSON.stringify(paymentInfo) : null,
      formData: formData ? JSON.stringify(formData) : null,
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

// Get public application form for an organization
router.get('/application-form/:organizationId', applicationFormController.getApplicationForm);

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
            isActive: true, 
            isPublic: true 
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
