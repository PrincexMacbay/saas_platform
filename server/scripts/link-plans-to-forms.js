const sequelize = require('../config/database');
const { Plan, Organization, ApplicationForm } = require('../models');

async function linkPlansToForms() {
  try {
    console.log('Linking plans to their appropriate application forms...');

    // Get all plans
    const plans = await Plan.findAll({
      include: [
        {
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`Found ${plans.length} plans to process`);

    // Get all published forms
    const publishedForms = await ApplicationForm.findAll({
      where: { isPublished: true },
      include: [
        {
          model: Organization,
          as: 'formOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`Found ${publishedForms.length} published forms`);

    // Process each plan
    for (const plan of plans) {
      console.log(`\nProcessing plan: "${plan.name}" (ID: ${plan.id})`);
      
      if (!plan.organizationId) {
        console.log('  ❌ Plan has no organization - cannot link to form');
        continue;
      }

      // Find forms for this organization
      const orgForms = publishedForms.filter(form => form.organizationId === plan.organizationId);
      
      if (orgForms.length === 0) {
        console.log('  ❌ No published forms found for this organization');
        continue;
      }

      // Try to find a matching form based on plan name
      let selectedForm = null;
      
      // First, try exact name match
      selectedForm = orgForms.find(form => 
        form.title.toLowerCase().includes(plan.name.toLowerCase()) ||
        plan.name.toLowerCase().includes(form.title.toLowerCase())
      );

      // If no exact match, try partial matches
      if (!selectedForm) {
        if (plan.name.toLowerCase().includes('gym')) {
          selectedForm = orgForms.find(form => 
            form.title.toLowerCase().includes('gym') || 
            form.title.toLowerCase().includes('fitness')
          );
        } else if (plan.name.toLowerCase().includes('trading')) {
          selectedForm = orgForms.find(form => 
            form.title.toLowerCase().includes('trading')
          );
        } else {
          // Use the first available form as default
          selectedForm = orgForms[0];
        }
      }

      if (selectedForm) {
        // Update the plan to use this specific form
        await plan.update({
          applicationFormId: selectedForm.id,
          useDefaultForm: false
        });

        console.log(`  ✅ Linked to form: "${selectedForm.title}" (ID: ${selectedForm.id})`);
      } else {
        // Use default form
        await plan.update({
          applicationFormId: null,
          useDefaultForm: true
        });

        console.log(`  ℹ️  Using default form (no specific form selected)`);
      }
    }

    // Verify the results
    console.log('\n=== VERIFICATION ===');
    const updatedPlans = await Plan.findAll({
      include: [
        {
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name']
        },
        {
          model: ApplicationForm,
          as: 'applicationForm',
          attributes: ['id', 'title', 'isPublished']
        }
      ]
    });

    updatedPlans.forEach(plan => {
      console.log(`Plan: "${plan.name}"`);
      console.log(`  Organization: ${plan.planOrganization?.name || 'None'}`);
      console.log(`  Use Default Form: ${plan.useDefaultForm}`);
      console.log(`  Specific Form: ${plan.applicationForm ? `"${plan.applicationForm.title}" (ID: ${plan.applicationForm.id})` : 'None'}`);
      console.log('');
    });

    console.log('✅ Plan-to-form linking completed!');
  } catch (error) {
    console.error('❌ Error linking plans to forms:', error);
  }
}

// Run the script
linkPlansToForms()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
