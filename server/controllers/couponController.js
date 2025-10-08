const { Coupon, User, Plan, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all coupons - USER-ONLY ACCESS
const getCoupons = async (req, res) => {
  try {
    // USER-ONLY ACCESS: Only show coupons created by the current user
    const coupons = await Coupon.findAll({
      where: {
        createdBy: req.user.id // Only show coupons created by the current user
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
};

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const {
      name,
      couponId,
      discount,
      discountType,
      maxRedemptions,
      expiryDate,
      applicablePlans
    } = req.body;

    // Check if coupon ID already exists
    const existingCoupon = await Coupon.findOne({
      where: { couponId }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon ID already exists'
      });
    }

    const coupon = await Coupon.create({
      name,
      couponId,
      discount: parseFloat(discount),
      discountType,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      applicablePlans: applicablePlans ? JSON.stringify(applicablePlans) : null,
      currentRedemptions: 0,
      isActive: true,
      createdBy: req.user.id // USER-ONLY ACCESS: Set the creator
    });

    const couponWithAssociations = await Coupon.findByPk(coupon.id);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon: couponWithAssociations
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
};

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // If updating couponId, check for uniqueness
    if (updateData.couponId && updateData.couponId !== coupon.couponId) {
      const existingCoupon = await Coupon.findOne({
        where: { couponId: updateData.couponId }
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon ID already exists'
        });
      }
    }

    await coupon.update(updateData);

    const updatedCoupon = await Coupon.findByPk(id);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: updatedCoupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
};

// Validate and apply coupon
const validateCoupon = async (req, res) => {
  try {
    const { couponId, planId, amount } = req.body;

    const coupon = await Coupon.findOne({
      where: { couponId }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is inactive'
      });
    }

    // Check if coupon has expired
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // Check if coupon has reached max redemptions
    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has reached maximum redemptions'
      });
    }

    // Check if coupon applies to the plan
    if (coupon.applicablePlans) {
      const applicablePlans = JSON.parse(coupon.applicablePlans);
      if (!applicablePlans.includes(parseInt(planId))) {
        return res.status(400).json({
          success: false,
          message: 'Coupon does not apply to this plan'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    res.json({
      success: true,
      message: 'Coupon is valid',
      coupon: {
        id: coupon.id,
        name: coupon.name,
        couponId: coupon.couponId,
        discount: coupon.discount,
        discountType: coupon.discountType,
        discountAmount,
        originalAmount: amount,
        finalAmount
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon'
    });
  }
};

// Redeem coupon
const redeemCoupon = async (req, res) => {
  try {
    const { couponId, userId } = req.body;

    const coupon = await Coupon.findOne({
      where: { couponId }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Validate coupon again before redemption
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is inactive'
      });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has reached maximum redemptions'
      });
    }

    // Increment redemption count
    await coupon.update({
      currentRedemptions: coupon.currentRedemptions + 1
    });

    res.json({
      success: true,
      message: 'Coupon redeemed successfully',
      coupon: {
        id: coupon.id,
        name: coupon.name,
        couponId: coupon.couponId,
        currentRedemptions: coupon.currentRedemptions + 1
      }
    });
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem coupon'
    });
  }
};

// Get coupon statistics
const getCouponStats = async (req, res) => {
  try {
    const stats = await Coupon.findAll({
      attributes: [
        'isActive',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCoupons'],
        [sequelize.fn('SUM', sequelize.col('currentRedemptions')), 'totalRedemptions']
      ],
      group: ['isActive']
    });

    const activeCoupons = await Coupon.count({
      where: { isActive: true }
    });

    const expiredCoupons = await Coupon.count({
      where: {
        expiryDate: {
          [Op.lt]: new Date()
        }
      }
    });

    res.json({
      success: true,
      stats: {
        activeCoupons,
        expiredCoupons,
        totalCoupons: activeCoupons + expiredCoupons,
        redemptionStats: stats
      }
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon statistics'
    });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
  validateCoupon,
  redeemCoupon,
  getCouponStats
};
