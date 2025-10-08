# Admin Account Setup Guide

## Overview
This guide explains how to set up and manage your admin account using environment variables. The admin account will be automatically created on every server startup if it doesn't exist, ensuring persistence even when the database is recreated.

---

## How It Works

1. **On Server Startup**: The system checks if an admin account exists
2. **If No Admin Found**: Creates a new admin account using environment variables
3. **If Admin Exists**: Skips creation and logs confirmation
4. **Database Reset**: If your database is deleted (e.g., Render free tier after 30 days), the admin will be recreated automatically on next deployment

---

## Step 1: Set Environment Variables on Render

### Go to Your Render Dashboard

1. Log in to [Render](https://dashboard.render.com/)
2. Click on your **Backend Service** (saas_platform_backend or similar)
3. Go to **Environment** tab
4. Click **Add Environment Variable**

### Add These Environment Variables:

```
ADMIN_EMAIL=your-admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_USERNAME=superadmin
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### Important Notes:
- **ADMIN_EMAIL**: Must be a valid email format (this will be used for login)
- **ADMIN_PASSWORD**: Use a strong password with uppercase, lowercase, numbers, and special characters
- **ADMIN_USERNAME**: Unique username for the admin
- **ADMIN_FIRST_NAME** & **ADMIN_LAST_NAME**: Admin's display name

### Default Values (if not set):
```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=Admin@123456
ADMIN_USERNAME=superadmin
ADMIN_FIRST_NAME=Super
ADMIN_LAST_NAME=Admin
```

⚠️ **WARNING**: Always change default credentials in production!

---

## Step 2: Deploy/Restart Your Service

After adding environment variables:

1. Click **Save Changes** in Render
2. Your service will automatically redeploy
3. During startup, you'll see logs like:

```
🔧 Checking for admin account...
🔧 No admin found. Creating default admin account...
✅ ============================================
✅ Admin account created successfully!
✅ ============================================
📧 Email: your-admin@yourdomain.com
👤 Username: superadmin
🔑 Password: YourSecurePassword123!
✅ ============================================
⚠️  IMPORTANT: Please change the password after first login!
✅ ============================================
```

---

## Step 3: Test Admin Login

### Login via API:
```bash
POST https://your-backend-url.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "your-admin@yourdomain.com",
  "password": "YourSecurePassword123!"
}
```

### Or Login via Frontend:
1. Go to your frontend URL
2. Click **Login**
3. Enter your admin credentials
4. You should be logged in successfully

---

## Optional: Reset Admin Password

If you need to reset the admin password:

### Method 1: Set Environment Variable
1. Go to Render Dashboard → Environment
2. Add: `RESET_ADMIN_PASSWORD=true`
3. Update: `ADMIN_PASSWORD=NewPassword123!`
4. Save and redeploy
5. After successful reset, **remove** `RESET_ADMIN_PASSWORD` variable

### Method 2: Manual Database Update
1. Access your database
2. Run this SQL (replace with your new password hash):
```sql
UPDATE users 
SET password = '$2a$12$YOUR_HASHED_PASSWORD_HERE'
WHERE email = 'your-admin@yourdomain.com';
```

---

## Security Best Practices

### 1. Use Strong Passwords
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Example: `MyS3cur3P@ssw0rd!2024`

### 2. Use Unique Email
- Use a dedicated admin email
- Example: `admin@yourdomain.com` or `security@yourdomain.com`

### 3. Change Default Credentials
- NEVER use default values in production
- Change password immediately after first login

### 4. Secure Environment Variables
- Never commit `.env` files to Git
- Keep environment variables confidential
- Rotate passwords regularly

### 5. Monitor Admin Activity
- Check logs for admin logins
- Set up alerts for admin actions
- Audit admin activities regularly

---

## Troubleshooting

### Admin Account Not Created?

**Check Logs:**
```
render logs -n 100
```

**Common Issues:**

1. **Database Connection Failed**
   - Ensure `DATABASE_URL` is set correctly
   - Check database is running

2. **Environment Variables Not Set**
   - Verify variables in Render Dashboard
   - Redeploy after setting variables

3. **User Already Exists Error**
   - Admin might already exist with different email
   - Check database: `SELECT * FROM users WHERE role = 'admin';`

### How to Manually Check Admin

**Connect to your database:**
```bash
psql <YOUR_DATABASE_URL>
```

**Check for admin:**
```sql
SELECT id, email, username, role, "createdAt" 
FROM users 
WHERE role = 'admin';
```

### How to Delete and Recreate Admin

**Option 1: Delete from Database**
```sql
DELETE FROM users WHERE email = 'your-admin@yourdomain.com';
```
Then restart your service.

**Option 2: Update Environment Variable**
Change `ADMIN_EMAIL` to a new email and restart.

---

## What Happens After 30 Days?

### Render Free Tier Database Deletion:
1. **Day 30**: Database is deleted
2. **You deploy again**: New database created
3. **Server starts**: Admin initialization script runs
4. **Result**: Admin account automatically recreated! ✅

### Steps to Handle Database Reset:
1. Database gets deleted (after 30 days)
2. Trigger a new deployment on Render (or it happens automatically)
3. New database created
4. Tables synced
5. Admin account recreated automatically
6. **No manual intervention needed!** 🎉

---

## Advanced Configuration

### Multiple Admin Accounts
To create multiple admins, you can:

1. **Create a script** in `server/scripts/create-additional-admin.js`
2. **Add endpoint** `/api/admin/create-admin` (protected)
3. **Use API** to create additional admins after initial setup

### Admin Role Permissions
The admin account has:
- `role: 'admin'`
- `status: 1` (active)
- `isEmailVerified: true`
- Full access to all platform features

### Modify Admin Creation Logic
Edit `server/scripts/init-admin.js` to customize:
- Additional admin fields
- Multiple admin creation
- Admin permissions
- Organization assignment

---

## Testing Locally

### 1. Create `.env` file in server folder:
```bash
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Test@123456
ADMIN_USERNAME=testadmin
ADMIN_FIRST_NAME=Test
ADMIN_LAST_NAME=Admin
```

### 2. Start your server:
```bash
cd server
npm start
```

### 3. Check console output:
You should see admin creation logs

---

## Quick Reference

### Environment Variables Table
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_EMAIL` | Yes | admin@yourdomain.com | Admin email (login) |
| `ADMIN_PASSWORD` | Yes | Admin@123456 | Admin password |
| `ADMIN_USERNAME` | No | superadmin | Admin username |
| `ADMIN_FIRST_NAME` | No | Super | Admin first name |
| `ADMIN_LAST_NAME` | No | Admin | Admin last name |
| `RESET_ADMIN_PASSWORD` | No | - | Set to 'true' to reset password |

### Important Files
- `server/scripts/init-admin.js` - Admin initialization script
- `server/app.js` - Server startup (calls init-admin)
- `server/models/User.js` - User model
- `.env` - Environment variables (local only)

---

## Need Help?

### Check Server Logs:
```bash
# On Render
render logs

# Locally
tail -f server/logs/app.log
```

### Common Commands:
```bash
# Restart Render service
render restart

# Check environment variables
render env list

# SSH into Render instance
render ssh
```

---

## Summary

✅ **Automatic**: Admin created on every startup if missing  
✅ **Persistent**: Survives database resets  
✅ **Secure**: Uses environment variables  
✅ **Simple**: No manual SQL needed  
✅ **Reliable**: Works on Render free tier  

**You're all set! Your admin account will persist even after database resets!** 🎉

