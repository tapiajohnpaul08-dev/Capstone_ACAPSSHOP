<!-- components/NavigationBar.vue -->
<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
    <div class="container mx-auto px-4">
      <!-- ✅ Always show the navbar, but conditionally show content -->
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link :to="isAuthenticated ? '/customer/dashboard' : '/'" class="flex items-center group">
          <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            <img src="../assets/images/ACAPS_LOGO_ONLY.png" alt="">
            </div>
          <div>
            <h1 class="text-lg font-black text-gray-900 tracking-tight">ACAPSHOP</h1>
            <p class="text-xs text-gray-400 -mt-0.5">We Are Committed to You</p>
          </div>
        </router-link>

        <!-- ✅ Desktop Navigation - Show only when authenticated -->
        <div v-if="isAuthenticated" class="hidden md:flex items-center gap-1">
          <router-link
            to="/customer/dashboard"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            :class="isActive('/customer/dashboard') ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span class="text-sm font-medium">Home</span>
          </router-link>

          <router-link
            to="/customer/orders"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            :class="isActive('/customer/orders') ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="text-sm font-medium">My Orders</span>
          </router-link>

          <router-link
            to="/customer/messages"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative"
            :class="isActive('/customer/messages') ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="text-sm font-medium">Messages</span>
            <span v-if="unreadCount > 0" class="ml-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-semibold rounded-full bg-red-500 text-white">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </router-link>

          <router-link
            to="/customer/profile"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            :class="isActive('/customer/profile') ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="text-sm font-medium">Profile</span>
          </router-link>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-2">
          

          <!-- ✅ Show User Menu if authenticated, otherwise show Login/Sign Up -->
          <div v-if="isAuthenticated" class="relative" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {{ userInitial }}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showUserMenu }">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ userEmail }}</p>
              </div>
              <router-link to="/customer/profile" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="showUserMenu = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Profile
              </router-link>
              <router-link to="/customer/orders" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="showUserMenu = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                My Orders
              </router-link>
              <button
                @click="logout"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </div>

          <!-- ✅ Show Login/Sign Up buttons for public users -->
          <template v-else>
            <router-link to="/customer/login" class="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              Log In
            </router-link>
            <router-link to="/customer/signup" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm">
              Sign Up
            </router-link>
          </template>

          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white">
      <div class="container mx-auto px-4 py-2 space-y-1">
        <!-- Public mobile links -->
        <router-link to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:bg-gray-100" @click="mobileMenuOpen = false">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>Home</span>
        </router-link>
        <router-link to="/catalog" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:bg-gray-100" @click="mobileMenuOpen = false">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <span>Catalog</span>
        </router-link>

        <!-- Auth links for mobile -->
        <template v-if="!isAuthenticated">
          <router-link to="/customer/login" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-blue-600 hover:bg-blue-50" @click="mobileMenuOpen = false">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>Log In</span>
          </router-link>
          <router-link to="/customer/signup" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all bg-blue-600 text-white hover:bg-blue-700" @click="mobileMenuOpen = false">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            <span>Sign Up</span>
          </router-link>
        </template>

        <!-- Protected mobile links (only when authenticated) -->
        <template v-if="isAuthenticated">
          <router-link to="/customer/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:bg-gray-100" @click="mobileMenuOpen = false">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
            <span>My Orders</span>
          </router-link>
          <router-link to="/customer/messages" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:bg-gray-100" @click="mobileMenuOpen = false">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Messages</span>
          </router-link>
          <router-link to="/customer/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:bg-gray-100" @click="mobileMenuOpen = false">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profile</span>
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  notifCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 }
})

const emit = defineEmits(['bell-click'])

const route = useRoute()
const router = useRouter()
const { userName, userEmail, userInitial, logout: authLogout } = useAuth()

const showUserMenu = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref(null)

// ✅ Check if user is authenticated (token exists and not expired)
const isAuthenticated = computed(() => {
  const token = localStorage.getItem('customerToken')
  if (!token) return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return true
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp > currentTime
  } catch {
    return false
  }
})

function isActive(path) {
  return route.path === path
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function logout() {
  authLogout()
  router.push('/customer/login')
  showUserMenu.value = false
  mobileMenuOpen.value = false
}


function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>