const { Subscription, MembershipSettings, Invoice } = require('../models');
const { Op } = require('sequelize');

// Generate unique member number
const generateMemberNumber = async () => {
  try {
    // Get settings for prefix and length
    let settings = await MembershipSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await MembershipSettings.create({
        memberNumberPrefix: 'MEM',
        memberNumberLength: 6
      });
    }

    const prefix = settings.memberNumberPrefix || 'MEM';
    const length = settings.memberNumberLength || 6;

    // Generate member number with retries
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomDigits = Math.random().toString().slice(2, 2 + length);
      const memberNumber = `${prefix}${randomDigits.padStart(length, '0')}`;

      // Check if member number already exists
      const existingSubscription = await Subscription.findOne({
        where: { memberNumber }
      });

      if (!existingSubscription) {
        return memberNumber;
      }

      attempts++;
    }

    // Fallback: use timestamp-based approach
    const timestamp = Date.now().toString().slice(-length);
    return `${prefix}${timestamp.padStart(length, '0')}`;
  } catch (error) {
    console.error('Error generating member number:', error);
    // Ultimate fallback
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `MEM${randomNum}`;
  }
};

// Generate invoice number
const generateInvoiceNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;
    
    // Find the last invoice number for this year
    const lastInvoice = await Invoice.findOne({
      where: {
        invoiceNumber: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['invoiceNumber', 'DESC']]
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${new Date().getFullYear()}-${timestamp}`;
  }
};

module.exports = {
  generateMemberNumber,
  generateInvoiceNumber
};
