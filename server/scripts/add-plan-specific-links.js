const sequelize = require('../config/database');

async function addPlanSpecificLinks() {
  try {
    console.log('🔄 Adding plan-specific linking fields...');

    // Add applicationFormId and useDefaultForm to plans table
    await sequelize.query(`
      ALTER TABLE plans 
      ADD COLUMN IF NOT EXISTS "applicationFormId" INTEGER REFERENCES application_forms(id),
      ADD COLUMN IF NOT EXISTS "useDefaultForm" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "digitalCardTemplateId" INTEGER REFERENCES digital_cards(id),
      ADD COLUMN IF NOT EXISTS "useDefaultCardTemplate" BOOLEAN DEFAULT true;
    `);

    // Add organizationId to digital_cards table
    await sequelize.query(`
      ALTER TABLE digital_cards 
      ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id);
    `);

    console.log('✅ Successfully added plan-specific linking fields!');
    console.log('');
    console.log('📋 Added fields:');
    console.log('  - plans.applicationFormId (links to specific application form)');
    console.log('  - plans.useDefaultForm (use org default or plan-specific form)');
    console.log('  - plans.digitalCardTemplateId (links to specific digital card template)');
    console.log('  - plans.useDefaultCardTemplate (use org default or plan-specific template)');
    console.log('  - digital_cards.organizationId (links card templates to organizations)');
    console.log('');
    console.log('🎯 How it works:');
    console.log('  1. Plans can now link directly to specific application forms');
    console.log('  2. Plans can now link directly to specific digital card templates');
    console.log('  3. If useDefaultForm/useDefaultCardTemplate is true, uses organization defaults');
    console.log('  4. If false, uses the plan-specific form/template');

  } catch (error) {
    console.error('❌ Error adding plan-specific linking fields:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addPlanSpecificLinks();
