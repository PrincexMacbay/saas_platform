const { ApplicationForm } = require('../models');

// Get all application forms - USER-ONLY ACCESS
const getApplicationForms = async (req, res) => {
  try {
    // USER-ONLY ACCESS: Only show application forms created by the current user
    const forms = await ApplicationForm.findAll({
      where: { createdBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: forms.map(form => {
        const fields = form.fields ? JSON.parse(form.fields) : [];
        // Filter out email fields - email is automatically included from user registration
        const filteredFields = fields.filter(field => 
          field.name?.toLowerCase() !== 'email' && 
          field.type?.toLowerCase() !== 'email' &&
          field.inputType?.toLowerCase() !== 'email' &&
          field.dataType?.toLowerCase() !== 'email'
        );
        return {
          ...form.toJSON(),
          fields: filteredFields
        };
      })
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
    
    console.log('Fetching application form with ID:', formId);
    
    const form = await ApplicationForm.findOne({
      where: { 
        id: formId,
        isPublished: true 
      }
    });

    if (!form) {
      console.log('Application form not found for ID:', formId);
      return res.status(404).json({
        success: false,
        message: 'Application form not found'
      });
    }

    const fields = form.fields ? JSON.parse(form.fields) : [];
    // Filter out email fields - email is automatically included from user registration
    const filteredFields = fields.filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.type?.toLowerCase() !== 'email' &&
      field.inputType?.toLowerCase() !== 'email' &&
      field.dataType?.toLowerCase() !== 'email'
    );
    
    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: filteredFields
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

// Get application form by ID (authenticated user)
const getApplicationFormById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await ApplicationForm.findOne({
      where: { 
        id: id,
        createdBy: req.user.id // Only forms created by current user
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or you do not have access to this form.'
      });
    }

    const fields = form.fields ? JSON.parse(form.fields) : [];
    // Filter out email fields - email is automatically included from user registration
    const filteredFields = fields.filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.type?.toLowerCase() !== 'email' &&
      field.inputType?.toLowerCase() !== 'email' &&
      field.dataType?.toLowerCase() !== 'email'
    );
    
    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: filteredFields
      }
    });
  } catch (error) {
    console.error('Get application form by ID error:', error);
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
    let whereCondition = { isPublished: true };
    
    // If organizationId is provided and not 'null', filter by organization
    if (organizationId && organizationId !== 'null') {
      whereCondition.organizationId = parseInt(organizationId);
    }
    
    const form = await ApplicationForm.findOne({
      where: whereCondition,
      order: [['createdAt', 'DESC']] // Get the most recent published form
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'No published application form found'
      });
    }

    const fields = form.fields ? JSON.parse(form.fields) : [];
    // Filter out email fields - email is automatically included from user registration
    const filteredFields = fields.filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.type?.toLowerCase() !== 'email' &&
      field.inputType?.toLowerCase() !== 'email' &&
      field.dataType?.toLowerCase() !== 'email'
    );
    
    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: filteredFields
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

// Create application form
const createApplicationForm = async (req, res) => {
  try {
    const { title, description, footer, terms, agreement, fields } = req.body;

    // Default required fields that should always be present
    const defaultFields = [
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
    ];

    // Combine default fields with custom fields, avoiding duplicates
    // Filter out any email fields from custom fields (email is automatically included from user registration)
    const customFields = (fields || []).filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.inputType !== 'email' && 
      field.dataType !== 'email' &&
      field.type !== 'email'
    );
    const customFieldNames = customFields.map(f => f.name);
    const uniqueDefaultFields = defaultFields.filter(defaultField => 
      !customFieldNames.includes(defaultField.name)
    );
    const allFields = [...uniqueDefaultFields, ...customFields];

    const form = await ApplicationForm.create({
      title,
      description,
      footer,
      terms,
      agreement,
      fields: JSON.stringify(allFields),
      createdBy: req.user.id,
      isPublished: false
    });

    res.status(201).json({
      success: true,
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

// Save application form (create or update)
const saveApplicationForm = async (req, res) => {
  try {
    const { title, description, footer, terms, agreement, fields } = req.body;

    // Default required fields that should always be present
    const defaultFields = [
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
    ];

    // Combine default fields with custom fields, avoiding duplicates
    // Filter out any email fields from custom fields (email is automatically included from user registration)
    const customFields = (fields || []).filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.inputType !== 'email' && 
      field.dataType !== 'email' &&
      field.type !== 'email'
    );
    const customFieldNames = customFields.map(f => f.name);
    const uniqueDefaultFields = defaultFields.filter(defaultField => 
      !customFieldNames.includes(defaultField.name)
    );
    const allFields = [...uniqueDefaultFields, ...customFields];

    const [form] = await ApplicationForm.upsert({
      title,
      description,
      footer,
      terms,
      agreement,
      fields: JSON.stringify(allFields),
      createdBy: req.user.id,
      isPublished: false
    });

    const fields = form.fields ? JSON.parse(form.fields) : [];
    // Filter out email fields - email is automatically included from user registration
    const filteredFields = fields.filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.type?.toLowerCase() !== 'email' &&
      field.inputType?.toLowerCase() !== 'email' &&
      field.dataType?.toLowerCase() !== 'email'
    );
    
    res.json({
      success: true,
      data: {
        ...form.toJSON(),
        fields: filteredFields
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

// Update application form
const updateApplicationForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, footer, terms, agreement, fields } = req.body;

    // Check if form exists and belongs to user
    const existingForm = await ApplicationForm.findOne({
      where: { 
        id: id,
        createdBy: req.user.id 
      }
    });

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or you do not have access to this form.'
      });
    }

    // Default required fields that should always be present
    const defaultFields = [
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
    ];

    // Combine default fields with custom fields, avoiding duplicates
    // Filter out any email fields from custom fields (email is automatically included from user registration)
    const customFields = (fields || []).filter(field => 
      field.name?.toLowerCase() !== 'email' && 
      field.inputType !== 'email' && 
      field.dataType !== 'email' &&
      field.type !== 'email'
    );
    const customFieldNames = customFields.map(f => f.name);
    const uniqueDefaultFields = defaultFields.filter(defaultField => 
      !customFieldNames.includes(defaultField.name)
    );
    const allFields = [...uniqueDefaultFields, ...customFields];

    await existingForm.update({
      title,
      description,
      footer,
      terms,
      agreement,
      fields: JSON.stringify(allFields)
    });

    res.json({
      success: true,
      data: {
        ...existingForm.toJSON(),
        fields: existingForm.fields ? JSON.parse(existingForm.fields) : []
      }
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

// Delete application form
const deleteApplicationForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await ApplicationForm.findOne({
      where: { 
        id: id,
        createdBy: req.user.id 
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or you do not have access to this form.'
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

// Publish application form
const publishApplicationForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await ApplicationForm.findOne({
      where: { 
        id: id,
        createdBy: req.user.id 
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or you do not have access to this form.'
      });
    }

    await form.update({ isPublished: true });

    res.json({
      success: true,
      message: 'Application form published successfully',
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
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

// Unpublish application form
const unpublishApplicationForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await ApplicationForm.findOne({
      where: { 
        id: id,
        createdBy: req.user.id 
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or you do not have access to this form.'
      });
    }

    await form.update({ isPublished: false });

    res.json({
      success: true,
      message: 'Application form unpublished successfully',
      data: {
        ...form.toJSON(),
        fields: form.fields ? JSON.parse(form.fields) : []
      }
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
  getApplicationFormByPlan,
  getApplicationFormById,
  getApplicationForm,
  createApplicationForm,
  saveApplicationForm,
  updateApplicationForm,
  deleteApplicationForm,
  publishApplicationForm,
  unpublishApplicationForm
};