const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.transporter = null;
    this.useSendGridAPI = false;
    this.initialize();
  }

  initialize() {
    // Create transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use real SMTP service (Gmail, SendGrid, etc.)
      if (process.env.EMAIL_SERVICE === 'sendgrid') {
        // SendGrid HTTP API (no SMTP, bypasses Render firewall)
        if (process.env.EMAIL_PASSWORD) {
          sgMail.setApiKey(process.env.EMAIL_PASSWORD);
          this.useSendGridAPI = true;
          console.log('📧 Email service initialized with SendGrid HTTP API');
        } else {
          console.error('❌ SendGrid API key not found in EMAIL_PASSWORD');
        }
      } else {
        // Generic SMTP configuration (Gmail, etc.)
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
          // Add timeout settings for better reliability
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000
        });
        console.log(`📧 Email service initialized with ${process.env.EMAIL_SERVICE || 'gmail'} SMTP`);
      }
    } else {
      // Development: Use Ethereal for testing
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        tls: {
          rejectUnauthorized: false // Ignore SSL certificate issues in development
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email service initialized with test account');
        console.log('Test account user:', testAccount.user);
        console.log('Test account pass:', testAccount.pass);
        console.log('Preview URLs will be logged to console');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create test email account:', error);
      }
      // Fallback to a mock transporter that just logs emails
      this.transporter = {
        sendMail: async (mailOptions) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📧 MOCK EMAIL SENT (service unavailable):');
            console.log('  To:', mailOptions.to);
            console.log('  Subject:', mailOptions.subject);
            console.log('  Content:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No content');
          }
          return { messageId: 'mock-' + Date.now() };
        }
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Using mock email service (emails will be logged to console)');
      }
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    // Use SendGrid HTTP API if configured (bypasses SMTP firewall issues)
    if (this.useSendGridAPI) {
      try {
        const msg = {
          to: to,
          from: process.env.EMAIL_FROM || '"Social Network" <noreply@social-network.com>',
          subject: subject,
          html: htmlContent,
          text: textContent || htmlContent.replace(/<[^>]*>/g, '')
        };

        const result = await sgMail.send(msg);
        
        console.log('📧 Email sent via SendGrid HTTP API successfully');
        
        return { 
          success: true, 
          messageId: result[0].headers['x-message-id'],
          provider: 'sendgrid-api'
        };
      } catch (error) {
        console.error('📧 SendGrid API error:', error.message);
        if (error.response) {
          console.error('SendGrid error details:', error.response.body);
        }
        return { 
          success: false, 
          message: error.message,
          error: error.code || 'SENDGRID_API_ERROR'
        };
      }
    }

    // Use Nodemailer SMTP (Gmail, etc.)
    if (!this.transporter) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email service not initialized, skipping email');
      }
      return { success: false, message: 'Email service not available' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"HumHub Clone" <noreply@humhub-clone.com>',
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '')
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('📧 Email sending error:', error.message);
      }
      // Don't throw error, just log it and return failure
      // This prevents email errors from breaking the application
      return { 
        success: false, 
        message: error.message,
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  // Template for new comment notification
  async sendCommentNotification(user, post, comment, postAuthor) {
    const subject = `New comment on your post`;
    const html = `
      <h2>New Comment Notification</h2>
      <p>Hi ${postAuthor.firstName || postAuthor.username},</p>
      <p><strong>${user.firstName || user.username}</strong> commented on your post:</p>
      <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #3498db;">
        ${comment.message}
      </blockquote>
      <p><strong>Original post:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 2px solid #ccc;">
        ${post.message.substring(0, 200)}${post.message.length > 200 ? '...' : ''}
      </blockquote>
      <p>
        <a href="${process.env.CLIENT_URL}/posts/${post.id}" 
           style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Post
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        You received this because you created this post. 
        You can disable these notifications in your profile settings.
      </p>
    `;

    return await this.sendEmail(postAuthor.email, subject, html);
  }

  // Template for new follower notification
  async sendFollowerNotification(follower, followedUser) {
    const subject = `${follower.firstName || follower.username} started following you`;
    const html = `
      <h2>New Follower!</h2>
      <p>Hi ${followedUser.firstName || followedUser.username},</p>
      <p><strong>${follower.firstName || follower.username}</strong> (@${follower.username}) started following you on HumHub Clone!</p>
      ${follower.about ? `<p><em>"${follower.about}"</em></p>` : ''}
      <p>
        <a href="${process.env.CLIENT_URL}/profile/${follower.username}" 
           style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Profile
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        You received this because someone followed you. 
        You can disable these notifications in your profile settings.
      </p>
    `;

    return await this.sendEmail(followedUser.email, subject, html);
  }

  // Template for space invitation
  async sendSpaceInvitation(inviter, invitedUser, space) {
    const subject = `You've been invited to join "${space.name}"`;
    const html = `
      <h2>Space Invitation</h2>
      <p>Hi ${invitedUser.firstName || invitedUser.username},</p>
      <p><strong>${inviter.firstName || inviter.username}</strong> invited you to join the space <strong>"${space.name}"</strong>!</p>
      ${space.description ? `<p><em>${space.description}</em></p>` : ''}
      ${space.about ? `<p>${space.about}</p>` : ''}
      <p>
        <a href="${process.env.CLIENT_URL}/spaces/${space.url || space.id}" 
           style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Space
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        You received this invitation from ${inviter.firstName || inviter.username}. 
        You can join or ignore this invitation.
      </p>
    `;

    return await this.sendEmail(invitedUser.email, subject, html);
  }

  // Template for welcome email
  async sendWelcomeEmail(user) {
    const subject = `Welcome to HumHub Clone!`;
    const html = `
      <h2>Welcome to Social Network</h2>
      <p>Hi ${user.firstName || user.username},</p>
      <p>Welcome to our social networking platform! We're excited to have you join our community.</p>
      <h3>Getting Started:</h3>
      <ul>
        <li>Complete your profile with a photo and description</li>
        <li>Explore and join interesting spaces</li>
        <li>Connect with other members</li>
        <li>Share your thoughts and ideas through posts</li>
      </ul>
      <p>
        <a href="${process.env.CLIENT_URL}/dashboard" 
           style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Get Started
        </a>
      </p>
      <p>If you have any questions, feel free to explore our platform or reach out to our community!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Thank you for joining HumHub Clone!
      </p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Template for space join request notification
  async sendSpaceJoinRequestNotification(requester, space, spaceOwner) {
    const subject = `New join request for "${space.name}"`;
    const html = `
      <h2>New Space Join Request</h2>
      <p>Hi ${spaceOwner.firstName || spaceOwner.username},</p>
      <p><strong>${requester.firstName || requester.username}</strong> (@${requester.username}) has requested to join your space <strong>"${space.name}"</strong>!</p>
      ${requester.about ? `<p><em>"${requester.about}"</em></p>` : ''}
      <p>
        <a href="${process.env.CLIENT_URL}/profile/${requester.username}" 
           style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
          View Profile
        </a>
        <a href="${process.env.CLIENT_URL}/spaces/${space.url || space.id}" 
           style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Manage Space
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        You received this because you own this space. 
        You can approve or reject this request in your space management panel.
      </p>
    `;

    return await this.sendEmail(spaceOwner.email, subject, html);
  }

  /**
   * Send Password Reset Email
   * 
   * This method sends a secure password reset email with:
   * - Branded HTML template
   * - Secure reset link with token
   * - Security warnings and instructions
   * - Expiration time information
   * 
   * @param {Object} user - User object with email, firstName, username
   * @param {string} resetToken - The plain reset token (not hashed)
   * @returns {Promise<Object>} Email sending result
   */
  async sendPasswordResetEmail(user, resetToken) {
    // Build the secure reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
    
    const subject = 'Reset Your Password - Social Network';
    
    // Create a professional HTML email template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #3498db;
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #3498db; 
            margin-bottom: 10px;
          }
          .reset-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #3498db, #2980b9); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            transition: all 0.3s ease;
          }
          .reset-button:hover { 
            background: linear-gradient(135deg, #2980b9, #1f618d);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
          }
          .security-warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #856404;
          }
          .expiry-info { 
            background: #e8f4fd; 
            border: 1px solid #bee5eb; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #0c5460;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e9ecef; 
            color: #6c757d; 
            font-size: 14px; 
            text-align: center;
          }
          .token-display {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #495057;
            word-break: break-all;
            margin: 10px 0;
          }
          @media (max-width: 600px) {
            .container { padding: 20px; }
            .reset-button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌐 Social Network</div>
            <h1 style="margin: 0; color: #2c3e50;">Password Reset Request</h1>
          </div>

          <p>Hi ${user.firstName || user.username},</p>
          
          <p>We received a request to reset your password for your Social Network account. If you didn't make this request, you can safely ignore this email.</p>

          <div class="security-warning">
            <strong>⚠️ Security Notice:</strong> This password reset link will expire in <strong>15 minutes</strong> for your security. If you need to reset your password after this time, please request a new reset link.
          </div>

          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          </div>

          <div class="expiry-info">
            <strong>⏰ Link Expires:</strong> 15 minutes from now<br>
            <strong>🔒 Security:</strong> This link can only be used once
          </div>

          <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
          <div class="token-display">${resetUrl}</div>

          <div class="security-warning">
            <strong>🛡️ Security Tips:</strong>
            <ul>
              <li>Never share this reset link with anyone</li>
              <li>Always log out of shared or public computers</li>
              <li>Use a strong, unique password</li>
              <li>If you didn't request this reset, your account may be compromised</li>
            </ul>
          </div>

          <p>If you have any questions or concerns, please contact our support team.</p>

          <div class="footer">
            <p><strong>Social Network Team</strong></p>
            <p>This email was sent to ${user.email}</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
            <p style="font-size: 12px; color: #adb5bd;">
              © ${new Date().getFullYear()} Social Network. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create plain text version for email clients that don't support HTML
    const textContent = `
Password Reset Request - Social Network

Hi ${user.firstName || user.username},

We received a request to reset your password for your Social Network account.

To reset your password, click this link:
${resetUrl}

This link will expire in 15 minutes for your security.

If you didn't request a password reset, you can safely ignore this email.

Security Tips:
- Never share this reset link with anyone
- Always log out of shared or public computers  
- Use a strong, unique password
- If you didn't request this reset, your account may be compromised

If you have any questions, please contact our support team.

Social Network Team
This email was sent to ${user.email}
    `;

    return await this.sendEmail(user.email, subject, html, textContent);
  }

  /**
   * Send Password Reset Confirmation Email
   * 
   * This method sends a confirmation email after a successful password reset:
   * - Confirms the password was changed
   * - Provides security information
   * - Includes support contact information
   * 
   * @param {Object} user - User object with email, firstName, username
   * @returns {Promise<Object>} Email sending result
   */
  async sendPasswordResetConfirmationEmail(user) {
    const subject = 'Password Successfully Reset - Social Network';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Confirmation</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #27ae60;
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #27ae60; 
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #27ae60;
            margin-bottom: 20px;
          }
          .login-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #27ae60, #229954); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
          }
          .security-info { 
            background: #e8f5e8; 
            border: 1px solid #c3e6c3; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #155724;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e9ecef; 
            color: #6c757d; 
            font-size: 14px; 
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌐 Social Network</div>
            <div class="success-icon">✅</div>
            <h1 style="margin: 0; color: #2c3e50;">Password Successfully Reset</h1>
          </div>

          <p>Hi ${user.firstName || user.username},</p>
          
          <p><strong>Your password has been successfully reset!</strong></p>

          <p>You can now log in to your account using your new password. For security reasons, we recommend logging out of all other devices and logging back in.</p>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/login" class="login-button">Log In to Your Account</a>
          </div>

          <div class="security-info">
            <strong>🔒 Security Information:</strong>
            <ul>
              <li>Your password was changed on ${new Date().toLocaleString()}</li>
              <li>All existing login sessions have been maintained</li>
              <li>If you didn't make this change, please contact support immediately</li>
              <li>Consider enabling two-factor authentication for added security</li>
            </ul>
          </div>

          <p><strong>What to do next:</strong></p>
          <ul>
            <li>Log in with your new password</li>
            <li>Update your password on any devices or apps that remember it</li>
            <li>Consider reviewing your account security settings</li>
            <li>Contact support if you have any concerns</li>
          </ul>

          <div class="footer">
            <p><strong>Social Network Team</strong></p>
            <p>This email was sent to ${user.email}</p>
            <p>If you didn't reset your password, please contact our support team immediately.</p>
            <p style="font-size: 12px; color: #adb5bd;">
              © ${new Date().getFullYear()} Social Network. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Password Successfully Reset - Social Network

Hi ${user.firstName || user.username},

Your password has been successfully reset!

You can now log in to your account using your new password at:
${process.env.CLIENT_URL}/login

Security Information:
- Your password was changed on ${new Date().toLocaleString()}
- All existing login sessions have been maintained
- If you didn't make this change, please contact support immediately

What to do next:
- Log in with your new password
- Update your password on any devices or apps that remember it
- Consider reviewing your account security settings
- Contact support if you have any concerns

Social Network Team
This email was sent to ${user.email}
    `;

    return await this.sendEmail(user.email, subject, html, textContent);
  }
}

// Export singleton instance
module.exports = new EmailService();