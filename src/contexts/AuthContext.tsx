import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { getUser, createUser } from '../api/users';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Try to fetch the user from backend
    let backendUser = null;
    try {
      backendUser = await getUser(email);
    } catch (err) {
      // ignore, will try to create
    }
    if (!backendUser) {
      // If not found, create the user
      const newUser = {
        id: email, // using email as id for demo
        name: email.split('@')[0],
        email,
        role: 'Admin',
        avatar: '',
        lastActive: new Date().toISOString()
      };
      backendUser = await createUser(newUser);
    }
    setUser(backendUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};