import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllAssets = (params = {}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return api.get('/assets', { params: filteredParams });
};

export const createAsset = (data) => api.post('/assets', data);

export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);

export const deleteAsset = (id) => api.delete(`/assets/${id}`);

export default api;
