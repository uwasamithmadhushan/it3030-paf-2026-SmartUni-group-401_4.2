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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 409 &&
      error.config?.url?.includes('/bookings')
    ) {
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        'This time slot is already booked. Please choose a different time.';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const loginWithGoogle = (credential) => api.post('/auth/google', { credential });

// Users
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const getAllUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const approveUser = (id) => api.put(`/users/${id}/approve`);
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role });

// Resources / Facilities Catalogue
export const getAllResources = (params) => api.get('/resources', { params });
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const updateResourceStatus = (id, status) => api.patch(`/resources/${id}/status`, { status });
export const deleteResource = (id) => api.delete(`/resources/${id}`);

// Assets (mapped to /resources)
export const getAllAssets = (params) => api.get('/resources', { params });
export const getAssetById = (id) => api.get(`/resources/${id}`);
export const createAsset = (data) => api.post('/resources', data);
export const updateAsset = (id, data) => api.put(`/resources/${id}`, data);
export const deleteAsset = (id) => api.delete(`/resources/${id}`);

// Incident Tickets
export const getAllTickets = (params) => api.get('/tickets', { params });
export const getMyTickets = (params) => api.get('/tickets/my', { params });
export const getAssignedTickets = (params) => api.get('/tickets/assigned/me', { params });
export const getTechnicianDashboardStats = () => api.get('/tickets/technician/dashboard');
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const createTicket = (data) => api.post('/tickets', data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);
export const updateTicketStatus = (id, data) => api.patch(`/tickets/${id}/status`, data);
export const assignTechnician = (id, data) => api.patch(`/tickets/${id}/assign`, data);
export const resolveTicket = (id, data) => api.patch(`/tickets/${id}/resolve`, data);
export const rejectTicket = (id, data) => api.patch(`/tickets/${id}/reject`, data);
export const addComment = (id, text) => api.post(`/tickets/${id}/comments`, text, {
  headers: { 'Content-Type': 'text/plain' }
});
export const updateComment = (id, commentId, text) => api.put(`/tickets/${id}/comments/${commentId}`, text, {
  headers: { 'Content-Type': 'text/plain' }
});
export const deleteComment = (id, commentId) => api.delete(`/tickets/${id}/comments/${commentId}`);
export const uploadAttachment = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tickets/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Bookings
export const getMyBookings = () => api.get('/bookings/my');
export const getAllBookings = (status) => api.get('/bookings', { params: { status } });
export const createBooking = (data) => api.post('/bookings', data);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}/status`, data);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

export default api;
