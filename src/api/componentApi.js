import api from './axios';

// Get electronic components list, optionally filtered by labId
export const getComponents = async (labId) => {
  const params = labId ? { labId } : {};
  const response = await api.get('/components', { params });
  return response.data;
};

// Get single component details
export const getComponentById = async (id) => {
  const response = await api.get(`/components/${id}`);
  return response.data;
};

// Add new component to inventory
export const createComponent = async (data) => {
  const response = await api.post('/components', data);
  return response.data;
};

// Update component information
export const updateComponent = async (id, data) => {
  const response = await api.put(`/components/${id}`, data);
  return response.data;
};

// Restock component quantity
export const restockComponent = async (id, quantityToAdd) => {
  const response = await api.put(`/components/${id}/restock`, { quantityToAdd });
  return response.data;
};

// Issue components to a student team for a lab session
export const issueComponent = async (issueData) => {
  const response = await api.post('/components/issue', issueData);
  return response.data;
};

// Return issued components with damage reconciliation
export const returnComponent = async (issueId, returnData) => {
  const response = await api.post(`/components/issues/${issueId}/return`, returnData);
  return response.data;
};

// View component issuance logs
export const getComponentIssues = async (params = {}) => {
  const response = await api.get('/components/issues', { params });
  return response.data;
};
