# Delete Old Admin Account Guide

## Problem
Your database has an old admin account with email `20234417@std.neu.edu.tr`, but you want to use the admin credentials from your Render environment variables.

---

## Solution Options

### **Option 1: Delete via Render Database Console (Easiest)**

1. **Go to Render Dashboard**
   - Navigate to your PostgreSQL database service
   - Click on the database name
   - Click **"Connect"** → **"External Connection"**
   - Copy the **PSQL Command**

2. **Connect to Database**
   ```bash
   # The command will look like this:
   PGPASSWORD=<password> psql -h <host> -U <user> <database>
   ```

3. **Run These SQL Commands**
   ```sql
   -- First, check current admins
   SELECT id, email, username, "firstName", "lastName", role 
   FROM users 
   WHERE role = 'admin' OR username = 'superadmin';
   
   -- Delete the old admin's profile first (foreign key constraint)
   DELETE FROM user_profiles 
   WHERE "userId" IN (
     SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr'
   );
   
   -- Delete the old admin user
   DELETE FROM users WHERE email = '20234417@std.neu.edu.tr';
   
   -- Verify deletion
   SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';
   ```

4. **Restart Your Render Service**
   - Go to Render Dashboard
   - Click on your backend service
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Or click **"Restart Service"**

5. **Check Logs**
   - You should see:
   ```
   🔧 No admin found. Creating default admin account...
   ✅ Admin account created successfully!
   📧 Email: your-admin@yourdomain.com
   ```

---

### **Option 2: Use Cleanup Script (Automated)**

1. **Run the cleanup script locally** (if you have access to production database):
   ```bash
   cd server
   node scripts/cleanup-admin.js
   ```

2. **Or add it as a one-time command on Render**:
   - Go to Render Dashboard → Your Backend Service
   - Click **"Shell"** tab
   - Run:
   ```bash
   node scripts/cleanup-admin.js
   ```

3. **Restart your service** after cleanup

---

### **Option 3: Quick SQL via Render Shell**

1. **Open Render Shell**
   - Go to your backend service
   - Click **"Shell"** tab

2. **Connect to database and run SQL**:
   ```bash
   # Get database URL
   echo $DATABASE_URL
   
   # Connect to database
   psql $DATABASE_URL
   
   # Run SQL
   DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr');
   DELETE FROM users WHERE email = '20234417@std.neu.edu.tr';
   
   # Exit
   \q
   
   # Restart the app
   exit
   ```

3. **Trigger a restart** from Render Dashboard

---

## Recommended: Option 1 (Database Console)

**Step-by-step:**

### 1. Access Your Database
```bash
# Go to Render Dashboard
# → PostgreSQL Database
# → Click "Connect"
# → Copy and run the PSQL command
```

### 2. Delete Old Admin
```sql
-- Copy and paste this entire block:

BEGIN;

-- Show current admin
SELECT id, email, username FROM users WHERE email = '20234417@std.neu.edu.tr';

-- Delete profile
DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr');

-- Delete user
DELETE FROM users WHERE email = '20234417@std.neu.edu.tr';

-- Verify
SELECT COUNT(*) FROM users WHERE role = 'admin';

COMMIT;
```

### 3. Restart Service
- Render Dashboard → Backend Service → **"Restart Service"**

### 4. Verify New Admin Created
Check logs for:
```
✅ Admin account created successfully!
📧 Email: <your-env-variable-email>
👤 Username: <your-env-variable-username>
```

---

## After Deletion

Once you delete the old admin and restart:

1. **Server starts** ✅
2. **init-admin.js runs** ✅
3. **Checks for admin** → None found ✅
4. **Creates new admin** using your environment variables ✅
5. **You can login** with your new credentials ✅

---

## Verify Environment Variables

Before deleting, make sure these are set in Render:

```
ADMIN_EMAIL=your-admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_USERNAME=youradminusername
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

**Check in Render:**
- Dashboard → Backend Service → **Environment** tab
- Verify all variables are set

---

## Troubleshooting

### "Permission denied" when deleting
```sql
-- Make sure you're connected to the right database
\c your_database_name

-- Try with CASCADE
DELETE FROM users WHERE email = '20234417@std.neu.edu.tr' CASCADE;
```

### "Cannot delete - foreign key constraint"
```sql
-- Delete in correct order:
-- 1. First delete related records
DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr');
DELETE FROM posts WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr');
DELETE FROM comments WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr');

-- 2. Then delete user
DELETE FROM users WHERE email = '20234417@std.neu.edu.tr';
```

### Admin still not created after restart
- Check logs: `render logs -n 100`
- Verify environment variables are set
- Check for errors in init-admin.js execution

---

## Quick Command Summary

**Delete old admin (one-liner):**
```sql
DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr'); DELETE FROM users WHERE email = '20234417@std.neu.edu.tr';
```

**Check if admin exists:**
```sql
SELECT email, username, role FROM users WHERE role = 'admin';
```

**Restart Render service:**
```bash
# Via Render Dashboard: Manual Deploy → Deploy latest commit
# Or: Click "Restart Service" button
```

---

## Need Help?

If you encounter issues:

1. **Check database connection**: Verify DATABASE_URL is correct
2. **Check environment variables**: All ADMIN_* variables set
3. **Check logs**: Look for init-admin.js output
4. **Manual verification**: Query database to see if admin exists

**Still stuck?** Share the error logs and I'll help debug!
