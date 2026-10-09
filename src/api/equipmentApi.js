import api from './axios';

// Get equipment list with optional filters (labId, status, category)
export const getEquipment = async (params = {}) => {
  const response = await api.get('/equipment', { params });
  return response.data;
};

// Get single equipment asset by ID
export const getEquipmentById = async (id) => {
  const response = await api.get(`/equipment/${id}`);
  return response.data;
};

// Register new equipment asset
export const createEquipment = async (data) => {
  const response = await api.post('/equipment', data);
  return response.data;
};

// Update equipment details
export const updateEquipment = async (id, data) => {
  const response = await api.put(`/equipment/${id}`, data);
  return response.data;
};

// Update equipment operational status
export const updateEquipmentStatus = async (id, status) => {
  const response = await api.put(`/equipment/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

// Report a fault on an equipment asset
export const reportMaintenance = async (id, issueData) => {
  const response = await api.post(`/equipment/${id}/maintenance`, issueData);
  return response.data;
};

// Resolve an equipment maintenance ticket
export const resolveMaintenance = async (logId) => {
  const response = await api.put(`/equipment/maintenance/${logId}/resolve`);
  return response.data;
};

// View maintenance logs
export const getMaintenanceLogs = async (params = {}) => {
  const response = await api.get('/equipment/maintenance', { params });
  return response.data;
};
