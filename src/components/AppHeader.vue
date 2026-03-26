<template>
  <header class="bg-white border-b sticky top-0 z-10">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/customer/dashboard" class="text-xl font-bold text-blue-600">
          ACAPSHOP
        </router-link>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <NavButton 
            to="/customer/dashboard" 
            icon="home" 
            label="Home"
            :active="isActive('/customer/dashboard')"
          />
          <NavButton 
            to="/customer/orders" 
            icon="shopping-bag" 
            label="My Orders"
            :active="isActive('/customer/orders')"
          />
          <NavButton 
            to="/customer/catalog" 
            icon="package" 
            label="Products"
            :active="isActive('/customer/catalog')"
          />
          <NavButton 
            to="/customer/cart" 
            icon="shopping-cart" 
            label="Cart"
            :active="isActive('/customer/cart')"
            :badge="cartCount"
          />
          <NavButton 
            to="/customer/messages" 
            icon="message-square" 
            label="Messages"
            :active="isActive('/customer/messages')"
            :badge="unreadCount"
          />
          <NavButton 
            to="/customer/profile" 
            icon="user" 
            label="Profile"
            :active="isActive('/customer/profile')"
          />
        </nav>

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

        <!-- Right Side Actions -->
        <div class="flex items-center gap-2">
          <button 
            @click="$emit('bell-click')"
            class="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
            </svg>
            <span v-if="notifCount > 0" class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
              {{ notifCount }}
            </span>
          </button>
          
          <button 
            @click="logout"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t bg-white">
      <div class="container mx-auto px-4 py-2">
        <NavButton 
          to="/customer/dashboard" 
          icon="home" 
          label="Home"
          :active="isActive('/customer/dashboard')"
          @click="mobileMenuOpen = false"
        />
        <NavButton 
          to="/customer/orders" 
          icon="shopping-bag" 
          label="My Orders"
          :active="isActive('/customer/orders')"
          @click="mobileMenuOpen = false"
        />
        <NavButton 
          to="/customer/catalog" 
          icon="package" 
          label="Products"
          :active="isActive('/customer/catalog')"
          @click="mobileMenuOpen = false"
        />
        <NavButton 
          to="/customer/cart" 
          icon="shopping-cart" 
          label="Cart"
          :active="isActive('/customer/cart')"
          :badge="cartCount"
          @click="mobileMenuOpen = false"
        />
        <NavButton 
          to="/customer/messages" 
          icon="message-square" 
          label="Messages"
          :active="isActive('/customer/messages')"
          :badge="unreadCount"
          @click="mobileMenuOpen = false"
        />
        <NavButton 
          to="/customer/profile" 
          icon="user" 
          label="Profile"
          :active="isActive('/customer/profile')"
          @click="mobileMenuOpen = false"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavButton from '../components/Navbutton.vue'

const props = defineProps({
  notifCount: { type: Number, default: 0 },
  cartCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 }
})

defineEmits(['bell-click'])

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

function isActive(path) {
  return route.path === path
}

function logout() {
  localStorage.removeItem('currentUser')
  router.push('/customer/login')
}
</script>