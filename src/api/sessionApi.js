import api from './axios';

// Get scheduled lab sessions with optional filters (labId, date, status)
export const getSessions = async (params = {}) => {
  const response = await api.get('/sessions', { params });
  return response.data;
};

// Get single session details
export const getSessionById = async (id) => {
  const response = await api.get(`/sessions/${id}`);
  return response.data;
};

// Schedule a new laboratory session
export const createSession = async (data) => {
  const response = await api.post('/sessions', data);
  return response.data;
};

// Transition session status (OPEN or CLOSED)
export const updateSessionStatus = async (id, status) => {
  const response = await api.put(`/sessions/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

// Batch submit student attendance records for a session
export const submitAttendance = async (id, records) => {
  const response = await api.post(`/sessions/${id}/attendance`, { records });
  return response.data;
};

// Get attendance records for a session
export const getAttendance = async (id) => {
  const response = await api.get(`/sessions/${id}/attendance`);
  return response.data;
};

// Form a student team for a session
export const createTeam = async (id, teamData) => {
  const response = await api.post(`/sessions/${id}/teams`, teamData);
  return response.data;
};

// Get teams registered in a session
export const getTeams = async (id) => {
  const response = await api.get(`/sessions/${id}/teams`);
  return response.data;
};
