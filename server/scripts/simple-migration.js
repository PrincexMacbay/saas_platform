const { sequelize } = require('../models');

const simpleMigration = async () => {
  try {
    console.log('🔄 Starting simple migration...');
    
    // Create tables without alter, just basic sync
    await sequelize.sync({ force: false });
    
    console.log('✅ Database migration completed successfully!');
    console.log('📋 All membership tables are ready.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('💡 The tables may already exist. Try seeding data with: node scripts/seed-membership.js');
    process.exit(1);
  }
};

simpleMigration();
