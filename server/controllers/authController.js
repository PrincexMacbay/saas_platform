const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User, UserProfile, IndividualProfile, CompanyProfile, PasswordResetToken, EmailVerificationToken } = require('../models');
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
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
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

    // Create new user with emailVerified set to false
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      emailVerified: false, // Email not verified yet
    });

    // Don't create a default user profile - let user choose their role
    // The profile will be created when they select their role in the career center

    // Get user without profile data initially
    const userWithoutProfile = await User.findByPk(user.id);

    // Get client IP and user agent for security logging
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create email verification token
    const { plainToken, verificationToken } = await EmailVerificationToken.createVerificationToken(
      user.id,
      {
        ipAddress,
        userAgent,
        expiryHours: 24 // 24 hours expiry
      }
    );

    console.log(`✅ Email verification token created for user: ${user.username} (ID: ${user.id})`);

    // Send email verification email (async, don't wait for it)
    emailService.sendEmailVerificationEmail(user, plainToken).then(result => {
      if (process.env.NODE_ENV === 'development') {
        if (result.success) {
          console.log('📧 Verification email sent successfully');
        } else {
          console.log('📧 Verification email failed (non-critical):', result.message);
        }
      }
    }).catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Verification email error (non-critical):', error.message);
      }
    });

    // Don't generate JWT token yet - user needs to verify email first
    // Return success but indicate email verification is required
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account before logging in.',
      data: {
        user: userWithoutProfile.toJSON(),
        emailVerificationRequired: true,
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && {
          debugToken: plainToken,
          expiresAt: verificationToken.expiresAt
        })
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

    // Check if email is verified (skip for admin users)
    if (!user.emailVerified && user.role !== 'admin') {
      console.log('❌ Email not verified');
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the verification email.',
        emailVerificationRequired: true
      });
    }
    
    // Auto-verify admin users if not already verified (for existing admins)
    if (!user.emailVerified && user.role === 'admin') {
      console.log('ℹ️  Auto-verifying admin user email');
      await user.update({
        emailVerified: true,
        emailVerifiedAt: new Date()
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

/**
 * Verify Email Controller
 * 
 * This endpoint handles email verification by:
 * 1. Validating the verification token
 * 2. Checking if token is expired or already used
 * 3. Marking the user's email as verified
 * 4. Marking the token as used
 * 5. Sending a welcome email
 * 
 * Security features:
 * - Tokens are validated against hashed versions in database
 * - Tokens are single-use only
 * - Tokens expire after 24 hours
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    console.log(`📧 Email verification attempt with token: ${token.substring(0, 8)}...`);
    
    // Validate the verification token
    const verificationTokenRecord = await EmailVerificationToken.validateToken(token);
    
    if (!verificationTokenRecord) {
      console.log(`❌ Invalid or expired verification token: ${token.substring(0, 8)}...`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.'
      });
    }

    console.log(`✅ Valid verification token found for user ID: ${verificationTokenRecord.userId}`);

    // Get the user
    const user = await User.findByPk(verificationTokenRecord.userId);
    
    if (!user) {
      console.log(`❌ User not found for verification token: ${verificationTokenRecord.userId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token. Please request a new verification email.'
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      console.log(`ℹ️ Email already verified for user: ${user.email}`);
      // Mark token as used anyway
      await EmailVerificationToken.markTokenAsUsed(token);
      return res.status(200).json({
        success: true,
        message: 'Email is already verified. You can log in now.',
        data: {
          userId: user.id,
          username: user.username,
          emailVerified: true
        }
      });
    }

    // Update the user's email verification status
    await user.update({
      emailVerified: true,
      emailVerifiedAt: new Date()
    });
    
    console.log(`✅ Email verified successfully for user: ${user.username}`);

    // Mark the token as used
    await EmailVerificationToken.markTokenAsUsed(token);
    
    console.log(`✅ Verification token marked as used for user: ${user.username}`);

    // Clean up expired tokens (async, don't wait for it)
    EmailVerificationToken.cleanupExpiredTokens().catch(error => {
      console.error('⚠️ Error cleaning up expired verification tokens:', error);
    });

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(user).catch(error => {
      console.error('⚠️ Error sending welcome email:', error);
    });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      data: {
        userId: user.id,
        username: user.username,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying your email. Please try again.'
    });
  }
};

/**
 * Resend Verification Email Controller
 * 
 * Allows users to request a new verification email if they didn't receive the first one
 */
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    console.log(`📧 Resend verification email requested for: ${email}`);
    
    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    // Always return success message to prevent email enumeration attacks
    const successMessage = 'If an account with that email exists and is not verified, we have sent a verification email.';

    if (!user) {
      console.log(`⚠️ Resend verification requested for non-existent email: ${email}`);
      return res.json({
        success: true,
        message: successMessage
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      console.log(`ℹ️ Resend verification requested for already verified email: ${email}`);
      return res.json({
        success: true,
        message: 'This email is already verified. You can log in now.'
      });
    }

    // Check if user account is active
    if (user.status !== 1) {
      console.log(`⚠️ Resend verification requested for inactive account: ${email}`);
      return res.json({
        success: true,
        message: successMessage
      });
    }

    // Get client IP and user agent for security logging
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create new verification token
    const { plainToken, verificationToken } = await EmailVerificationToken.createVerificationToken(
      user.id,
      {
        ipAddress,
        userAgent,
        expiryHours: 24
      }
    );

    console.log(`✅ New verification token created for user: ${user.username} (ID: ${user.id})`);

    // Send verification email
    const emailResult = await emailService.sendEmailVerificationEmail(user, plainToken);
    
    if (emailResult.success) {
      console.log(`📧 Verification email sent successfully to: ${email}`);
    } else {
      console.error(`❌ Failed to send verification email to: ${email}`, emailResult.error);
      // Don't fail the request if email fails - token is still created
    }

    res.json({
      success: true,
      message: successMessage,
      data: {
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && {
          debugToken: plainToken,
          expiresAt: verificationToken.expiresAt
        })
      }
    });

  } catch (error) {
    console.error('❌ Resend verification email error:', error);
    
    // Always return success to prevent information disclosure
    res.json({
      success: true,
      message: 'If an account with that email exists and is not verified, we have sent a verification email.'
    });
  }
};

module.exports = {
  register: [registerValidation, handleValidationErrors, register],
  login: [loginValidation, handleValidationErrors, login],
  getProfile,
  forgotPassword: [forgotPasswordValidation, handleValidationErrors, forgotPassword],
  resetPassword: [resetPasswordValidation, handleValidationErrors, resetPassword],
  verifyEmail,
  resendVerificationEmail: [forgotPasswordValidation, handleValidationErrors, resendVerificationEmail],
};