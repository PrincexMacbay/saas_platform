const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testApplyForm() {
  try {
    console.log('Testing application form fetching...\n');

    // 1. Get all plans
    console.log('1. Fetching plans...');
    const plansResponse = await axios.get(`${API_BASE}/public/plans`);
    const plans = plansResponse.data.data;
    console.log('Plans found:', plans.length);
    
    // Find a plan with organization
    const planWithOrg = plans.find(p => p.organizationId);
    if (!planWithOrg) {
      console.log('No plans with organization found');
      return;
    }
    
    console.log('Selected plan:', {
      id: planWithOrg.id,
      name: planWithOrg.name,
      applicationFormId: planWithOrg.applicationFormId,
      useDefaultForm: planWithOrg.useDefaultForm,
      organizationId: planWithOrg.organizationId
    });

    // 2. Test form fetching logic
    console.log('\n2. Testing form fetching logic...');
    
    let formResponse;
    if (planWithOrg.applicationFormId && !planWithOrg.useDefaultForm) {
      console.log('Fetching plan-specific form:', planWithOrg.applicationFormId);
      formResponse = await axios.get(`${API_BASE}/public/application-form/plan/${planWithOrg.applicationFormId}`);
    } else if (planWithOrg.organizationId) {
      console.log('Fetching organization default form:', planWithOrg.organizationId);
      formResponse = await axios.get(`${API_BASE}/public/application-form/${planWithOrg.organizationId}`);
    } else {
      console.log('Fetching default form');
      formResponse = await axios.get(`${API_BASE}/public/application-form`);
    }

    console.log('Form response:', JSON.stringify(formResponse.data, null, 2));

    // 3. Test the specific plan endpoint
    console.log('\n3. Testing specific plan endpoint...');
    const planResponse = await axios.get(`${API_BASE}/public/plans/${planWithOrg.id}`);
    console.log('Plan details:', JSON.stringify(planResponse.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testApplyForm();



