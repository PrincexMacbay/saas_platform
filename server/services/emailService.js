const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    // Create transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use real SMTP service (Gmail, SendGrid, etc.)
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
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
      <h2>Welcome to HumHub Clone!</h2>
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
}

// Export singleton instance
module.exports = new EmailService();