import React, { ReactNode } from 'react';
interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: boolean;
}
declare const Card: React.FC<CardProps>;
export default Card;
