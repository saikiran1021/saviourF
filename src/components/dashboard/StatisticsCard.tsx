import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'green' | 'yellow';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend
}) => {
  const colorClasses = {
    red: 'bg-red-500 text-red-100',
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    yellow: 'bg-yellow-500 text-yellow-100'
  };

  const bgColorClasses = {
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50'
  };

  return (
    <div className={`${bgColorClasses[color]} rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};