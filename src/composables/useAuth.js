// src/composables/useAuth.js
// Central auth state — shared across the entire app via module-level refs.

import { ref, computed } from 'vue'
import { authApi } from '@/api.js'

const currentUser = ref(null)
const token = ref(null)

try {
  const rawUser = localStorage.getItem('currentUser')
  if (rawUser) { currentUser.value = JSON.parse(rawUser); token.value = localStorage.getItem('customerToken') }
} catch {}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const userName = computed(() => currentUser.value?.name || localStorage.getItem('userName') || '')
  const userEmail = computed(() => currentUser.value?.email || localStorage.getItem('userEmail') || '')
  const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

  async function login(email, password) {
    const res = await authApi.login(email, password)
    if (res.success) {
      currentUser.value = res.user
      token.value = res.token
      localStorage.setItem('customerToken', res.token)
      localStorage.setItem('currentUser', JSON.stringify(res.user))
      localStorage.setItem('userName', res.user.name)
      localStorage.setItem('userEmail', res.user.email)
    }
    return res
  }

  async function register(userData) {
    return authApi.register(userData)
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('customerToken')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
  }

  return { currentUser, token, isAuthenticated, userName, userEmail, userInitial, login, register, logout }
}