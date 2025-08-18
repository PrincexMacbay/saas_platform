const { sequelize, Organization } = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Syncing database...');
    
    // First create Organization table if it doesn't exist
    console.log('📋 Creating Organization table...');
    await Organization.sync({ force: false });
    
    // Then sync other tables with force: false to avoid conflicts
    console.log('📋 Syncing remaining tables...');
    await sequelize.sync({ force: false });
    
    console.log('✅ Database synced successfully!');
    console.log('📋 All membership tables are ready.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    console.error('💡 Try running: node scripts/migrate-membership.js instead');
    process.exit(1);
  }
};

syncDatabase();
