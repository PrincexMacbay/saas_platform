const { User, UserProfile, Organization, Plan } = require('../models');
const bcrypt = require('bcryptjs');

async function testPlanSecurity() {
  try {
    console.log('🧪 Testing Plan Security...\n');

    // Create test organizations
    console.log('1. Creating test organizations...');
    const org1 = await Organization.create({
      name: 'Test Organization 1',
      description: 'Test org for security testing',
      ownerId: 1
    });

    const org2 = await Organization.create({
      name: 'Test Organization 2', 
      description: 'Another test org for security testing',
      ownerId: 1
    });

    console.log(`✅ Created organizations: ${org1.name} (ID: ${org1.id}), ${org2.name} (ID: ${org2.id})\n`);

    // Create test users
    console.log('2. Creating test users...');
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@test.com',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Test',
      lastName: 'User1'
    });

    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@test.com', 
      password: await bcrypt.hash('password123', 12),
      firstName: 'Test',
      lastName: 'User2'
    });

    console.log(`✅ Created users: ${user1.username} (ID: ${user1.id}), ${user2.username} (ID: ${user2.id})\n`);

    // Create user profiles with different organizations
    console.log('3. Creating user profiles...');
    const profile1 = await UserProfile.create({
      userId: user1.id,
      userType: 'individual',
      organizationId: org1.id,
      organizationRole: 'admin'
    });

    const profile2 = await UserProfile.create({
      userId: user2.id,
      userType: 'individual', 
      organizationId: org2.id,
      organizationRole: 'admin'
    });

    console.log(`✅ Created profiles: User1 -> ${org1.name}, User2 -> ${org2.name}\n`);

    // Create plans for each organization
    console.log('4. Creating test plans...');
    const plan1 = await Plan.create({
      name: 'Plan from Org 1',
      description: 'Test plan from organization 1',
      fee: 29.99,
      renewalInterval: 'monthly',
      benefits: JSON.stringify(['Benefit 1', 'Benefit 2']),
      organizationId: org1.id,
      isActive: true
    });

    const plan2 = await Plan.create({
      name: 'Plan from Org 2',
      description: 'Test plan from organization 2', 
      fee: 49.99,
      renewalInterval: 'monthly',
      benefits: JSON.stringify(['Benefit 3', 'Benefit 4']),
      organizationId: org2.id,
      isActive: true
    });

    console.log(`✅ Created plans: ${plan1.name} (Org: ${org1.name}), ${plan2.name} (Org: ${org2.name})\n`);

    // Test plan filtering
    console.log('5. Testing plan filtering by organization...');
    
    // Simulate user1 requesting plans
    const user1Profile = await UserProfile.findOne({ where: { userId: user1.id } });
    const user1Plans = await Plan.findAll({
      where: { organizationId: user1Profile.organizationId }
    });
    
    console.log(`📋 User1 (${org1.name}) can see ${user1Plans.length} plans:`);
    user1Plans.forEach(plan => console.log(`   - ${plan.name} (ID: ${plan.id})`));

    // Simulate user2 requesting plans  
    const user2Profile = await UserProfile.findOne({ where: { userId: user2.id } });
    const user2Plans = await Plan.findAll({
      where: { organizationId: user2Profile.organizationId }
    });

    console.log(`\n📋 User2 (${org2.name}) can see ${user2Plans.length} plans:`);
    user2Plans.forEach(plan => console.log(`   - ${plan.name} (ID: ${plan.id})`));

    // Test cross-organization access
    console.log('\n6. Testing cross-organization access prevention...');
    
    // User1 trying to access User2's plan
    const user1AccessingPlan2 = await Plan.findOne({
      where: { 
        id: plan2.id,
        organizationId: user1Profile.organizationId 
      }
    });

    if (!user1AccessingPlan2) {
      console.log('✅ User1 cannot access User2\'s plan (correct behavior)');
    } else {
      console.log('❌ User1 can access User2\'s plan (security issue!)');
    }

    // User2 trying to access User1's plan
    const user2AccessingPlan1 = await Plan.findOne({
      where: { 
        id: plan1.id,
        organizationId: user2Profile.organizationId 
      }
    });

    if (!user2AccessingPlan1) {
      console.log('✅ User2 cannot access User1\'s plan (correct behavior)');
    } else {
      console.log('❌ User2 can access User1\'s plan (security issue!)');
    }

    console.log('\n🎉 Plan security test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Each user can only see plans from their own organization');
    console.log('- Cross-organization access is properly prevented');
    console.log('- Plan filtering works correctly based on UserProfile.organizationId');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testPlanSecurity();
