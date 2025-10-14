const { User } = require('../models');

/**
 * Migration script to add role field to existing users
 * This ensures that existing users get the default 'user' role
 */
async function migrateUserRoles() {
  try {
    console.log('🔄 Starting user roles migration...');
    
    // Check if role column exists in the database
    const sequelize = require('../models').sequelize;
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (results.length === 0) {
      console.log('📝 Role column does not exist, adding it...');
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL
      `);
      console.log('✅ Role column added successfully');
    } else {
      console.log('✅ Role column already exists');
    }
    
    // Get all users without a role field (or with null/empty role)
    const usersWithoutRole = await User.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { role: null },
          { role: '' }
        ]
      }
    });

    console.log(`📊 Found ${usersWithoutRole.length} users without role field`);

    if (usersWithoutRole.length > 0) {
      // Update all users without role to have 'user' role
      await User.update(
        { role: 'user' },
        { 
          where: {
            [require('sequelize').Op.or]: [
              { role: null },
              { role: '' }
            ]
          }
        }
      );

      console.log('✅ Successfully updated users with default role');
    }

    // Also check for admin users and ensure they have admin role
    const adminUsers = await User.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { email: process.env.ADMIN_EMAIL || 'admin@yourdomain.com' },
          { username: process.env.ADMIN_USERNAME || 'superadmin' }
        ]
      }
    });

    for (const adminUser of adminUsers) {
      if (adminUser.role !== 'admin') {
        await adminUser.update({ role: 'admin' });
        console.log(`✅ Updated admin user: ${adminUser.email} to admin role`);
      }
    }

    console.log('🎉 User roles migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during user roles migration:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateUserRoles()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateUserRoles;
