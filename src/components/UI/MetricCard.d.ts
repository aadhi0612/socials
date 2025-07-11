import React, { ReactNode } from 'react';
interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: ReactNode;
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}
declare const MetricCard: React.FC<MetricCardProps>;
export default MetricCard;
