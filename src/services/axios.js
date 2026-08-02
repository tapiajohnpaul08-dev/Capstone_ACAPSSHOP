// src/services/axios.js
import axios from 'axios';

// Use VITE_API_BASE_URL (not VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

console.log('API Base URL:', API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check if backend is running');
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - redirecting to login');
      localStorage.removeItem('customerToken');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/customer/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;