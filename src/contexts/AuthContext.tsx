import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { getUser, createUser, login } from '../api/users';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // Fetch user from backend if not in storage
        getUserFromToken(storedToken);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const getUserFromToken = async (token: string) => {
    try {
      // You may need to decode the token to get user_id, or store user_id in sessionStorage
      // For now, let's assume you store user_id in sessionStorage as well
      const userId = sessionStorage.getItem('user_id');
      if (userId) {
        const backendUser = await getUser(userId, token);
        setUser(backendUser);
        sessionStorage.setItem('user', JSON.stringify(backendUser));
      }
    } catch (e) {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const loginHandler = async (email: string, password: string) => {
    let loginResult = null;
    try {
      loginResult = await login(email, password);
      console.log('Login result:', loginResult);
    } catch (err) {
      console.log('Login error:', err);
      throw new Error('Invalid credentials');
    }
    if (loginResult && loginResult.user_id && loginResult.token) {
      setToken(loginResult.token);
      console.log('Storing token:', loginResult.token);
      sessionStorage.setItem('token', loginResult.token);
      sessionStorage.setItem('user_id', loginResult.user_id);
      const backendUser = await getUser(loginResult.user_id, loginResult.token);
      setUser(backendUser);
      console.log('Storing user:', backendUser);
      sessionStorage.setItem('user', JSON.stringify(backendUser));
      console.log('Session storage after login:', {
        token: sessionStorage.getItem('token'),
        user_id: sessionStorage.getItem('user_id'),
        user: sessionStorage.getItem('user')
      });
    } else {
      console.log('Login failed: No token or user_id in loginResult', loginResult);
    }
  };

  const register = async (userData: any) => {
    const backendUser = await createUser(userData);
    setUser(backendUser);
    sessionStorage.setItem('user', JSON.stringify(backendUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_id');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login: loginHandler,
      register,
      logout,
      isAuthenticated: !!user && !!token,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};