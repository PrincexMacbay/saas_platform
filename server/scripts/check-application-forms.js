const sequelize = require('../config/database');
const { ApplicationForm, Organization, User } = require('../models');

async function checkApplicationForms() {
  try {
    console.log('Checking application forms...');

    // Check if there are any organizations
    const organizations = await Organization.findAll();
    console.log(`Found ${organizations.length} organizations`);

    if (organizations.length === 0) {
      console.log('No organizations found. Creating a sample organization...');
      
      // Get the first user
      const firstUser = await User.findOne({
        order: [['id', 'ASC']]
      });

      if (!firstUser) {
        console.log('No users found. Cannot create organization.');
        return;
      }

      // Create a sample organization
      const organization = await Organization.create({
        name: 'Sample Gym',
        description: 'A sample gym for testing',
        email: 'info@samplegym.com',
        phone: '+1234567890',
        website: 'https://samplegym.com',
        ownerId: firstUser.id,
        isActive: true
      });

      console.log(`Created organization: ${organization.name} (ID: ${organization.id})`);
    }

    // Check for application forms
    const forms = await ApplicationForm.findAll({
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`Found ${forms.length} application forms:`);
    forms.forEach(form => {
      console.log(`- ID: ${form.id}, Title: ${form.title}, Published: ${form.isPublished}, Organization: ${form.formOrganization?.name || 'None'}`);
    });

    // If no published forms exist, create a sample one
    const publishedForms = forms.filter(f => f.isPublished);
    if (publishedForms.length === 0) {
      console.log('No published forms found. Creating a sample published form...');
      
      const firstOrg = organizations[0] || await Organization.findOne();
      if (!firstOrg) {
        console.log('No organization found. Cannot create form.');
        return;
      }

      const sampleForm = await ApplicationForm.create({
        organizationId: firstOrg.id,
        title: 'Gym Membership Application',
        description: 'Please fill out this form to apply for gym membership.',
        footer: 'Thank you for your application. We will review it and get back to you soon.',
        terms: 'By submitting this application, you agree to our terms and conditions.',
        fields: JSON.stringify([
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
            name: 'emergencyContact',
            label: 'Emergency Contact',
            type: 'text',
            required: false,
            order: 6,
            placeholder: 'Name and phone number'
          },
          {
            name: 'membershipType',
            label: 'Membership Type',
            type: 'select',
            required: true,
            order: 7,
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
            order: 8,
            placeholder: 'Please list any health conditions or concerns'
          },
          {
            name: 'agreeToTerms',
            label: 'I agree to the terms and conditions',
            type: 'checkbox',
            required: true,
            order: 9
          }
        ]),
        isPublished: true
      });

      console.log(`Created sample form: ${sampleForm.title} (ID: ${sampleForm.id})`);
      console.log('Form is now published and available for public use.');
    }

    console.log('✅ Application forms check completed!');
  } catch (error) {
    console.error('❌ Error checking application forms:', error);
  }
}

// Run the check
checkApplicationForms()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
