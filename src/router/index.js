import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/views/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/customer'
    },
    {
      path: '/customer',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/customer/dashboard'
        },
        {
          path: 'dashboard',
          name: 'CustomerDashboard',
          component: () => import('@/pages/CustomerHomePage.vue'),
          meta: { requiresAuth: false } // Set to true after login
        },
        {
          path: 'login',
          name: 'CustomerLogin',
          component: () => import('@/pages/LoginForm.vue'),
          meta: { requiresAuth: false }
        },
        // {
        //   path: 'orders',
        //   name: 'CustomerOrders',
        //   component: () => import('@/pages/OrdersView.vue'),
        //   meta: { requiresAuth: true }
        // },
        // {
        //   path: 'orders/create',
        //   name: 'CreateOrder',
        //   component: () => import('@/pages/CreateOrderView.vue'),
        //   meta: { requiresAuth: true }
        // },
        // {
        //   path: 'catalog',
        //   name: 'Catalog',
        //   component: () => import('@/pages/CatalogView.vue'),
        //   meta: { requiresAuth: true }
        // },
        // {
        //   path: 'cart',
        //   name: 'Cart',
        //   component: () => import('@/pages/CartView.vue'),
        //   meta: { requiresAuth: true }
        // },
        // {
        //   path: 'messages',
        //   name: 'Messages',
        //   component: () => import('@/pages/MessagesView.vue'),
        //   meta: { requiresAuth: true }
        // },
        // {
        //   path: 'profile',
        //   name: 'Profile',
        //   component: () => import('@/pages/ProfileView.vue'),
        //   meta: { requiresAuth: true }
        // }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, from) => {
  const isAuthenticated = localStorage.getItem('currentUser') !== null
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/customer/login'
  }
  
  if (to.path === '/customer/login' && isAuthenticated) {
    return '/customer/dashboard'
  }
  
  return true
})

export default router