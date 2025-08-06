import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { User, UserPermissions } from './types';

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  // Simple hash function - in production use proper bcrypt
  return btoa(password + 'salt_key_2025');
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

export class UserService {
  private static readonly COLLECTION_NAME = 'users';

  // Create new user
  static async createUser(userData: {
    username: string;
    name: string;
    role: 'admin' | 'staff';
    password: string;
    permissions?: UserPermissions;
  }): Promise<string> {
    const usersRef = collection(db, this.COLLECTION_NAME);
    
    // Check if username already exists
    const existingUserQuery = query(usersRef, where('username', '==', userData.username));
    const existingUsers = await getDocs(existingUserQuery);
    
    if (!existingUsers.empty) {
      throw new Error('Username sudah digunakan');
    }

    const newUser = {
      username: userData.username,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions || {
        subject: false,
        survey: { results: false, analytics: false },
        questions: { create: false, groups: false, categories: false, collection: false }
      },
      passwordHash: hashPassword(userData.password),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(usersRef, newUser);
    return docRef.id;
  }

  // Get all users
  static async getAllUsers(): Promise<(User & { firestoreId: string })[]> {
    const usersRef = collection(db, this.COLLECTION_NAME);
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id, // Use Firestore document ID
      firestoreId: doc.id,
      username: doc.data().username,
      name: doc.data().name,
      role: doc.data().role,
      permissions: doc.data().permissions,
      isActive: doc.data().isActive,
      createdAt: doc.data().createdAt
    }));
  }

  // Authenticate user
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const usersRef = collection(db, this.COLLECTION_NAME);
    const userQuery = query(
      usersRef, 
      where('username', '==', username),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Verify password
    if (!verifyPassword(password, userData.passwordHash)) {
      return null;
    }

    return {
      id: userDoc.id,
      username: userData.username,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions,
      isActive: userData.isActive,
      createdAt: userData.createdAt
    };
  }

  // Update user
  static async updateUser(
    userId: string, 
    updates: Partial<{
      username: string;
      name: string;
      role: 'admin' | 'staff';
      permissions: UserPermissions;
      password: string;
      isActive: boolean;
    }>
  ): Promise<void> {
    const userRef = doc(db, this.COLLECTION_NAME, userId);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If password is being updated, hash it
    if (updates.password) {
      updateData.passwordHash = hashPassword(updates.password);
      delete updateData.password;
    }

    // Check username uniqueness if being updated
    if (updates.username) {
      const usersRef = collection(db, this.COLLECTION_NAME);
      const existingUserQuery = query(usersRef, where('username', '==', updates.username));
      const existingUsers = await getDocs(existingUserQuery);
      
      // Check if username exists and it's not the current user
      const conflictUser = existingUsers.docs.find(doc => doc.id !== userId);
      if (conflictUser) {
        throw new Error('Username sudah digunakan');
      }
    }

    await updateDoc(userRef, updateData);
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    const userRef = doc(db, this.COLLECTION_NAME, userId);
    await deleteDoc(userRef);
  }

  // Toggle user active status
  static async toggleUserStatus(userId: string): Promise<void> {
    const usersRef = collection(db, this.COLLECTION_NAME);
    const snapshot = await getDocs(usersRef);
    const userDoc = snapshot.docs.find(doc => doc.id === userId);
    
    if (!userDoc) {
      throw new Error('User tidak ditemukan');
    }

    const currentStatus = userDoc.data().isActive;
    await this.updateUser(userId, { isActive: !currentStatus });
  }

  // Initialize super admin (run once)
  static async initializeSuperAdmin(): Promise<void> {
    const usersRef = collection(db, this.COLLECTION_NAME);
    const superAdminQuery = query(usersRef, where('username', '==', 'superadmin'));
    const existingSuperAdmin = await getDocs(superAdminQuery);
    
    if (existingSuperAdmin.empty) {
      await addDoc(usersRef, {
        username: 'superadmin',
        name: 'Super Administrator',
        role: 'super_admin',
        passwordHash: hashPassword('superlogin2025'),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Super admin initialized in Firestore');
    }
  }
}