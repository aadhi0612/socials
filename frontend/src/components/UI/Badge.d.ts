import React, { ReactNode } from 'react';
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}
declare const Badge: React.FC<BadgeProps>;
export default Badge;
