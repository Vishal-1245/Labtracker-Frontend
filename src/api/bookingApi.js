import api from './axios';

// Create a new lab slot or equipment booking
export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

// Get reservations submitted by the current student
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data;
};

// Get all bookings with optional filters (labId, date, status)
export const getAllBookings = async (params = {}) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

// Cancel an existing booking
export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

// Mark a booking as completed (In-charge and Admin)
export const completeBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/complete`);
  return response.data;
};
