const bcrypt = require('bcryptjs');
const { User, UserProfile } = require('../models');
require('dotenv').config();

/**
 * Production Admin Seeder
 * Creates a default admin user for production deployments
 * This script is safe to run multiple times and won't duplicate admin records
 */
async function seedProductionAdmin() {
  try {
    console.log('🔧 Production Admin Seeder Starting...');
    
    // Get admin credentials from environment variables or use defaults
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin';
    const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: ADMIN_EMAIL },
          { username: ADMIN_USERNAME }
        ]
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists:');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Username: ${existingAdmin.username}`);
      console.log(`🆔 User ID: ${existingAdmin.id}`);
      return existingAdmin;
    }

    console.log('🔧 Creating production admin account...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create admin user
    const admin = await User.create({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: hashedPassword,
      status: 1,
      isOrganization: false,
      visibility: 2, // Public visibility for admin
      language: 'en',
      timezone: 'UTC'
    });

    // Create admin profile
    await UserProfile.create({
      userId: admin.id,
      userType: 'individual'
    });

    console.log('✅ ============================================');
    console.log('✅ Production Admin Account Created Successfully!');
    console.log('✅ ============================================');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`👤 Username: ${ADMIN_USERNAME}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`🆔 User ID: ${admin.id}`);
    console.log('✅ ============================================');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('✅ ============================================');

    return admin;

  } catch (error) {
    console.error('❌ Error creating production admin:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProductionAdmin()
    .then(() => {
      console.log('🎉 Production admin seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production admin seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedProductionAdmin;
