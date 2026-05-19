<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">My Orders</h1>

    <div class="mb-6">
      <div class="relative w-full whitespace-nowrap overflow-x-auto pb-2">
        <div class="flex gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            @click="selectedStatus = tab.value"
            class="px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            :class="selectedStatus === tab.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
          >
            {{ tab.label }}
            <span
              class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ml-2"
              :class="selectedStatus === tab.value ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'"
            >
              {{ getOrderCount(tab.value) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="space-y-4">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @click="viewOrderDetails(order)"
      />
    </div>

    <div v-if="!isLoading && filteredOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500">No orders found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OrderCard from '@/components/orders/OrderCard.vue'
import { useOrders } from '@/composables/useOrders.js'

const router = useRouter()
const { orders, fetchOrders } = useOrders()
const selectedStatus = ref('all')
const isLoading = ref(false)

// Fixed status tabs to match actual statusValue values
const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'scheduled', label: 'Scheduled for Production' },
  { value: 'production', label: 'In Production' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'delayed', label: 'Delayed' }
]

const getOrderCount = (status) => {
  if (status === 'all') return orders.value.length
  return orders.value.filter((o) => o.statusValue === status || o.status === status).length
}

const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') return orders.value
  return orders.value.filter((o) => o.statusValue === selectedStatus.value || o.status === selectedStatus.value)
})

function viewOrderDetails(order) {
  router.push(`/customer/orders/${order.id}`)
}

onMounted(async () => {
  isLoading.value = true
  await fetchOrders()
  isLoading.value = false
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>