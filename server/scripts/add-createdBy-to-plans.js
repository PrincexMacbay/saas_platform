const sequelize = require('../config/database');
const { Plan, User } = require('../models');

async function addCreatedByToPlans() {
  try {
    console.log('Starting migration: Adding createdBy column to plans table...');

    // Add the createdBy column
    await sequelize.query(`
      ALTER TABLE plans 
      ADD COLUMN IF NOT EXISTS "createdBy" INTEGER NOT NULL DEFAULT 1
    `);

    console.log('✅ Added createdBy column to plans table');

    // Update existing plans to set createdBy to the first user (or a default user)
    // This is a temporary fix - in a real scenario, you'd want to determine the actual creator
    const firstUser = await User.findOne({
      order: [['id', 'ASC']]
    });

    if (firstUser) {
      await sequelize.query(`
        UPDATE plans 
        SET "createdBy" = ${firstUser.id} 
        WHERE "createdBy" = 1
      `);
      console.log(`✅ Updated existing plans to set createdBy to user ID: ${firstUser.id}`);
    } else {
      console.log('⚠️  No users found, keeping default createdBy = 1');
    }

    // Add foreign key constraint (handle the case where it might already exist)
    try {
      await sequelize.query(`
        ALTER TABLE plans 
        ADD CONSTRAINT "plans_createdBy_fkey" 
        FOREIGN KEY ("createdBy") REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Added foreign key constraint for createdBy column');
    } catch (constraintError) {
      if (constraintError.message.includes('already exists')) {
        console.log('ℹ️  Foreign key constraint already exists, skipping...');
      } else {
        throw constraintError;
      }
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
addCreatedByToPlans()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
