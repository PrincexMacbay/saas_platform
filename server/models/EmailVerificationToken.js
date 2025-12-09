const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Email Verification Token Model
 * 
 * This model stores secure email verification tokens with the following security features:
 * - Tokens are hashed before storage (never stored in plain text)
 * - Tokens expire after 24 hours by default
 * - Tokens are invalidated after single use
 * - Multiple tokens per user are allowed (for resending verification emails)
 */
const EmailVerificationToken = sequelize.define('EmailVerificationToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Reference to the user who needs email verification'
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hashed verification token (never stored in plain text)'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Token expiration time (default: 24 hours from creation)'
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the token has been used to verify email'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when token was used (if used)'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the request (for security logging)'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string (for security logging)'
  }
}, {
  tableName: 'email_verification_tokens',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['token']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['used']
    }
  ],
  hooks: {
    /**
     * Hash the token before saving to database
     * This ensures tokens are never stored in plain text
     */
    beforeSave: async (verificationToken) => {
      if (verificationToken.changed('token')) {
        // Hash the token with bcrypt for secure storage
        verificationToken.token = await bcrypt.hash(verificationToken.token, 12);
      }
    }
  }
});

/**
 * Static method: Generate a cryptographically secure verification token
 * @returns {string} A secure random token
 */
EmailVerificationToken.generateSecureToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Static method: Create a new email verification token for a user
 * @param {number} userId - The user ID
 * @param {Object} options - Additional options
 * @param {string} options.ipAddress - IP address of the request
 * @param {string} options.userAgent - User agent string
 * @param {number} options.expiryHours - Token expiry in hours (default: 24)
 * @returns {Promise<Object>} Object containing the plain token and database record
 */
EmailVerificationToken.createVerificationToken = async function(userId, options = {}) {
  const { ipAddress, userAgent, expiryHours = 24 } = options;
  
  // Generate secure token
  const plainToken = this.generateSecureToken();
  
  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);
  
  // Create database record (token will be hashed by the beforeSave hook)
  const verificationToken = await this.create({
    userId,
    token: plainToken, // This will be hashed by the hook
    expiresAt,
    ipAddress,
    userAgent
  });
  
  return {
    plainToken,
    verificationToken
  };
};

/**
 * Static method: Validate a verification token
 * @param {string} plainToken - The plain token to validate
 * @param {number} userId - The user ID (optional, for additional security)
 * @returns {Promise<Object|null>} The valid token record or null
 */
EmailVerificationToken.validateToken = async function(plainToken, userId = null) {
  if (!plainToken) {
    return null;
  }

  // Find all tokens for this user (if userId provided) or search all tokens
  const whereClause = {};
  if (userId) {
    whereClause.userId = userId;
  }

  const tokens = await this.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']] // Get most recent tokens first
  });

  // Check each token to see if it matches
  for (const token of tokens) {
    // Skip expired tokens
    if (token.expiresAt < new Date()) {
      continue;
    }

    // Skip used tokens
    if (token.used) {
      continue;
    }

    // Check if the plain token matches the hashed token
    const isValid = await bcrypt.compare(plainToken, token.token);
    if (isValid) {
      return token;
    }
  }

  return null;
};

/**
 * Static method: Mark a token as used
 * @param {string} plainToken - The plain token to mark as used
 * @returns {Promise<boolean>} True if token was found and marked as used
 */
EmailVerificationToken.markTokenAsUsed = async function(plainToken) {
  if (!plainToken) {
    return false;
  }

  const tokens = await this.findAll({
    where: {
      used: false,
      expiresAt: {
        [require('sequelize').Op.gt]: new Date() // Not expired
      }
    },
    order: [['createdAt', 'DESC']]
  });

  for (const token of tokens) {
    const isValid = await bcrypt.compare(plainToken, token.token);
    if (isValid) {
      await token.update({
        used: true,
        usedAt: new Date()
      });
      return true;
    }
  }

  return false;
};

/**
 * Static method: Clean up expired tokens
 * @returns {Promise<number>} Number of tokens deleted
 */
EmailVerificationToken.cleanupExpiredTokens = async function() {
  const result = await this.destroy({
    where: {
      expiresAt: {
        [require('sequelize').Op.lt]: new Date()
      }
    }
  });
  
  console.log(`🧹 Cleaned up ${result} expired email verification tokens`);
  return result;
};

/**
 * Static method: Get active tokens for a user (for resending verification emails)
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of active tokens
 */
EmailVerificationToken.getActiveTokensForUser = async function(userId) {
  return await this.findAll({
    where: {
      userId,
      used: false,
      expiresAt: {
        [require('sequelize').Op.gt]: new Date()
      }
    },
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Instance method to check if token is expired
 * @returns {boolean} True if token is expired
 */
EmailVerificationToken.prototype.isExpired = function() {
  return this.expiresAt < new Date();
};

/**
 * Instance method to check if token is valid (not used and not expired)
 * @returns {boolean} True if token is valid
 */
EmailVerificationToken.prototype.isValid = function() {
  return !this.used && !this.isExpired();
};

module.exports = EmailVerificationToken;

