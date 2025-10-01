const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Password Reset Token Model
 * 
 * This model stores secure password reset tokens with the following security features:
 * - Tokens are hashed before storage (never stored in plain text)
 * - Tokens expire after 15 minutes by default
 * - Tokens are invalidated after single use
 * - Multiple tokens per user are allowed (for concurrent requests)
 */
const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
    comment: 'Reference to the user who requested password reset'
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hashed reset token (never stored in plain text)'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Token expiration time (default: 15 minutes from creation)'
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the token has been used to reset password'
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
  tableName: 'password_reset_tokens',
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
    beforeSave: async (resetToken) => {
      if (resetToken.changed('token')) {
        // Hash the token with bcrypt for secure storage
        resetToken.token = await bcrypt.hash(resetToken.token, 12);
      }
    }
  }
});

/**
 * Static method: Generate a cryptographically secure reset token
 * @returns {string} A secure random token
 */
PasswordResetToken.generateSecureToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Static method: Create a new password reset token for a user
 * @param {number} userId - The user ID
 * @param {Object} options - Additional options
 * @param {string} options.ipAddress - IP address of the request
 * @param {string} options.userAgent - User agent string
 * @param {number} options.expiryMinutes - Token expiry in minutes (default: 15)
 * @returns {Promise<Object>} Object containing the plain token and database record
 */
PasswordResetToken.createResetToken = async function(userId, options = {}) {
  const { ipAddress, userAgent, expiryMinutes = 15 } = options;
  
  // Generate secure token
  const plainToken = this.generateSecureToken();
  
  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  
  // Create database record (token will be hashed by the beforeSave hook)
  const resetToken = await this.create({
    userId,
    token: plainToken, // This will be hashed by the hook
    expiresAt,
    ipAddress,
    userAgent
  });
  
  return {
    plainToken,
    resetToken
  };
};

/**
 * Static method: Validate a reset token
 * @param {string} plainToken - The plain token to validate
 * @param {number} userId - The user ID (optional, for additional security)
 * @returns {Promise<Object|null>} The valid token record or null
 */
PasswordResetToken.validateToken = async function(plainToken, userId = null) {
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
PasswordResetToken.markTokenAsUsed = async function(plainToken) {
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
PasswordResetToken.cleanupExpiredTokens = async function() {
  const result = await this.destroy({
    where: {
      expiresAt: {
        [require('sequelize').Op.lt]: new Date()
      }
    }
  });
  
  console.log(`🧹 Cleaned up ${result} expired password reset tokens`);
  return result;
};

/**
 * Static method: Get active tokens for a user (for security monitoring)
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of active tokens
 */
PasswordResetToken.getActiveTokensForUser = async function(userId) {
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
PasswordResetToken.prototype.isExpired = function() {
  return this.expiresAt < new Date();
};

/**
 * Instance method to check if token is valid (not used and not expired)
 * @returns {boolean} True if token is valid
 */
PasswordResetToken.prototype.isValid = function() {
  return !this.used && !this.isExpired();
};

module.exports = PasswordResetToken;
