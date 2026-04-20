import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const googleLogin = (credential) => api.post('/auth/google', { credential });

// Users
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const getAllUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const approveUser = (id) => api.put(`/users/${id}/approve`);

// Assets / Facilities
export const getAllAssets = (params) => api.get('/assets', { params });
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getAllBookings = (status) => api.get('/bookings', { params: status ? { status } : {} });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}/status`, data);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// Incident Tickets
export const getAllTickets = () => api.get('/tickets');
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const createTicket = (data) => api.post('/tickets', data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);
export const assignTechnician = (id, data) => api.put(`/tickets/${id}/assign`, data);
export const updateTicketStatus = (id, data) => api.put(`/tickets/${id}/status`, data);
export const addComment = (id, text) => api.post(`/tickets/${id}/comments`, text, { headers: { 'Content-Type': 'text/plain' } });
export const updateComment = (id, commentId, text) => api.put(`/tickets/${id}/comments/${commentId}`, text, { headers: { 'Content-Type': 'text/plain' } });
export const deleteComment = (id, commentId) => api.delete(`/tickets/${id}/comments/${commentId}`);
export const uploadAttachment = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tickets/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteAttachment = (id, filename) => api.delete(`/tickets/${id}/attachments/${filename}`);

export default api;
