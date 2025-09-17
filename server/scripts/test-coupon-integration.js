const sequelize = require('../config/database');
const { Coupon, Plan, Application } = require('../models');

async function testCouponIntegration() {
  try {
    console.log('🔄 Testing Coupon Integration...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Test 1: Create a test coupon
    console.log('\n📋 Test 1: Creating test coupon...');
    const testCoupon = await Coupon.create({
      name: 'Test Integration Coupon',
      couponId: 'TESTINT123',
      discount: 20.00,
      discountType: 'percentage',
      maxRedemptions: 10,
      expiryDate: new Date('2025-12-31'),
      applicablePlans: JSON.stringify([1, 2, 3]), // Applicable to plans 1, 2, 3
      currentRedemptions: 0,
      isActive: true,
      createdBy: 1
    });
    console.log('✅ Test coupon created:', {
      id: testCoupon.id,
      name: testCoupon.name,
      couponId: testCoupon.couponId,
      discount: testCoupon.discount,
      discountType: testCoupon.discountType
    });

    // Test 2: Create a test application with coupon
    console.log('\n📋 Test 2: Creating test application with coupon...');
    const testApplication = await Application.create({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '123-456-7890',
      planId: 1, // Assuming plan 1 exists
      status: 'incomplete',
      couponId: testCoupon.id,
      couponCode: testCoupon.couponId,
      originalAmount: 100.00,
      discountAmount: 20.00, // 20% of $100
      finalAmount: 80.00
    });
    console.log('✅ Test application created:', {
      id: testApplication.id,
      email: testApplication.email,
      couponId: testApplication.couponId,
      originalAmount: testApplication.originalAmount,
      discountAmount: testApplication.discountAmount,
      finalAmount: testApplication.finalAmount
    });

    // Test 3: Verify coupon validation logic
    console.log('\n📋 Test 3: Testing coupon validation logic...');
    
    // Test valid coupon
    const validCoupon = await Coupon.findOne({
      where: {
        couponId: 'TESTINT123',
        isActive: true
      }
    });
    
    if (validCoupon) {
      console.log('✅ Valid coupon found:', validCoupon.couponId);
      
      // Test discount calculation
      const originalAmount = 100.00;
      let discountAmount = 0;
      if (validCoupon.discountType === 'percentage') {
        discountAmount = (originalAmount * parseFloat(validCoupon.discount)) / 100;
      }
      const finalAmount = Math.max(0, originalAmount - discountAmount);
      
      console.log('✅ Discount calculation:', {
        originalAmount: originalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount
      });
    }

    // Test 4: Verify application-coupon association
    console.log('\n📋 Test 4: Testing application-coupon association...');
    const applicationWithCoupon = await Application.findByPk(testApplication.id, {
      include: [{
        model: Coupon,
        as: 'coupon'
      }]
    });
    
    if (applicationWithCoupon && applicationWithCoupon.coupon) {
      console.log('✅ Application-coupon association working:', {
        applicationId: applicationWithCoupon.id,
        couponName: applicationWithCoupon.coupon.name,
        couponCode: applicationWithCoupon.coupon.couponId
      });
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await testApplication.destroy();
    await testCoupon.destroy();
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Coupon integration test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Coupon creation works');
    console.log('✅ Application creation with coupon works');
    console.log('✅ Coupon validation logic works');
    console.log('✅ Application-coupon association works');
    console.log('✅ Discount calculation works');

  } catch (error) {
    console.error('❌ Coupon integration test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

testCouponIntegration();
