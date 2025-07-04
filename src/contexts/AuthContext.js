import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { getUser, createUser, login } from '../api/users';
const AuthContext = createContext(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const loginHandler = async (email, password) => {
        // Try to login
        let loginResult = null;
        try {
            loginResult = await login(email, password);
        }
        catch (err) {
            throw new Error('Invalid credentials');
        }
        // If login successful, fetch user profile
        if (loginResult && loginResult.user_id) {
            const backendUser = await getUser(loginResult.user_id);
            setUser(backendUser);
        }
    };
    const register = async (userData) => {
        // Register new user
        const backendUser = await createUser(userData);
        setUser(backendUser);
    };
    const logout = () => {
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            login: loginHandler,
            register,
            logout,
            isAuthenticated: !!user
        }, children: children }));
};
