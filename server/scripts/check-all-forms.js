const sequelize = require('../config/database');
const ApplicationForm = require('../models/ApplicationForm');

async function checkAllForms() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const forms = await ApplicationForm.findAll({
      raw: true
    });

    console.log(`Found ${forms.length} application forms:`);
    console.log('='.repeat(50));

    forms.forEach((form, index) => {
      console.log(`\n${index + 1}. Form ID: ${form.id}`);
      console.log(`   Title: ${form.title}`);
      console.log(`   Organization ID: ${form.organizationId}`);
      console.log(`   Is Published: ${form.isPublished}`);
      console.log(`   Created: ${form.createdAt}`);
      
      if (form.fields) {
        try {
          const fields = JSON.parse(form.fields);
          console.log(`   Fields (${fields.length}):`);
          fields.forEach((field, fieldIndex) => {
            console.log(`     ${fieldIndex + 1}. ${field.name} (${field.type}) - ${field.label} ${field.required ? '[REQUIRED]' : '[OPTIONAL]'}`);
          });
        } catch (e) {
          console.log(`   Fields: Error parsing JSON - ${e.message}`);
        }
      } else {
        console.log('   Fields: None');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAllForms();

