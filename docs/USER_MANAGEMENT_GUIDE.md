# User Management System - Labbaik Chicken Customer Management

## Overview
A complete user management system has been implemented with role-based permissions, accessible only to super admin accounts.

## Features

### ✅ **Super Admin Only Access**
- User Management menu only visible to `super_admin` role
- Complete access control and permission management
- Create, edit, activate/deactivate, and delete users

### ✅ **User Creation & Management**
- **Create New Users** with custom permissions
- **Edit Existing Users** and their permissions
- **Toggle User Status** (Active/Inactive)
- **Delete Users** (except super admin)
- **Password Management** with secure updates

### ✅ **Granular Permission System**
Users can be granted specific access to menu sections:

#### **Subject**
- Access to stores management (`/dashboard/stores`)

#### **Survey**
- **Hasil Survey** - View survey results (`/dashboard/survey/results`)
- **Analytics** - View survey analytics (`/dashboard/survey/analytics`)

#### **Pertanyaan (Questions)**
- **Buat Pertanyaan** - Create questions (`/dashboard/questions/create`)
- **Grup Pertanyaan** - Manage question groups (`/dashboard/questions/groups`)
- **Kategori** - Manage categories (`/dashboard/questions/categories`)
- **Koleksi** - Manage collections (`/dashboard/questions/collection`)

### ✅ **Dynamic Navigation**
- Menu items automatically show/hide based on user permissions
- Super admin sees all menus
- Regular users only see permitted sections
- Clean, permission-based UI experience

## User Roles

### **Super Admin** (`super_admin`)
- Full system access
- Can manage users and permissions
- Cannot be deleted or deactivated
- Default credentials: `superadmin` / `superlogin2025`

### **Admin** (`admin`)
- Configurable permissions
- Can access assigned menu sections
- Can be managed by super admin

### **Staff** (`staff`)
- Configurable permissions
- Limited access based on assignments
- Can be managed by super admin

## How to Use

### **Accessing User Management**
1. Login as super admin
2. Navigate to "User Management" in the sidebar
3. Choose from:
   - **Kelola User** - View and manage existing users
   - **Buat User Baru** - Create new users

### **Creating a New User**
1. Click "Buat User Baru" or the "+" button
2. Fill in basic information:
   - Username (minimum 3 characters)
   - Full Name
   - Role (Admin/Staff)
   - Password (minimum 6 characters)
3. Select menu permissions:
   - Check boxes for allowed menu access
   - Granular control per submenu item
4. Click "Simpan User" to create

### **Editing an Existing User**
1. Find user in the list
2. Click the edit icon (pencil)
3. Modify information and permissions
4. Optionally change password
5. Click "Simpan Perubahan" to update

### **Managing User Status**
- **Activate/Deactivate**: Click the user status icon
- **Delete**: Click the trash icon (confirmation required)
- Super admin account cannot be deleted or deactivated

## Technical Implementation

### **Files Created:**
1. **`src/app/dashboard/users/page.tsx`** - Main user management page
2. **`src/app/dashboard/users/new/page.tsx`** - Create new user page
3. **`src/app/dashboard/users/edit/[id]/page.tsx`** - Edit user page

### **Files Modified:**
1. **`src/lib/types.ts`** - Added User and UserPermissions interfaces
2. **`src/contexts/AuthContext.tsx`** - Enhanced to support created users
3. **`src/components/admin/navigation.tsx`** - Permission-based menu system

### **Data Storage:**
- **Users**: `localStorage.getItem('app_users')`
- **Passwords**: `localStorage.getItem('user_passwords')` (hashed in production)
- **Current User**: `localStorage.getItem('auth_user')`

### **Security Features:**
- Role-based access control
- Permission validation on both client and component level
- Protected routes with AuthGuard
- Username uniqueness validation
- Password strength requirements

## Permission Matrix

| Role | Subject | Survey Results | Survey Analytics | Create Questions | Question Groups | Categories | Collections | User Management |
|------|---------|----------------|------------------|------------------|-----------------|------------|-------------|-----------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | 🔧 | 🔧 | 🔧 | 🔧 | 🔧 | 🔧 | 🔧 | ❌ |
| Staff | 🔧 | 🔧 | 🔧 | 🔧 | 🔧 | 🔧 | 🔧 | ❌ |

🔧 = Configurable by Super Admin  
✅ = Always Allowed  
❌ = Never Allowed  

## Future Enhancements

For production deployment, consider:
- Database storage instead of localStorage
- Password hashing with bcrypt
- JWT token-based authentication
- Audit logging for user actions
- Email notifications for account changes
- Two-factor authentication
- Session management and timeout
- API-based user management

## Testing Checklist

✅ Super admin can access User Management  
✅ Regular users cannot access User Management  
✅ Create new users with custom permissions  
✅ Edit existing users and permissions  
✅ Toggle user active/inactive status  
✅ Delete users (except super admin)  
✅ Permission-based navigation works correctly  
✅ Users can login with created accounts  
✅ Password changes work properly  
✅ Form validation works correctly  

The user management system is now fully functional and ready for use!