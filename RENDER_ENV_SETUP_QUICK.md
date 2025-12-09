# Quick Render Environment Variables Setup

## Your SendGrid Configuration

Based on your setup, add these environment variables in Render:

### Required Variables

1. **EMAIL_SERVICE**
   ```
   EMAIL_SERVICE=sendgrid
   ```

2. **EMAIL_PASSWORD** (Your SendGrid API Key)
   ```
   EMAIL_PASSWORD=SG.your_actual_sendgrid_api_key_here
   ```
   - Get this from: SendGrid Dashboard → Settings → API Keys
   - Copy the full key (starts with `SG.`)

3. **EMAIL_FROM** (Your Verified SendGrid Email)
   ```
   EMAIL_FROM=macbayprince76@gmail.com
   ```
   - **This must match the email you verified in SendGrid**
   - This is the email address that will appear as the sender

## How to Add in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend web service
3. Go to **Environment** tab
4. Click **Add Environment Variable** for each one
5. Add all three variables above
6. Click **Save Changes**
7. Render will automatically redeploy

## After Setup

- ✅ Emails will be sent from `macbayprince76@gmail.com`
- ✅ Users will receive verification emails
- ✅ All email notifications will work

## Verify It's Working

After redeploy, check Render logs for:
- `📧 Email service initialized with SendGrid HTTP API`
- `📧 Verification email sent successfully to: user@example.com`

If you see errors, check:
- API key is correct (starts with `SG.`)
- Email is verified in SendGrid dashboard
- `EMAIL_FROM` matches verified email exactly

