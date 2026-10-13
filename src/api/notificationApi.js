import api from './axios';

export const getMyNotifications = async () => {
  const response = await api.get('/notifications/my');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};