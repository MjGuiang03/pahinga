import React from 'react';

export default function Badge({ 
  children, 
  variant = 'green', 
  className = '', 
  ...props 
}) {
  const variantClass = {
    green: 'badge-green',
    outline: 'badge-outline',
    easy: 'badge-easy',
    moderate: 'badge-moderate',
    difficult: 'badge-difficult',
  }[variant] || 'badge-green';

  return (
    <span className={`badge ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
