import React, { ReactNode } from 'react';
import { User } from '../types';
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        name: string;
        email: string;
        password: string;
    }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}
export declare const useAuth: () => AuthContextType;
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthProvider: React.FC<AuthProviderProps>;
export {};
