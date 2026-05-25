// src/services/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 30000,
  withCredentials: true, // Keep this for sessions
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to log requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Important: Don't set Content-Type for FormData
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
      // window.location.href = '/customer/login';
    } else if (error.response) {
      console.error(`HTTP ${error.response.status}:`, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;