const bcrypt = require('bcryptjs');
const { User, UserProfile } = require('../models');

const initializeAdmin = async () => {
  try {
    console.log('🔧 Checking for admin account...');
    
    // Get admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'superadmin';
    const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Super';
    const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Admin';

    // Check if admin exists by email
    const adminExists = await User.findOne({ 
      where: { email: ADMIN_EMAIL } 
    });

    if (!adminExists) {
      console.log('🔧 No admin found. Creating default admin account...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

      // Create admin user
      const admin = await User.create({
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
        status: 1,
        isEmailVerified: true
      });

      // Create admin profile
      await UserProfile.create({
        userId: admin.id,
        bio: 'System Administrator with full access to all platform features',
        userType: 'individual',
        organizationId: null
      });

      console.log('✅ ============================================');
      console.log('✅ Admin account created successfully!');
      console.log('✅ ============================================');
      console.log('📧 Email:', ADMIN_EMAIL);
      console.log('👤 Username:', ADMIN_USERNAME);
      console.log('🔑 Password:', ADMIN_PASSWORD);
      console.log('✅ ============================================');
      console.log('⚠️  IMPORTANT: Please change the password after first login!');
      console.log('✅ ============================================');
    } else {
      console.log('✅ Admin account already exists:', ADMIN_EMAIL);
      
      // Optional: Update admin password if RESET_ADMIN_PASSWORD is set
      if (process.env.RESET_ADMIN_PASSWORD === 'true') {
        console.log('🔧 Resetting admin password...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await adminExists.update({ password: hashedPassword });
        console.log('✅ Admin password reset successfully!');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    console.error('❌ Stack trace:', error.stack);
    // Don't throw error - allow server to continue starting
  }
};

module.exports = initializeAdmin;

