# Quick Steps to Delete Old Admin and Create New One

## Current Situation
- **Database has**: Admin with email `your-admin@yourdomain.com` (default)
- **You want**: Admin with email `20234417@std.neu.edu.tr` (your credentials)

---

## Step-by-Step Instructions

### **Step 1: Verify Environment Variables on Render**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on **saas_platform_backend** (your backend service)
3. Go to **Environment** tab
4. Make sure these variables are set:

```
ADMIN_EMAIL=20234417@std.neu.edu.tr
ADMIN_PASSWORD=Macbayprince05
ADMIN_USERNAME=prince_admin
ADMIN_FIRST_NAME=Prince
ADMIN_LAST_NAME=Macbay
```

**Important**: If `ADMIN_USERNAME` is not set, it will use the default `superadmin` which might conflict with existing users. Set a unique username!

---

### **Step 2: Delete Existing Admin from Database**

#### **Option A: Via Render Database Console** (Easiest)

1. Go to Render Dashboard
2. Click on your **PostgreSQL Database** (not backend service)
3. Click **"Connect"** button
4. Under **"External Connection"**, copy the **PSQL Command**
   - It looks like: `PGPASSWORD=xxx psql -h dpg-xxx.oregon-postgres.render.com -U xxx humhub_clone`

5. Open your terminal/command prompt and paste the command

6. Once connected, run this SQL:

```sql
-- Delete ALL admin user profiles
DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE role = 'admin');

-- Delete ALL admin users
DELETE FROM users WHERE role = 'admin';

-- Verify deletion (should return 0)
SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';

-- Exit
\q
```

#### **Option B: Via Render Shell** (Alternative)

1. Go to Render Dashboard → Backend Service
2. Click **"Shell"** tab (top right)
3. Wait for shell to load
4. Run:

```bash
psql $DATABASE_URL

# Then run the SQL commands:
DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE role = 'admin');
DELETE FROM users WHERE role = 'admin';
SELECT COUNT(*) FROM users WHERE role = 'admin';
\q
```

---

### **Step 3: Restart Your Backend Service**

1. Go to Render Dashboard → Backend Service
2. Click **"Manual Deploy"** (top right)
3. Click **"Deploy latest commit"**
4. Wait for deployment to complete

---

### **Step 4: Verify Admin Creation**

1. Go to **Logs** tab in your backend service
2. Look for these messages:

```
🔧 Checking for admin account...
🔧 No admin found. Creating default admin account...
✅ ============================================
✅ Admin account created successfully!
✅ ============================================
📧 Email: 20234417@std.neu.edu.tr
👤 Username: prince_admin
🔑 Password: Macbayprince05
✅ ============================================
```

---

### **Step 5: Test Login**

1. Go to your frontend: https://social-network-frontend-k0ml.onrender.com
2. Click **Login**
3. Enter credentials:
   - **Email**: `20234417@std.neu.edu.tr`
   - **Password**: `Macbayprince05`
4. Click **Login**
5. ✅ You should be logged in successfully!

---

## Troubleshooting

### Issue: Still seeing "Admin account already exists"

**Solution**: The admin wasn't deleted properly. Run this SQL again:

```sql
-- Force delete with CASCADE
DELETE FROM users WHERE role = 'admin' CASCADE;
```

### Issue: "Permission denied" error

**Solution**: You might not have permission. Try:

```sql
-- Check who the admin user is
SELECT * FROM users WHERE role = 'admin';

-- Delete by specific ID
DELETE FROM user_profiles WHERE "userId" = <ID_FROM_ABOVE>;
DELETE FROM users WHERE id = <ID_FROM_ABOVE>;
```

### Issue: Init-admin script not found

**Solution**: The script exists but might not be deployed yet. 

1. Check if latest commit is deployed
2. Or manually trigger deployment: **Manual Deploy → Clear build cache & deploy**

---

## Quick SQL Command (Copy & Paste)

**Run this in your database console:**

```sql
DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE role = 'admin');
DELETE FROM users WHERE role = 'admin';
SELECT COUNT(*) FROM users WHERE role = 'admin';
```

**Expected output**: `0` (no admin accounts)

Then restart your service!

---

## Summary

1. ✅ Set environment variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`
2. ✅ Delete old admin from database (SQL commands above)
3. ✅ Restart backend service (Manual Deploy)
4. ✅ Check logs for admin creation confirmation
5. ✅ Login with your new credentials

**Your admin will be**: `20234417@std.neu.edu.tr` / `Macbayprince05`

Need help? Let me know! 🚀

