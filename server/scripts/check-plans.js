const { Plan, Organization } = require('../models');

async function checkPlans() {
  try {
    const plans = await Plan.findAll({
      include: [
        {
          model: Organization,
          as: 'planOrganization',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log('Plans in database:');
    plans.forEach(plan => {
      console.log({
        id: plan.id,
        name: plan.name,
        applicationFormId: plan.applicationFormId,
        useDefaultForm: plan.useDefaultForm,
        organizationId: plan.organizationId,
        organizationName: plan.planOrganization?.name
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking plans:', error);
    process.exit(1);
  }
}

checkPlans();



