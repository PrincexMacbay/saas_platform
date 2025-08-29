const { sequelize, User, UserProfile, IndividualProfile, CompanyProfile } = require('../models');

async function createMissingProfiles() {
  try {
    console.log('Creating missing profile data for existing users...\n');

    // Get all users
    const users = await User.findAll({
      include: [
        {
          model: UserProfile,
          as: 'profile'
        },
        {
          model: IndividualProfile,
          as: 'individualProfile'
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ]
    });

    console.log(`Found ${users.length} users to process\n`);

    for (const user of users) {
      console.log(`Processing user: ${user.username} (ID: ${user.id})`);

      // Check if user has a profile
      if (!user.profile) {
        console.log(`  Creating UserProfile for ${user.username}...`);
        await UserProfile.create({
          userId: user.id,
          userType: 'individual' // Default to individual
        });
        console.log(`  ✅ UserProfile created`);
      } else {
        console.log(`  ✅ UserProfile already exists (Type: ${user.profile.userType})`);
      }

      // For demonstration, let's create some sample data
      // You can modify this based on your needs
      if (!user.individualProfile && !user.companyProfile) {
        // Create individual profile for demonstration
        console.log(`  Creating IndividualProfile for ${user.username}...`);
        await IndividualProfile.create({
          userId: user.id,
          resume: null,
          workExperience: 'Sample work experience',
          jobPreferences: 'Looking for opportunities in technology'
        });
        console.log(`  ✅ IndividualProfile created`);
      } else {
        if (user.individualProfile) {
          console.log(`  ✅ IndividualProfile already exists`);
        }
        if (user.companyProfile) {
          console.log(`  ✅ CompanyProfile already exists`);
        }
      }

      console.log('  ---');
    }

    console.log('\n✅ Profile creation completed!');
    
    // Show summary
    const userProfileCount = await UserProfile.count();
    const individualProfileCount = await IndividualProfile.count();
    const companyProfileCount = await CompanyProfile.count();

    console.log('\n=== Final Summary ===');
    console.log(`User Profiles: ${userProfileCount}`);
    console.log(`Individual Profiles: ${individualProfileCount}`);
    console.log(`Company Profiles: ${companyProfileCount}`);

  } catch (error) {
    console.error('❌ Error creating profiles:', error);
  }
}

// Interactive function to set user type
async function setUserType() {
  try {
    console.log('\n=== Set User Type ===');
    console.log('This will help you set the correct user type for each user.\n');

    const users = await User.findAll({
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    console.log('Available users:');
    users.forEach((user, index) => {
      const userType = user.profile ? user.profile.userType : 'none';
      console.log(`${index + 1}. ${user.username} (ID: ${user.id}) - Current Type: ${userType}`);
    });

    console.log('\nTo set user types, you can:');
    console.log('1. Run this script and manually update each user');
    console.log('2. Use the application interface to update user types');
    console.log('3. Directly update the database with SQL commands');

    console.log('\nExample SQL to set a user as company:');
    console.log('UPDATE user_profiles SET "userType" = \'company\' WHERE "userId" = 1;');
    console.log('INSERT INTO company_profiles ("userId", "companyName", "industry") VALUES (1, \'My Company\', \'Technology\');');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the functions if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--set-type')) {
    setUserType()
      .then(() => {
        console.log('\nSet type check completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Set type check failed:', error);
        process.exit(1);
      });
  } else {
    createMissingProfiles()
      .then(() => {
        console.log('\nProfile creation completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Profile creation failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { createMissingProfiles, setUserType };
