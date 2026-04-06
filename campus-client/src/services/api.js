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

// Users
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const getAllUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Assets / Facilities
export const getAllAssets = (params) => api.get('/assets', { params });
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);

export default api;
