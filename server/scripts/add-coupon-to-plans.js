/**
 * Migration script to add couponId column to plans table
 * Run this once to add the column to existing database
 */

const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function addCouponToPlans() {
  try {
    console.log('🔄 Adding couponId column to plans table...');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'plans' AND column_name = 'couponId'
    `);

    if (results.length > 0) {
      console.log('✅ couponId column already exists in plans table');
      return;
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE plans 
      ADD COLUMN "couponId" INTEGER 
      REFERENCES coupons(id) 
      ON DELETE SET NULL
    `);

    console.log('✅ Successfully added couponId column to plans table');
  } catch (error) {
    console.error('❌ Error adding couponId column:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addCouponToPlans()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCouponToPlans;
