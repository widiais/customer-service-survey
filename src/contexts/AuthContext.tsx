'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { UserService } from '@/lib/userService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize super admin if not exists
        await UserService.initializeSuperAdmin();
        
        // Check if user is already logged in (session only, data from Firestore)
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            // Just restore session, actual user data comes from Firestore
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('auth_user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await UserService.authenticateUser(username, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      // Get fresh user data from Firestore by fetching all users and finding current user
      const allUsers = await UserService.getAllUsers();
      const freshUser = allUsers.find(u => u.id === user.id);
      
      if (freshUser) {
        // Update with fresh data from Firestore
        setUser(freshUser);
        localStorage.setItem('auth_user', JSON.stringify(freshUser));
      } else {
        // User not found in Firestore, logout
        console.warn('User not found in Firestore, logging out');
        logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}