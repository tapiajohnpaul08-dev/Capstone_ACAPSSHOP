// src/api.js
// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER SIDE API calls using axios - Connected to your Express/MongoDB backend
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
  async register(userData) {
    return handleResponse(
      axiosInstance.post('/customer/register', userData)
    );
  },
  async login(email, password) {
    return handleResponse(
      axiosInstance.post('/customer/login', { email, password })
    );
  },
  async logout() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    return handleResponse(
      axiosInstance.post('/customer/logout')
    );
  },
  async verifyToken() {
    return handleResponse(
      axiosInstance.get('/customer/verify')
    );
  },
  async getProfile() {
    return handleResponse(
      axiosInstance.get('/customer/profile')
    );
  },
  async updateCustomer(customerId, data) {
    return handleResponse(
      axiosInstance.put(`/customer/${customerId}`, data)
    );
  },
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
  async sendOtp(email) {
    return handleResponse(
      axiosInstance.post('/otp/send', { email })
    );
  },
  async verifyOtp(email, otp) {
    return handleResponse(
      axiosInstance.post('/otp/verify', { email, otp })
    );
  }
};

// ─── OAuth Routes ──────────────────────────────────────────────────────────
export const oauthApi = {
  googleLogin() {
    window.location.href = 'http://localhost:3001/api/v1/auth/google';
  },
  facebookLogin() {
    window.location.href = 'http://localhost:3001/api/v1/auth/facebook';
  },
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
  async googleLoginJson() {
    return handleResponse(
      axiosInstance.get('/auth/google/json')
    );
  }
};

// ─── Customer Profile ─────────────────────────────────────────────────────────
export const profileApi = {
  async getProfile() {
    return handleResponse(
      axiosInstance.get('/customer/profile')
    );
  },
  async updateProfile(data) {
    console.warn('Use authApi.updateCustomer(customerId, data) instead');
    return { success: false, message: 'Use updateCustomer method' };
  },
  async changePassword(customerId, currentPassword, newPassword) {
    return authApi.changePassword(customerId, currentPassword, newPassword);
  }
};

// ─── Products API ─────────────────────────────────────────────────────────────
export const productsApi = {
  async getAllProducts() {
    return handleResponse(
      axiosInstance.get('/product')
    );
  },
  async getProductById(id) {
    return handleResponse(
      axiosInstance.get(`/product/${id}`)
    );
  },
  async getProductsByCategory(category) {
    return handleResponse(
      axiosInstance.get(`/product/category/${category}`)
    );
  },
  async getFeaturedProducts() {
    return handleResponse(
      axiosInstance.get('/product/featured')
    );
  },
  async getPopularProducts() {
    return handleResponse(
      axiosInstance.get('/product/popular')
    );
  },
  async getAllSizes(productId) {
    return handleResponse(
      axiosInstance.get(`/product/${productId}/sizes`)
    );
  },
  async getSizeDetails(productId, sizeName) {
    return handleResponse(
      axiosInstance.get(`/product/${productId}/size/${sizeName}`)
    );
  },
  async calculatePrice(productId, sizeName, quantity) {
    return handleResponse(
      axiosInstance.post('/product/calculate-price', { productId, sizeName, quantity })
    );
  }
};

// ─── Orders API (FULLY IMPLEMENTED with your backend) ────────────────────────
export const ordersApi = {
  // Create a new order (customer)
  async createOrder(orderData) {

    console.log('Creating order with data:', orderData);
    return handleResponse(
      axiosInstance.post('/order/customer/create', orderData)
    );
  },
  
  // Get customer's orders
  async getMyOrders() {
    return handleResponse(
      axiosInstance.get('/order/customer/my-orders')
    );
  },
  
  // Get single order by ID (using orderId from your model)
  async getMyOrderById(orderId) {
    return handleResponse(
      axiosInstance.get(`/order/customer/orders/${orderId}`)
    );
  },
  
  // Cancel order
  async cancelMyOrder(orderId) {
    return handleResponse(
      axiosInstance.patch(`/order/customer/orders/${orderId}/cancel`)
    );
  },
  
  // Update order (only pending orders)
  async updateMyOrder(orderId, updateData) {
    return handleResponse(
      axiosInstance.put(`/order/customer/orders/${orderId}`, updateData)
    );
  },
   uploadDesignFiles: async (formData) => {
    return handleResponse(
      axiosInstance.post('/designs/upload-design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    );
  },
};

// ─── Designs/Templates API ────────────────────────────────────────────────────
export const designsApi = {
  async getDesigns() {
    // If you have a designs endpoint, implement here
    // For now, return empty array
    return { success: true, designs: [] };
  },
  async getDesign(id) {
    return { success: false, message: 'Not implemented yet' };
  },
  async saveDesign(designData) {
    return { success: false, message: 'Not implemented yet' };
  }
};

// ─── Cart API (Client-side only for now) ──────────────────────────────────────
export const cartApi = {
  async getCart() {
    const savedCart = localStorage.getItem('customerCart');
    return { success: true, items: savedCart ? JSON.parse(savedCart) : [] };
  },
  async addToCart(item) {
    const savedCart = localStorage.getItem('customerCart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    cart.push(item);
    localStorage.setItem('customerCart', JSON.stringify(cart));
    return { success: true, message: 'Item added to cart' };
  },
  async updateCartItem(id, quantity) {
    const savedCart = localStorage.getItem('customerCart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
      cart[index].quantity = quantity;
      localStorage.setItem('customerCart', JSON.stringify(cart));
    }
    return { success: true };
  },
  async removeFromCart(id) {
    const savedCart = localStorage.getItem('customerCart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const filtered = cart.filter(item => item.id !== id);
    localStorage.setItem('customerCart', JSON.stringify(filtered));
    return { success: true };
  },
  async clearCart() {
    localStorage.removeItem('customerCart');
    return { success: true };
  }
};

// ─── Pricing API ──────────────────────────────────────────────────────────────
export const pricingApi = {
  async getPrice(productId, sizeName, quantity) {
    return productsApi.calculatePrice(productId, sizeName, quantity);
  }
};

// ─── Support Messages API ─────────────────────────────────────────────────────
export const messagesApi = {
  async getMessages() {
    return { success: true, messages: [] };
  },
  async sendMessage(messageData) {
    return { success: false, message: 'Messages API not available yet' };
  }
};


export const templatesApi = {
  async getTemplates() {
    return handleResponse(
      axiosInstance.get('/customer/templates')
    );
  },
  
  async getTemplateById(templateId) {
    return handleResponse(
      axiosInstance.get(`/customer/templates/${templateId}`)
    );
  },
  
  async createTemplate(templateData) {
    // Check if we're sending an existingImagePath (no file upload)
    if (templateData.existingImagePath) {
      // Send as regular JSON, not FormData
      return handleResponse(
        axiosInstance.post('/customer/templates', {
          name: templateData.name,
          printSize: templateData.printSize,
          placement: templateData.placement,
          notes: templateData.notes,
          existingImagePath: templateData.existingImagePath
        })
      );
    }
    
    // Otherwise, use FormData for file upload
    const formData = new FormData();
    formData.append('name', templateData.name);
    formData.append('printSize', templateData.printSize || '');
    formData.append('placement', templateData.placement || '');
    formData.append('notes', templateData.notes || '');
    
    if (templateData.imageFile) {
      formData.append('image', templateData.imageFile);
    }
    
    return handleResponse(
      axiosInstance.post('/customer/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    );
  },
  
  async updateTemplate(templateId, templateData) {
    const formData = new FormData();
    formData.append('name', templateData.name);
    formData.append('printSize', templateData.printSize || '');
    formData.append('placement', templateData.placement || '');
    formData.append('notes', templateData.notes || '');
    
    if (templateData.imageFile) {
      formData.append('image', templateData.imageFile);
    }
    
    return handleResponse(
      axiosInstance.put(`/customer/templates/${templateId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    );
  },
  
  async deleteTemplate(templateId) {
    return handleResponse(
      axiosInstance.delete(`/customer/templates/${templateId}`)
    );
  },
  
  async saveDesignAsTemplate(orderDesignData) {
    const formData = new FormData();
    formData.append('templateName', orderDesignData.templateName);
    formData.append('printSize', orderDesignData.printSize || '');
    formData.append('printPlacement', orderDesignData.printPlacement || '');
    formData.append('designNotes', orderDesignData.designNotes || '');
    
    if (orderDesignData.imageFile) {
      formData.append('image', orderDesignData.imageFile);
    }
    
    return handleResponse(
      axiosInstance.post('/customer/templates/save-from-order', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    );
  }
};