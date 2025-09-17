const sequelize = require('../config/database');
const { Coupon, User } = require('../models');

async function testCouponCreation() {
  try {
    console.log('🔄 Testing Coupon Creation...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Test creating a coupon with createdBy
    const testCoupon = await Coupon.create({
      name: 'Test Coupon',
      couponId: 'TEST123',
      discount: 10.00,
      discountType: 'percentage',
      maxRedemptions: 5,
      expiryDate: new Date('2025-12-31'),
      applicablePlans: JSON.stringify([1, 2]),
      currentRedemptions: 0,
      isActive: true,
      createdBy: 1 // Set createdBy to user ID 1
    });

    console.log('✅ Coupon created successfully:', {
      id: testCoupon.id,
      name: testCoupon.name,
      couponId: testCoupon.couponId,
      createdBy: testCoupon.createdBy
    });

    // Test finding the coupon
    const foundCoupon = await Coupon.findByPk(testCoupon.id);
    console.log('✅ Coupon found successfully:', {
      id: foundCoupon.id,
      name: foundCoupon.name,
      createdBy: foundCoupon.createdBy
    });

    // Clean up - delete the test coupon
    await testCoupon.destroy();
    console.log('✅ Test coupon cleaned up');

    console.log('🎉 Coupon creation test completed successfully!');
  } catch (error) {
    console.error('❌ Coupon creation test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

testCouponCreation();
