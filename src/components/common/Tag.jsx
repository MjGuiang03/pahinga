import React from 'react';

export default function Tag({ 
  children, 
  active = false, 
  className = '', 
  ...props 
}) {
  return (
    <span
      className={`tag ${active ? 'tag-active' : ''} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
