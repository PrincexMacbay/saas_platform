const { sequelize } = require('../config/database');

async function checkOriginalData() {
  try {
    console.log('Checking original users table structure...\n');

    // Check if the old columns still exist in the users table
    const tableInfo = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('=== Current Users Table Columns ===');
    tableInfo.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if there are any users with career-related data
    const usersWithCareerData = await sequelize.query(`
      SELECT id, username, email, 
             "userType", resume, "workExperience", "jobPreferences",
             "companyName", "companyLogo", industry, "companySize", website, location,
             "organizationId", "organizationRole"
      FROM users 
      WHERE "userType" IS NOT NULL 
         OR resume IS NOT NULL 
         OR "workExperience" IS NOT NULL 
         OR "jobPreferences" IS NOT NULL
         OR "companyName" IS NOT NULL
         OR "companyLogo" IS NOT NULL
         OR industry IS NOT NULL
         OR "companySize" IS NOT NULL
         OR website IS NOT NULL
         OR location IS NOT NULL
         OR "organizationId" IS NOT NULL
         OR "organizationRole" IS NOT NULL;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n=== Users with Career/Organization Data ===');
    if (usersWithCareerData.length === 0) {
      console.log('No users found with career or organization data.');
    } else {
      usersWithCareerData.forEach(user => {
        console.log(`User: ${user.username} (ID: ${user.id})`);
        console.log(`  userType: ${user.userType}`);
        console.log(`  resume: ${user.resume ? 'Yes' : 'No'}`);
        console.log(`  workExperience: ${user.workExperience ? 'Yes' : 'No'}`);
        console.log(`  jobPreferences: ${user.jobPreferences ? 'Yes' : 'No'}`);
        console.log(`  companyName: ${user.companyName || 'None'}`);
        console.log(`  industry: ${user.industry || 'None'}`);
        console.log(`  organizationId: ${user.organizationId || 'None'}`);
        console.log('  ---');
      });
    }

    // Check the new profile tables
    const userProfiles = await sequelize.query('SELECT COUNT(*) as count FROM user_profiles;', { type: sequelize.QueryTypes.SELECT });
    const individualProfiles = await sequelize.query('SELECT COUNT(*) as count FROM individual_profiles;', { type: sequelize.QueryTypes.SELECT });
    const companyProfiles = await sequelize.query('SELECT COUNT(*) as count FROM company_profiles;', { type: sequelize.QueryTypes.SELECT });

    console.log('\n=== New Profile Tables Count ===');
    console.log(`User Profiles: ${userProfiles[0].count}`);
    console.log(`Individual Profiles: ${individualProfiles[0].count}`);
    console.log(`Company Profiles: ${companyProfiles[0].count}`);

  } catch (error) {
    console.error('Error checking original data:', error);
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkOriginalData()
    .then(() => {
      console.log('\nCheck completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Check failed:', error);
      process.exit(1);
    });
}

module.exports = checkOriginalData;
