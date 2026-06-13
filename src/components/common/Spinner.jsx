import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-8 h-8 border-3';

  return (
    <div
      className={`border-brand-600 border-t-transparent rounded-full animate-spin ${sizeClass} ${className}`}
      role="status"
    />
  );
}
