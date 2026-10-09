import React from 'react';

// Spinner component representing asynchronous loading states
const Loader = ({ message = 'Loading data...' }) => {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
