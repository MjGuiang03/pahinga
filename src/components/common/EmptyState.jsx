import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = HelpCircle, 
  title = 'No records found', 
  description = 'There is currently no data to display.', 
  children,
  className = '' 
}) {
  return (
    <div className={`card p-8 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {children}
    </div>
  );
}
