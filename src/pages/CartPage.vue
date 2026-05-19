<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">Shopping Cart</h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="items.length === 0" class="bg-white rounded-xl border">
      <div class="p-8 text-center">
        <ShoppingCart class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600 mb-4">Your cart is empty</p>
        <button @click="startShopping" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2">
          Start Shopping
        </button>
      </div>
    </div>

    <div v-else>
      <div class="space-y-4">
        <CartItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @update-quantity="updateQuantity"
          @remove="removeItem"
        />
      </div>

      <div class="mt-6 bg-white rounded-xl border p-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">Subtotal</span>
          <span class="text-lg font-bold text-blue-600">{{ formatPrice(cartTotal) }}</span>
        </div>
        <div class="flex justify-between items-center mb-4 text-sm text-gray-600">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div class="flex justify-between items-center mb-6 pt-4 border-t">
          <span class="text-xl font-bold">Total</span>
          <span class="text-2xl font-bold text-blue-600">{{ formatPrice(cartTotal) }}</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="continueShopping" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Continue Shopping
          </button>
          <button @click="checkout" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import CartItemCard from '@/components/cart/CartITemCard.vue'
import { useCart } from '@/composables/useCart.js'

const router = useRouter()
const { items, cartTotal, init, removeFromCart } = useCart()
const isLoading = ref(true)

onMounted(async () => {
  await init()
  isLoading.value = false
})

function formatPrice(price) {
  return `₱${price.toLocaleString()}`
}

function startShopping() { router.push('/customer/dashboard') }
function continueShopping() { router.push('/customer/dashboard') }
function checkout() {
  // Save cart to sessionStorage and go to create order
  sessionStorage.setItem('pendingCart', JSON.stringify(items.value))
  router.push('/customer/orders/create?source=cart')
}

async function updateQuantity(itemId, newQuantity) {
  const item = items.value.find((i) => i.id === itemId)
  if (!item) return
  if (newQuantity <= 0) {
    await removeFromCart(itemId)
  } else {
    item.quantity = newQuantity
    // Persist change
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
    const idx = cartItems.findIndex((i) => i.id === itemId)
    if (idx !== -1) { cartItems[idx].quantity = newQuantity; localStorage.setItem('cartItems', JSON.stringify(cartItems)) }
  }
}

async function removeItem(itemId) {
  await removeFromCart(itemId)
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>