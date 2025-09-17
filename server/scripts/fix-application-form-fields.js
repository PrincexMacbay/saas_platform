const sequelize = require('../config/database');
const ApplicationForm = require('../models/ApplicationForm');

async function fixApplicationFormFields() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

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

    const forms = await ApplicationForm.findAll();

    console.log(`Found ${forms.length} application forms to fix:`);

    for (const form of forms) {
      console.log(`\nProcessing Form ID: ${form.id} - "${form.title}"`);
      
      let currentFields = [];
      if (form.fields) {
        try {
          currentFields = JSON.parse(form.fields);
          console.log(`   Current fields: ${currentFields.length}`);
        } catch (e) {
          console.log(`   Error parsing current fields: ${e.message}`);
          currentFields = [];
        }
      }

      // Check which default fields are missing
      const currentFieldNames = currentFields.map(f => f.name);
      const missingDefaultFields = defaultFields.filter(defaultField => 
        !currentFieldNames.includes(defaultField.name)
      );

      if (missingDefaultFields.length > 0) {
        console.log(`   Missing default fields: ${missingDefaultFields.map(f => f.name).join(', ')}`);
        
        // Add missing default fields to the beginning
        const updatedFields = [...missingDefaultFields, ...currentFields];
        
        // Update the form
        await form.update({
          fields: JSON.stringify(updatedFields)
        });
        
        console.log(`   ✅ Updated form with ${updatedFields.length} total fields`);
      } else {
        console.log(`   ✅ All default fields already present`);
      }
    }

    console.log('\nForm fields fix completed!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixApplicationFormFields();

