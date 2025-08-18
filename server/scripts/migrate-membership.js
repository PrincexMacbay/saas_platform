const { sequelize, Organization, User, Plan } = require('../models');

const migrateMembership = async () => {
  try {
    console.log('🔄 Starting membership migration...');
    
    // Step 1: Create Organization table first (if it doesn't exist)
    console.log('📋 Creating Organization table...');
    await Organization.sync({ force: false });
    console.log('✅ Organization table ready');
    
    // Step 2: Add new columns to existing tables safely
    console.log('📋 Adding organization columns to User table...');
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS "organizationId" INTEGER,
        ADD COLUMN IF NOT EXISTS "organizationRole" VARCHAR(10) CHECK ("organizationRole" IN ('admin', 'member'))
      `);
      console.log('✅ User table updated');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ User columns already exist');
      } else {
        throw error;
      }
    }
    
    // Step 3: Add organization columns to Plan table
    console.log('📋 Adding organization columns to Plan table...');
    try {
      await sequelize.query(`
        ALTER TABLE plans 
        ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS "organizationId" INTEGER
      `);
      console.log('✅ Plan table updated');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Plan columns already exist');
      } else {
        throw error;
      }
    }
    
    // Step 4: Create foreign key constraints safely
    console.log('📋 Creating foreign key constraints...');
    try {
      // User -> Organization FK
      await sequelize.query(`
        ALTER TABLE users 
        ADD CONSTRAINT IF NOT EXISTS fk_user_organization 
        FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE SET NULL
      `);
      
      // Plan -> Organization FK  
      await sequelize.query(`
        ALTER TABLE plans 
        ADD CONSTRAINT IF NOT EXISTS fk_plan_organization 
        FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE
      `);
      
      console.log('✅ Foreign key constraints created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key constraints already exist');
      } else {
        console.log('⚠️ Foreign key constraint creation skipped:', error.message);
      }
    }
    
    // Step 5: Sync all other membership tables
    console.log('📋 Syncing remaining membership tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ All membership tables synced');
    
    console.log('🎉 Membership migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

migrateMembership();
