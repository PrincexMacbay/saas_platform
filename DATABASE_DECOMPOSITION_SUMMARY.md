# Database Decomposition Summary

## Overview
The `users` table has been decomposed into a normalized structure with 4 separate tables to improve database design and maintainability.

## New Table Structure

### 1. `users` (Core Personal Information)
**Purpose**: Core authentication and basic personal information that ALL users need.

**Fields**:
- `id` (Primary Key)
- `guid` (UUID)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `firstName`, `lastName`
- `about` (Bio)
- `profileImage`, `coverImage`
- `status` (0: disabled, 1: enabled, 2: needs approval)
- `visibility` (1: registered only, 2: public, 3: hidden)
- `language`, `timezone`
- `lastLogin`
- `createdAt`, `updatedAt`

### 2. `user_profiles` (Extended Profile Information)
**Purpose**: Bridge table linking users to their profile type and organization membership.

**Fields**:
- `id` (Primary Key)
- `userId` (Foreign Key to users.id, Unique)
- `userType` (varchar(50) - flexible for future types)
- `organizationId` (Foreign Key to organizations.id)
- `organizationRole` ('admin', 'member')
- `createdAt`, `updatedAt`

### 3. `individual_profiles` (Job Seeker Information)
**Purpose**: All information specific to job seekers/individuals.

**Fields**:
- `id` (Primary Key)
- `userId` (Foreign Key to users.id, Unique)
- `resume` (File path)
- `workExperience` (Text)
- `jobPreferences` (Text)
- `createdAt`, `updatedAt`

### 4. `company_profiles` (Employer Information)
**Purpose**: All information specific to companies/employers.

**Fields**:
- `id` (Primary Key)
- `userId` (Foreign Key to users.id, Unique)
- `companyName`
- `companyLogo` (File path)
- `industry`
- `companySize`
- `website`
- `location`
- `createdAt`, `updatedAt`

## Relationships

```sql
-- One-to-One relationships
users.id < user_profiles.userId
users.id < individual_profiles.userId  
users.id < company_profiles.userId

-- Foreign key relationships
user_profiles.organizationId > organizations.id
```

## Migration Process

### Step 1: Run the Migration
```bash
cd server
node scripts/decompose-users-table.js
```

This script will:
1. Create the new tables
2. Migrate all existing user data
3. Create appropriate profile records based on userType

### Step 2: Verify Migration
Check that all data was migrated correctly:
```sql
-- Check user profiles
SELECT u.username, up.userType, up.organizationId 
FROM users u 
JOIN user_profiles up ON u.id = up.userId;

-- Check individual profiles
SELECT u.username, ip.resume, ip.workExperience 
FROM users u 
JOIN individual_profiles ip ON u.id = ip.userId;

-- Check company profiles
SELECT u.username, cp.companyName, cp.industry 
FROM users u 
JOIN company_profiles cp ON u.id = cp.userId;
```

### Step 3: Drop Old Columns (Optional)
```bash
cd server
node scripts/drop-old-user-columns.js
```

## Usage Examples

### Get User with Profile Information
```javascript
const user = await User.findOne({
  where: { id: userId },
  include: [
    {
      model: UserProfile,
      as: 'profile',
      include: [{ model: Organization, as: 'organization' }]
    },
    {
      model: IndividualProfile,
      as: 'individualProfile'
    },
    {
      model: CompanyProfile,
      as: 'companyProfile'
    }
  ]
});
```

### Get All Job Seekers
```javascript
const jobSeekers = await User.findAll({
  include: [
    {
      model: UserProfile,
      as: 'profile',
      where: { userType: 'individual' }
    },
    {
      model: IndividualProfile,
      as: 'individualProfile'
    }
  ]
});
```

### Get All Companies
```javascript
const companies = await User.findAll({
  include: [
    {
      model: UserProfile,
      as: 'profile',
      where: { userType: 'company' }
    },
    {
      model: CompanyProfile,
      as: 'companyProfile'
    }
  ]
});
```

### Create New Individual User
```javascript
const user = await User.create({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'hashedPassword',
  firstName: 'John',
  lastName: 'Doe'
});

await UserProfile.create({
  userId: user.id,
  userType: 'individual'
});

await IndividualProfile.create({
  userId: user.id,
  resume: 'resume.pdf',
  workExperience: '5 years in software development',
  jobPreferences: 'Remote work, React, Node.js'
});
```

### Create New Company User
```javascript
const user = await User.create({
  username: 'techcorp_hr',
  email: 'hr@techcorp.com',
  password: 'hashedPassword',
  firstName: 'HR',
  lastName: 'Manager'
});

await UserProfile.create({
  userId: user.id,
  userType: 'company'
});

await CompanyProfile.create({
  userId: user.id,
  companyName: 'TechCorp Inc',
  industry: 'Technology',
  companySize: '100-500',
  website: 'https://techcorp.com',
  location: 'San Francisco, CA'
});
```

## Benefits

1. **Normalization**: Proper 3NF database design
2. **Flexibility**: Easy to add new user types without schema changes
3. **Performance**: Smaller, focused tables
4. **Maintainability**: Clear separation of concerns
5. **Scalability**: Easy to extend individual or company profiles independently

## Next Steps

1. Update application code to use the new models
2. Update API endpoints to handle the new structure
3. Update frontend components to work with the new data structure
4. Test all functionality thoroughly
5. Consider adding indexes for better query performance

## Rollback Plan

If you need to rollback:
1. Restore the original User model
2. Drop the new tables
3. Restore the original columns to the users table
4. Restore the original data

The migration script creates a backup of the original data structure, so rollback is possible if needed.
