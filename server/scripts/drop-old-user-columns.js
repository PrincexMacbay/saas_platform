const { sequelize } = require('../config/database');

async function dropOldUserColumns() {
  try {
    console.log('Dropping old columns from users table...');

    // List of columns to drop
    const columnsToDrop = [
      'userType',
      'resume',
      'workExperience', 
      'jobPreferences',
      'companyName',
      'companyLogo',
      'industry',
      'companySize',
      'website',
      'location',
      'organizationId',
      'organizationRole'
    ];

    for (const column of columnsToDrop) {
      try {
        console.log(`Dropping column: ${column}`);
        await sequelize.query(`ALTER TABLE users DROP COLUMN IF EXISTS "${column}"`);
        console.log(`Successfully dropped column: ${column}`);
      } catch (error) {
        console.log(`Column ${column} doesn't exist or couldn't be dropped:`, error.message);
      }
    }

    console.log('Successfully dropped old columns from users table!');
    console.log('\nUsers table now contains only core personal information:');
    console.log('- id, guid, username, email, password');
    console.log('- firstName, lastName, about');
    console.log('- profileImage, coverImage');
    console.log('- status, visibility, language, timezone');
    console.log('- lastLogin, createdAt, updatedAt');

  } catch (error) {
    console.error('Failed to drop old columns:', error);
    throw error;
  }
}

// Run the script if executed directly
if (require.main === module) {
  dropOldUserColumns()
    .then(() => {
      console.log('Column cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Column cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = dropOldUserColumns;
