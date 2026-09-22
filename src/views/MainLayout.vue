<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <NavigationBar
      :notif-count="notificationCount"
      :cart-count="cartCount"
      :unread-count="unreadCount"
      @bell-click="handleBell"
    />
    <main class="flex-1 min-h-0">
        <router-view :key="$route.fullPath" />
    </main>
    <Footer v-if="!hideFooter" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()

// Hide the footer on immersive pages (chat, full-screen flows)
const HIDE_FOOTER_ROUTES = ['/customer/messages', '/customer/orders/create']
const hideFooter = computed(() =>
  HIDE_FOOTER_ROUTES.some((p) => route.path.startsWith(p)),
)
import { useCart } from '@/composables/useCart.js'
import { chatApi } from '@/api'

const { cartCount } = useCart()
const notificationCount = ref(0)
const unreadCount = ref(0)

// ── Fetch unread messages count ──────────────────────
async function fetchUnreadCount() {
  try {
    const response = await chatApi.getUnreadCount()
    if (response.success && response.data) {
      unreadCount.value = response.data.total || response.data.count || 0
      console.log('📩 Unread messages count:', unreadCount.value)
    }
  } catch (error) {
    console.error('Error fetching unread count:', error)
    unreadCount.value = 0
  }
}

// ── Handle bell click ────────────────────────────────
function handleBell() {
  console.log('Bell clicked - open notifications panel')
}

// ── Listen for unread count updates ──────────────────
function handleUnreadCountUpdate(event) {
  if (event.detail && event.detail.count !== undefined) {
    unreadCount.value = event.detail.count
    console.log('📩 Unread count updated via event:', event.detail.count)
  }
}

function handleNewMessageReceived() {
  fetchUnreadCount()
}

// ── Lifecycle ─────────────────────────────────────────
onMounted(() => {
  fetchUnreadCount()
  
  // Listen for unread count updates from socket
  window.addEventListener('unreadCountUpdated', handleUnreadCountUpdate)
  window.addEventListener('newMessageReceived', handleNewMessageReceived)
  window.addEventListener('messageRead', fetchUnreadCount)
})

onUnmounted(() => {
  window.removeEventListener('unreadCountUpdated', handleUnreadCountUpdate)
  window.removeEventListener('newMessageReceived', handleNewMessageReceived)
  window.removeEventListener('messageRead', fetchUnreadCount)
})
</script>