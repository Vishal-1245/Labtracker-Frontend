import api from './axios';

// Get all users (Admin only)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Get single user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create a new student, lab incharge, or admin
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update an existing user's details
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Deactivate a user account
export const deactivateUser = async (id) => {
  const response = await api.put(`/users/${id}/deactivate`);
  return response.data;
};

// Bulk import student accounts from a CSV file (Admin only)
export const importUsersCsv = async (formData) => {
  const response = await api.post('/users/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get current logged-in user profile
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};
