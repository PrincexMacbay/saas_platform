# Database Seeder System Guide

This guide explains the comprehensive database seeder system that handles both development demo data and production admin user creation.

## 🌱 Overview

The seeder system consists of multiple components:

1. **Development Seeder** - Creates demo data for development/testing
2. **Production Admin Seeder** - Creates admin users for production deployments
3. **Admin Initialization** - Ensures admin account exists on every startup

## 📁 File Structure

```
server/
├── services/
│   └── seederService.js          # Main demo data seeder
├── scripts/
│   ├── init-admin.js             # Admin initialization (startup)
│   ├── seed-database.js          # Manual demo data seeder
│   └── seed-production-admin.js  # Production admin seeder
└── DATABASE_SEEDER_GUIDE.md      # This guide
```

## 🚀 How It Works

### Development Mode (`NODE_ENV=development`)

1. **Database Sync**: Tables are created/updated
2. **Demo Data Seeding**: Creates 6 users, 5 spaces, posts, comments, jobs, etc.
3. **Admin Initialization**: Creates admin from environment variables

### Production Mode (`NODE_ENV=production`)

1. **Database Sync**: Tables are created (no alterations)
2. **Admin Initialization**: Creates admin from environment variables
3. **No Demo Data**: Demo seeding is disabled for production

## 📊 Demo Data Created (Development Only)

### Users (6 accounts)
| Username | Email | Password | Type | Description |
|----------|-------|----------|------|-------------|
| admin | admin@example.com | admin123 | Individual | System administrator |
| johndoe | john@example.com | password123 | Individual | Software developer |
| janesmith | jane@example.com | password123 | Individual | Marketing professional |
| mikejohnson | mike@example.com | password123 | Individual | Project manager |
| sarahwilson | sarah@example.com | password123 | Individual | UX/UI designer |
| techcorp | hr@techcorp.com | password123 | Company | Technology company |

### Additional Content
- **5 Spaces**: General Discussion, Development Team, Marketing & Content, Career Development, Design Community
- **8 Posts**: Mix of personal and space posts
- **7 Comments**: Engaging discussions
- **3 Jobs**: Sample job postings
- **Memberships**: Users joined to relevant spaces
- **Follows**: User and space following relationships
- **Likes**: Sample likes on posts and comments

## 🔧 Environment Variables

### Required for Admin Creation
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_USERNAME=admin
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### Optional
```env
RESET_ADMIN_PASSWORD=true  # Resets admin password on startup
NODE_ENV=development       # Enables demo data seeding
```

## 📝 Manual Commands

### Development Commands
```bash
# Seed demo data (development only)
npm run db:seed

# Create admin user (production safe)
npm run db:seed-admin

# Full database setup
npm run db:create && npm run db:seed
```

### Production Commands
```bash
# Create admin user only (recommended for production)
npm run db:seed-admin
```

## 🛡️ Safety Features

### Data Protection
- **No Data Loss**: Never overwrites existing data
- **Smart Detection**: Only seeds empty databases or creates missing admin
- **Production Safe**: Demo seeding disabled in production
- **Idempotent**: Can be run multiple times safely
- **Duplicate Prevention**: Checks for existing users before creating

### Development Only Features
- **Automatic Logging**: Detailed console output in development
- **Error Handling**: Graceful failure handling
- **Non-Blocking**: Doesn't prevent app startup if seeding fails

## 🚀 Render Deployment Integration

### Automatic Admin Creation
The admin initialization runs automatically on every deployment:

1. **Database Connection**: Establishes connection to Render PostgreSQL
2. **Schema Sync**: Creates tables if they don't exist
3. **Admin Check**: Looks for existing admin user
4. **Admin Creation**: Creates admin if none exists
5. **Profile Creation**: Creates associated user profile

### Render Environment Variables
Set these in your Render service settings:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_USERNAME=admin
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### Render Build Command
```bash
npm run build
```

### Render Start Command
```bash
npm start
```

## 🔍 Verification

### Check Seeding Status
```bash
# Check if demo seeder ran (development)
npm run db:seed

# Check if admin seeder ran
npm run db:seed-admin
```

### Verify Admin Account
```sql
-- Check admin users
SELECT id, username, email, "firstName", "lastName", "createdAt" 
FROM users 
WHERE email = 'admin@example.com' OR username = 'admin';

-- Check admin profile
SELECT up.*, u.email, u.username 
FROM user_profiles up 
JOIN users u ON up."userId" = u.id 
WHERE u.email = 'admin@example.com';
```

### Verify Demo Data (Development)
```sql
-- Check users
SELECT username, email, "isOrganization" FROM users;

-- Check spaces
SELECT name, url, visibility FROM spaces;

-- Check posts
SELECT COUNT(*) as post_count FROM posts;

-- Check jobs
SELECT title, category, "jobType" FROM jobs;
```

## 🚨 Troubleshooting

### Common Issues

1. **Admin Not Created**
   - Check environment variables are set in Render
   - Verify database connection
   - Check for existing admin with different credentials

2. **Demo Data Not Seeding**
   - Ensure `NODE_ENV=development`
   - Check if database already has data
   - Verify database permissions

3. **Seeding Fails**
   - Check database connection
   - Verify model associations
   - Check for missing required fields
   - Review console logs for specific errors

### Debug Mode
Add debug logging to any seeder:
```javascript
console.log('Debug: Creating users...');
const users = await this.createUsers();
console.log('Debug: Created users:', users.length);
```

## 📋 Best Practices

### Development
1. **Always Test**: Test seeder changes in development first
2. **Keep Data Realistic**: Use realistic but safe demo data
3. **Maintain Relationships**: Ensure proper foreign key relationships
4. **Use Bulk Operations**: Use `bulkCreate` for performance

### Production
1. **Never Run Demo Seeder**: Demo seeding is disabled in production
2. **Use Environment Variables**: Always use env vars for admin credentials
3. **Backup First**: Always backup before any data operations
4. **Test Thoroughly**: Test admin creation in staging environment

## 🎯 Production Deployment Checklist

- [ ] Set `ADMIN_EMAIL` environment variable
- [ ] Set `ADMIN_PASSWORD` environment variable
- [ ] Set `ADMIN_USERNAME` environment variable
- [ ] Set `ADMIN_FIRST_NAME` environment variable
- [ ] Set `ADMIN_LAST_NAME` environment variable
- [ ] Verify database connection string
- [ ] Test admin login after deployment
- [ ] Change default password after first login

## 📞 Support

If you encounter issues:

1. **Check Logs**: Review console logs for error messages
2. **Verify Environment**: Check all required environment variables
3. **Test Connection**: Ensure database connectivity
4. **Review Code**: Check seeder service implementation
5. **Manual Testing**: Try running seeders manually

## 🔄 Updates and Maintenance

### Adding New Demo Data
1. Edit `server/services/seederService.js`
2. Add new data creation methods
3. Call them in the `seedDatabase()` method
4. Test in development environment

### Modifying Admin Creation
1. Edit `server/scripts/init-admin.js`
2. Update environment variable handling
3. Test with different credentials
4. Deploy to staging first

---

**Note**: This seeder system is designed to be safe, reliable, and production-ready. Always test changes in development before deploying to production.
