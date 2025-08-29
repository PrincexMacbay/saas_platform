const { Subscription } = require('../models');

// Generate a unique member number
const generateMemberNumber = async () => {
  const prefix = 'MEM';
  const length = 6;
  
  // Generate a random number
  const randomNum = Math.floor(Math.random() * Math.pow(10, length));
  const memberNumber = `${prefix}${randomNum.toString().padStart(length, '0')}`;
  
  // Check if it already exists
  const existing = await Subscription.findOne({
    where: { memberNumber: memberNumber }
  });
  
  if (existing) {
    // If exists, generate a new one recursively
    return generateMemberNumber();
  }
  
  return memberNumber;
};

// Generate member number with custom prefix and length
const generateCustomMemberNumber = async (prefix = 'MEM', length = 6) => {
  const randomNum = Math.floor(Math.random() * Math.pow(10, length));
  const memberNumber = `${prefix}${randomNum.toString().padStart(length, '0')}`;
  
  // Check if it already exists
  const existing = await Subscription.findOne({
    where: { memberNumber: memberNumber }
  });
  
  if (existing) {
    // If exists, generate a new one recursively
    return generateCustomMemberNumber(prefix, length);
  }
  
  return memberNumber;
};

// Validate member number format
const validateMemberNumber = (memberNumber) => {
  // Basic validation - can be customized based on requirements
  const pattern = /^[A-Z]{2,4}\d{4,8}$/;
  return pattern.test(memberNumber);
};

module.exports = {
  generateMemberNumber,
  generateCustomMemberNumber,
  validateMemberNumber
};
