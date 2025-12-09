# SendGrid Email Service Setup Guide

## Problem
You're seeing these errors:
- `SendGrid API error: Unauthorized`
- `Maximum credits exceeded`

This means your SendGrid API key is either missing, invalid, or your free tier limit has been reached.

## Solution Options

### Option 1: Fix SendGrid Configuration (Recommended)

1. **Sign up for SendGrid** (if you haven't):
   - Go to https://sendgrid.com
   - Create a free account (100 emails/day free)

2. **Create an API Key**:
   - Log into SendGrid dashboard
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "Social Network API Key")
   - Choose "Full Access" or "Restricted Access" with Mail Send permissions
   - Copy the API key (you'll only see it once!)

3. **Verify Your Sender Email** (Choose ONE option):

   **Option A: Single Sender Verification (EASIER - Recommended for testing)**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Fill in your email address and details
   - Click "Create"
   - Check your email and click the verification link
   - ✅ Done! No DNS records needed
   - Use this email in `EMAIL_FROM` environment variable

   **Option B: Domain Authentication (ADVANCED - For production)**
   - Go to Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Select your domain provider or "Other"
   - SendGrid will give you DNS records to add
   - Add these records to your domain's DNS settings:
     - CNAME records (for email tracking)
     - TXT records (for DMARC)
   - Wait for DNS propagation (can take up to 48 hours)
   - Click "Verify" in SendGrid
   - ✅ Once verified, you can send from any email on that domain
   - Use any email from your domain in `EMAIL_FROM` (e.g., noreply@yourdomain.com)

4. **Set Environment Variables in Render**:
   - Go to your Render service dashboard
   - Navigate to Environment tab
   - Add/Update these variables:
     ```
     EMAIL_SERVICE=sendgrid
     EMAIL_PASSWORD=SG.your_api_key_here
     EMAIL_FROM=noreply@yourdomain.com
     ```
   - Replace `SG.your_api_key_here` with your actual SendGrid API key
   - Replace `noreply@yourdomain.com` with your verified sender email

5. **Redeploy** your Render service to apply the changes

### Option 2: Use Gmail SMTP (Alternative)

If you prefer Gmail:

1. **Enable App Password in Gmail**:
   - Go to your Google Account settings
   - Security → 2-Step Verification (enable if not already)
   - App Passwords → Generate new app password
   - Copy the 16-character password

2. **Set Environment Variables in Render**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Redeploy** your Render service

### Option 3: Use Another Email Service

You can use any SMTP service:
- **Mailgun** (free tier: 5,000 emails/month)
- **Amazon SES** (very cheap, pay-as-you-go)
- **Postmark** (free tier: 100 emails/month)

Just set the appropriate `EMAIL_SERVICE` and credentials.

## Testing Email Service

After setting up, test by:
1. Registering a new user
2. Check Render logs for email sending status
3. Check your email inbox (and spam folder)

## Troubleshooting

### "Unauthorized" Error
- Check that your API key is correct
- Make sure you copied the full API key (starts with `SG.`)
- Verify the sender email is verified in SendGrid

### "Maximum credits exceeded"
- Free tier: 100 emails/day
- Check your SendGrid dashboard for usage
- Wait until next day or upgrade to paid plan
- Or switch to a different email service

### Emails not arriving
- Check spam/junk folder
- Verify sender email is authenticated in SendGrid
- Check Render logs for email sending errors
- Make sure `EMAIL_FROM` matches your verified sender

## Current Status

Based on your logs:
- ✅ Registration is working
- ✅ Email verification token is being created
- ❌ Email sending is failing (SendGrid configuration issue)

Once you fix the SendGrid configuration, emails will be sent automatically!

