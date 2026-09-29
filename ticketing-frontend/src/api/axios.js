import axios from 'axios';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: '/api/ticketing',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      window.location.href = '/ticketing/login';
    }
    return Promise.reject(error);
  }
);

export default api;