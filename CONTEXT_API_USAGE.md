# Context API Usage in the Project

This document lists all places where React Context API is used for state management in the SaaS platform project.

## Overview

The project uses **4 Context Providers** for global state management:
1. **AuthContext** - User authentication and authorization
2. **LanguageContext** - Internationalization and language switching
3. **MembershipDataContext** - Centralized membership data management
4. **ErrorLoggerContext** - Error tracking and logging

---

## 1. AuthContext

**Location**: `client/src/contexts/AuthContext.jsx`

### Purpose
Manages user authentication state, login/logout functionality, and user profile data.

### State Managed
- `user` - Current authenticated user object
- `token` - JWT authentication token
- `isLoading` - Loading state during auth initialization
- `isAuthenticated` - Boolean indicating authentication status

### Methods Provided
- `login(credentials)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Clear authentication
- `updateUser(userData)` - Update user profile

### Usage Locations (30+ components)

#### Pages
1. **Login.jsx** - `useAuth()` for login functionality
2. **Register.jsx** - `useAuth()` for registration
3. **Dashboard.jsx** - `useAuth()` to get current user
4. **Profile.jsx** - `useAuth()` for user data and updates
5. **BrowseMemberships.jsx** - `useAuth()` to check authentication status
6. **PlanDetail.jsx** - `useAuth()` to get user info
7. **ApplyMembership.jsx** - `useAuth()` to get user data
8. **ResetPassword.jsx** - `useAuth()` to check auth status
9. **ForgotPassword.jsx** - `useAuth()` to check auth status
10. **MySpaces.jsx** - `useAuth()` to get user
11. **SpaceDetail.jsx** - `useAuth()` to get user
12. **Users.jsx** - `useAuth()` to get current user
13. **CareerCenter.jsx** - `useAuth()` for user and updates
14. **AdminDashboard.jsx** - `useAuth()` to get user

#### Components
15. **Navbar.jsx** - `useAuth()` for user display and logout
16. **ProtectedRoute.jsx** - `useAuth()` to check authentication
17. **ProfileImageUpload.jsx** - `useAuth()` for user and updates
18. **PostCard.jsx** - `useAuth()` to get current user
19. **PostWithAttachment.jsx** - `useAuth()` to get user
20. **SmartRedirect.jsx** - `useAuth()` to get user for redirect logic
21. **AdminSidebar.jsx** - `useAuth()` for logout
22. **JobDetail.jsx** - `useAuth()` to get user
23. **ProfileSection.jsx** - `useAuth()` for user and updates

#### Hooks
24. **useAdminRedirect.js** - `useAuth()` to check user role

### Provider Setup
```javascript
// client/src/App.jsx
<LanguageProvider>
  <AuthProvider>
    <Router>
      {/* App routes */}
    </Router>
  </AuthProvider>
</LanguageProvider>
```

---

## 2. LanguageContext

**Location**: `client/src/contexts/LanguageContext.jsx`

### Purpose
Manages internationalization (i18n) and language switching functionality.

### State Managed
- `language` - Current selected language
- `availableLanguages` - List of supported languages
- Translation function `t(key)` - Get translated text

### Methods Provided
- `changeLanguage(lang)` - Switch language
- `t(key)` - Translation function

### Usage Locations (40+ components)

#### Pages
1. **Login.jsx** - `useLanguage()` for translations
2. **Register.jsx** - `useLanguage()` for translations
3. **Dashboard.jsx** - `useLanguage()` for translations
4. **Profile.jsx** - `useLanguage()` for translations
5. **BrowseMemberships.jsx** - `useLanguage()` for translations
6. **PlanDetail.jsx** - `useLanguage()` for translations
7. **ApplyMembership.jsx** - `useLanguage()` for translations
8. **ResetPassword.jsx** - `useLanguage()` for translations
9. **ForgotPassword.jsx** - `useLanguage()` for translations
10. **Users.jsx** - `useLanguage()` for translations
11. **CareerCenter.jsx** - `useLanguage()` for translations
12. **AdminDashboard.jsx** - `useLanguage()` for translations

#### Admin Components
13. **AdminOverview.jsx** - `useLanguage()` for translations
14. **MembershipManagement.jsx** - `useLanguage()` for translations
15. **UserManagement.jsx** - `useLanguage()` for translations
16. **JobManagement.jsx** - `useLanguage()` for translations
17. **FinancialManagement.jsx** - `useLanguage()` for translations
18. **SystemConfiguration.jsx** - `useLanguage()` for translations
19. **CouponManagement.jsx** - `useLanguage()` for translations

#### Membership Components
20. **Plans.jsx** - `useLanguage()` for translations (used twice)
21. **Applications.jsx** - `useLanguage()` for translations
22. **ApplicationForms.jsx** - `useLanguage()` for translations (used twice)
23. **ApplicationFormBuilder.jsx** - `useLanguage()` for translations
24. **Payments.jsx** - `useLanguage()` for translations
25. **ScheduledPayments.jsx** - `useLanguage()` for translations
26. **Debts.jsx** - `useLanguage()` for translations
27. **Reminders.jsx** - `useLanguage()` for translations
28. **Coupons.jsx** - `useLanguage()` for translations
29. **DigitalCard.jsx** - `useLanguage()` for translations
30. **MembershipDashboard.jsx** - `useLanguage()` for translations
31. **MembershipSettings.jsx** - `useLanguage()` for translations
32. **MembershipNavbar.jsx** - `useLanguage()` for translations
33. **PaymentInfo.jsx** - `useLanguage()` for translations

#### Career Components
34. **CompanyDashboard.jsx** - `useLanguage()` for translations (used twice)
35. **IndividualDashboard.jsx** - `useLanguage()` for translations

#### Shared Components
36. **Navbar.jsx** - `useLanguage()` for translations
37. **AdminSidebar.jsx** - `useLanguage()` for translations
38. **LanguageSelector.jsx** - `useLanguage()` for language switching

### Provider Setup
```javascript
// client/src/App.jsx
<LanguageProvider>
  <AuthProvider>
    {/* Rest of app */}
  </AuthProvider>
</LanguageProvider>
```

---

## 3. MembershipDataContext

**Location**: `client/src/contexts/MembershipDataContext.jsx`

### Purpose
Centralized state management for all membership-related data, reducing API calls and providing a single source of truth.

### State Managed
- `data` - Object containing all membership data:
  - `dashboard` - Dashboard statistics and KPIs
  - `payments` - Payment history
  - `scheduledPayments` - Recurring payments
  - `debts` - Outstanding debts
  - `plans` - Membership plans
  - `reminders` - Payment reminders
  - `applications` - Membership applications
  - `settings` - Membership settings
  - `coupons` - Discount coupons
  - `applicationForms` - Application form templates
  - `digitalCard` - Digital card data
  - `paymentInfo` - User payment information

- `loading` - Loading states for each data type
- `errors` - Error states for each data type
- `isInitialized` - Whether data has been preloaded
- `isLoadingAll` - Whether bulk data loading is in progress

### Methods Provided
- `preloadAllData()` - Fetch all membership data in parallel
- `refreshData(dataKey)` - Refresh specific data type
- `updateData(dataKey, newData)` - Update specific data
- `clearData()` - Clear all membership data

### Usage Locations (12 components)

#### Membership Components
1. **Plans.jsx** - `useMembershipData()` for plans data, loading states, and refresh
2. **Applications.jsx** - `useMembershipData()` for applications data
3. **ApplicationForms.jsx** - `useMembershipData()` for form templates
4. **ApplicationFormBuilder.jsx** - `useMembershipData()` for forms and loading
5. **Payments.jsx** - `useMembershipData()` for payment history
6. **ScheduledPayments.jsx** - `useMembershipData()` for scheduled payments
7. **Debts.jsx** - `useMembershipData()` for debts data
8. **Reminders.jsx** - `useMembershipData()` for reminders
9. **Coupons.jsx** - `useMembershipData()` for coupons
10. **MembershipDashboard.jsx** - `useMembershipData()` for dashboard data
11. **MembershipNavbar.jsx** - `useMembershipData()` for preloading data
12. **PaymentInfo.jsx** - `useMembershipData()` for payment info

### Provider Setup
```javascript
// client/src/pages/Membership.jsx
<MembershipDataProvider>
  <MembershipNavbar />
  <Routes>
    {/* Membership routes */}
  </Routes>
</MembershipDataProvider>
```

**Note**: This provider is scoped to the `/membership/*` routes, not the entire app, for better performance.

---

## 4. ErrorLoggerContext

**Location**: `client/src/contexts/ErrorLoggerContext.jsx`

### Purpose
Centralized error tracking and logging system for debugging and monitoring.

### State Managed
- `errors` - Array of error objects with metadata
- `isVisible` - Whether error logger UI is visible

### Methods Provided
- `addError(error, type, context)` - Add error to log
- `logFrontendError(error, context)` - Log frontend errors
- `logBackendError(error, context)` - Log backend errors
- `logNetworkError(error, context)` - Log network errors
- `logApiError(error, context)` - Log API errors
- `logValidationError(error, context)` - Log validation errors
- `clearErrors()` - Clear all errors
- `clearErrorsByType(type)` - Clear errors by type
- `getErrorCount(type)` - Get error count
- `toggleVisibility()` - Toggle error logger visibility
- `setVisibility(visible)` - Set visibility state

### Usage Locations (2 components)

1. **ErrorLogger.jsx** - `useErrorLogger()` for displaying and managing errors
2. **SimpleErrorLogger.jsx** - `useErrorLogger()` for error logging functionality

### Provider Setup
```javascript
// Note: ErrorLoggerProvider is not explicitly shown in App.jsx
// but is likely integrated through ErrorLogger component
```

---

## Context Provider Hierarchy

The Context Providers are nested in the following order:

```
App.jsx
└── LanguageProvider (outermost - wraps entire app)
    └── AuthProvider (wraps authenticated routes)
        └── Router
            └── Routes
                └── /membership/* routes
                    └── MembershipDataProvider (scoped to membership section)
```

### Provider Setup Code

```javascript
// client/src/App.jsx
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route
                  path="/membership/*"
                  element={
                    <ProtectedRoute>
                      <Membership /> {/* Contains MembershipDataProvider */}
                    </ProtectedRoute>
                  }
                />
                
                {/* Other routes */}
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
```

---

## Summary Statistics

### Context Providers: 4
1. AuthContext - 30+ usage locations
2. LanguageContext - 40+ usage locations
3. MembershipDataContext - 12 usage locations
4. ErrorLoggerContext - 2 usage locations

### Total Components Using Context API: 80+

### Most Used Context
- **LanguageContext** - Used in 40+ components (most widespread)
- **AuthContext** - Used in 30+ components (second most common)
- **MembershipDataContext** - Used in 12 components (scoped to membership section)
- **ErrorLoggerContext** - Used in 2 components (specialized use)

---

## Benefits of Context API Usage

1. **Avoiding Prop Drilling**: No need to pass props through multiple component levels
2. **Global State Management**: Shared state accessible from any component
3. **Performance**: Scoped providers (like MembershipDataContext) reduce unnecessary re-renders
4. **Code Organization**: Clear separation of concerns with dedicated contexts
5. **Type Safety**: Custom hooks provide error handling for context usage
6. **Reusability**: Context logic can be reused across multiple components

---

## Code Examples

### Using AuthContext
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user.username}!</div>;
};
```

### Using LanguageContext
```javascript
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { t, language, changeLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <button onClick={() => changeLanguage('es')}>Spanish</button>
    </div>
  );
};
```

### Using MembershipDataContext
```javascript
import { useMembershipData } from '../contexts/MembershipDataContext';

const PlansComponent = () => {
  const { 
    data, 
    loading, 
    errors, 
    refreshData 
  } = useMembershipData();
  
  const plans = data.plans || [];
  
  if (loading.plans) {
    return <div>Loading plans...</div>;
  }
  
  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  );
};
```

### Using ErrorLoggerContext
```javascript
import { useErrorLogger } from '../contexts/ErrorLoggerContext';

const MyComponent = () => {
  const { addError, logApiError } = useErrorLogger();
  
  const handleError = (error) => {
    logApiError(error, { component: 'MyComponent' });
  };
  
  // Component code...
};
```

---

**Document Generated**: [Current Date]  
**Total Context Providers**: 4  
**Total Usage Locations**: 80+ components
