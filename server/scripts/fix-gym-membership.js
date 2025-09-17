const sequelize = require('../config/database');
const { Plan, Organization, ApplicationForm } = require('../models');

async function fixGymMembership() {
  try {
    console.log('Fixing gym membership plan and form...');

    // Find the gym membership plan
    const gymPlan = await Plan.findOne({
      where: { name: 'Gym Membership' }
    });

    if (!gymPlan) {
      console.log('Gym Membership plan not found');
      return;
    }

    console.log(`Found gym plan: ID ${gymPlan.id}, Name: "${gymPlan.name}"`);

    // Find the organization (Tech Innovators Hub)
    const organization = await Organization.findOne({
      where: { name: 'Tech Innovators Hub' }
    });

    if (!organization) {
      console.log('Tech Innovators Hub organization not found');
      return;
    }

    console.log(`Found organization: ID ${organization.id}, Name: "${organization.name}"`);

    // Update the gym plan to link to the organization
    await gymPlan.update({
      organizationId: organization.id
    });

    console.log(`✅ Updated gym plan to link to organization ID ${organization.id}`);

    // Find the gym membership form
    const gymForm = await ApplicationForm.findOne({
      where: { title: 'Gym  Membership' }
    });

    if (!gymForm) {
      console.log('Gym Membership form not found');
      return;
    }

    console.log(`Found gym form: ID ${gymForm.id}, Title: "${gymForm.title}", Published: ${gymForm.isPublished}`);

    // Publish the gym form
    await gymForm.update({
      isPublished: true
    });

    console.log(`✅ Published gym form ID ${gymForm.id}`);

    // Verify the fix
    const updatedPlan = await Plan.findByPk(gymPlan.id, {
      include: [
        {
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`\nVerification:`);
    console.log(`- Plan: "${updatedPlan.name}" (ID: ${updatedPlan.id})`);
    console.log(`- Organization: ${updatedPlan.planOrganization?.name || 'None'} (ID: ${updatedPlan.organizationId})`);

    const publishedForms = await ApplicationForm.findAll({
      where: { 
        organizationId: organization.id,
        isPublished: true 
      }
    });

    console.log(`- Published forms for this organization: ${publishedForms.length}`);
    publishedForms.forEach(form => {
      console.log(`  - "${form.title}" (ID: ${form.id})`);
    });

    console.log('\n✅ Gym membership fix completed!');
    console.log('The gym membership plan should now show the custom form fields.');
  } catch (error) {
    console.error('❌ Error fixing gym membership:', error);
  }
}

// Run the fix
fixGymMembership()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
