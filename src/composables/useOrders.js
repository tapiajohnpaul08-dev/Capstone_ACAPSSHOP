// src/composables/useOrders.js
import { ref } from 'vue'
import { ordersApi } from '@/api.js'

const orders = ref([])
let initialized = false
let pendingFetch = null

export function useOrders() {
  async function fetchOrders(force = false) {
    // Prevent multiple concurrent requests
    if (pendingFetch && !force) {
      return pendingFetch
    }
    
    pendingFetch = (async () => {
      const res = await ordersApi.getOrders()
      if (res.success) {
        orders.value = res.orders
        initialized = true
      }
      pendingFetch = null
      return res
    })()
    
    return pendingFetch
  }

  async function fetchOrder(id) {
    return ordersApi.getOrder(id)
  }

  async function submitOrder(orderData) {
    const res = await ordersApi.createOrder(orderData)
    if (res.success) {
      // Refresh orders list if already initialized
      if (initialized) {
        await fetchOrders(true)
      }
    }
    return res
  }

  async function cancelOrder(id) {
    const res = await ordersApi.cancelOrder(id)
    if (res.success) {
      const idx = orders.value.findIndex((o) => o.id === parseInt(id))
      if (idx !== -1) {
        orders.value[idx] = { 
          ...orders.value[idx], 
          statusValue: 'cancelled', 
          status: 'Cancelled' 
        }
      }
    }
    return res
  }

  // Initialize on first use
  if (!initialized) {
    fetchOrders()
  }

  return { orders, fetchOrders, fetchOrder, submitOrder, cancelOrder }
}