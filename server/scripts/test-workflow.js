const sequelize = require('../config/database');
const { Plan, Organization, ApplicationForm, User } = require('../models');

async function testWorkflow() {
  try {
    console.log('🧪 Testing Complete Membership Workflow...\n');

    // Step 1: Check Organizations
    console.log('📋 STEP 1: Checking Organizations');
    const organizations = await Organization.findAll();
    console.log(`Found ${organizations.length} organizations:`);
    organizations.forEach(org => {
      console.log(`  - ${org.name} (ID: ${org.id})`);
    });

    // Step 2: Check Application Forms
    console.log('\n📝 STEP 2: Checking Application Forms');
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
      console.log(`  - "${form.title}" (ID: ${form.id})`);
      console.log(`    Organization: ${form.formOrganization?.name || 'None'}`);
      console.log(`    Published: ${form.isPublished}`);
      console.log(`    Fields: ${form.fields ? JSON.parse(form.fields).length : 0}`);
    });

    // Step 3: Check Plans
    console.log('\n💼 STEP 3: Checking Plans');
    const plans = await Plan.findAll({
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

    console.log(`Found ${plans.length} plans:`);
    plans.forEach(plan => {
      console.log(`  - "${plan.name}" (ID: ${plan.id})`);
      console.log(`    Organization: ${plan.planOrganization?.name || 'None'}`);
      console.log(`    Use Default Form: ${plan.useDefaultForm}`);
      console.log(`    Specific Form: ${plan.applicationForm ? `"${plan.applicationForm.title}" (ID: ${plan.applicationForm.id})` : 'None'}`);
    });

    // Step 4: Validate Workflow
    console.log('\n✅ STEP 4: Validating Workflow');
    
    let workflowIssues = [];

    // Check if plans have proper form associations
    plans.forEach(plan => {
      if (plan.organizationId) {
        if (plan.useDefaultForm) {
          // Check if organization has a default form
          const orgDefaultForm = forms.find(f => 
            f.organizationId === plan.organizationId && 
            f.isPublished && 
            f.title.toLowerCase().includes('membership application')
          );
          
          if (!orgDefaultForm) {
            workflowIssues.push(`Plan "${plan.name}" uses default form but organization has no published default form`);
          }
        } else {
          // Check if specific form exists and is published
          if (!plan.applicationForm) {
            workflowIssues.push(`Plan "${plan.name}" has no specific form selected`);
          } else if (!plan.applicationForm.isPublished) {
            workflowIssues.push(`Plan "${plan.name}" uses unpublished form "${plan.applicationForm.title}"`);
          }
        }
      } else {
        workflowIssues.push(`Plan "${plan.name}" has no organization - cannot be used for applications`);
      }
    });

    // Check if organizations have published forms
    organizations.forEach(org => {
      const orgForms = forms.filter(f => f.organizationId === org.id);
      const publishedForms = orgForms.filter(f => f.isPublished);
      
      if (publishedForms.length === 0) {
        workflowIssues.push(`Organization "${org.name}" has no published forms`);
      }
    });

    // Report Results
    if (workflowIssues.length === 0) {
      console.log('🎉 All workflow validations passed!');
      console.log('✅ Plans are properly linked to forms');
      console.log('✅ Organizations have published forms');
      console.log('✅ Application workflow is ready');
    } else {
      console.log('⚠️  Workflow issues found:');
      workflowIssues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }

    // Step 5: Show API Endpoints for Testing
    console.log('\n🔗 STEP 5: API Endpoints for Testing');
    console.log('\nBackend API Endpoints:');
    console.log('  GET  /api/membership/application-forms - List user\'s forms');
    console.log('  POST /api/membership/application-form - Create form');
    console.log('  POST /api/membership/application-form/publish - Publish form');
    console.log('  GET  /api/membership/plans - List user\'s plans');
    console.log('  POST /api/membership/plans - Create plan (requires form selection)');
    console.log('  GET  /api/public/plans - List public plans');
    console.log('  GET  /api/public/application-form/:organizationId - Get form for plan');
    console.log('  POST /api/public/apply - Submit application');

    console.log('\nFrontend Routes:');
    console.log('  /membership/application-form-builder - Create application forms');
    console.log('  /membership/plans - Manage plans');
    console.log('  /browse-memberships - Browse public plans');
    console.log('  /apply/:planId - Apply for membership');

    console.log('\n📋 Workflow Summary:');
    console.log('1. User creates application form in Application Form Builder');
    console.log('2. User publishes the form');
    console.log('3. User creates plan and selects the published form');
    console.log('4. Public users browse plans at /browse-memberships');
    console.log('5. Users click "Apply" and fill out the selected form');
    console.log('6. Application is submitted and saved');

    console.log('\n✅ Workflow test completed!');
  } catch (error) {
    console.error('❌ Error testing workflow:', error);
  }
}

// Run the test
testWorkflow()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
