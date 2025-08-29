const { sequelize, User, UserProfile, IndividualProfile, CompanyProfile } = require('../models');

async function verifyMigration() {
  try {
    console.log('Verifying database migration...\n');

    // Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Get all user profiles
    const userProfiles = await UserProfile.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['username', 'email'] 
      }]
    });

    console.log('=== User Profiles ===');
    userProfiles.forEach(profile => {
      console.log(`User: ${profile.user.username}, Type: ${profile.userType}, Org: ${profile.organizationId || 'None'}`);
    });

    // Get individual profiles
    const individualProfiles = await IndividualProfile.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['username'] 
      }]
    });

    console.log('\n=== Individual Profiles ===');
    individualProfiles.forEach(profile => {
      console.log(`User: ${profile.user.username}, Resume: ${profile.resume ? 'Yes' : 'No'}, Experience: ${profile.workExperience ? 'Yes' : 'No'}`);
    });

    // Get company profiles
    const companyProfiles = await CompanyProfile.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['username'] 
      }]
    });

    console.log('\n=== Company Profiles ===');
    companyProfiles.forEach(profile => {
      console.log(`User: ${profile.user.username}, Company: ${profile.companyName || 'Not set'}, Industry: ${profile.industry || 'Not set'}`);
    });

    console.log('\n✅ Migration verification completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Total User Profiles: ${userProfiles.length}`);
    console.log(`- Individual Profiles: ${individualProfiles.length}`);
    console.log(`- Company Profiles: ${companyProfiles.length}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyMigration()
    .then(() => {
      console.log('\nVerification completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = verifyMigration;
