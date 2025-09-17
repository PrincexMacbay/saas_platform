const sequelize = require('../config/database');

async function fixApplicationFormsData() {
  try {
    console.log('Starting data fix for application_forms table...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if createdBy column exists
    const [columnCheck] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'application_forms' 
      AND column_name = 'createdBy'
    `);
    
    if (columnCheck.length === 0) {
      console.log('❌ createdBy column does not exist');
      return;
    }
    
    console.log('✅ createdBy column exists');
    
    // Get first user ID
    const [users] = await sequelize.query(`
      SELECT id FROM users LIMIT 1
    `);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const defaultUserId = users[0].id;
    console.log(`✅ Using user ID ${defaultUserId} as default`);
    
    // Check for null values
    const [nullCheck] = await sequelize.query(`
      SELECT COUNT(*) as count FROM application_forms WHERE "createdBy" IS NULL
    `);
    
    console.log(`Found ${nullCheck[0].count} records with null createdBy values`);
    
    if (nullCheck[0].count > 0) {
      // Update null values
      await sequelize.query(`
        UPDATE application_forms 
        SET "createdBy" = ${defaultUserId} 
        WHERE "createdBy" IS NULL
      `);
      console.log(`✅ Updated ${nullCheck[0].count} records`);
    }
    
    // Check total records
    const [totalCheck] = await sequelize.query(`
      SELECT COUNT(*) as count FROM application_forms
    `);
    
    console.log(`Total application forms: ${totalCheck[0].count}`);
    
    console.log('🎉 Data fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Data fix failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixApplicationFormsData()
    .then(() => {
      console.log('Data fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Data fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixApplicationFormsData;
