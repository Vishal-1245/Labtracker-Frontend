import api from './axios';

// Public endpoint fetching university and department identity
export const getPublicConfig = async () => {
  const response = await api.get('/config/public');
  return response.data;
};
