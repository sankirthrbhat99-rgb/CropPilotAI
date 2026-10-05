import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000 // 45 seconds for AI diagnostic requests
});

// Attach authenticated user's JWT to all outgoing requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      console.warn('Error fetching Supabase auth session for API request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to extract clean server error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.details = error.response?.data?.details;
    return Promise.reject(customError);
  }
);

export const healthApi = {
  check: () => apiClient.get('/health')
};

export const profileApi = {
  getProfile: () => apiClient.get('/profile')
};

export const farmsApi = {
  getAll: () => apiClient.get('/farms'),
  getById: (id) => apiClient.get(`/farms/${id}`),
  create: (data) => apiClient.post('/farms', data),
  update: (id, data) => apiClient.put(`/farms/${id}`, data),
  delete: (id) => apiClient.delete(`/farms/${id}`)
};

export const fieldsApi = {
  getAll: (farmId) => apiClient.get('/fields', { params: farmId ? { farm_id: farmId } : {} }),
  getById: (id) => apiClient.get(`/fields/${id}`),
  create: (data) => apiClient.post('/fields', data),
  update: (id, data) => apiClient.put(`/fields/${id}`, data),
  delete: (id) => apiClient.delete(`/fields/${id}`)
};

export const cropsApi = {
  getAll: (params = {}) => apiClient.get('/crops', { params }),
  getById: (id) => apiClient.get(`/crops/${id}`),
  create: (data) => apiClient.post('/crops', data),
  update: (id, data) => apiClient.put(`/crops/${id}`, data),
  delete: (id) => apiClient.delete(`/crops/${id}`)
};

export const advisoriesApi = {
  getAll: (cropId) => apiClient.get('/advisories', { params: cropId ? { crop_id: cropId } : {} }),
  getById: (id) => apiClient.get(`/advisories/${id}`),
  requestAdvisory: (payload) => apiClient.post('/advisories', payload)
};

export default apiClient;
