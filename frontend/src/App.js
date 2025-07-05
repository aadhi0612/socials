import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import ContentCreation from './pages/ContentCreation';
import MediaLibrary from './pages/MediaLibrary';
import CampaignManager from './pages/CampaignManager';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
const AppContent = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) })] }));
    }
    return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-x-hidden overflow-y-auto p-6", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/create", element: _jsx(ContentCreation, {}) }), _jsx(Route, { path: "/media", element: _jsx(MediaLibrary, {}) }), _jsx(Route, { path: "/campaigns", element: _jsx(CampaignManager, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/login", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] })] }));
};
function App() {
    return (_jsx(ThemeProvider, { children: _jsx(AuthProvider, { children: _jsx(Router, { children: _jsx(AppContent, {}) }) }) }));
}
export default App;
