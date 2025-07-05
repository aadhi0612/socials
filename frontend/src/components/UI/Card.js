import { jsx as _jsx } from "react/jsx-runtime";
const Card = ({ children, className = '', padding = true }) => {
    return (_jsx("div", { className: `
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-xl shadow-sm 
      ${padding ? 'p-6' : ''} 
      ${className}
    `, children: children }));
};
export default Card;
