# Forgot Password Feature Setup Guide

This guide will help you set up the complete forgot password feature for your Social Network application on Render.

## 📋 Overview

The forgot password feature includes:
- ✅ Database migration for password reset tokens
- ✅ Backend API endpoints (`/api/auth/forgot-password`, `/api/auth/reset-password`)
- ✅ Secure email service with branded templates
- ✅ Frontend pages (ForgotPassword, ResetPassword)
- ✅ Password strength validation
- ✅ Token expiration and security features

## 🔧 Environment Variables for Render

### Required Environment Variables

Add these environment variables to your Render backend service:

```bash
# ================= EMAIL CONFIGURATION ========================
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM="Social Network" <noreply@yourdomain.com>

# Alternative: SendGrid (Recommended for Production)
# EMAIL_SERVICE=sendgrid
# EMAIL_USER=apikey
# EMAIL_PASSWORD=your_sendgrid_api_key

# Alternative: Custom SMTP
# EMAIL_HOST=smtp.your-provider.com
# EMAIL_PORT=587
# EMAIL_USER=your-username
# EMAIL_PASSWORD=your-password

# ================= PASSWORD RESET ========================
RESET_TOKEN_EXPIRY=15

# ================= FRONTEND URLS ========================
CLIENT_URL=https://your-frontend-app.onrender.com
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### Already Configured Variables

These should already be set in your Render service:
- `DATABASE_URL` (PostgreSQL connection)
- `JWT_SECRET` (JWT token secret)
- `NODE_ENV=production`

## 📧 Email Service Options

### Option 1: Gmail (Development/Testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   EMAIL_FROM="Social Network" <your-email@gmail.com>
   ```

### Option 2: SendGrid (Production Recommended)

1. Sign up for SendGrid account
2. Create an API key
3. Use these settings:
   ```bash
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM="Social Network" <noreply@yourdomain.com>
   ```

### Option 3: Mailgun

1. Sign up for Mailgun account
2. Get SMTP credentials
3. Use these settings:
   ```bash
   EMAIL_SERVICE=
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=your_mailgun_username
   EMAIL_PASSWORD=your_mailgun_password
   EMAIL_FROM="Social Network" <noreply@yourdomain.com>
   ```

## 🚀 Deployment Steps

### 1. Database Migration

The new `PasswordResetToken` model will be automatically created when your backend starts up (Sequelize sync).

### 2. Backend Deployment

1. Commit all changes to your repository
2. Render will automatically deploy the updated backend
3. Verify the new API endpoints are available:
   - `POST /api/auth/forgot-password`
   - `POST /api/auth/reset-password`

### 3. Frontend Deployment

1. The new pages are automatically included in your frontend
2. Routes are configured in `App.jsx`:
   - `/forgot-password` - ForgotPasswordPage
   - `/reset-password` - ResetPasswordPage
3. Login page now includes "Forgot Password" link

## 🧪 Testing the Feature

### Local Testing

1. **Start your backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Test the flow:**
   - Go to `http://localhost:3000/login`
   - Click "Forgot your password?"
   - Enter your email address
   - Check console logs for debug token (development mode)
   - Use the token in the reset URL: `http://localhost:3000/reset-password?token=YOUR_TOKEN`

### Production Testing

1. **Test forgot password:**
   - Go to your live site
   - Click "Forgot Password" on login page
   - Enter a valid email address
   - Check email for reset link

2. **Test reset password:**
   - Click the reset link in email
   - Enter new password (must meet requirements)
   - Verify successful reset and redirect to login

## 🔒 Security Features

### Token Security
- ✅ Tokens are hashed before database storage
- ✅ Tokens expire after 15 minutes
- ✅ Tokens are single-use only
- ✅ Cryptographically secure token generation

### Password Security
- ✅ Passwords are hashed with bcrypt (12 rounds)
- ✅ Password strength validation
- ✅ Minimum requirements enforced

### Email Security
- ✅ Prevents email enumeration attacks
- ✅ Always returns success message
- ✅ Secure reset links with HTTPS

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending:**
   - Check email credentials in environment variables
   - Verify SMTP settings
   - Check Render logs for email errors

2. **Token validation failing:**
   - Ensure `JWT_SECRET` is set
   - Check database connection
   - Verify token hasn't expired (15 minutes)

3. **Frontend routing issues:**
   - Ensure new routes are added to `App.jsx`
   - Check browser console for JavaScript errors
   - Verify environment variables are set

### Debug Mode

In development, the backend returns debug information:
- Reset tokens are logged to console
- Token expiration times are shown
- Detailed error messages are provided

## 📱 User Experience

### Forgot Password Flow
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Receives branded email with reset link
4. Clicks link to go to reset page
5. Enters new password (with strength validation)
6. Password is updated and user is redirected to login

### Email Templates
- Professional HTML design
- Mobile-responsive
- Clear instructions and security warnings
- Branded with your app's styling

## 🔄 Maintenance

### Cleanup Expired Tokens
The system automatically cleans up expired tokens, but you can also run manual cleanup:

```javascript
// In your backend console or script
const { PasswordResetToken } = require('./models');
await PasswordResetToken.cleanupExpiredTokens();
```

### Monitoring
- Monitor email delivery rates
- Check for failed password reset attempts
- Review token usage patterns

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify all environment variables are set
3. Test email configuration separately
4. Check database connectivity

The feature is production-ready and follows security best practices!
