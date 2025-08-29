const { sequelize, User, UserProfile, IndividualProfile, CompanyProfile } = require('../models');

async function decomposeUsersTable() {
  try {
    console.log('Starting users table decomposition...');

    // Step 1: Create new tables
    console.log('Creating new tables...');
    await sequelize.sync({ force: false }); // This will create the new tables

    // Step 2: Get all existing users
    console.log('Fetching existing users...');
    const users = await User.findAll({
      raw: true
    });

    console.log(`Found ${users.length} users to migrate`);

    // Step 3: Migrate data to new tables
    for (const user of users) {
      console.log(`Migrating user: ${user.username} (ID: ${user.id})`);

      // Create UserProfile
      const userProfileData = {
        userId: user.id,
        userType: user.userType || 'individual', // Default to individual if not set
        organizationId: user.organizationId,
        organizationRole: user.organizationRole
      };

      await UserProfile.create(userProfileData);

      // Create specific profile based on userType
      if (user.userType === 'individual') {
        const individualProfileData = {
          userId: user.id,
          resume: user.resume,
          workExperience: user.workExperience,
          jobPreferences: user.jobPreferences
        };

        await IndividualProfile.create(individualProfileData);
        console.log(`Created individual profile for user ${user.id}`);
      } else if (user.userType === 'company') {
        const companyProfileData = {
          userId: user.id,
          companyName: user.companyName,
          companyLogo: user.companyLogo,
          industry: user.industry,
          companySize: user.companySize,
          website: user.website,
          location: user.location
        };

        await CompanyProfile.create(companyProfileData);
        console.log(`Created company profile for user ${user.id}`);
      } else {
        console.log(`User ${user.id} has no specific profile type, skipping profile creation`);
      }
    }

    console.log('Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify the data migration was successful');
    console.log('2. Update your application code to use the new models');
    console.log('3. Drop the old columns from the users table (optional)');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  decomposeUsersTable()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = decomposeUsersTable;
