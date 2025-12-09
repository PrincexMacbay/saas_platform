const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Validation errors:', errors.array());
      console.log('Request body:', req.body);
    }
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
};