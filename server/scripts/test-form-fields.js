const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFormFields() {
  try {
    console.log('Testing form fields...\n');

    // Get the form for organization 1
    const formResponse = await axios.get(`${API_BASE}/public/application-form/1`);
    const form = formResponse.data.data;
    
    console.log('Form title:', form.title);
    console.log('Form fields count:', form.fields ? form.fields.length : 0);
    
    if (form.fields && form.fields.length > 0) {
      console.log('\nForm fields:');
      form.fields.forEach((field, index) => {
        console.log(`${index + 1}. ${field.label} (${field.name})`);
        console.log(`   Type: ${field.inputType || field.dataType}`);
        console.log(`   Required: ${field.required}`);
        console.log(`   Placeholder: ${field.placeholder}`);
        console.log('');
      });
    } else {
      console.log('No fields found in form');
    }

    // Test the ApplyMembership page logic
    console.log('\nTesting ApplyMembership logic...');
    
    // Get plans
    const plansResponse = await axios.get(`${API_BASE}/public/plans`);
    const plans = plansResponse.data.data;
    const planWithOrg = plans.find(p => p.organizationId);
    
    if (planWithOrg) {
      console.log('Plan found:', planWithOrg.name);
      console.log('Plan config:', {
        applicationFormId: planWithOrg.applicationFormId,
        useDefaultForm: planWithOrg.useDefaultForm,
        organizationId: planWithOrg.organizationId
      });
      
      // Simulate the form fetching logic
      let formResponse2;
      if (planWithOrg.applicationFormId && !planWithOrg.useDefaultForm) {
        console.log('Would fetch plan-specific form');
        formResponse2 = await axios.get(`${API_BASE}/public/application-form/plan/${planWithOrg.applicationFormId}`);
      } else if (planWithOrg.organizationId) {
        console.log('Would fetch organization default form');
        formResponse2 = await axios.get(`${API_BASE}/public/application-form/${planWithOrg.organizationId}`);
      } else {
        console.log('Would fetch default form');
        formResponse2 = await axios.get(`${API_BASE}/public/application-form`);
      }
      
      const form2 = formResponse2.data.data;
      console.log('Form fetched:', form2.title);
      console.log('Fields in fetched form:', form2.fields ? form2.fields.length : 0);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFormFields();

