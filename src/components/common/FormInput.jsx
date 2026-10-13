import { useState } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);

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
        <div className={type === 'password' ? 'password-input-wrap' : undefined}>
          <input
            id={name}
            name={name}
            type={type === 'password' && showPassword ? 'text' : type}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`form-control ${type === 'password' ? 'has-password-toggle' : ''} ${error ? 'is-invalid' : ''}`}
          />
          {type === 'password' && (
            <button
              type="button"
              className="password-visibility-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.3 9.5 6-.4.8-1.3 2-2.7 3.2M6.2 6.2C4.2 7.4 2.9 9.2 2.5 11c.8 1.5 4 6 9.5 6 1 0 2-.2 2.8-.5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          )}
        </div>
      )}

      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-help">{helperText}</span>}
    </div>
  );
};

export default FormInput;
