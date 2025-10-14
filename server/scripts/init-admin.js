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

    // Check if admin exists by email or username
    const adminExists = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [
          { email: ADMIN_EMAIL },
          { username: ADMIN_USERNAME }
        ]
      } 
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
        status: 1,
        isOrganization: false
      });

      // Create admin profile
      await UserProfile.create({
        userId: admin.id,
        userType: 'individual'
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
      console.log('✅ Admin account already exists');
      console.log('📧 Email:', adminExists.email);
      console.log('👤 Username:', adminExists.username);
      console.log('🆔 User ID:', adminExists.id);
      
      // Optional: Update admin password if RESET_ADMIN_PASSWORD is set
      if (process.env.RESET_ADMIN_PASSWORD === 'true') {
        console.log('🔧 Resetting admin password...');
        console.log('🔑 Resetting to password:', ADMIN_PASSWORD);
        
        // Use the model's update method which will trigger the beforeSave hook
        // This will properly hash the password using the model's logic
        await adminExists.update({ password: ADMIN_PASSWORD });
        
        // Reload the user from database to get fresh data
        await adminExists.reload();
        
        // Test password validation
        console.log('🔍 Testing password validation...');
        const isValid = await adminExists.validatePassword(ADMIN_PASSWORD);
        console.log('✅ Admin password reset successfully!');
        console.log('🔑 New password:', ADMIN_PASSWORD);
        console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED');
        
        if (!isValid) {
          console.log('⚠️  Password validation failed - checking password hash...');
          console.log('🔍 Stored password hash length:', adminExists.password ? adminExists.password.length : 'null');
          // Try direct bcrypt comparison as backup
          const directComparison = await bcrypt.compare(ADMIN_PASSWORD, adminExists.password);
          console.log('🔍 Direct bcrypt comparison:', directComparison ? 'PASSED' : 'FAILED');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    console.error('❌ Stack trace:', error.stack);
    // Don't throw error - allow server to continue starting
  }
};

module.exports = initializeAdmin;

