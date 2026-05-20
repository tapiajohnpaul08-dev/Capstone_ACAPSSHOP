import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api/v1', // Matches your backend port and route prefix
  timeout: 10000,
  withCredentials: true, // Important for cookies/sessions since your backend uses credentials: true
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional - for adding auth tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    // If you're using JWT tokens instead of cookies
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;