# Career Center Role Selection Fix

## Problem
New users were automatically being assigned as "job seekers" without seeing the role selection screen. The career center was not showing the option to choose between "Job Seeker" and "Employer" roles.

## Root Cause
1. **Backend Registration**: The registration process was automatically creating a `UserProfile` with `userType: 'individual'` (job seeker)
2. **Frontend Logic**: The CareerCenter component was checking `!user.profile?.userType` to show role selection, but since all users had a default userType, the role selection screen never appeared

## Solution

### 1. Backend Changes (`server/controllers/authController.js`)

**Before:**
```javascript
// Create user profile (default to individual)
await UserProfile.create({
  userId: user.id,
  userType: 'individual'
});
```

**After:**
```javascript
// Don't create a default user profile - let user choose their role
// The profile will be created when they select their role in the career center
```

### 2. Frontend Changes (`client/src/pages/CareerCenter.jsx`)

**Enhanced Role Selection Logic:**
```javascript
const [hasCompletedRoleSelection, setHasCompletedRoleSelection] = useState(false);

useEffect(() => {
  // Check if user has completed role selection
  if (user?.profile?.userType) {
    const hasIndividualData = user?.individualProfile && (
      user.individualProfile.workExperience || 
      user.individualProfile.jobPreferences
    );
    
    const hasCompanyData = user?.companyProfile && (
      user.companyProfile.companyName || 
      user.companyProfile.industry || 
      user.companyProfile.companySize
    );
    
    setHasCompletedRoleSelection(hasIndividualData || hasCompanyData);
  } else {
    setHasCompletedRoleSelection(false);
  }
}, [user]);
```

## How It Works Now

### For New Users:
1. **Registration**: User registers without any default role assignment
2. **First Visit to Career Center**: User sees role selection screen with two options:
   - **Job Seeker**: "I am looking for a job"
   - **Employer**: "I want to hire"
3. **Role Selection**: User chooses their role and fills out relevant information
4. **Profile Creation**: Backend creates the appropriate profile (UserProfile + IndividualProfile or CompanyProfile)
5. **Dashboard Access**: User gets access to the appropriate dashboard

### For Existing Users:
- Users who already have completed role selection will see their respective dashboards
- Users who have a userType but no profile data will be prompted to complete their setup

## Benefits

1. **User Choice**: Users can now choose their role instead of being automatically assigned
2. **Better UX**: Clear role selection process with visual cards and descriptions
3. **Flexibility**: Users can be either job seekers or employers
4. **Data Integrity**: Profile data is only created when user actually selects a role
5. **Backward Compatibility**: Existing users are not affected

## Testing

### Test Cases:
1. **New User Registration**: Verify role selection screen appears
2. **Job Seeker Selection**: Verify individual profile creation and dashboard access
3. **Employer Selection**: Verify company profile creation and dashboard access
4. **Existing Users**: Verify they can access their dashboards without issues
5. **Profile Completion**: Verify users with incomplete profiles are prompted to finish setup

## Files Modified

- `server/controllers/authController.js` - Removed default userType assignment
- `client/src/pages/CareerCenter.jsx` - Enhanced role selection detection logic

## Future Enhancements

1. **Role Switching**: Allow users to change their role later
2. **Multiple Roles**: Support users being both job seekers and employers
3. **Profile Completion Tracking**: Track completion percentage of user profiles
4. **Role-Based Features**: Show different features based on user role
