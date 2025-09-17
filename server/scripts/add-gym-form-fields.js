const sequelize = require('../config/database');
const { ApplicationForm } = require('../models');

async function addGymFormFields() {
  try {
    console.log('Adding proper fields to gym membership form...');

    // Find the gym membership form
    const gymForm = await ApplicationForm.findOne({
      where: { title: 'Gym  Membership' }
    });

    if (!gymForm) {
      console.log('Gym Membership form not found');
      return;
    }

    console.log(`Found gym form: ID ${gymForm.id}, Title: "${gymForm.title}"`);

    // Define proper gym membership form fields
    const gymFields = [
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
        name: 'address',
        label: 'Address',
        type: 'textarea',
        required: false,
        order: 6,
        placeholder: 'Enter your full address'
      },
      {
        name: 'emergencyContact',
        label: 'Emergency Contact',
        type: 'text',
        required: false,
        order: 7,
        placeholder: 'Name and phone number'
      },
      {
        name: 'membershipType',
        label: 'Membership Type',
        type: 'select',
        required: true,
        order: 8,
        options: [
          { value: 'basic', label: 'Basic Membership - $30/month' },
          { value: 'premium', label: 'Premium Membership - $50/month' },
          { value: 'family', label: 'Family Membership - $80/month' },
          { value: 'student', label: 'Student Membership - $25/month' }
        ]
      },
      {
        name: 'healthConditions',
        label: 'Health Conditions',
        type: 'textarea',
        required: false,
        order: 9,
        placeholder: 'Please list any health conditions, injuries, or concerns we should be aware of'
      },
      {
        name: 'fitnessGoals',
        label: 'Fitness Goals',
        type: 'select',
        required: false,
        order: 10,
        options: [
          { value: 'weight_loss', label: 'Weight Loss' },
          { value: 'muscle_gain', label: 'Muscle Gain' },
          { value: 'general_fitness', label: 'General Fitness' },
          { value: 'sports_training', label: 'Sports Training' },
          { value: 'rehabilitation', label: 'Rehabilitation' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'experienceLevel',
        label: 'Fitness Experience Level',
        type: 'select',
        required: false,
        order: 11,
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' }
        ]
      },
      {
        name: 'agreeToTerms',
        label: 'I agree to the gym terms and conditions',
        type: 'checkbox',
        required: true,
        order: 12
      },
      {
        name: 'agreeToPrivacy',
        label: 'I agree to the privacy policy',
        type: 'checkbox',
        required: true,
        order: 13
      }
    ];

    // Update the form with proper fields
    await gymForm.update({
      fields: JSON.stringify(gymFields),
      title: 'Gym Membership Application',
      description: 'Please fill out this form to apply for gym membership. All fields marked with * are required.',
      terms: 'By submitting this application, you agree to our gym terms and conditions, including safety rules, membership policies, and payment terms. You also acknowledge that physical activity involves inherent risks and you participate at your own risk.',
      footer: 'Thank you for your application! We will review it and contact you within 2-3 business days to confirm your membership.'
    });

    console.log('✅ Updated gym form with proper fields and content');
    console.log(`- Added ${gymFields.length} form fields`);
    console.log('- Updated title, description, terms, and footer');

    // Verify the update
    const updatedForm = await ApplicationForm.findByPk(gymForm.id);
    const fields = JSON.parse(updatedForm.fields);
    
    console.log('\nVerification:');
    console.log(`- Form title: "${updatedForm.title}"`);
    console.log(`- Published: ${updatedForm.isPublished}`);
    console.log(`- Fields count: ${fields.length}`);
    console.log('- Field types: ' + fields.map(f => f.type).join(', '));

    console.log('\n✅ Gym form fields added successfully!');
    console.log('The gym membership application should now show all the custom form fields.');
  } catch (error) {
    console.error('❌ Error adding gym form fields:', error);
  }
}

// Run the script
addGymFormFields()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
