import { jsx as _jsx } from "react/jsx-runtime";
const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    };
    return (_jsx("span", { className: `
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]} ${className}
    `, children: children }));
};
export default Badge;
