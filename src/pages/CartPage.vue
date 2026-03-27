<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">Shopping Cart</h1>
    
    <!-- Empty Cart State -->
    <div v-if="cartItems.length === 0" class="bg-white rounded-xl border">
      <div class="p-8 text-center">
        <ShoppingCart class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600 mb-4">Your cart is empty</p>
        <button 
          @click="startShopping"
          class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2"
        >
          Start Shopping
        </button>
      </div>
    </div>

    <!-- Cart with Items -->
    <div v-else>
      <!-- Cart Items Grid -->
      <div class="space-y-4">
        <CartItemCard 
          v-for="item in cartItems" 
          :key="item.id"
          :item="item"
          @update-quantity="updateQuantity"
          @remove="removeItem"
        />
      </div>

      <!-- Cart Summary -->
      <div class="mt-6 bg-white rounded-xl border p-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">Subtotal</span>
          <span class="text-lg font-bold text-blue-600">{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between items-center mb-4 text-sm text-gray-600">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div class="flex justify-between items-center mb-6 pt-4 border-t">
          <span class="text-xl font-bold">Total</span>
          <span class="text-2xl font-bold text-blue-600">{{ formatPrice(total) }}</span>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            @click="continueShopping"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
          <button 
            @click="checkout"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import CartItemCard from '@/components/cart/CartITemCard.vue'

const router = useRouter()

// Mock cart data - replace with actual store or API data
const cartItems = ref([
  // Add sample data for testing, or keep empty array
])

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const total = computed(() => subtotal.value)

function formatPrice(price) {
  return `₱${price.toLocaleString()}`
}

function startShopping() {
  router.push('/customer/dashboard')
}

function continueShopping() {
  router.push('/customer/dashboard')
}

function checkout() {
  router.push('/customer/checkout')
}

function updateQuantity(itemId, newQuantity) {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item) {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      item.quantity = newQuantity
    }
  }
}

function removeItem(itemId) {
  cartItems.value = cartItems.value.filter(i => i.id !== itemId)
}
</script>