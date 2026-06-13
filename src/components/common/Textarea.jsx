import React from 'react';

export default function Textarea({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`form-textarea ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-600/10' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
