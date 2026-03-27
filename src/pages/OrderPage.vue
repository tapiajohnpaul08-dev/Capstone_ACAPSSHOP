<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">My Orders</h1>

    <!-- Status Filter Tabs (Horizontal Scroll) -->
    <div class="mb-6">
      <div class="relative w-full whitespace-nowrap overflow-x-auto pb-2">
        <div class="flex gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            @click="selectedStatus = tab.value"
            class="px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            :class="selectedStatus === tab.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'"
          >
            {{ tab.label }}
            <span 
              class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ml-2"
              :class="selectedStatus === tab.value
                ? 'bg-white text-blue-600'
                : 'bg-gray-200 text-gray-700'"
            >
              {{ getOrderCount(tab.value) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div class="space-y-4">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @click="viewOrderDetails(order)"
      />
    </div>

    <!-- Empty State -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500">No orders found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import OrderCard from '@/components/orders/OrderCard.vue'
import { customerOrders } from '@/data/ordersData'

const router = useRouter()
const selectedStatus = ref('all')

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'scheduled', label: 'Scheduled for Production' },
  { value: 'production', label: 'In Production' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'delayed', label: 'Delayed' }
]

const getOrderCount = (status) => {
  if (status === 'all') return customerOrders.length
  return customerOrders.filter(order => order.statusValue === status).length
}

const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') {
    return customerOrders
  }
  return customerOrders.filter(order => order.statusValue === selectedStatus.value)
})

function viewOrderDetails(order) {
  router.push(`/customer/orders/${order.id}`)
}
</script>