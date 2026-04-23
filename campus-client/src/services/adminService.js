import api from './api';

export const getSummary         = () => api.get('/analytics/summary');
export const getResourceStats   = () => api.get('/analytics/resource-stats');
export const getTechnicianPerformance = () => api.get('/analytics/performance');
export const getBookingTrends   = () => api.get('/analytics/booking-trends');
