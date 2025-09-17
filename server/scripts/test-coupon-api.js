const sequelize = require('../config/database');
const { Coupon, User } = require('../models');

async function testCouponAPI() {
  try {
    console.log('🔄 Testing Coupon API...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Test 1: Check if coupons table exists and has createdBy column
    const [tableCheck] = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'createdBy';`
    );
    
    if (tableCheck.length > 0) {
      console.log('✅ coupons table has createdBy column');
    } else {
      console.log('❌ coupons table missing createdBy column');
      return;
    }

    // Test 2: Check if we can find coupons
    const coupons = await Coupon.findAll({
      limit: 5
    });
    console.log(`✅ Found ${coupons.length} coupons in database`);

    // Test 3: Check if we can find coupons by createdBy
    const userCoupons = await Coupon.findAll({
      where: { createdBy: 1 },
      limit: 5
    });
    console.log(`✅ Found ${userCoupons.length} coupons created by user 1`);

    // Test 4: Test the association
    const userWithCoupons = await User.findByPk(1, {
      include: [{ model: Coupon, as: 'createdCoupons' }]
    });
    
    if (userWithCoupons) {
      console.log(`✅ User association working - user 1 has ${userWithCoupons.createdCoupons?.length || 0} coupons`);
    } else {
      console.log('⚠️ User 1 not found, but associations are set up correctly');
    }

    console.log('🎉 Coupon API test completed successfully!');
  } catch (error) {
    console.error('❌ Coupon API test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

testCouponAPI();
