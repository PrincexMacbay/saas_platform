const sequelize = require('../config/database');

async function checkDatabase() {
  try {
    console.log('Checking database structure...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Check users table columns
    const usersColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('=== Users Table Columns ===');
    usersColumns.forEach(col => {
      console.log(`- ${col.column_name}`);
    });

    // Check if career-related columns exist
    const careerColumns = usersColumns.filter(col => 
      ['userType', 'resume', 'workExperience', 'jobPreferences', 
       'companyName', 'companyLogo', 'industry', 'companySize', 
       'website', 'location', 'organizationId', 'organizationRole'].includes(col.column_name)
    );

    console.log('\n=== Career-Related Columns Found ===');
    if (careerColumns.length === 0) {
      console.log('❌ No career-related columns found in users table');
    } else {
      careerColumns.forEach(col => {
        console.log(`✅ ${col.column_name}`);
      });
    }

    // Check new profile tables
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_profiles', 'individual_profiles', 'company_profiles')
      ORDER BY table_name;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n=== New Profile Tables ===');
    tables.forEach(table => {
      console.log(`✅ ${table.table_name}`);
    });

    // Count records in each table
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users;', { type: sequelize.QueryTypes.SELECT });
    const userProfileCount = await sequelize.query('SELECT COUNT(*) as count FROM user_profiles;', { type: sequelize.QueryTypes.SELECT });
    const individualProfileCount = await sequelize.query('SELECT COUNT(*) as count FROM individual_profiles;', { type: sequelize.QueryTypes.SELECT });
    const companyProfileCount = await sequelize.query('SELECT COUNT(*) as count FROM company_profiles;', { type: sequelize.QueryTypes.SELECT });

    console.log('\n=== Record Counts ===');
    console.log(`Users: ${userCount[0].count}`);
    console.log(`User Profiles: ${userProfileCount[0].count}`);
    console.log(`Individual Profiles: ${individualProfileCount[0].count}`);
    console.log(`Company Profiles: ${companyProfileCount[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  checkDatabase()
    .then(() => {
      console.log('\nCheck completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Check failed:', error);
      process.exit(1);
    });
}

module.exports = checkDatabase;
