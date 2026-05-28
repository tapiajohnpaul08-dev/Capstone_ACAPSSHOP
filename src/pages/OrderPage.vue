<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">My Orders</h1>

    <!-- Status Tabs -->
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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Order Items List (grouped by order, displayed by item) -->
    <div v-else class="space-y-6">
      <div 
        v-for="order in filteredOrders" 
        :key="order.id" 
        class="bg-white rounded-xl border overflow-hidden"
      >
        <!-- Order Header -->
        <div class="px-4 py-3 bg-gray-50 border-b flex flex-wrap justify-between items-center gap-2">
          <div>
            <span class="font-semibold">Order #{{ order.orderNumber || order.orderId || order.id }}</span>
            <span class="text-gray-500 text-sm ml-3">{{ formatDate(order.createdAt || order.date) }}</span>
          </div>
          <div class="flex gap-2">
            <span 
              class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
              :class="getStatusBadgeClass(order.status)"
            >
              {{ formatStatus(order.status) }}
            </span>
            <span 
              v-if="order.paymentStatus"
              class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
              :class="getPaymentBadgeClass(order.paymentStatus)"
            >
              {{ order.paymentStatus }}
            </span>
          </div>
        </div>

        <!-- Order Items - Each as a separate row -->
        <div class="divide-y">
          <div 
            v-for="(item, index) in order.items" 
            :key="item._id || index"
            class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="viewOrderDetails(order)"
          >
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <img v-if="!order.isProvided"
                  :src="getImageUrl(item.image)" 
                  :alt="item.name || 'Product'" 
                  class="w-20 h-20 object-cover rounded-lg"
                  @error="handleImageError"
                />
              </div>

              <!-- Item Details -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap justify-between gap-2">
                  <div>
                    <div class="font-semibold">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">{{ item.category }} • {{ item.size }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-blue-600">{{ formatPrice(item.estimatedTotal) }}</div>
                    <div class="text-sm text-gray-500">Quantity: {{ formatNumber(item.quantity) }} pcs</div>
                  </div>
                </div>

                <!-- Additional Item Info -->
                <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <div v-if="item.printSize" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Print: {{ item.printSize }}</span>
                  </div>
                  <div v-if="item.printPlacement" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                    <span>Placement: {{ formatPlacement(item.printPlacement) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Footer -->
        <div class="px-4 py-3 bg-gray-50 border-t flex flex-wrap justify-between items-center gap-2">
          <div class="flex gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                <path d="M12 22V12"/>
                <polyline points="3.29 7 12 12 20.71 7"/>
              </svg>
              <span>{{ order.isProvided ? 'Own Cups' : 'Company Cups' }}</span>
            </div>
            <div class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Total Order Amount</div>
            <div class="text-lg font-bold">{{ formatPrice(order.totalAmount || order.amount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500">No orders found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders.js'

const router = useRouter()
const { orders, fetchOrders } = useOrders()
const selectedStatus = ref('all')
const isLoading = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Status tabs matching your backend status values
const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in production', label: 'In Production' },
  { value: 'out for delivery', label: 'Out for Delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

// Helper: Get order count for a status (counts orders, not items)
const getOrderCount = (status) => {
  if (status === 'all') return orders.value.length
  return orders.value.filter((o) => {
    const orderStatus = o.status?.toLowerCase() || ''
    return orderStatus === status
  }).length
}

// Filter orders by selected status
const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') return orders.value
  return orders.value.filter((o) => {
    const orderStatus = o.status?.toLowerCase() || ''
    return orderStatus === selectedStatus.value
  })
})


function viewOrderDetails(order) {
  router.push(`/customer/orders/${order.orderId || order.id}`)
}

// Image helpers
function getImageUrl(imagePath) {
  if (!imagePath) return '/placeholder-image.png'
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) return `${API_BASE_URL}/${cleanPath}`
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = '/placeholder-image.png'
}

// Status formatting
function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending Review',
    'scheduled': 'Scheduled',
    'in production': 'In Production',
    'out for delivery': 'Out for Delivery',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status?.toLowerCase()] || status || 'Pending'
}

function getStatusBadgeClass(status) {
  const statusLower = status?.toLowerCase() || ''
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'in production': 'bg-purple-100 text-purple-800',
    'out for delivery': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[statusLower] || 'bg-gray-100 text-gray-800'
}

function getPaymentBadgeClass(paymentStatus) {
  const classes = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial': 'bg-orange-100 text-orange-800',
    'Unpaid': 'bg-yellow-100 text-yellow-800'
  }
  return classes[paymentStatus] || 'bg-gray-100 text-gray-800'
}

function formatPlacement(placement) {
  if (!placement) return 'Standard'
  const map = {
    'back-only': 'Back Only',
    'front-only': 'Front Only',
    'both': 'Front & Back'
  }
  return map[placement] || placement
}

function formatPrice(price) {


  if (price === undefined || price === null || isNaN(price)) {
    return '₱0'
  }
  return `₱${Number(price).toLocaleString()}`
}

function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return Number(value).toLocaleString()
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

onMounted(async () => {
  isLoading.value = true
  await fetchOrders()
  isLoading.value = false
})
</script>

<style scoped>
.animate-spin {
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>