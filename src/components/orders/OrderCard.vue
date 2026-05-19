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
            :src="order.image || '/placeholder-image.png'" 
            :alt="order.product || 'Order Item'" 
            class="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        <!-- Order Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <div class="font-semibold">{{ order.orderNumber || 'Order #' + order.id }}</div>
              <div class="text-sm text-gray-600">{{ order.date || formatDate(order.createdAt) }}</div>
            </div>
            <div class="flex gap-2">
              <span 
                class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium"
                :class="statusBadgeClass"
              >
                {{ order.status || 'Pending' }}
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <div class="text-sm">
              <span class="font-semibold">{{ order.product || 'Custom Order' }}</span>
              <template v-if="order.quantity">
                • {{ formatNumber(order.quantity) }} pcs
              </template>
              <template v-if="order.sizes">
                • {{ order.sizes }}
              </template>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div v-if="order.supplyType" class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                <path d="M12 22V12"/>
                <polyline points="3.29 7 12 12 20.71 7"/>
                <path d="m7.5 4.27 9 5.15"/>
              </svg>
              <span>{{ order.supplyType }}</span>
            </div>
            <div v-if="order.deliveryMethod" class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ order.deliveryMethod }}</span>
            </div>
          </div>
        </div>

        <!-- Amount Section -->
        <div class="flex-shrink-0 text-right">
          <div class="text-sm text-gray-600">Total Amount</div>
          <div class="text-xl font-bold text-blue-600">{{ formatPrice(order.totalAmount) }}</div>
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

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const statusBadgeClass = computed(() => {
  const status = props.order.status || 'Pending'
  const classes = {
    'Pending Review': 'bg-yellow-100 text-yellow-800',
    'Scheduled for Production': 'bg-blue-100 text-blue-800',
    'In Production': 'bg-purple-100 text-purple-800',
    'Ready': 'bg-green-100 text-green-800',
    'Completed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Delayed': 'bg-orange-100 text-orange-800',
    'Pending': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

const paymentBadgeClass = computed(() => {
  const paymentStatus = props.order.paymentStatus || 'Pending Payment'
  const classes = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial Payment': 'bg-orange-100 text-orange-800',
    'Pending Payment': 'bg-yellow-100 text-yellow-800',
    'Refunded': 'bg-gray-100 text-gray-800'
  }
  return classes[paymentStatus] || 'bg-gray-100 text-gray-800'
})

function formatPrice(price) {
  // Handle undefined, null, or non-numeric values
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