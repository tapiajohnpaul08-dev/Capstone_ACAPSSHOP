import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/views/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Login route - outside MainLayout (no navigation bar)
    {
      path: '/customer/login',
      name: 'CustomerLogin',
      component: () => import('@/views/LoginForm.vue'),
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
          component: () => import('@/pages/CatalogPage.vue'),
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
  path: 'order-history',
  name: 'OrderHistory',
  component: () => import('@/pages/OrderHistoryPage.vue'),
  meta: { requiresAuth: true }
},
{
  path: 'profile/account',
  name: 'AccountInfo',
  component: () => import('@/pages/AccountInfoPage.vue'),
  meta: { requiresAuth: true }
},
{
  path: 'profile/customer-info',
  name: 'CustomerInfoTemplate',
  component: () => import('@/pages/AccountInfoPage.vue'),
  meta: { requiresAuth: true }
},
{
  path: 'profile/privacy',
  name: 'PrivacySettings',
  component: () => import('@/pages/PrivacyPage.vue'),
  meta: { requiresAuth: true }
},
{
  path: 'profile/change-password',
  name: 'ChangePassword',
  component: () => import('@/pages/ChangePasswordPage.vue'),
  meta: { requiresAuth: true }
}
      ],
    },
    // Redirect root to customer login
    {
      path: '/',
      redirect: '/customer/login',
    },
  ],
})

// Navigation guard
router.beforeEach((to, from) => {
  console.log('Navigating to:', to.path)
  const isAuthenticated =
    localStorage.getItem('customerToken') !== null || localStorage.getItem('currentUser') !== null

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/customer/login'
  }

  if ((to.path === '/customer/login' || to.path === '/') && isAuthenticated) {
    return '/customer/dashboard'
  }

  return true
})

export default router