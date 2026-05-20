// src/api.js
// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER SIDE API calls using axios - Connected to your Express/MongoDB backend
// Only using working customer routes: /otp, /auth, /customer
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from './services/axios';

// Helper function to handle API responses
const handleResponse = async (request) => {
  try {
    const response = await request;
    return { success: true, ...response.data };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'An error occurred' 
    };
  }
};

// ─── Customer Auth ───────────────────────────────────────────────────────────
export const authApi = {
  // Customer Registration (with OTP)
  async register(userData) {
    // Register expects OTP in the request body
    return handleResponse(
      axiosInstance.post('/customer/register', userData)
    );
  },

  // Customer Login
  async login(email, password) {
    return handleResponse(
      axiosInstance.post('/customer/login', { email, password })
    );
  },

  // Customer Logout
  async logout() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    return handleResponse(
      axiosInstance.post('/customer/logout')
    );
  },

  // Verify Customer Token
  async verifyToken() {
    return handleResponse(
      axiosInstance.get('/customer/verify')
    );
  },

  // Get Customer Profile (requires auth)
  async getProfile() {
    return handleResponse(
      axiosInstance.get('/customer/profile')
    );
  },

  // Update Customer
  async updateCustomer(customerId, data) {
    return handleResponse(
      axiosInstance.put(`/customer/${customerId}`, data)
    );
  },

  // Change Password
  async changePassword(customerId, currentPassword, newPassword) {
    return handleResponse(
      axiosInstance.put(`/customer/${customerId}/password`, { 
        currentPassword, 
        newPassword 
      })
    );
  }
};

// ─── OTP Routes ──────────────────────────────────────────────────────────────
export const otpApi = {
  // Send OTP for registration
  async sendOtp(email) {
    return handleResponse(
      axiosInstance.post('/otp/send', { email })
    );
  },

  // Verify OTP
  async verifyOtp(email, otp) {
    return handleResponse(
      axiosInstance.post('/otp/verify', { email, otp })
    );
  }
};

// ─── OAuth Routes (Google/Facebook) ──────────────────────────────────────────
export const oauthApi = {
  // Google OAuth - Redirect to Google
  googleLogin() {
    window.location.href = 'http://localhost:3001/api/v1/auth/google';
  },

  // Facebook OAuth - Redirect to Facebook
  facebookLogin() {
    window.location.href = 'http://localhost:3001/api/v1/auth/facebook';
  },

  // Handle OAuth callback (parse token from URL)
  handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userDataParam = urlParams.get('user');
    
    if (token && userDataParam) {
      const userData = JSON.parse(decodeURIComponent(userDataParam));
      localStorage.setItem('customerToken', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('token', token);
      return { success: true, token, user: userData };
    }
    
    return { success: false, message: 'OAuth callback failed' };
  },

  // Google OAuth - JSON response alternative
  async googleLoginJson() {
    return handleResponse(
      axiosInstance.get('/auth/google/json')
    );
  }
};

// ─── Customer Profile ─────────────────────────────────────────────────────────
export const profileApi = {
  async getProfile() {
    return authApi.getProfile();
  },

  async updateProfile(customerId, data) {
    return authApi.updateCustomer(customerId, data);
  },

  async changePassword(customerId, currentPassword, newPassword) {
    return authApi.changePassword(customerId, currentPassword, newPassword);
  }
};

// ─── NOTE: The following APIs are NOT YET IMPLEMENTED in your backend ─────────
// These will be added for customer-facing features when you create the routes

// Orders (Customer can view their orders)
export const ordersApi = {
  async getOrders() {
    console.warn('Orders API not implemented yet. Add /api/v1/order routes for customers.');
    return { success: false, message: 'Orders API not available' };
  },
  async getOrder(id) {
    console.warn('Orders API not implemented yet.');
    return { success: false, message: 'Orders API not available' };
  },
  async createOrder(orderData) {
    console.warn('Orders API not implemented yet.');
    return { success: false, message: 'Orders API not available' };
  },
  async cancelOrder(id) {
    console.warn('Orders API not implemented yet.');
    return { success: false, message: 'Orders API not available' };
  }
};

// Products/Designs (Customer can browse designs)
export const designsApi = {
  async getDesigns() {
    console.warn('Products API not implemented yet. Add /api/v1/product routes.');
    return { success: false, message: 'Products API not available' };
  },
  async getDesign(id) {
    console.warn('Products API not implemented yet.');
    return { success: false, message: 'Products API not available' };
  }
};

// Cart (Customer can manage cart)
export const cartApi = {
  async getCart() {
    console.warn('Cart API not implemented yet. Add /api/v1/cart routes.');
    return { success: true, items: [] };
  },
  async addToCart(item) {
    console.warn('Cart API not implemented yet.');
    return { success: false, message: 'Cart API not available' };
  },
  async updateCartItem(id, quantity) {
    console.warn('Cart API not implemented yet.');
    return { success: false, message: 'Cart API not available' };
  },
  async removeFromCart(id) {
    console.warn('Cart API not implemented yet.');
    return { success: false, message: 'Cart API not available' };
  },
  async clearCart() {
    console.warn('Cart API not implemented yet.');
    return { success: false, message: 'Cart API not available' };
  }
};

// Pricing (Customer can calculate prices)
export const pricingApi = {
  async getPrice(cupType, quantity, colors = 1) {
    console.warn('Pricing API not implemented yet.');
    return { success: false, message: 'Pricing API not available' };
  }
};

// Support Messages (Customer can send messages)
export const messagesApi = {
  async getMessages() {
    console.warn('Messages API not implemented yet.');
    return { success: true, messages: [] };
  },
  async sendMessage(messageData) {
    console.warn('Messages API not implemented yet.');
    return { success: false, message: 'Messages API not available' };
  }
};