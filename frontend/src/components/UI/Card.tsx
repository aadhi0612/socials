import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true 
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-xl shadow-sm 
      ${padding ? 'p-6' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;