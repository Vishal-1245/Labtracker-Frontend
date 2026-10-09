import React from 'react';

// Controlled form input component with validation error and helper text display
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  rows,
  min,
  max,
  step,
}) => {
  const isTextarea = type === 'textarea';

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 3}
          className={`form-textarea ${error ? 'is-invalid' : ''}`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`form-control ${error ? 'is-invalid' : ''}`}
        />
      )}

      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-help">{helperText}</span>}
    </div>
  );
};

export default FormInput;
