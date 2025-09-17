const { sequelize } = require('../config/database');

async function fixApplicationFormsCreatedBy() {
  try {
    console.log('Starting migration: Fixing createdBy column in application_forms table...');
    
    // First, check if the column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'application_forms' 
      AND column_name = 'createdBy'
    `);
    
    if (results.length > 0) {
      console.log('✅ createdBy column already exists in application_forms table');
      
      // Check if there are any null values
      const [nullResults] = await sequelize.query(`
        SELECT COUNT(*) as count FROM application_forms WHERE "createdBy" IS NULL
      `);
      
      if (nullResults[0].count > 0) {
        console.log(`Found ${nullResults[0].count} records with null createdBy values`);
        
        // Get the first user ID to use as default
        const [userResults] = await sequelize.query(`
          SELECT id FROM users LIMIT 1
        `);
        
        if (userResults.length > 0) {
          const defaultUserId = userResults[0].id;
          await sequelize.query(`
            UPDATE application_forms 
            SET "createdBy" = ${defaultUserId} 
            WHERE "createdBy" IS NULL
          `);
          console.log(`✅ Updated ${nullResults[0].count} records to be created by user ID ${defaultUserId}`);
        }
      }
      
      return;
    }
    
    // Step 1: Add the column as nullable first
    await sequelize.query(`
      ALTER TABLE application_forms 
      ADD COLUMN "createdBy" INTEGER
    `);
    console.log('✅ Added createdBy column as nullable');
    
    // Step 2: Get the first user ID to use as default
    const [userResults] = await sequelize.query(`
      SELECT id FROM users LIMIT 1
    `);
    
    if (userResults.length === 0) {
      throw new Error('No users found in database. Cannot set default createdBy values.');
    }
    
    const defaultUserId = userResults[0].id;
    
    // Step 3: Update existing records with default user ID
    await sequelize.query(`
      UPDATE application_forms 
      SET "createdBy" = ${defaultUserId}
    `);
    console.log(`✅ Updated existing application forms to be created by user ID ${defaultUserId}`);
    
    // Step 4: Make the column NOT NULL
    await sequelize.query(`
      ALTER TABLE application_forms 
      ALTER COLUMN "createdBy" SET NOT NULL
    `);
    console.log('✅ Made createdBy column NOT NULL');
    
    // Step 5: Add foreign key constraint
    await sequelize.query(`
      ALTER TABLE application_forms 
      ADD CONSTRAINT fk_application_forms_createdBy 
      FOREIGN KEY ("createdBy") REFERENCES users(id) 
      ON DELETE CASCADE
    `);
    console.log('✅ Added foreign key constraint for createdBy column');
    
    // Step 6: Add comment
    await sequelize.query(`
      COMMENT ON COLUMN application_forms."createdBy" IS 'User who created this application form'
    `);
    console.log('✅ Added comment to createdBy column');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  fixApplicationFormsCreatedBy()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = fixApplicationFormsCreatedBy;
