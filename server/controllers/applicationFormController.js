const { ApplicationForm, Organization } = require('../models');

// Get application form (public endpoint)
const getApplicationForm = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    const form = await ApplicationForm.findOne({
      where: { 
        organizationId,
        isPublished: true 
      },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo', 'description']
        }
      ]
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found or not published'
      });
    }

    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
    });
  } catch (error) {
    console.error('Get application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application form',
      error: error.message
    });
  }
};

// Get organization's application form (admin)
const getOrganizationForm = async (req, res) => {
  try {
    const organizationId = req.user.organizationId; // Get from authenticated user
    
    // Check if user has an organization
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any organization. Please join an organization first.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    let form = await ApplicationForm.findOne({
      where: { organizationId }
    });

    // Create default form if none exists
    if (!form) {
      form = await ApplicationForm.create({
        organizationId,
        title: 'Membership Application',
        description: 'Please fill out this form to apply for membership.',
        fields: JSON.stringify([
          {
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true,
            order: 1
          },
          {
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true,
            order: 2
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            order: 3
          },
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            required: false,
            order: 4
          }
        ]),
        isPublished: false
      });
    }

    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
    });
  } catch (error) {
    console.error('Get organization form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application form',
      error: error.message
    });
  }
};

// Save application form (admin)
const saveApplicationForm = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Check if user has an organization
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any organization. Please join an organization first.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    const { title, description, footer, terms, agreement, fields } = req.body;

    const [form] = await ApplicationForm.upsert({
      organizationId,
      title,
      description,
      footer,
      terms,
      agreement,
      fields: JSON.stringify(fields),
      isPublished: false // Keep current published status when saving
    });

    res.json({
      success: true,
      message: 'Application form saved successfully',
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
    });
  } catch (error) {
    console.error('Save application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save application form',
      error: error.message
    });
  }
};

// Publish application form (admin)
const publishApplicationForm = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Check if user has an organization
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any organization. Please join an organization first.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    const form = await ApplicationForm.findOne({
      where: { organizationId }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found. Please save the form first.'
      });
    }

    await form.update({ isPublished: true });

    res.json({
      success: true,
      message: 'Application form published successfully',
      data: form
    });
  } catch (error) {
    console.error('Publish application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish application form',
      error: error.message
    });
  }
};

// Unpublish application form (admin)
const unpublishApplicationForm = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Check if user has an organization
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any organization. Please join an organization first.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    const form = await ApplicationForm.findOne({
      where: { organizationId }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found'
      });
    }

    await form.update({ isPublished: false });

    res.json({
      success: true,
      message: 'Application form unpublished successfully',
      data: form
    });
  } catch (error) {
    console.error('Unpublish application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish application form',
      error: error.message
    });
  }
};

module.exports = {
  getApplicationForm,
  getOrganizationForm,
  saveApplicationForm,
  publishApplicationForm,
  unpublishApplicationForm
};
