<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="space-y-4">
      <div class="bg-white rounded-xl border">
        <div class="p-6">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl">
              {{ userInitial }}
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold">{{ userName }}</h2>
              <p class="text-gray-600">{{ userEmail }}</p>
              <!-- Show provider badge -->
              <span v-if="userProvider && userProvider !== 'local'" class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                <span v-if="userProvider === 'google'">🔵</span>
                <span v-else-if="userProvider === 'facebook'">🔷</span>
                {{ userProvider === 'google' ? 'Google Account' : userProvider === 'facebook' ? 'Facebook Account' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border">
        <div class="p-0">
          <ProfileMenuItem
            v-for="item in filteredMenuItems"
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

      <div class="space-y-3">
        <button @click="showLogoutConfirm = true" class="inline-flex items-center justify-center gap-2 w-full rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-9 px-4 py-2 text-sm font-medium transition-colors">
          <LogOut class="h-4 w-4 mr-2" />
          Log Out
        </button>
        <button @click="showDeleteConfirm = true" class="inline-flex items-center justify-center gap-2 w-full rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-4 py-2 text-sm font-medium transition-colors">
          <Trash2 class="h-4 w-4 mr-2" />
          Delete Account
        </button>
      </div>
    </div>

    <!-- Logout confirmation -->
    <ConfirmationModal
      v-model:visible="showLogoutConfirm"
      title="Log Out"
      message="Are you sure you want to log out of your account?"
      type="warning"
      close-label="Stay"
      confirm-label="Log Out"
      @confirm="logout"
      @close="showLogoutConfirm = false"
    />

    <!-- Delete account confirmation -->
    <ConfirmationModal
      v-model:visible="showDeleteConfirm"
      title="Delete Account"
      message="Are you absolutely sure? This action is permanent and cannot be undone."
      type="danger"
      close-label="Cancel"
      confirm-label="Delete Account"
      @confirm="deleteAccount"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Trash2 } from 'lucide-vue-next'
import ProfileMenuItem from '@/components/profile/ProfileMenuItem.vue'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const { logout: authLogout, userName, userEmail, userInitial } = useAuth()

const showLogoutConfirm = ref(false)
const showDeleteConfirm = ref(false)
const userProvider = ref('local') // 'local', 'google', 'facebook'

// All menu items
const allMenuItems = ref([
  { id: 'account', icon: 'User', title: 'Account Information', description: 'Manage your personal information', to: '/customer/profile/account' },
  { id: 'designs', icon: 'Image', title: 'My Design Templates', description: 'View and manage saved designs', to: '/customer/designs' },
  { id: 'order-history', icon: 'History', title: 'Order History', description: 'View all past orders', to: '/customer/order-history' },
  { id: 'change-password', icon: 'Settings', title: 'Change Password', description: 'Update your account password', to: '/customer/profile/change-password', requiresLocal: true },
  { id: 'privacy', icon: 'Shield', title: 'Privacy', description: 'Control your privacy settings', to: '/customer/profile/privacy' },
  { id: 'language', icon: 'Globe', title: 'Language', description: 'English', badge: 'English', to: null },
  { id: 'help', icon: 'CircleHelp', title: 'Help Centre', description: 'Get support and assistance', to: null },
  { id: 'feedback', icon: 'MessageSquare', title: 'Share Feedback', description: 'Tell us what you think', to: null }
])

// Filter menu items based on provider
const filteredMenuItems = computed(() => {
  if (userProvider.value === 'local') {
    return allMenuItems.value
  }
  // For third-party accounts, hide items that require local account
  return allMenuItems.value.filter(item => !item.requiresLocal)
})

// Load user data from localStorage
onMounted(() => {
  const currentUser = localStorage.getItem('currentUser')
  if (currentUser) {
    const user = JSON.parse(currentUser)
    userProvider.value = user.provider || 'local'
  }
})

function handleMenuClick(item) {
  if (item.to) router.push(item.to)
}

function logout() {
  authLogout()
  router.push('/customer/login')
}

function deleteAccount() {
  showDeleteConfirm.value = false
  alert('Account deletion request submitted. Please contact support@acapshop.com.')
}
</script>