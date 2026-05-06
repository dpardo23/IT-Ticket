"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type User, type UserRole, mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock authentication - accept any password for demo
    const foundUser = mockUsers.find(u => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      return { success: true };
    }

    // Demo accounts for easy testing
    if (username === 'user' || username === 'end_user') {
      setUser(mockUsers[0]); // End user
      return { success: true };
    }
    if (username === 'helpdesk' || username === 'analyst') {
      setUser(mockUsers[2]); // Helpdesk
      return { success: true };
    }
    if (username === 'admin' || username === 'mlops') {
      setUser(mockUsers[4]); // Admin
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials. Try: user, helpdesk, or admin' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const userForRole = mockUsers.find(u => u.role === role);
    if (userForRole) {
      setUser(userForRole);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login, 
      logout,
      switchRole
    }}>
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
