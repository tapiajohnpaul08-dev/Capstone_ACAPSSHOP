// src/composables/useAuth.js
// Central auth state — shared across the entire app via module-level refs.

import { ref, computed } from 'vue'
import { authApi } from '@/api.js'

const currentUser = ref(null)
const token = ref(null)

try {
  const rawUser = localStorage.getItem('currentUser')
  if (rawUser) { 
    currentUser.value = JSON.parse(rawUser)
    token.value = localStorage.getItem('customerToken')
  }
} catch (error) {
  console.error('Error loading auth state:', error)
}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  
  // Full name from backend (already split for both local and OAuth users)
  const userName = computed(() => {
    const user = currentUser.value
    if (!user) return localStorage.getItem('userName') || ''
    
    // Backend already provides firstName and lastName for all users
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`.trim()
    }
    if (user.firstName) return user.firstName
    if (user.name) return user.name
    return user.email?.split('@')[0] || 'User'
  })
  
  const userEmail = computed(() => currentUser.value?.email || localStorage.getItem('userEmail') || '')
  
  const userInitial = computed(() => {
    const name = userName.value
    return name ? name.charAt(0).toUpperCase() : 'U'
  })
  
  // First name from backend
  const userFirstName = computed(() => {
    const user = currentUser.value
    return user?.firstName || userName.value.split(' ')[0] || ''
  })
  
  // Last name from backend
  const userLastName = computed(() => {
    const user = currentUser.value
    return user?.lastName || ''
  })
  
  // Provider (local, google, facebook) - set by backend
  const userProvider = computed(() => currentUser.value?.provider || 'local')
  
  // Check if user has local account (can change password)
  const isLocalAccount = computed(() => userProvider.value === 'local')
  
  // Customer ID for API calls
  const customerId = computed(() => {
    const user = currentUser.value
    return user?.customerId || user?._id || null
  })

  async function login(email, password) {
    const res = await authApi.login(email, password)
    if (res.success && res.data) {
      const customer = res.data.customer
      currentUser.value = customer
      token.value = res.data.token
      
      localStorage.setItem('customerToken', res.data.token)
      localStorage.setItem('currentUser', JSON.stringify(customer))
      localStorage.setItem('userName', `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email)
      localStorage.setItem('userEmail', customer.email)
    }
    return res
  }

  // For OAuth login callback (user already has firstName, lastName from backend)
  function setOAuthUser(userData, authToken) {
    currentUser.value = userData
    token.value = authToken
    
    localStorage.setItem('customerToken', authToken)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    localStorage.setItem('userName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email)
    localStorage.setItem('userEmail', userData.email)
  }

  async function register(userData) {
    const res = await authApi.register(userData)
    if (res.success && res.data) {
      if (res.data.token) {
        // Auto-login after registration
        currentUser.value = res.data.customer
        token.value = res.data.token
        
        localStorage.setItem('customerToken', res.data.token)
        localStorage.setItem('currentUser', JSON.stringify(res.data.customer))
        localStorage.setItem('userName', `${res.data.customer.firstName || ''} ${res.data.customer.lastName || ''}`.trim() || res.data.customer.email)
        localStorage.setItem('userEmail', res.data.customer.email)
      }
    }
    return res
  }

  function logout() {
    // Call logout API
    authApi.logout().catch(console.error)
    
    currentUser.value = null
    token.value = null
    
    localStorage.removeItem('customerToken')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
  }

  async function updateProfile(updateData) {
    const id = customerId.value
    if (!id) {
      return { success: false, message: 'User not authenticated' }
    }
    
    const res = await authApi.updateCustomer(id, updateData)
    if (res.success && res.data) {
      // Update current user state
      currentUser.value = {
        ...currentUser.value,
        ...res.data
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      localStorage.setItem('userName', `${currentUser.value.firstName || ''} ${currentUser.value.lastName || ''}`.trim() || currentUser.value.email)
    }
    return res
  }

  return { 
    currentUser, 
    token, 
    isAuthenticated, 
    userName, 
    userEmail, 
    userInitial,
    userFirstName,
    userLastName,
    userProvider,
    isLocalAccount,
    customerId,
    login, 
    register, 
    logout,
    setOAuthUser,
    updateProfile
  }
}