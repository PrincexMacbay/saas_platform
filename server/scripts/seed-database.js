const seederService = require('../services/seederService');
const { sequelize } = require('../models');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting manual database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database schema
    await sequelize.sync();
    console.log('✅ Database schema synchronized');
    
    // Run seeder
    await seederService.seedDatabase();
    
    console.log('🎉 Manual seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Manual seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
