import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { getUser, createUser, login } from '../api/users';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const loginHandler = async (email: string, password: string) => {
    console.log('loginHandler called', email, password);
    // Try to login
    let loginResult = null;
    try {
      loginResult = await login(email, password); // should return { token, user_id }
      console.log('Login result:', loginResult);
    } catch (err) {
      throw new Error('Invalid credentials');
    }
    // If login successful, fetch user profile with token
    if (loginResult && loginResult.user_id && loginResult.token) {
      setToken(loginResult.token);
      console.log('About to store token:', loginResult.token);
      localStorage.setItem('token', loginResult.token);
      const backendUser = await getUser(loginResult.user_id, loginResult.token);
      setUser(backendUser);
      console.log('Saving user to localStorage:', backendUser);
      localStorage.setItem('user', JSON.stringify(backendUser));
    } else {
      console.log('Login failed: No token or user_id in loginResult', loginResult);
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    // Register new user
    const backendUser = await createUser(userData);
    setUser(backendUser);
    localStorage.setItem('user', JSON.stringify(backendUser));
    // Note: If your backend returns a token on register, set it here as well
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    console.log('Removing user and token from localStorage');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login: loginHandler,
      register,
      logout,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};