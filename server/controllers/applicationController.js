const { Op } = require('sequelize');
const { Application, Plan, User, Subscription, DigitalCard, GroupConversation, GroupMember } = require('../models');
const { generateMemberNumber } = require('../utils/memberUtils');
const bcrypt = require('bcryptjs');
const notificationService = require('../services/notificationService');

// Get all applications
const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, planId } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // USER-ONLY ACCESS: No organization check needed
    
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { studentId: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (planId) {
      whereClause.planId = planId;
    }

    // USER-ONLY ACCESS: Only show applications for plans created by the current user
    const { count, rows } = await Application.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'fee', 'createdBy'],
          where: {
            createdBy: req.user.id // Only plans created by current user
          },
          required: true // This ensures only applications with valid plans are returned
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        applications: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Get single application
const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CRITICAL SECURITY FIX: Only allow access to applications for plans the user created
    // or for plans in the user's organization
    const application = await Application.findOne({
      where: { id },
      include: [
        {
          model: Plan,
          as: 'plan',
          where: {
            createdBy: req.user.id // Only plans created by current user
          },
          required: true
        },
        {
          model: User,
          as: 'user',
          required: false
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

// Create application
const createApplication = async (req, res) => {
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

    // Check if email already has an application for THIS SPECIFIC plan
    const existingApplication = await Application.findOne({
      where: { 
        email: extractedEmail, 
        planId, // Must be for this specific plan
        status: { [Op.in]: ['pending', 'approved', 'rejected'] } 
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'An application for this plan already exists with this email'
      });
    }

    // Get the plan to check if user is the creator
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Prevent plan creators from applying for their own plans
    if (req.user && plan.createdBy === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply for a plan that you created. Plan creators are automatically considered members.'
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

    // Fetch with relations
    const fullApplication = await Application.findByPk(application.id, {
      include: [{ model: Plan, as: 'plan', attributes: ['name', 'fee'] }]
    });

    // Send notification to plan creator
    notificationService.notifyApplicationSubmitted(application.id).catch(error => {
      console.error('Failed to send application notification:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        application: fullApplication
      }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error.message
    });
  }
};

// Approve application
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { createUser = true } = req.body;

    const application = await Application.findByPk(id, {
      include: [{ model: Plan, as: 'plan' }]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Application is already approved'
      });
    }

    let user = null;
    let existingUser = null;
    let temporaryPassword = null;

    if (createUser) {
      // Check if user already exists
      existingUser = await User.findOne({
        where: { email: application.email }
      });

      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user
        const username = await generateUniqueUsername(application.firstName, application.lastName);
        temporaryPassword = Math.random().toString(36).slice(-8);

        user = await User.create({
          username,
          email: application.email,
          password: temporaryPassword,
          firstName: application.firstName,
          lastName: application.lastName,
          status: 1 // Enabled
        });

        // TODO: Send welcome email with login credentials
      }

      // Generate member number and create subscription
      const memberNumber = await generateMemberNumber();

      const subscription = await Subscription.create({
        userId: user.id,
        planId: application.planId,
        memberNumber,
        status: 'pending', // Will be activated when payment is received
        notes: `Created from application #${application.id}`
      });

      // Update application with user reference
      await application.update({
        status: 'approved',
        userId: user.id
      });

      // Add user to plan's group chat if plan has hasGroupChat enabled
      try {
        // Reload plan to get latest hasGroupChat value
        const plan = await Plan.findByPk(application.planId);
        
        if (plan && plan.hasGroupChat) {
          const existingGroup = await GroupConversation.findOne({
            where: {
              planId: application.planId,
              isPlanGroup: true
            }
          });

          if (existingGroup) {
            // Check if user is already a member
            const existingMember = await GroupMember.findOne({
              where: {
                groupConversationId: existingGroup.id,
                userId: user.id
              }
            });

            if (!existingMember) {
              // Add user to the group chat
              await GroupMember.create({
                groupConversationId: existingGroup.id,
                userId: user.id,
                role: 'member'
              });
              console.log(`✅ Added approved user ${user.id} to group chat ${existingGroup.id} for plan ${application.planId}`);
            }
          } else {
            // Group chat should exist but doesn't - create it
            const { createOrUpdatePlanGroupChat } = require('./chatController');
            await createOrUpdatePlanGroupChat(application.planId, plan.createdBy);
            console.log(`✅ Created missing group chat for plan ${application.planId}`);
          }
        }
      } catch (error) {
        console.error('Error adding user to group chat:', error);
        // Don't fail the approval if group chat addition fails
      }

      // Create digital card for the new member using the plan's template
      try {
        // First, try to get plan-specific template
        let template = null;
        
        if (application.plan.digitalCardTemplateId) {
          template = await DigitalCard.findOne({
            where: {
              id: application.plan.digitalCardTemplateId,
              isTemplate: true
            }
          });
        }
        
        // If no plan-specific template, fall back to plan creator's general template
        if (!template) {
          const planCreatorId = application.plan.createdBy;
          template = await DigitalCard.findOne({
            where: {
              userId: planCreatorId,
              isTemplate: true,
              planId: null // General template (not plan-specific)
            }
          });
        }

        if (template) {
          // Create user-specific card based on template
          await DigitalCard.create({
            userId: user.id,
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
          console.log('✅ Digital card created for new member:', {
            userId: user.id,
            subscriptionId: subscription.id,
            memberNumber
          });
        } else {
          console.log('⚠️ No digital card template found for plan creator:', planCreatorId);
        }
      } catch (error) {
        console.error('❌ Error creating digital card during approval:', error);
        // Don't fail the approval if card creation fails
      }

      console.log('✅ Application approved and updated with userId:', {
        applicationId: id,
        userId: user.id,
        userEmail: user.email
      });

      // Fetch updated application with relations
      const updatedApplication = await Application.findByPk(id, {
        include: [
          { model: Plan, as: 'plan' },
          { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
        ]
      });

      // Send notification to applicant (after userId is set and database is updated)
      // Reload application to ensure we have the latest data
      const applicationForNotification = await Application.findByPk(id, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      console.log('📧 Preparing to send approval notification:', {
        applicationId: id,
        userId: applicationForNotification.userId,
        userEmail: applicationForNotification.email,
        planName: applicationForNotification.plan?.name
      });
      
      // Send notification - use await to ensure it completes before response
      try {
        await notificationService.notifyApplicationApproved(id);
        console.log('✅ Approval notification sent successfully');
      } catch (error) {
        console.error('❌ Failed to send approval notification:', error);
        // Don't fail the request if notification fails
      }

      res.json({
        success: true,
        message: 'Application approved successfully',
        data: {
          application: updatedApplication,
          subscription: await Subscription.findByPk(subscription.id, {
            include: [{ model: Plan, as: 'plan' }]
          }),
          credentials: existingUser ? null : {
            username: user.username,
            temporaryPassword
          }
        }
      });
    } else {
      // Just approve without creating user
      // Try to find existing user by email
      const existingUser = await User.findOne({
        where: { email: application.email }
      });

      if (existingUser) {
        // Update application with user reference if user exists
        await application.update({ 
          status: 'approved',
          userId: existingUser.id
        });
      } else {
        // No user exists, just approve
        await application.update({ status: 'approved' });
      }

      const updatedApplication = await Application.findByPk(id, {
        include: [{ model: Plan, as: 'plan' }]
      });

      // Send notification if user exists
      if (existingUser) {
        // Reload application to ensure we have the latest data with userId
        const applicationForNotification = await Application.findByPk(id, {
          include: [{ model: Plan, as: 'plan' }]
        });
        
        console.log('📧 Sending approval notification for existing user:', {
          applicationId: id,
          userId: applicationForNotification.userId,
          userEmail: existingUser.email,
          planName: applicationForNotification.plan?.name
        });
        
        try {
          await notificationService.notifyApplicationApproved(id);
          console.log('✅ Approval notification sent successfully for existing user');
        } catch (error) {
          console.error('❌ Failed to send approval notification:', error);
          // Don't fail the request if notification fails
        }

        // Add user to plan's group chat if one exists
        try {
          const existingGroup = await GroupConversation.findOne({
            where: {
              planId: application.planId,
              isPlanGroup: true
            }
          });

          if (existingGroup) {
            // Check if user is already a member
            const existingMember = await GroupMember.findOne({
              where: {
                groupConversationId: existingGroup.id,
                userId: existingUser.id
              }
            });

            if (!existingMember) {
              // Add user to the group chat
              await GroupMember.create({
                groupConversationId: existingGroup.id,
                userId: existingUser.id,
                role: 'member'
              });
              console.log(`✅ Added approved user ${existingUser.id} to group chat ${existingGroup.id} for plan ${application.planId}`);
            }
          }
        } catch (error) {
          console.error('Error adding user to group chat:', error);
          // Don't fail the approval if group chat addition fails
        }
      } else {
        console.log('⚠️ Cannot send notification: No user found for application email:', application.email);
      }

      res.json({
        success: true,
        message: 'Application approved successfully',
        data: { application: updatedApplication }
      });
    }
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve application',
      error: error.message
    });
  }
};

// Reject application
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({ status: 'rejected' });

    // Send notification to applicant if they have a user account
    if (application.userId) {
      notificationService.notifyApplicationRejected(id).catch(error => {
        console.error('Failed to send rejection notification:', error);
      });
    }

    res.json({
      success: true,
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error.message
    });
  }
};

// Update application
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update(updateData);

    const updatedApplication = await Application.findByPk(id, {
      include: [{ model: Plan, as: 'plan' }]
    });

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByPk(id, {
      include: [{ model: Plan, as: 'plan' }]
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const previousStatus = application.status;
    await application.update({ status });

    const updatedApplication = await Application.findByPk(id, {
      include: [{ model: Plan, as: 'plan' }]
    });

    // Send notification if status changed to 'approved'
    if (status === 'approved' && previousStatus !== 'approved') {
      console.log('📧 Status updated to approved via updateApplicationStatus, sending notification:', {
        applicationId: id,
        userId: updatedApplication.userId,
        email: updatedApplication.email
      });
      
      let userIdForGroup = null;
      
      try {
        // If application has userId, send notification
        if (updatedApplication.userId) {
          userIdForGroup = updatedApplication.userId;
          await notificationService.notifyApplicationApproved(id);
          console.log('✅ Approval notification sent successfully via updateApplicationStatus');
        } else {
          // Try to find user by email
          const user = await User.findOne({ where: { email: updatedApplication.email } });
          if (user) {
            // Update application with userId
            await updatedApplication.update({ userId: user.id });
            userIdForGroup = user.id;
            await notificationService.notifyApplicationApproved(id);
            console.log('✅ Approval notification sent successfully after finding user by email');
          } else {
            console.log('⚠️ Cannot send notification: No user found for application email:', updatedApplication.email);
          }
        }

        // Add user to plan's group chat if one exists and user was found
        if (userIdForGroup && updatedApplication.planId) {
          try {
            const existingGroup = await GroupConversation.findOne({
              where: {
                planId: updatedApplication.planId,
                isPlanGroup: true
              }
            });

            if (existingGroup) {
              // Check if user is already a member
              const existingMember = await GroupMember.findOne({
                where: {
                  groupConversationId: existingGroup.id,
                  userId: userIdForGroup
                }
              });

              if (!existingMember) {
                // Add user to the group chat
                await GroupMember.create({
                  groupConversationId: existingGroup.id,
                  userId: userIdForGroup,
                  role: 'member'
                });
                console.log(`✅ Added approved user ${userIdForGroup} to group chat ${existingGroup.id} for plan ${updatedApplication.planId}`);
              }
            }
          } catch (error) {
            console.error('Error adding user to group chat:', error);
            // Don't fail the approval if group chat addition fails
          }
        }
      } catch (error) {
        console.error('❌ Failed to send approval notification via updateApplicationStatus:', error);
        // Don't fail the request if notification fails
      }
    }

    // Send notification if status changed to 'rejected'
    if (status === 'rejected' && previousStatus !== 'rejected') {
      if (updatedApplication.userId) {
        notificationService.notifyApplicationRejected(id).catch(error => {
          console.error('Failed to send rejection notification:', error);
        });
      }
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

// Delete application
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};

// Helper function to generate unique username
const generateUniqueUsername = async (firstName, lastName) => {
  const baseUsername = `${firstName.toLowerCase()}${lastName ? lastName.toLowerCase() : ''}`;
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  approveApplication,
  rejectApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
};
