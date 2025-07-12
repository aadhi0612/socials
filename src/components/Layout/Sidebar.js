import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, Image, Settings, Target, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
const Sidebar = () => {
    const { user, logout } = useAuth();
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/create', icon: PenTool, label: 'Content Creation' },
        { path: '/media', icon: Image, label: 'Media Library' },
        { path: '/campaigns', icon: Target, label: 'Campaign Manager' },
        { path: '/admin', icon: Settings, label: 'Admin Dashboard' }
    ];
    return (_jsxs("div", { className: "w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-lg font-bold text-black", children: "AI" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "socials AI" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "AI-powered social media platform" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-2", children: navItems.map((item) => (_jsxs(NavLink, { to: item.path, className: ({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-r-2 border-yellow-600 dark:border-yellow-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
            `, children: [_jsx(item.icon, { className: "w-5 h-5" }), _jsx("span", { children: item.label })] }, item.path))) }), _jsxs("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("img", { src: user?.avatar || 'https://images.pexels.com/photos/3783725/pexels-photo-3783725.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', alt: user?.name, className: "w-10 h-10 rounded-full" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: user?.name }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: [user?.role, " \u2022 socials AI"] })] })] }), _jsxs("button", { onClick: logout, className: "flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { children: "Sign Out" })] })] })] }));
};
export default Sidebar;
