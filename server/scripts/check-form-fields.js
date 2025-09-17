const sequelize = require('../config/database');
const { ApplicationForm } = require('../models');

async function checkFormFields() {
  try {
    console.log('Checking gym membership form fields...');

    // Find the gym membership form
    const gymForm = await ApplicationForm.findOne({
      where: { title: 'Gym  Membership' }
    });

    if (!gymForm) {
      console.log('Gym Membership form not found');
      return;
    }

    console.log(`Form: "${gymForm.title}" (ID: ${gymForm.id})`);
    console.log(`Published: ${gymForm.isPublished}`);
    console.log(`Organization ID: ${gymForm.organizationId}`);

    // Parse and display the fields
    if (gymForm.fields) {
      const fields = JSON.parse(gymForm.fields);
      console.log(`\nForm has ${fields.length} fields:`);
      
      fields.forEach((field, index) => {
        console.log(`${index + 1}. ${field.label} (${field.name})`);
        console.log(`   Type: ${field.type}`);
        console.log(`   Required: ${field.required}`);
        if (field.placeholder) {
          console.log(`   Placeholder: ${field.placeholder}`);
        }
        if (field.options) {
          console.log(`   Options: ${field.options.map(opt => opt.label || opt).join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('\nNo fields found in the form.');
    }

    // If no fields, add some sample fields
    if (!gymForm.fields || JSON.parse(gymForm.fields).length === 0) {
      console.log('\nAdding sample fields to the gym form...');
      
      const sampleFields = [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true,
          order: 1,
          placeholder: 'Enter your first name'
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          required: true,
          order: 2,
          placeholder: 'Enter your last name'
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          order: 3,
          placeholder: 'Enter your email address'
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          required: false,
          order: 4,
          placeholder: 'Enter your phone number'
        },
        {
          name: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          order: 5
        },
        {
          name: 'membershipType',
          label: 'Membership Type',
          type: 'select',
          required: true,
          order: 6,
          options: [
            { value: 'basic', label: 'Basic Membership' },
            { value: 'premium', label: 'Premium Membership' },
            { value: 'family', label: 'Family Membership' }
          ]
        },
        {
          name: 'healthConditions',
          label: 'Health Conditions',
          type: 'textarea',
          required: false,
          order: 7,
          placeholder: 'Please list any health conditions or concerns'
        }
      ];

      await gymForm.update({
        fields: JSON.stringify(sampleFields)
      });

      console.log('✅ Added sample fields to the gym form');
    }

    console.log('\n✅ Form fields check completed!');
  } catch (error) {
    console.error('❌ Error checking form fields:', error);
  }
}

// Run the check
checkFormFields()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
