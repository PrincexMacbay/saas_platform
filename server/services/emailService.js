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

  // Template for space join approval notification
  async sendSpaceJoinApprovalNotification(user, space) {
    const subject = `Your request to join "${space.name}" has been approved`;
    const html = `
      <h2>Space Join Request Approved!</h2>
      <p>Hi ${user.firstName || user.username},</p>
      <p>Great news! Your request to join the space <strong>"${space.name}"</strong> has been approved.</p>
      ${space.description ? `<p><em>${space.description}</em></p>` : ''}
      <p>You can now participate in discussions, share posts, and connect with other members of this space.</p>
      <p>
        <a href="${process.env.CLIENT_URL}/spaces/${space.url || space.id}" 
           style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Visit Space
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        You received this because your join request was approved. 
        Welcome to ${space.name}!
      </p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Template for space join rejection notification
  async sendSpaceJoinRejectionNotification(user, space) {
    const subject = `Update on your request to join "${space.name}"`;
    const html = `
      <h2>Space Join Request Update</h2>
      <p>Hi ${user.firstName || user.username},</p>
      <p>We wanted to let you know that your request to join the space <strong>"${space.name}"</strong> was not approved at this time.</p>
      <p>This could be due to various reasons such as space capacity, membership criteria, or other factors determined by the space administrators.</p>
      <p>You're welcome to explore other spaces on our platform or try again in the future.</p>
      <p>
        <a href="${process.env.CLIENT_URL}/spaces" 
           style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Explore Other Spaces
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        If you have any questions, please contact the space administrators or our support team.
      </p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Template for reminder email (used for payment reminders, renewals, etc.)
  async sendReminderEmail(userEmail, reminderData) {
    const { name, message, type, reminderDate } = reminderData;
    
    // Determine subject and styling based on reminder type
    let subject = '';
    let typeLabel = '';
    let color = '#3498db'; // Default blue
    
    switch (type) {
      case 'payment_due':
        subject = `Payment Due Reminder: ${name}`;
        typeLabel = 'Payment Due';
        color = '#f39c12'; // Orange
        break;
      case 'overdue':
        subject = `⚠️ Overdue Payment: ${name}`;
        typeLabel = 'Overdue Payment';
        color = '#e74c3c'; // Red
        break;
      case 'renewal':
        subject = `Renewal Reminder: ${name}`;
        typeLabel = 'Renewal Reminder';
        color = '#3498db'; // Blue
        break;
      case 'welcome':
        subject = `Welcome: ${name}`;
        typeLabel = 'Welcome';
        color = '#27ae60'; // Green
        break;
      default:
        subject = `Reminder: ${name}`;
        typeLabel = 'Reminder';
        color = '#3498db'; // Blue
    }
    
    const formattedDate = reminderDate ? new Date(reminderDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
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
            border-bottom: 3px solid ${color};
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: ${color}; 
            margin-bottom: 10px;
          }
          .reminder-type {
            display: inline-block;
            background: ${color};
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 15px;
          }
          .reminder-content {
            background: #f8f9fa;
            border-left: 4px solid ${color};
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .reminder-date {
            background: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #0c5460;
            text-align: center;
          }
          .action-button { 
            display: inline-block; 
            background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)}); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e9ecef; 
            color: #6c757d; 
            font-size: 14px; 
            text-align: center;
          }
          @media (max-width: 600px) {
            .container { padding: 20px; }
            .action-button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📧 Reminder Notification</div>
            <div class="reminder-type">${typeLabel}</div>
            <h1 style="margin: 0; color: #2c3e50;">${name}</h1>
          </div>

          <div class="reminder-date">
            <strong>📅 Reminder Date:</strong> ${formattedDate}
          </div>

          <div class="reminder-content">
            ${message || 'This is a reminder notification from your account.'}
          </div>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" class="action-button">
              View Dashboard
            </a>
          </div>

          <div class="footer">
            <p><strong>Social Network Team</strong></p>
            <p>This email was sent to ${userEmail}</p>
            <p>If you have any questions, please contact our support team.</p>
            <p style="font-size: 12px; color: #adb5bd;">
              © ${new Date().getFullYear()} Social Network. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
${subject}

Reminder Date: ${formattedDate}

${message || 'This is a reminder notification from your account.'}

View your dashboard: ${process.env.CLIENT_URL}/dashboard

---
Social Network Team
This email was sent to ${userEmail}
    `;

    return await this.sendEmail(userEmail, subject, html, textContent);
  }

  // Helper method to darken color for gradients
  darkenColor(color) {
    // Simple color darkening - converts hex to darker shade
    if (color.startsWith('#')) {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.max(0, (num >> 16) - 20);
      const g = Math.max(0, ((num >> 8) & 0x00FF) - 20);
      const b = Math.max(0, (num & 0x0000FF) - 20);
      return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    return color;
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

  /**
   * Send Payment Confirmation Email
   * 
   * Sends a confirmation email after a successful payment
   * 
   * @param {Object} user - User object with email, firstName, username
   * @param {Object} payment - Payment object with amount, plan, transactionId, etc.
   * @returns {Promise<Object>} Email sending result
   */
  async sendPaymentConfirmationEmail(user, payment) {
    const subject = `Payment Confirmation - ${payment.plan?.name || 'Membership Payment'}`;
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payment.currency || 'USD'
    }).format(payment.amount);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
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
          .payment-details {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .payment-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #27ae60;
          }
          .dashboard-button { 
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
            <h1 style="margin: 0; color: #2c3e50;">Payment Confirmed</h1>
          </div>

          <p>Hi ${user.firstName || user.username},</p>
          
          <p><strong>Your payment has been successfully processed!</strong></p>

          <div class="payment-details">
            <div class="payment-row">
              <span>Plan:</span>
              <span>${payment.plan?.name || 'N/A'}</span>
            </div>
            <div class="payment-row">
              <span>Amount:</span>
              <span>${formattedAmount}</span>
            </div>
            ${payment.transactionId ? `
            <div class="payment-row">
              <span>Transaction ID:</span>
              <span style="font-family: monospace; font-size: 12px;">${payment.transactionId}</span>
            </div>
            ` : ''}
            ${payment.identifier ? `
            <div class="payment-row">
              <span>Payment ID:</span>
              <span style="font-family: monospace; font-size: 12px;">${payment.identifier}</span>
            </div>
            ` : ''}
            <div class="payment-row">
              <span>Date:</span>
              <span>${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="payment-row">
              <span>Status:</span>
              <span style="color: #27ae60; font-weight: bold;">Completed</span>
            </div>
          </div>

          ${payment.subscription?.memberNumber ? `
          <p><strong>Member Number:</strong> ${payment.subscription.memberNumber}</p>
          ` : ''}

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" class="dashboard-button">
              View Dashboard
            </a>
          </div>

          <p>Thank you for your payment. If you have any questions, please contact our support team.</p>

          <div class="footer">
            <p><strong>Social Network Team</strong></p>
            <p>This email was sent to ${user.email}</p>
            <p style="font-size: 12px; color: #adb5bd;">
              © ${new Date().getFullYear()} Social Network. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Payment Confirmation - Social Network

Hi ${user.firstName || user.username},

Your payment has been successfully processed!

Payment Details:
- Plan: ${payment.plan?.name || 'N/A'}
- Amount: ${formattedAmount}
${payment.transactionId ? `- Transaction ID: ${payment.transactionId}` : ''}
${payment.identifier ? `- Payment ID: ${payment.identifier}` : ''}
- Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString()}
- Status: Completed
${payment.subscription?.memberNumber ? `- Member Number: ${payment.subscription.memberNumber}` : ''}

View your dashboard: ${process.env.CLIENT_URL}/dashboard

Thank you for your payment. If you have any questions, please contact our support team.

Social Network Team
This email was sent to ${user.email}
    `;

    return await this.sendEmail(user.email, subject, html, textContent);
  }

  /**
   * Send Payment Failure Email
   * 
   * Sends a notification email when a payment fails
   * 
   * @param {Object} user - User object with email, firstName, username
   * @param {Object} payment - Payment object with amount, plan, error details, etc.
   * @returns {Promise<Object>} Email sending result
   */
  async sendPaymentFailureEmail(user, payment) {
    const subject = `Payment Failed - Action Required`;
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payment.currency || 'USD'
    }).format(payment.amount);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
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
            border-bottom: 2px solid #e74c3c;
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #e74c3c; 
            margin-bottom: 10px;
          }
          .warning-icon {
            font-size: 48px;
            color: #e74c3c;
            margin-bottom: 20px;
          }
          .payment-details {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ffeaa7;
          }
          .payment-row:last-child {
            border-bottom: none;
          }
          .action-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #e74c3c, #c0392b); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
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
            <div class="warning-icon">⚠️</div>
            <h1 style="margin: 0; color: #2c3e50;">Payment Failed</h1>
          </div>

          <p>Hi ${user.firstName || user.username},</p>
          
          <p><strong>We were unable to process your payment.</strong></p>

          <div class="payment-details">
            <div class="payment-row">
              <span>Plan:</span>
              <span>${payment.plan?.name || 'N/A'}</span>
            </div>
            <div class="payment-row">
              <span>Amount:</span>
              <span>${formattedAmount}</span>
            </div>
            <div class="payment-row">
              <span>Date:</span>
              <span>${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            ${payment.error || payment.notes ? `
            <div class="payment-row">
              <span>Reason:</span>
              <span>${payment.error || payment.notes || 'Payment processing failed'}</span>
            </div>
            ` : ''}
          </div>

          <p><strong>What you need to do:</strong></p>
          <ul>
            <li>Check your payment method (card, bank account, etc.)</li>
            <li>Ensure you have sufficient funds</li>
            <li>Verify your payment information is correct</li>
            <li>Try updating your payment method and retry</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" class="action-button">
              Update Payment Method
            </a>
          </div>

          <p>If you continue to experience issues, please contact our support team for assistance.</p>

          <div class="footer">
            <p><strong>Social Network Team</strong></p>
            <p>This email was sent to ${user.email}</p>
            <p style="font-size: 12px; color: #adb5bd;">
              © ${new Date().getFullYear()} Social Network. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Payment Failed - Action Required - Social Network

Hi ${user.firstName || user.username},

We were unable to process your payment.

Payment Details:
- Plan: ${payment.plan?.name || 'N/A'}
- Amount: ${formattedAmount}
- Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString()}
${payment.error || payment.notes ? `- Reason: ${payment.error || payment.notes}` : ''}

What you need to do:
- Check your payment method (card, bank account, etc.)
- Ensure you have sufficient funds
- Verify your payment information is correct
- Try updating your payment method and retry

Update your payment method: ${process.env.CLIENT_URL}/dashboard

If you continue to experience issues, please contact our support team for assistance.

Social Network Team
This email was sent to ${user.email}
    `;

    return await this.sendEmail(user.email, subject, html, textContent);
  }

  /**
   * Send Email Verification Email
   * 
   * Sends an email with a verification link to verify the user's email address
   * 
   * @param {Object} user - User object with email, firstName, username
   * @param {string} verificationToken - The plain verification token (not hashed)
   * @returns {Promise<Object>} Email sending result
   */
  async sendEmailVerificationEmail(user, verificationToken) {
    // Build the verification URL
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    
    const subject = 'Verify Your Email Address - Social Network';
    
    // Create a professional HTML email template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
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
          .verify-button { 
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
          .verify-button:hover { 
            background: linear-gradient(135deg, #2980b9, #1f618d);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
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
            .verify-button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌐 Social Network</div>
            <h1 style="margin: 0; color: #2c3e50;">Verify Your Email Address</h1>
          </div>

          <p>Hi ${user.firstName || user.username},</p>
          
          <p>Thank you for signing up! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
          </div>

          <div class="expiry-info">
            <strong>⏰ Link Expires:</strong> 24 hours from now<br>
            <strong>🔒 Security:</strong> This link can only be used once
          </div>

          <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
          <div class="token-display">${verificationUrl}</div>

          <p>If you didn't create an account with us, you can safely ignore this email.</p>

          <div class="footer">
            <p><strong>Social Network Team</strong></p>
            <p>This email was sent to ${user.email}</p>
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
Verify Your Email Address - Social Network

Hi ${user.firstName || user.username},

Thank you for signing up! To complete your registration and activate your account, please verify your email address by clicking this link:

${verificationUrl}

This link will expire in 24 hours for your security.

If you didn't create an account with us, you can safely ignore this email.

Social Network Team
This email was sent to ${user.email}
    `;

    return await this.sendEmail(user.email, subject, html, textContent);
  }
}

// Export singleton instance
module.exports = new EmailService();