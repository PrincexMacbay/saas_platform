const { sequelize } = require('../models');

/**
 * Migration script to add hasGroupChat field to plans table
 * This ensures that existing plans get the default false value
 * Idempotent: can be run multiple times safely
 */
async function migratePlanGroupChat() {
  try {
    console.log('🔄 Starting plan group chat migration...');
    
    // Check if hasGroupChat column exists in the database
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'plans' AND column_name = 'hasGroupChat'
    `);
    
    if (results.length === 0) {
      console.log('📝 hasGroupChat column does not exist, adding it...');
      await sequelize.query(`
        ALTER TABLE plans ADD COLUMN "hasGroupChat" BOOLEAN DEFAULT false NOT NULL
      `);
      console.log('✅ hasGroupChat column added successfully');
    } else {
      console.log('✅ hasGroupChat column already exists');
    }
    
    // Note: When adding a column with DEFAULT false NOT NULL,
    // PostgreSQL automatically sets all existing rows to false
    // So no additional UPDATE is needed

    console.log('🎉 Plan group chat migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during plan group chat migration:', error);
    // Don't throw - allow server to continue if migration fails
    // The column might already exist or there might be a temporary DB issue
    console.log('⚠️  Migration failed but server will continue. You can run the migration manually later.');
  }
}

// Run migration if called directly
if (require.main === module) {
  migratePlanGroupChat()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migratePlanGroupChat;
