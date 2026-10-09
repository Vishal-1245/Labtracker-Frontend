import React, { createContext, useContext, useState } from 'react';
import { login as loginService } from '../api/authApi';

// Authentication context providing session state across the React app
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state directly from localStorage if user previously logged in
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || null);
  const [fullName, setFullName] = useState(() => localStorage.getItem('fullName') || null);
  const [mustChangePassword, setMustChangePassword] = useState(() => {
    return localStorage.getItem('mustChangePassword') === 'true';
  });

  // Login handler saving token and profile details
  const login = async (credentials) => {
    const data = await loginService(credentials);

    // Persist to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('mustChangePassword', String(data.mustChangePassword));

    // Update state
    setToken(data.token);
    setRole(data.role);
    setUsername(data.username);
    setFullName(data.fullName);
    setMustChangePassword(Boolean(data.mustChangePassword));

    return data;
  };

  // Logout handler removing session data
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('mustChangePassword');

    setToken(null);
    setRole(null);
    setUsername(null);
    setFullName(null);
    setMustChangePassword(false);
  };

  // Clear must-change-password flag after user updates their password
  const clearMustChangePassword = () => {
    localStorage.setItem('mustChangePassword', 'false');
    setMustChangePassword(false);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        username,
        fullName,
        mustChangePassword,
        isAuthenticated,
        login,
        logout,
        clearMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for accessing current user authentication state
export const useAuth = () => useContext(AuthContext);
