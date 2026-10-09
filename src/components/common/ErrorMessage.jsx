import React from 'react';

// Central error alert component extracting backend message and field-level validation errors
const ErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null;

  // Extract message and fieldErrors from Axios error response or direct error object
  let mainMessage = '';
  let fieldErrors = null;

  if (typeof error === 'string') {
    mainMessage = error;
  } else if (error.response && error.response.data) {
    const data = error.response.data;
    mainMessage = data.message || 'An unexpected error occurred. Please try again.';
    fieldErrors = data.fieldErrors || null;
  } else if (error.message) {
    mainMessage = error.message;
  } else {
    mainMessage = 'An unexpected server error occurred.';
  }

  return (
    <div className="alert alert-danger" role="alert">
      <span style={{ fontSize: '18px' }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong>{mainMessage}</strong>
        {fieldErrors && Object.keys(fieldErrors).length > 0 && (
          <ul>
            {Object.entries(fieldErrors).map(([field, msg]) => (
              <li key={field}>
                <strong>{field}</strong>: {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
