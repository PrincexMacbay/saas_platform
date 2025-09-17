const sequelize = require('../config/database');

async function fixApplicationFormsOrganizationId() {
  try {
    console.log('🔄 Fixing application_forms organizationId constraint...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Check current constraint
    const [constraintCheck] = await sequelize.query(`
      SELECT 
        column_name, 
        is_nullable, 
        data_type 
      FROM information_schema.columns 
      WHERE table_name = 'application_forms' 
      AND column_name = 'organizationId'
    `);
    
    if (constraintCheck.length > 0) {
      const column = constraintCheck[0];
      console.log(`📋 Current organizationId column: ${column.column_name}, nullable: ${column.is_nullable}`);
      
      if (column.is_nullable === 'NO') {
        console.log('🔧 Making organizationId nullable...');
        
        // Make the column nullable
        await sequelize.query(`
          ALTER TABLE application_forms 
          ALTER COLUMN "organizationId" DROP NOT NULL
        `);
        
        console.log('✅ organizationId is now nullable');
      } else {
        console.log('✅ organizationId is already nullable');
      }
    } else {
      console.log('❌ application_forms table or organizationId column not found');
    }
    
    // Verify the change
    const [verifyCheck] = await sequelize.query(`
      SELECT 
        column_name, 
        is_nullable, 
        data_type 
      FROM information_schema.columns 
      WHERE table_name = 'application_forms' 
      AND column_name = 'organizationId'
    `);
    
    if (verifyCheck.length > 0) {
      const column = verifyCheck[0];
      console.log(`✅ Verified: organizationId is now ${column.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
    }
    
    console.log('🎉 Database constraint fix completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database constraint fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

fixApplicationFormsOrganizationId();
