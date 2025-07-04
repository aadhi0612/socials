import React, { ReactNode } from 'react';
import { Theme } from '../types';
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}
export declare const useTheme: () => ThemeContextType;
interface ThemeProviderProps {
    children: ReactNode;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export {};
