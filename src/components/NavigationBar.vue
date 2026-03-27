<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/customer/dashboard" class="flex items-center gap-2 group">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm transition-all group-hover:shadow-md">
            <span class="text-white font-black text-sm">A</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-gray-900 tracking-tight">ACAPSHOP</h1>
            <p class="text-xs text-gray-400 -mt-0.5">Customer Portal</p>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center gap-1">
          <router-link 
            to="/customer/dashboard" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group"
            :class="isActive('/customer/dashboard') 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span class="text-sm font-medium">Home</span>
          </router-link>

          <router-link 
            to="/customer/orders" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group"
            :class="isActive('/customer/orders') 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="text-sm font-medium">My Orders</span>
          </router-link>

          <!-- <router-link 
            to="/customer/catalog" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group"
            :class="isActive('/customer/catalog') 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
              <path d="M12 22V12"/>
              <polyline points="3.29 7 12 12 20.71 7"/>
              <path d="m7.5 4.27 9 5.15"/>
            </svg>
            <span class="text-sm font-medium">Products</span>
          </router-link> -->

          <router-link 
            to="/customer/cart" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group"
            :class="isActive('/customer/cart') 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span class="text-sm font-medium">Cart</span>
            <span v-if="cartCount > 0" class="ml-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-semibold rounded-full bg-red-500 text-white">
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </router-link>

          <router-link 
            to="/customer/messages" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group"
            :class="isActive('/customer/messages') 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
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
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group"
            :class="isActive('/customer/profile') 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="text-sm font-medium">Profile</span>
          </router-link>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-2">
          <!-- Notification Bell -->
          <button 
            @click="$emit('bell-click')"
            class="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
            </svg>
            <span v-if="notifCount > 0" class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
              {{ notifCount > 99 ? '99+' : notifCount }}
            </span>
          </button>

          <!-- User Menu Button -->
          <div class="relative" ref="userMenuRef">
            <button 
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {{ userNameInitial }}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showUserMenu }">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ userEmail }}</p>
              </div>
              <router-link 
                to="/customer/profile" 
                class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="showUserMenu = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                My Profile
              </router-link>
              <router-link 
                to="/customer/orders" 
                class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="showUserMenu = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <path d="M3 6h18"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                My Orders
              </router-link>
              <button 
                @click="logout"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white">
      <div class="container mx-auto px-4 py-2 space-y-1">
        <router-link 
          to="/customer/dashboard" 
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          :class="isActive('/customer/dashboard') 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'"
          @click="mobileMenuOpen = false"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span>Home</span>
        </router-link>
        <!-- Add other mobile links similarly -->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  notifCount: { type: Number, default: 0 },
  cartCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 }
})

defineEmits(['bell-click'])

const route = useRoute()
const router = useRouter()
const showUserMenu = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref(null)

const userName = ref(localStorage.getItem('userName') || 'John Customer')
const userEmail = ref(localStorage.getItem('userEmail') || 'customer@acapshop.com')
const userNameInitial = computed(() => userName.value.charAt(0))

function isActive(path) {
  return route.path === path
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function logout() {
  localStorage.removeItem('customerToken')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('currentUser')
  router.push('/customer/login')
  showUserMenu.value = false
  mobileMenuOpen.value = false
}

function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>