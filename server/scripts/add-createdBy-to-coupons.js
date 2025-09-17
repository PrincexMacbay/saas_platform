const sequelize = require('../config/database');

async function addCreatedByToCoupons() {
  try {
    console.log('🔄 Adding createdBy column to coupons table...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check if createdBy column already exists
    const [results] = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'createdBy';`
    );

    if (results.length === 0) {
      console.log('📋 Adding createdBy column to coupons table...');
      await sequelize.query(
        `ALTER TABLE coupons ADD COLUMN "createdBy" INTEGER NOT NULL DEFAULT 1 REFERENCES users(id);`
      );
      console.log('✅ createdBy column added successfully');
    } else {
      console.log('✅ createdBy column already exists');
    }

    // Update existing coupons to have createdBy = 1 (assuming user ID 1 exists)
    const [updateResults] = await sequelize.query(
      `UPDATE coupons SET "createdBy" = 1 WHERE "createdBy" IS NULL;`
    );
    console.log(`✅ Updated ${updateResults} existing coupons with createdBy = 1`);

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addCreatedByToCoupons();
