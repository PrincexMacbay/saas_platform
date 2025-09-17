const sequelize = require('../config/database');

async function addCouponFieldsToApplications() {
  try {
    console.log('🔄 Adding coupon fields to applications table...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('applications');

    // Add couponId field
    if (!tableDescription.couponId) {
      await queryInterface.addColumn('applications', 'couponId', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'coupons',
          key: 'id',
        },
        comment: 'Coupon used for this application'
      });
      console.log('✅ couponId column added successfully');
    } else {
      console.log('✅ couponId column already exists');
    }

    // Add couponCode field
    if (!tableDescription.couponCode) {
      await queryInterface.addColumn('applications', 'couponCode', {
        type: sequelize.Sequelize.STRING(50),
        allowNull: true,
        comment: 'Coupon code used for this application'
      });
      console.log('✅ couponCode column added successfully');
    } else {
      console.log('✅ couponCode column already exists');
    }

    // Add originalAmount field
    if (!tableDescription.originalAmount) {
      await queryInterface.addColumn('applications', 'originalAmount', {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Original plan fee before discount'
      });
      console.log('✅ originalAmount column added successfully');
    } else {
      console.log('✅ originalAmount column already exists');
    }

    // Add discountAmount field
    if (!tableDescription.discountAmount) {
      await queryInterface.addColumn('applications', 'discountAmount', {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Discount amount applied'
      });
      console.log('✅ discountAmount column added successfully');
    } else {
      console.log('✅ discountAmount column already exists');
    }

    // Add finalAmount field
    if (!tableDescription.finalAmount) {
      await queryInterface.addColumn('applications', 'finalAmount', {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Final amount after discount'
      });
      console.log('✅ finalAmount column added successfully');
    } else {
      console.log('✅ finalAmount column already exists');
    }

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addCouponFieldsToApplications();
