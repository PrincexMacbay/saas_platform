const { sequelize } = require('../config/database');

async function addCreatedByToApplicationForms() {
  try {
    console.log('Starting migration: Adding createdBy column to application_forms table...');
    
    // First, check if the column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'application_forms' 
      AND column_name = 'createdBy'
    `);
    
    if (results.length > 0) {
      console.log('✅ createdBy column already exists in application_forms table');
      return;
    }
    
    // Add the createdBy column
    await sequelize.query(`
      ALTER TABLE application_forms 
      ADD COLUMN "createdBy" INTEGER NOT NULL DEFAULT 1
    `);
    
    console.log('✅ Added createdBy column to application_forms table');
    
    // Add foreign key constraint
    await sequelize.query(`
      ALTER TABLE application_forms 
      ADD CONSTRAINT fk_application_forms_createdBy 
      FOREIGN KEY ("createdBy") REFERENCES users(id) 
      ON DELETE CASCADE
    `);
    
    console.log('✅ Added foreign key constraint for createdBy column');
    
    // Update existing records to have a default createdBy value
    // We'll set them to user ID 1 (assuming there's at least one user)
    const [userResults] = await sequelize.query(`
      SELECT id FROM users LIMIT 1
    `);
    
    if (userResults.length > 0) {
      const defaultUserId = userResults[0].id;
      await sequelize.query(`
        UPDATE application_forms 
        SET "createdBy" = ${defaultUserId} 
        WHERE "createdBy" = 1
      `);
      console.log(`✅ Updated existing application forms to be created by user ID ${defaultUserId}`);
    }
    
    // Remove the default value since we've populated the data
    await sequelize.query(`
      ALTER TABLE application_forms 
      ALTER COLUMN "createdBy" DROP DEFAULT
    `);
    
    console.log('✅ Removed default value from createdBy column');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addCreatedByToApplicationForms()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCreatedByToApplicationForms;
