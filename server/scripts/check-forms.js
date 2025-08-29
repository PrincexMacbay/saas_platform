const { ApplicationForm, Organization } = require('../models');

async function checkForms() {
  try {
    const forms = await ApplicationForm.findAll({
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log('Application forms in database:');
    forms.forEach(form => {
      console.log({
        id: form.id,
        title: form.title,
        isPublished: form.isPublished,
        organizationId: form.organizationId,
        organizationName: form.formOrganization?.name,
        fieldsCount: form.fields ? JSON.parse(form.fields).length : 0
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking forms:', error);
    process.exit(1);
  }
}

checkForms();

