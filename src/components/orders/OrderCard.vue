<template>
  <div 
    class="bg-white rounded-xl border cursor-pointer hover:shadow-lg transition-shadow"
    @click="$emit('click', order)"
  >
    <div class="p-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Product Image -->
        <div class="flex-shrink-0">
          <img 
            :src="getImageUrl(order.image)" 
            :alt="order.product || 'Order Item'" 
            class="w-20 h-20 object-cover rounded-lg"
            @error="handleImageError"
          />
        </div>

        <!-- Order Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <div class="font-semibold">{{ order.orderNumber || order.orderId || 'Order #' + order.id }}</div>
              <div class="text-sm text-gray-600">{{ order.date || formatDate(order.createdAt) }}</div>
            </div>
            <div class="flex gap-2">
              <span 
                class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium"
                :class="statusBadgeClass"
              >
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <div class="text-sm">
              <span class="font-semibold">{{ order.product || getFirstItemName() }}</span>
              <template v-if="order.quantity">
                • {{ formatNumber(order.quantity) }} pcs
              </template>
              <template v-if="order.sizes">
                • {{ order.sizes }}
              </template>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                <path d="M12 22V12"/>
                <polyline points="3.29 7 12 12 20.71 7"/>
              </svg>
              <span>{{ order.supplyType || (order.isProvided ? 'Own Cups' : 'Company Cups') }}</span>
            </div>
            <div class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ order.deliveryMethod || order.receivingMode || 'Delivery' }}</span>
            </div>
          </div>
        </div>

        <!-- Amount Section -->
        <div class="flex-shrink-0 text-right">
          <div class="text-sm text-gray-600">Total Amount</div>
          <div class="text-xl font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
          <span 
            v-if="order.paymentStatus"
            class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium mt-2"
            :class="paymentBadgeClass"
          >
            {{ order.paymentStatus }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

function getImageUrl(imagePath) {
  if (!imagePath) {
    return `${API_BASE_URL}/uploads/products/default-product.jpg`
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  let cleanPath = imagePath.replace(/^\/+/, '') // Remove leading slashes
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  if (cleanPath.startsWith('products/')) {
    return `${API_BASE_URL}/uploads/${cleanPath}`
  }
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = '/placeholder-image.png'
}

function getFirstItemName() {
  if (props.order.items && props.order.items.length > 0) {
    return props.order.items[0].name
  }
  return 'Custom Order'
}

function formatStatus(status) {
  const statusMap = {
    'Pending': 'Pending Review',
    'Scheduled': 'Scheduled for Production',
    'In Production': 'In Production',
    'Out for Delivery': 'Out for Delivery',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled',
    
  }
  return statusMap[status] || status || 'Pending'
}

const statusBadgeClass = computed(() => {
  const status = props.order.status
  const classes = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'Scheduled': 'bg-blue-100 text-blue-800',
    'In Production': 'bg-purple-100 text-purple-800',
    'production': 'bg-purple-100 text-purple-800',
    'Out for Delivery': 'bg-green-100 text-green-800',
    'ready': 'bg-green-100 text-green-800',
    'Completed': 'bg-gray-100 text-gray-800',
    'completed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

const paymentBadgeClass = computed(() => {
  const paymentStatus = props.order.paymentStatus
  const classes = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial': 'bg-orange-100 text-orange-800',
    'Unpaid': 'bg-yellow-100 text-yellow-800'
  }
  return classes[paymentStatus] || 'bg-gray-100 text-gray-800'
})

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
</script>