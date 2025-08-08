# Database Seeder Service

This document explains the database seeder service that automatically populates the database with initial data for development.

## 🌱 Overview

The seeder service automatically creates demo data when the application starts in development mode. This ensures you always have consistent test data without losing your existing data.

## 🚀 How It Works

### Automatic Seeding
- **Development Mode**: The seeder runs automatically when `NODE_ENV=development`
- **Production Mode**: Seeding is disabled to prevent data loss
- **Smart Detection**: Only seeds if the database is empty (no existing users)

### Manual Seeding
You can manually run the seeder using:
```bash
npm run db:seed
```

## 📊 Demo Data Created

### Users (6 accounts)
| Username | Email | Password | Role | Type |
|----------|-------|----------|------|------|
| admin | admin@example.com | password123 | System Admin | Individual |
| johndoe | john@example.com | password123 | Developer | Individual |
| janesmith | jane@example.com | password123 | Marketer | Individual |
| mikejohnson | mike@example.com | password123 | Project Manager | Individual |
| sarahwilson | sarah@example.com | password123 | Designer | Individual |
| techcorp | hr@techcorp.com | password123 | Company | Company |

### Spaces (5 communities)
1. **General Discussion** - Public space for all users
2. **Development Team** - Private space for developers
3. **Marketing & Content** - Marketing team space
4. **Career Development** - Professional growth discussions
5. **Design Community** - Creative professionals

### Content
- **8 Posts** - Mix of personal and space posts
- **7 Comments** - Engaging discussions
- **3 Jobs** - Sample job postings from TechCorp
- **Memberships** - Users joined to relevant spaces
- **Follows** - User and space following relationships
- **Likes** - Sample likes on posts and comments

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development  # Enables automatic seeding
```

### Seeder Service Location
```
server/services/seederService.js
```

### Manual Script Location
```
server/scripts/seed-database.js
```

## 🛡️ Safety Features

### Data Protection
- **No Data Loss**: Never overwrites existing data
- **Smart Detection**: Only seeds empty databases
- **Production Safe**: Disabled in production environment
- **Idempotent**: Can be run multiple times safely

### Development Only
- **Automatic Logging**: Only logs in development mode
- **Error Handling**: Graceful failure handling
- **Non-Blocking**: Doesn't prevent app startup if seeding fails

## 📝 Customization

### Adding New Demo Data
1. Edit `server/services/seederService.js`
2. Add new data creation methods
3. Call them in the `seedDatabase()` method

### Example: Adding New Users
```javascript
async createAdditionalUsers() {
  const users = await User.bulkCreate([
    {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      // ... other fields
    }
  ], { individualHooks: true });
  
  return users;
}
```

### Modifying Existing Data
1. Update the relevant creation method
2. The seeder will use the new data structure
3. Existing databases won't be affected

## 🔍 Verification

### Check Seeding Status
```bash
# Check if seeder ran
npm run db:seed

# Expected output:
# 🌱 Starting manual database seeding...
# ✅ Database connected successfully
# ✅ Database schema synchronized
# ✅ Database already has data, skipping seeding
# 🎉 Manual seeding completed successfully!
```

### Verify Demo Data
```sql
-- Check users
SELECT username, email, "userType" FROM users;

-- Check spaces
SELECT name, url, visibility FROM spaces;

-- Check posts
SELECT COUNT(*) as post_count FROM posts;

-- Check jobs
SELECT title, category, "jobType" FROM jobs;
```

## 🚨 Troubleshooting

### Common Issues

1. **Seeding Not Running**
   - Check `NODE_ENV=development`
   - Verify database connection
   - Check for existing data

2. **Partial Data Created**
   - Check for database constraints
   - Verify foreign key relationships
   - Check for unique constraint violations

3. **Seeding Fails**
   - Check database permissions
   - Verify model associations
   - Check for missing required fields

### Debug Mode
Add debug logging to the seeder:
```javascript
// In seederService.js
console.log('Debug: Creating users...');
const users = await this.createUsers();
console.log('Debug: Created users:', users.length);
```

## 📋 Best Practices

1. **Always Test**: Test seeder changes in development
2. **Keep Data Realistic**: Use realistic but safe demo data
3. **Maintain Relationships**: Ensure proper foreign key relationships
4. **Use Bulk Operations**: Use `bulkCreate` for performance
5. **Handle Errors**: Always include proper error handling

## 🎯 Production Considerations

- **Never Run in Production**: Seeding is disabled in production
- **Data Migration**: Use proper migrations for production data
- **Backup First**: Always backup before any data operations
- **Test Thoroughly**: Test seeding in staging environment

## 📞 Support

If you encounter issues with the seeder:
1. Check the console logs for error messages
2. Verify database connectivity
3. Check environment variables
4. Review the seeder service code
