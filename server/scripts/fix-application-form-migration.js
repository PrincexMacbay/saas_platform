const { sequelize, ApplicationForm, Organization } = require('../models');

const fixApplicationFormMigration = async () => {
  try {
    console.log('🔧 Fixing ApplicationForm migration...');

    // First, check if the organizationId column exists
    const tableInfo = await sequelize.getQueryInterface().describeTable('application_forms');
    const hasOrganizationId = tableInfo.organizationId;

    if (!hasOrganizationId) {
      console.log('📝 Adding organizationId column...');
      
      // Step 1: Add the column as nullable first
      await sequelize.getQueryInterface().addColumn(
        'application_forms',
        'organizationId',
        {
          type: sequelize.Sequelize.INTEGER,
          allowNull: true, // Allow null initially
          references: {
            model: 'organizations',
            key: 'id',
          },
        }
      );
      console.log('✅ Added organizationId column (nullable)');
    }

    // Step 2: Get the first organization to use as default
    const firstOrg = await Organization.findOne();
    if (!firstOrg) {
      console.log('❌ No organizations found. Creating a default organization...');
      
      // Create a default organization
      const defaultOrg = await Organization.create({
        name: 'Default Organization',
        description: 'Default organization for existing application forms',
        email: 'admin@example.com',
        ownerId: 1 // Assuming user ID 1 exists
      });
      
      console.log(`✅ Created default organization with ID: ${defaultOrg.id}`);
      
      // Update all NULL organizationId values to the default organization
      await sequelize.query(
        'UPDATE application_forms SET "organizationId" = :orgId WHERE "organizationId" IS NULL',
        { 
          replacements: { orgId: defaultOrg.id },
          type: sequelize.QueryTypes.UPDATE 
        }
      );
    } else {
      // Update all NULL organizationId values to the first organization
      await sequelize.query(
        'UPDATE application_forms SET "organizationId" = :orgId WHERE "organizationId" IS NULL',
        { 
          replacements: { orgId: firstOrg.id },
          type: sequelize.QueryTypes.UPDATE 
        }
      );
      console.log(`✅ Updated NULL organizationId values to organization ID: ${firstOrg.id}`);
    }

    // Step 3: Now change the column to NOT NULL
    await sequelize.getQueryInterface().changeColumn(
      'application_forms',
      'organizationId',
      {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
      }
    );
    console.log('✅ Changed organizationId column to NOT NULL');

    console.log('🎉 ApplicationForm migration fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing ApplicationForm migration:', error);
    throw error;
  }
};

// Run the migration if called directly
if (require.main === module) {
  fixApplicationFormMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = fixApplicationFormMigration;
