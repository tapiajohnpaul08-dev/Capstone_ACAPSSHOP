// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/views/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/oauth/callback',
      name: 'OAuthCallback',
      component: () => import('@/views/OAuthCallback.vue'),
      meta: { requiresAuth: false },
    },
    // Login route - outside MainLayout (no navigation bar)
    {
      path: '/customer/login',
      name: 'CustomerLogin',
      component: () => import('@/views/LoginForm.vue'),
      meta: { requiresAuth: false },
    },
            {
  path: '/customer/forgot-password',
  name: 'ForgotPassword',
  component: () => import('@/pages/ForgotPasswordPage.vue'),
},
    {
      path: '/customer/signup',
      name: 'SignUp',
      component: () => import('@/views/SignupView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/customer/verify-otp',
      name: 'OtpVerify',
      component: () => import('@/views/OtpVerifyView.vue'),
      meta: { requiresAuth: false },
    },
    // All authenticated routes - inside MainLayout (with navigation bar)
    {
      path: '/customer',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/customer/dashboard',
        },
        {
          path: 'dashboard',
          name: 'CustomerDashboard',
          component: () => import('@/pages/CustomerHomePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'CustomerOrders',
          component: () => import('@/pages/OrderPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/create',
          name: 'CreateOrder',
          component: () => import('@/pages/CreateOrderPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:id',
          name: 'OrderDetail',
          component: () => import('@/pages/OrderDetailPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'catalog',
          name: 'CustomerCatalog',
          component: () => import('@/pages/CustomerHomePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'cart',
          name: 'CustomerCart',
          component: () => import('@/pages/CartPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'messages',
          name: 'CustomerMessages',
          component: () => import('@/pages/MessagesPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'CustomerProfile',
          component: () => import('@/pages/ProfilePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'designs',
          name: 'DesignTemplates',
          component: () => import('@/pages/DesignTemplatePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/customer/product/:id',
          name: 'ProductDetail',
          component: () => import('@/pages/ProductDetailPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'order-history',
          name: 'OrderHistory',
          component: () => import('@/pages/OrderHistoryPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile/account',
          name: 'AccountInfo',
          component: () => import('@/pages/AccountInfoPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile/customer-info',
          name: 'CustomerInfoTemplate',
          component: () => import('@/pages/AccountInfoPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile/privacy',
          name: 'PrivacySettings',
          component: () => import('@/pages/PrivacyPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile/change-password',
          name: 'ChangePassword',
          component: () => import('@/pages/ChangePasswordPage.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    
    {
      path: '/',
      redirect: '/customer/login',
    },
    // Catch all route - redirect to login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/customer/login',
    },
  ],
})

// Helper function to check if token is expired
function isTokenExpired(token) {
  if (!token) return true
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return false
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}

// Helper function to check authentication status
function isAuthenticated(to) {
  // ✅ FIRST: Check for token in URL parameters (for OAuth callback)
  const urlParams = new URLSearchParams(to.query)
  const urlToken = urlParams.get('token')
  
  if (urlToken && !isTokenExpired(urlToken)) {
    console.log('✅ Valid token found in URL parameters')
    return true
  }
  
  // ✅ SECOND: Check for token in localStorage
  const token = localStorage.getItem('customerToken')
  if (token && !isTokenExpired(token)) {
    return true
  }
  
  // Check legacy currentUser
  const currentUser = localStorage.getItem('currentUser')
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser)
      if (user && user.token && !isTokenExpired(user.token)) {
        return true
      }
    } catch {
      return false
    }
  }
  
  return false
}

// Navigation guard with token validation
router.beforeEach((to, from) => {
  console.log('📍 Navigating to:', to.path)
  console.log('🔑 Query params:', to.query)
  
  const authenticated = isAuthenticated(to)
  
  // If route requires authentication and user is not authenticated, redirect to login
  if (to.meta.requiresAuth && !authenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    
    // Clear any invalid auth data
    localStorage.removeItem('customerToken')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('user')
    
    // Store the intended destination for redirect after login
    if (to.path !== '/customer/login') {
      sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    }
    
    return '/customer/login'
  }
  
  // If user is authenticated and tries to access login/signup pages, redirect to dashboard
  if ((to.path === '/customer/login' || to.path === '/customer/signup' || to.path === '/customer/verify-otp' || to.path === '/') && authenticated) {
    console.log('✅ Already authenticated, redirecting to dashboard')
    return '/customer/dashboard'
  }
  
  return true
})

export function setupAuthInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('customerToken')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('user')
        router.push('/customer/login')
      }
      return Promise.reject(error)
    }
  )
}

export default router