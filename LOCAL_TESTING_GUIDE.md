# Local Testing Guide - Forgot Password Feature

This guide will help you test the forgot password feature locally before deploying to production.

## 🚀 Quick Start

### 1. Start Your Services

**Backend Server:**
```bash
cd server
npm run dev
```

**Frontend Server:**
```bash
cd client
npm run dev
```

### 2. Test the Feature

1. Go to `http://localhost:3000/login`
2. Click "Forgot your password?"
3. Enter your email address
4. Check the console logs for debug token
5. Use the token in the reset URL

## 📋 Detailed Testing Steps

### Step 1: Database Setup

The password reset tokens table will be created automatically when you start the backend server. If you need to manually create it:

```bash
cd server
npm run db:migrate-password-reset
```

### Step 2: Environment Configuration

Create a `.env` file in the `server` directory with these variables:

```bash
# Database (adjust for your setup)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_network_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for testing)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="Social Network" <your-email@gmail.com>

# Frontend URL
CLIENT_URL=http://localhost:3000

# Token expiry (optional, defaults to 15 minutes)
RESET_TOKEN_EXPIRY=15
```

### Step 3: Email Setup (Gmail)

For local testing with Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the 16-character app password** in your `.env` file

### Step 4: Run Automated Tests

Use the test script to verify API endpoints:

```bash
cd server
node test-forgot-password.js your-email@example.com
```

This will test:
- ✅ Forgot password endpoint
- ✅ Reset password endpoint
- ✅ Invalid token scenarios
- ✅ Email validation

## 🧪 Manual Testing Scenarios

### Scenario 1: Happy Path

1. **Start with a registered user account**
2. **Go to login page:** `http://localhost:3000/login`
3. **Click "Forgot your password?"**
4. **Enter valid email address**
5. **Check console logs** for debug token (development mode)
6. **Check email** for reset link
7. **Click reset link** or manually navigate to `/reset-password?token=YOUR_TOKEN`
8. **Enter new password** (must meet strength requirements)
9. **Verify success** and redirect to login

### Scenario 2: Invalid Email

1. **Enter non-existent email**
2. **Verify success message** (prevents email enumeration)
3. **Check console logs** for security logging

### Scenario 3: Invalid Token

1. **Try resetting with invalid token**
2. **Verify error message**
3. **Try expired token** (wait 15+ minutes)
4. **Try used token** (after successful reset)

### Scenario 4: Password Validation

Test these password scenarios:
- ✅ `Password123` (meets requirements)
- ❌ `password` (too weak)
- ❌ `PASSWORD` (no lowercase/numbers)
- ❌ `pass` (too short)

### Scenario 5: Email Templates

Check email formatting:
- ✅ HTML rendering
- ✅ Mobile responsiveness
- ✅ Branding consistency
- ✅ Security warnings
- ✅ Clear instructions

## 🔍 Debugging

### Backend Logs

Watch the backend console for these messages:

```bash
🔐 Password reset requested for email: user@example.com
✅ Password reset token created for user: username (ID: 123)
📧 Password reset email sent successfully to: user@example.com
```

### Frontend Console

Check browser console for:
- API request/response logs
- Form validation errors
- Navigation issues

### Database Verification

Check the `password_reset_tokens` table:

```sql
SELECT * FROM password_reset_tokens ORDER BY created_at DESC LIMIT 5;
```

### Email Debugging

In development mode, emails are logged to console:
- Check for "Preview URL" messages
- Verify email content
- Test with Ethereal email service

## 🐛 Common Issues & Solutions

### Issue 1: Email Not Sending

**Symptoms:** No email received, no preview URL in logs

**Solutions:**
1. Check email credentials in `.env`
2. Verify Gmail app password is correct
3. Check SMTP settings
4. Try different email service (SendGrid, Mailgun)

### Issue 2: Token Not Working

**Symptoms:** "Invalid or expired token" error

**Solutions:**
1. Check if token expired (15 minutes)
2. Verify token format in URL
3. Check database for token record
4. Ensure `JWT_SECRET` is set

### Issue 3: Frontend Routing Issues

**Symptoms:** 404 errors on forgot/reset password pages

**Solutions:**
1. Verify routes added to `App.jsx`
2. Check component imports
3. Restart frontend server
4. Clear browser cache

### Issue 4: Database Connection Issues

**Symptoms:** Server won't start, database errors

**Solutions:**
1. Check database connection string
2. Verify PostgreSQL is running
3. Check database credentials
4. Run migration script manually

## 📱 Mobile Testing

Test on mobile devices:

1. **Responsive design** - Check form layouts
2. **Touch interactions** - Verify buttons work
3. **Email links** - Test clicking reset links in mobile email apps
4. **Password input** - Test password visibility toggles

## 🔒 Security Testing

Verify security features:

1. **Email enumeration protection** - Invalid emails return same message
2. **Token expiration** - Tokens expire after 15 minutes
3. **Single-use tokens** - Tokens can't be reused
4. **Password hashing** - Passwords are hashed in database
5. **HTTPS enforcement** - Reset links use HTTPS in production

## 📊 Performance Testing

Test under load:

1. **Multiple requests** - Send multiple forgot password requests
2. **Token cleanup** - Verify expired tokens are cleaned up
3. **Database performance** - Check query performance
4. **Email rate limiting** - Consider implementing rate limits

## 🎯 Production Readiness Checklist

Before deploying to production:

- [ ] Email service configured (SendGrid recommended)
- [ ] HTTPS URLs configured
- [ ] Environment variables set in Render
- [ ] Database migration completed
- [ ] Email templates tested
- [ ] Mobile responsiveness verified
- [ ] Security features validated
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Monitoring configured

## 📞 Support

If you encounter issues:

1. **Check logs** - Backend and frontend console
2. **Verify configuration** - Environment variables
3. **Test endpoints** - Use the test script
4. **Check database** - Verify table creation
5. **Review documentation** - Check setup guide

The feature is production-ready and follows security best practices!
