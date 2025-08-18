# 🚀 **MULTI-INSTANCE TESTING GUIDE**

## 📋 **Overview**

You can now run multiple frontend instances on different ports to test different user accounts simultaneously. This is perfect for testing:

- **Admin vs Member workflows**
- **Different organization perspectives** 
- **Multi-user interactions**
- **Role-based access control**

## 🔧 **Setup Complete**

✅ **Backend Server**: Running on port **5000** (shared by all frontend instances)  
✅ **Frontend Configurations**: Created for ports **3000**, **3001**, **3002**  
✅ **NPM Scripts**: Added for easy startup  

## 🚀 **How to Start Multiple Instances**

### **Method 1: Using NPM Scripts** (Recommended)

Open **separate terminal windows** and run:

#### **Instance 1 - Port 3000** (Main/Admin Testing)
```bash
cd "C:\Program Files\saas_platform\client"
npm run dev:3000
```
**Access at**: `http://localhost:3000`

#### **Instance 2 - Port 3001** (Member Testing)
```bash
cd "C:\Program Files\saas_platform\client"
npm run dev:3001
```
**Access at**: `http://localhost:3001`

#### **Instance 3 - Port 3002** (Additional Testing)
```bash
cd "C:\Program Files\saas_platform\client"
npm run dev:3002
```
**Access at**: `http://localhost:3002`

### **Method 2: Direct Vite Commands**

Alternatively, you can use direct Vite commands:

```bash
# Terminal 1
cd "C:\Program Files\saas_platform\client"
vite --port 3000

# Terminal 2
cd "C:\Program Files\saas_platform\client"
vite --port 3001

# Terminal 3
cd "C:\Program Files\saas_platform\client"
vite --port 3002
```

## 🎯 **Testing Scenarios**

### **Scenario 1: Admin vs Member Testing**

**Port 3000 - Admin Dashboard:**
- Login: `admin` / `admin123`
- Test: Create plans, approve applications, view analytics

**Port 3001 - Member Experience:**
- Visit: `/browse-memberships` (no login required)
- Test: Browse plans, submit applications

**Port 3002 - Different Member:**
- Register new user account
- Test: Member workflow, application status

### **Scenario 2: Multi-Organization Testing**

**Port 3000 - Tech Innovators Hub Admin:**
- Login as admin
- Manage developer membership plans

**Port 3001 - Creative Professionals Admin:**
- Create new admin user for Creative Professionals
- Manage creative membership plans

**Port 3002 - Public User:**
- Browse both organizations
- Compare membership plans

### **Scenario 3: Application Workflow Testing**

**Port 3000 - Organization Admin:**
- Monitor `/membership/applications`
- Approve/reject applications in real-time

**Port 3001 - Applicant #1:**
- Submit application for Developer Membership
- Track application status

**Port 3002 - Applicant #2:**
- Submit application for Creative Pro Membership
- Test different application flows

## 🔄 **Data Sharing**

**Important**: All instances share the **same database** and **backend server**:

✅ **Shared Data**: Users, plans, applications, payments  
✅ **Real-time Updates**: Changes in one instance reflect in others (after refresh)  
✅ **Consistent State**: Same backend APIs and authentication  

## 🎨 **Visual Differentiation** (Optional)

To help distinguish between instances, you can:

### **Browser Bookmarks:**
- `http://localhost:3000` - "Admin Dashboard"
- `http://localhost:3001` - "Member Portal" 
- `http://localhost:3002` - "Testing Instance"

### **Different Browsers:**
- **Chrome**: Port 3000 (Admin testing)
- **Edge**: Port 3001 (Member testing)
- **Firefox**: Port 3002 (Additional testing)

## 📊 **Sample Test Accounts**

### **Pre-created Admin:**
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Organization Admin
- **Access**: Full membership management

### **Create Additional Test Users:**

**Member Test Account:**
```
Username: member1
Email: member1@test.com
Password: member123
Role: Member
```

**Organization Admin:**
```
Username: orgadmin
Email: orgadmin@test.com  
Password: admin123
Role: Organization Admin
```

## 🚀 **Quick Start Commands**

### **Terminal 1 - Backend (if not running):**
```bash
cd "C:\Program Files\saas_platform\server"
npm start
```

### **Terminal 2 - Frontend Instance 1:**
```bash
cd "C:\Program Files\saas_platform\client"
npm run dev:3000
```

### **Terminal 3 - Frontend Instance 2:**
```bash
cd "C:\Program Files\saas_platform\client"
npm run dev:3001
```

### **Terminal 4 - Frontend Instance 3:**
```bash
cd "C:\Program Files\saas_platform\client"
npm run dev:3002
```

## 🎉 **Testing Checklist**

### **✅ Multi-User Testing:**
- [ ] Admin can manage plans while member browses
- [ ] Real-time application workflow (submit → approve)
- [ ] Different users in different organizations
- [ ] Payment processing from multiple accounts

### **✅ Role-Based Access:**
- [ ] Admin sees membership dashboard
- [ ] Members see public browsing only
- [ ] Unauthorized access blocked properly

### **✅ Organization Multi-tenancy:**
- [ ] Different organizations have separate plans
- [ ] Admins only see their organization's data
- [ ] Public users can browse all organizations

## 🛠️ **Troubleshooting**

### **Port Already in Use:**
If you get "port already in use" errors:
1. Check if another instance is running
2. Use different ports (3003, 3004, etc.)
3. Modify vite config files accordingly

### **Backend Connection:**
All frontend instances connect to the same backend on port 5000. Ensure:
1. Backend server is running
2. Database is connected
3. API endpoints are accessible

### **Session Management:**
Each browser/port maintains separate sessions:
- Login on port 3000 ≠ login on port 3001
- Use different browsers for completely isolated sessions
- Clear localStorage to reset authentication

---

## 🎊 **Ready for Multi-User Testing!**

You now have a complete setup for testing the membership module with multiple users simultaneously. This allows you to:

✅ **Test complete workflows end-to-end**  
✅ **Verify role-based access control**  
✅ **Simulate real-world multi-user scenarios**  
✅ **Debug cross-user interactions**  

**Happy testing! 🚀**
