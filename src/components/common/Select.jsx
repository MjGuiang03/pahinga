import React from 'react';

export default function Select({ 
  label, 
  error, 
  id, 
  options = [], 
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
      <select
        id={id}
        className={`form-select ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-600/10' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
