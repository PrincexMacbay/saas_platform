# 🚀 Application Startup Guide

## Quick Start

### 1. Start the Server
```bash
cd server
npm start
```

### 2. Start the Client (in a new terminal)
```bash
cd client
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000 (or the port shown in terminal)
- **Backend API**: http://localhost:5000

## 🔐 Login Credentials

### Test User (Created for you)
- **Username**: `testuser`
- **Email**: `test@example.com`
- **Password**: `password123`

### Existing Users in Database
Based on the debug script, you have these users available:

1. **johnhub** (john@humhub.test)
2. **janehub** (jane@humhub.test)
3. **mikehub** (mike@humhub.test)
4. **admin** (admin@humhub.test)
5. **Nahfise** (tradermac00@gmail.com)
6. **newuser123** (newuser123@example.com)
7. **Queen** (princemacbay00@gmail.com)
8. **Ochi** (20234417@std.neu.edu.tr) - Company user
9. **Oghenewoma** (u2067453391@gmail.com)

## 🛠️ Troubleshooting

### If you get "Connection Refused" error:
1. Make sure the server is running on port 5000
2. Check that both server and client are started
3. Verify no other applications are using port 5000

### If login fails:
1. Use the test user credentials above
2. Make sure you're using the correct username/email
3. Check that the password matches what you set during registration

### If you need to create a new user:
1. Go to the registration page
2. Create a new account
3. Use those credentials to login

## 📋 Testing the Complete Workflow

Once logged in, you can test the complete membership management workflow:

### For Organization Admins:
1. Create a membership plan
2. Design an application form
3. Design a digital card template
4. Review member applications
5. Manage payments and subscriptions

### For Regular Users:
1. Browse available memberships
2. Apply for membership
3. View your digital card
4. Manage your account

## 🔧 Development Commands

### Server Commands:
```bash
cd server
npm start          # Start server
npm run dev        # Start with nodemon (if available)
```

### Client Commands:
```bash
cd client
npm run dev        # Start development server
npm run build      # Build for production
```

### Database Commands:
```bash
cd server
node scripts/debug-login.js        # Debug login issues
node scripts/create-test-user.js   # Create test user
```

## 🌐 Ports Used
- **Frontend**: 3000 (or auto-assigned by Vite)
- **Backend**: 5000
- **Database**: 5432 (PostgreSQL)

## 📞 Support
If you encounter any issues:
1. Check the console for error messages
2. Verify both server and client are running
3. Use the debug scripts to check database connectivity
4. Ensure all environment variables are set correctly

Your membership management system is fully implemented and ready to use! 🎉

