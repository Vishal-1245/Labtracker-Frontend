import api from './axios';

// Get all laboratories
export const getLabs = async () => {
  const response = await api.get('/labs');
  return response.data;
};

// Get single lab by ID
export const getLabById = async (id) => {
  const response = await api.get(`/labs/${id}`);
  return response.data;
};

// Create a new lab room (Admin only)
export const createLab = async (labData) => {
  const response = await api.post('/labs', labData);
  return response.data;
};

// Update an existing lab room (Admin only)
export const updateLab = async (id, labData) => {
  const response = await api.put(`/labs/${id}`, labData);
  return response.data;
};

// Delete a lab room (Admin only)
export const deleteLab = async (id) => {
  const response = await api.delete(`/labs/${id}`);
  return response.data;
};
