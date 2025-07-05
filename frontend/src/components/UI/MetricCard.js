import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';
const MetricCard = ({ title, value, change, icon, color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    };
    return (_jsx(Card, { children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `p-3 rounded-lg ${colors[color]}`, children: icon }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: title }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: value }), change !== undefined && (_jsxs("div", { className: "flex items-center mt-1", children: [change > 0 ? (_jsx(TrendingUp, { className: "w-4 h-4 text-green-500 mr-1" })) : (_jsx(TrendingDown, { className: "w-4 h-4 text-red-500 mr-1" })), _jsxs("span", { className: `text-sm font-medium ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`, children: [Math.abs(change), "%"] })] }))] })] }) }));
};
export default MetricCard;
