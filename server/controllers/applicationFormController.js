const { ApplicationForm, Organization } = require('../models');

// Get all application forms (admin)
const getApplicationForms = async (req, res) => {
  try {
    const forms = await ApplicationForm.findAll({
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name', 'logo', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: forms.map(form => ({
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }))
    });
  } catch (error) {
    console.error('Get application forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application forms',
      error: error.message
    });
  }
};

// Get application form by plan ID (public endpoint)
const getApplicationFormByPlan = async (req, res) => {
  try {
    const { formId } = req.params;
    
    const form = await ApplicationForm.findOne({
      where: { 
        id: formId,
        isPublished: true 
      },
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name', 'logo', 'description']
        }
      ]
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found'
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
    console.error('Get application form by plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application form',
      error: error.message
    });
  }
};

// Get application form (public endpoint)
const getApplicationForm = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    // Handle the case where organizationId is "null" string
    let whereCondition = { isPublished: true };
    
    if (organizationId && organizationId !== 'null') {
      whereCondition.organizationId = organizationId;
    } else {
      // If organizationId is null or "null", find forms without organization
      whereCondition.organizationId = null;
    }
    
    const form = await ApplicationForm.findOne({
      where: whereCondition,
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name', 'logo', 'description']
        }
      ]
    });

    if (!form) {
      // Return a default form structure if no form is found
      return res.json({
        success: true,
        data: {
          id: null,
          title: 'Membership Application',
          description: 'Please fill out this form to apply for membership.',
          footer: '',
          terms: '',
          agreement: '',
          fields: [],
          isPublished: true,
          organizationId: null,
          organization: null
        }
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

// Create application form (admin)
const createApplicationForm = async (req, res) => {
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

    const form = await ApplicationForm.create({
      organizationId,
      title: title || 'Membership Application',
      description: description || 'Please fill out this form to apply for membership.',
      footer,
      terms,
      agreement,
      fields: JSON.stringify(fields || []),
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: 'Application form created successfully',
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
    });
  } catch (error) {
    console.error('Create application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application form',
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

// Delete application form
const deleteApplicationForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await ApplicationForm.findByPk(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found'
      });
    }

    // Check if user has permission to delete this form
    if (form.organizationId !== req.user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application form'
      });
    }

    await form.destroy();

    res.json({
      success: true,
      message: 'Application form deleted successfully'
    });
  } catch (error) {
    console.error('Delete application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application form',
      error: error.message
    });
  }
};

// Update application form
const updateApplicationForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const form = await ApplicationForm.findByPk(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found'
      });
    }

    // Check if user has permission to update this form
    if (form.organizationId !== req.user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application form'
      });
    }

    await form.update(updateData);

    res.json({
      success: true,
      message: 'Application form updated successfully',
      data: form
    });
  } catch (error) {
    console.error('Update application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application form',
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
  getApplicationForms,
  getApplicationForm,
  getOrganizationForm,
  createApplicationForm,
  saveApplicationForm,
  updateApplicationForm,
  deleteApplicationForm,
  publishApplicationForm,
  unpublishApplicationForm,
  getApplicationFormByPlan
};
