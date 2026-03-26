<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <AppHeader 
      :notif-count="notificationCount"
      :cart-count="cartCount"
      :unread-count="unreadCount"
      @bell-click="handleBell"
    />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'

const notificationCount = ref(2)
const cartCount = ref(0)
const unreadCount = ref(1)

function handleBell() {
  console.log('Bell clicked - open notifications panel')
}
</script>