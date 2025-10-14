const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User, UserProfile, IndividualProfile, CompanyProfile, PasswordResetToken } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters'),
];

const loginValidation = [
  body('login')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    // Always log registration attempts for debugging
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    // Don't create a default user profile - let user choose their role
    // The profile will be created when they select their role in the career center

    // Get user without profile data initially
    const userWithoutProfile = await User.findByPk(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(user).then(result => {
      if (process.env.NODE_ENV === 'development') {
        if (result.success) {
          console.log('📧 Welcome email sent successfully');
        } else {
          console.log('📧 Welcome email failed (non-critical):', result.message);
        }
      }
    }).catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Welcome email error (non-critical):', error.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: userWithoutProfile.toJSON(),
      }
    });
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for specific error types
    if (error.name === 'SequelizeValidationError') {
      console.log('Validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('Unique constraint errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    console.log('=== LOGIN DEBUG ===');
    console.log('Login attempt for:', login);
    console.log('Password length:', password ? password.length : 'undefined');

    // Find user by username or email (simplified query first)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: login },
          { username: login }
        ]
      }
    });

    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User username:', user.username);
      console.log('User status:', user.status);
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    console.log('Checking password...');
    const isValidPassword = await user.validatePassword(password);
    console.log('Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is enabled
    console.log('Checking user status:', user.status);
    if (user.status !== 1) {
      console.log('❌ User account not active');
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Get user with profile data for response
    const userWithProfile = await User.findOne({
      where: { id: user.id },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    // Generate token
    const token = generateToken(user.id);
    console.log('✅ Login successful for user:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithProfile ? userWithProfile.toJSON() : user.toJSON(),
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // Get user with profile data
    const userWithProfile = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserProfile,
          as: 'profile'
        },
        {
          model: IndividualProfile,
          as: 'individualProfile'
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ]
    });

    res.json({
      success: true,
      data: {
        user: userWithProfile.toJSON(),
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Forgot Password Controller
 * 
 * This endpoint handles password reset requests by:
 * 1. Validating the email address
 * 2. Checking if the user exists
 * 3. Generating a secure reset token
 * 4. Storing the hashed token in the database
 * 5. Sending a password reset email
 * 
 * Security features:
 * - Always returns success message (prevents email enumeration)
 * - Tokens expire after 15 minutes
 * - Tokens are hashed before storage
 * - Rate limiting should be applied at the API level
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`🔐 Password reset requested for email: ${email}`);
    
    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    // Always return success message to prevent email enumeration attacks
    const successMessage = 'If an account with that email exists, we have sent a password reset link.';

    if (!user) {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
      return res.json({
        success: true,
        message: successMessage
      });
    }

    // Check if user account is active
    if (user.status !== 1) {
      console.log(`⚠️ Password reset requested for inactive account: ${email}`);
      return res.json({
        success: true,
        message: successMessage
      });
    }

    // Get client IP and user agent for security logging
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create password reset token
    const { plainToken, resetToken } = await PasswordResetToken.createResetToken(
      user.id,
      {
        ipAddress,
        userAgent,
        expiryMinutes: parseInt(process.env.RESET_TOKEN_EXPIRY) || 15
      }
    );

    console.log(`✅ Password reset token created for user: ${user.username} (ID: ${user.id})`);

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(user, plainToken);
    
    if (emailResult.success) {
      console.log(`📧 Password reset email sent successfully to: ${email}`);
    } else {
      console.error(`❌ Failed to send password reset email to: ${email}`, emailResult.error);
      // Don't fail the request if email fails - token is still created
    }

    res.json({
      success: true,
      message: successMessage,
      data: {
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && {
          debugToken: plainToken,
          expiresAt: resetToken.expiresAt
        })
      }
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    
    // Always return success to prevent information disclosure
    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }
};

/**
 * Reset Password Controller
 * 
 * This endpoint handles password reset completion by:
 * 1. Validating the reset token
 * 2. Checking if token is expired or already used
 * 3. Updating the user's password
 * 4. Marking the token as used
 * 5. Cleaning up expired tokens
 * 
 * Security features:
 * - Tokens are validated against hashed versions in database
 * - Tokens are single-use only
 * - Tokens expire after 15 minutes
 * - Passwords are hashed before storage
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    console.log(`🔐 Password reset attempt with token: ${token.substring(0, 8)}...`);
    
    // Validate the reset token
    const resetTokenRecord = await PasswordResetToken.validateToken(token);
    
    if (!resetTokenRecord) {
      console.log(`❌ Invalid or expired reset token: ${token.substring(0, 8)}...`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    console.log(`✅ Valid reset token found for user ID: ${resetTokenRecord.userId}`);

    // Get the user
    const user = await User.findByPk(resetTokenRecord.userId);
    
    if (!user) {
      console.log(`❌ User not found for reset token: ${resetTokenRecord.userId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token. Please request a new password reset.'
      });
    }

    // Check if user account is active
    if (user.status !== 1) {
      console.log(`❌ Password reset attempted for inactive account: ${user.email}`);
      return res.status(400).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Update the user's password
    // The password will be automatically hashed by the User model's beforeSave hook
    await user.update({ password });
    
    console.log(`✅ Password updated successfully for user: ${user.username}`);

    // Mark the token as used
    await PasswordResetToken.markTokenAsUsed(token);
    
    console.log(`✅ Reset token marked as used for user: ${user.username}`);

    // Clean up expired tokens (async, don't wait for it)
    PasswordResetToken.cleanupExpiredTokens().catch(error => {
      console.error('⚠️ Error cleaning up expired tokens:', error);
    });

    // Send confirmation email (async, don't wait for it)
    emailService.sendPasswordResetConfirmationEmail(user).catch(error => {
      console.error('⚠️ Error sending password reset confirmation email:', error);
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      data: {
        userId: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password. Please try again.'
    });
  }
};

module.exports = {
  register: [registerValidation, handleValidationErrors, register],
  login: [loginValidation, handleValidationErrors, login],
  getProfile,
  forgotPassword: [forgotPasswordValidation, handleValidationErrors, forgotPassword],
  resetPassword: [resetPasswordValidation, handleValidationErrors, resetPassword],
};