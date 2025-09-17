const sequelize = require('../config/database');
const { Plan, Organization, ApplicationForm } = require('../models');

async function checkPlansAndForms() {
  try {
    console.log('Checking plans and their organization links...');

    // Check all plans
    const plans = await Plan.findAll({
      include: [
        {
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`Found ${plans.length} plans:`);
    plans.forEach(plan => {
      console.log(`- Plan ID: ${plan.id}, Name: "${plan.name}", Organization: ${plan.planOrganization?.name || 'None'} (ID: ${plan.organizationId})`);
    });

    // Check all application forms
    const forms = await ApplicationForm.findAll({
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`\nFound ${forms.length} application forms:`);
    forms.forEach(form => {
      console.log(`- Form ID: ${form.id}, Title: "${form.title}", Published: ${form.isPublished}, Organization: ${form.formOrganization?.name || 'None'} (ID: ${form.organizationId})`);
    });

    // Check which plans have published forms available
    console.log('\nChecking which plans have published forms available:');
    plans.forEach(plan => {
      const orgId = plan.organizationId;
      const publishedForms = forms.filter(f => f.organizationId === orgId && f.isPublished);
      
      if (publishedForms.length > 0) {
        console.log(`✅ Plan "${plan.name}" (ID: ${plan.id}) has ${publishedForms.length} published form(s):`);
        publishedForms.forEach(form => {
          console.log(`  - Form: "${form.title}" (ID: ${form.id})`);
        });
      } else {
        console.log(`❌ Plan "${plan.name}" (ID: ${plan.id}) has NO published forms available`);
      }
    });

    // Show sample API calls
    console.log('\nSample API calls to test:');
    plans.forEach(plan => {
      if (plan.organizationId) {
        console.log(`GET /api/public/application-form/${plan.organizationId} - for plan "${plan.name}"`);
      } else {
        console.log(`GET /api/public/application-form - for plan "${plan.name}" (no organization)`);
      }
    });

    console.log('\n✅ Plans and forms check completed!');
  } catch (error) {
    console.error('❌ Error checking plans and forms:', error);
  }
}

// Run the check
checkPlansAndForms()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
