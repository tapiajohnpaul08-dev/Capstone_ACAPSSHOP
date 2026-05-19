<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <NavigationBar
      :notif-count="notificationCount"
      :cart-count="cartCount"
      :unread-count="unreadCount"
      @bell-click="handleBell"
    />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavigationBar from '@/components/NavigationBar.vue'
import Footer from '@/components/Footer.vue'
import { useCart } from '@/composables/useCart.js'

const { cartCount, init } = useCart()
const notificationCount = ref(2)
const unreadCount = ref(1)

onMounted(() => init())

function handleBell() {
  console.log('Bell clicked - open notifications panel')
}
</script>