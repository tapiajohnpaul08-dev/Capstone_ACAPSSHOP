<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="space-y-4">
      <!-- Profile Header Card -->
      <div class="bg-white rounded-xl border">
        <div class="p-6">
          <div class="flex items-center gap-4">
            <img 
              :src="user.avatar" 
              :alt="user.name" 
              class="w-20 h-20 rounded-full object-cover"
            />
            <div class="flex-1">
              <h2 class="text-xl font-bold">{{ user.name }}</h2>
              <p class="text-gray-600">{{ user.email }}</p>
              <p class="text-gray-600">{{ user.phone }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Menu -->
      <div class="bg-white rounded-xl border">
        <div class="p-0">
          <ProfileMenuItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :title="item.title"
            :description="item.description"
            :badge="item.badge"
            :to="item.to"
            @click="handleMenuClick(item)"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          @click="logout"
          class="inline-flex items-center justify-center gap-2 w-full rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-9 px-4 py-2 text-sm font-medium transition-colors"
        >
          <LogOut class="h-4 w-4 mr-2" />
          Log Out
        </button>
        <button 
          @click="deleteAccount"
          class="inline-flex items-center justify-center gap-2 w-full rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-4 py-2 text-sm font-medium transition-colors"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Trash2 } from 'lucide-vue-next'
import ProfileMenuItem from '@/components/profile/ProfileMenuItem.vue'

const router = useRouter()

const user = ref({
  name: 'John Doe',
  email: 'customer@acapshop.com',
  phone: '+63 912 345 6789',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
})

const menuItems = ref([
  {
    id: 'account',
    icon: 'User',
    title: 'Account Information',
    description: 'Manage your personal information',
    to: '/customer/profile/account',
    chevron: true
  },
  {
    id: 'designs',
    icon: 'Image',
    title: 'My Design Templates',
    description: 'View and manage saved designs',
    to: '/customer/designs',  // Navigate to standalone page
    chevron: true
  },
  {
    id: 'customer-info',
    icon: 'FileText',
    title: 'Customer Info Template',
    description: 'Manage your default order information',
    to: '/customer/profile/customer-info',
    chevron: true
  },
  {
    id: 'order-history',
    icon: 'History',
    title: 'Order History',
    description: 'View all past orders',
    to: '/customer/order-history',  // Navigate to standalone page
    chevron: true
  },
  {
    id: 'privacy',
    icon: 'Shield',
    title: 'Privacy',
    description: 'Control your privacy settings',
    to: '/customer/profile/privacy',
    chevron: true
  },
  {
    id: 'change-password',
    icon: 'Settings',
    title: 'Change Password',
    description: 'Update your account password',
    to: '/customer/profile/change-password',
    chevron: true
  },
  {
    id: 'language',
    icon: 'Globe',
    title: 'Language',
    description: 'English',
    badge: 'English',
    to: null,
    chevron: true
  },
  {
    id: 'help',
    icon: 'CircleHelp',
    title: 'Help Centre',
    description: 'Get support and assistance',
    to: null,
    chevron: true
  },
  {
    id: 'feedback',
    icon: 'MessageSquare',
    title: 'Share Feedback',
    description: 'Tell us what you think',
    to: null,
    chevron: true
  }
])

function handleMenuClick(item) {
  if (item.to) {
    router.push(item.to)
  } else {
    switch (item.id) {
      case 'language':
        alert('Language selector coming soon')
        break
      case 'help':
        window.open('/help', '_blank')
        break
      case 'feedback':
        alert('Feedback form coming soon')
        break
    }
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('customerToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('currentUser')
    router.push('/customer/login')
  }
}

function deleteAccount() {
  if (confirm('Are you absolutely sure? This action cannot be undone.')) {
    alert('Account deletion request submitted. Please contact support.')
  }
}
</script>