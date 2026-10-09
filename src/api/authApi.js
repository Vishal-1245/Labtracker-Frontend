import api from './axios';

// Authenticate user credentials and return JWT token with profile info
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Change password for the currently logged-in student or faculty
export const changePassword = async (passwords) => {
  const response = await api.post('/auth/change-password', passwords);
  return response.data;
};
