import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Bell, Search, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = [
        {
            id: 1,
            type: 'like',
            message: 'Your LinkedIn post about digital transformation received 45 new likes',
            time: '2 minutes ago',
            unread: true
        },
        {
            id: 2,
            type: 'comment',
            message: 'New comment on your Instagram post: "Great insights on sustainability!"',
            time: '15 minutes ago',
            unread: true
        },
        {
            id: 3,
            type: 'share',
            message: 'Your Twitter post was shared 12 times in the last hour',
            time: '1 hour ago',
            unread: false
        },
        {
            id: 4,
            type: 'mention',
            message: 'EY was mentioned in a LinkedIn post by a client',
            time: '2 hours ago',
            unread: false
        }
    ];
    const unreadCount = notifications.filter(n => n.unread).length;
    return (_jsx("header", { className: "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 relative", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx("input", { type: "text", placeholder: "Search posts, campaigns, assets...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" })] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowNotifications(!showNotifications), className: "relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors", children: [_jsx(Bell, { className: "w-5 h-5" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium", children: unreadCount }))] }), showNotifications && (_jsxs("div", { className: "absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Notifications" }), _jsx("button", { onClick: () => setShowNotifications(false), className: "p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded", children: _jsx(X, { className: "w-4 h-4 text-gray-500 dark:text-gray-400" }) })] }), _jsx("div", { className: "max-h-96 overflow-y-auto", children: notifications.map((notification) => (_jsx("div", { className: `p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${notification.unread ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}` }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: notification.message }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: notification.time })] })] }) }, notification.id))) }), _jsx("div", { className: "p-3 border-t border-gray-200 dark:border-gray-700", children: _jsx("button", { className: "w-full text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium", children: "View all notifications" }) })] }))] }), _jsx("button", { onClick: toggleTheme, className: "p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors", children: theme === 'light' ? _jsx(Moon, { className: "w-5 h-5" }) : _jsx(Sun, { className: "w-5 h-5" }) })] })] }) }));
};
export default Header;
