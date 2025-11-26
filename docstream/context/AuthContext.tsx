// context/AuthContext.tsx
'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
  id: number;  
  staff_id: string;
  email: string;
  department: string;
  role: string;
  name: string;
  status: string;
  is_active: boolean;
  created_at: string;
}
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In your AuthContext, add debugging:
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const userData = localStorage.getItem('user');

          console.log('AuthProvider init - token:', token ? 'exists' : 'null');
          console.log('AuthProvider init - userData:', userData);

          if (token && userData) {
            setAccessToken(token);
            setUser(JSON.parse(userData));
            console.log('AuthProvider - user set:', JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      } finally {
        setIsLoading(false);
        console.log('AuthProvider - isLoading set to false');
      }
    };

    initializeAuth();
  }, []);


  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    accessToken,
    login,
    logout,
    isLoading,
    isAuthenticated: !!accessToken && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};