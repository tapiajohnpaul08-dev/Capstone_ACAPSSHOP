// src/composables/useCart.js
import { ref, computed } from 'vue'
import { cartApi } from '@/api.js'

const items = ref([])
let initialized = false

export function useCart() {
  async function init() {
    if (initialized) return
    const res = await cartApi.getCart()
    if (res.success) items.value = res.items
    initialized = true
  }

  const cartCount = computed(() => items.value.length)
  const cartTotal = computed(() => items.value.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0))

  async function addToCart(item) {
    const res = await cartApi.addToCart(item)
    if (res.success) items.value = res.items
    return res
  }

  async function removeFromCart(id) {
    const res = await cartApi.removeFromCart(id)
    if (res.success) items.value = res.items
    return res
  }

  async function clearCart() {
    const res = await cartApi.clearCart()
    if (res.success) items.value = []
    return res
  }

  return { items, cartCount, cartTotal, init, addToCart, removeFromCart, clearCart }
}