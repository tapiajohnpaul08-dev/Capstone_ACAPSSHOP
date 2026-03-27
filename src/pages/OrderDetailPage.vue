<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Back Button -->
    <button 
      @click="goBack"
      class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m12 19-7-7 7-7"/>
        <path d="M19 12H5"/>
      </svg>
      Back to Orders
    </button>

    <!-- Order Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold">{{ order?.orderNumber }}</h1>
        <p class="text-gray-600 mt-1">{{ order?.date }}</p>
      </div>
      <div class="flex gap-2">
        <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusBadgeClass">
          {{ order?.status }}
        </span>
        <span v-if="order?.delayBadge" class="px-3 py-1 rounded-full text-sm font-medium border border-orange-600 text-orange-600 bg-orange-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline mr-1">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          Delayed
        </span>
      </div>
    </div>

    <!-- Order Details Card -->
    <div class="bg-white rounded-xl border overflow-hidden mb-6">
      <!-- Order Items Section -->
      <div class="p-6 border-b">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-shrink-0">
            <img :src="order?.image" :alt="order?.product" class="w-24 h-24 object-cover rounded-lg">
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ order?.product }}</h3>
            <div class="text-sm text-gray-600 mt-1">
              Quantity: {{ order?.quantity.toLocaleString() }} pcs
            </div>
            <div class="text-sm text-gray-600">
              Sizes: {{ order?.sizes }}
            </div>
            <div class="mt-2 flex flex-wrap gap-3 text-sm">
              <span class="flex items-center gap-1 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                  <path d="M12 22V12"/>
                  <polyline points="3.29 7 12 12 20.71 7"/>
                </svg>
                {{ order?.supplyType }}
              </span>
              <span class="flex items-center gap-1 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ order?.deliveryMethod }}
              </span>
            </div>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="text-sm text-gray-600">Total Amount</div>
            <div class="text-2xl font-bold text-blue-600">{{ formatPrice(order?.totalAmount) }}</div>
            <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium" :class="paymentBadgeClass">
              {{ order?.paymentStatus }}
            </span>
          </div>
        </div>
      </div>

      <!-- Design Preview -->
      <div v-if="order?.designImage" class="p-6 border-b bg-gray-50">
        <h4 class="font-semibold mb-3">Design Preview</h4>
        <div class="flex items-center gap-4">
          <img :src="order.designImage" alt="Design preview" class="w-32 h-32 object-cover rounded-lg border">
          <div class="text-sm text-gray-600">
            <p>Your custom design will be printed on the product</p>
            <p class="mt-1">File: {{ order.designFile || 'custom-logo.png' }}</p>
          </div>
        </div>
      </div>

      <!-- Order Timeline -->
      <div class="p-6">
        <h4 class="font-semibold mb-4">Order Timeline</h4>
        <div class="space-y-4">
          <div v-for="(event, index) in timeline" :key="index" class="flex gap-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="event.bgColor">
                <component :is="event.icon" class="w-4 h-4" :class="event.iconColor" />
              </div>
              <div v-if="index < timeline.length - 1" class="w-0.5 h-8 bg-gray-200 mx-auto mt-1"></div>
            </div>
            <div class="flex-1 pb-4">
              <div class="flex flex-wrap justify-between items-start gap-2">
                <span class="font-medium text-gray-900">{{ event.title }}</span>
                <span class="text-xs text-gray-500">{{ event.date }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button 
        @click="contactSupport"
        class="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
      >
        Contact Support
      </button>
      <button 
        v-if="order?.statusValue === 'pending'"
        @click="cancelOrder"
        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        Cancel Order
      </button>
      <button 
        v-if="order?.statusValue === 'ready'"
        @click="confirmPickup"
        class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Confirm Pickup/Delivery
      </button>
      <button 
        v-if="order?.paymentStatus === 'Pending Payment'"
        @click="makePayment"
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Make Payment
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { customerOrders } from '@/data/ordersData'

// Icons defined as render functions so they work inside <component :is="...">
const ClockIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) }
const CheckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('polyline', { points: '20 6 9 17 4 12' })]) }
const CalendarIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })]) }
const PackageIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }), h('path', { d: 'M12 22V12' }), h('polyline', { points: '3.29 7 12 12 20.71 7' })]) }
const TruckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }), h('path', { d: 'M15 18H9' }), h('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }), h('circle', { cx: '17', cy: '18', r: '2' }), h('circle', { cx: '7', cy: '18', r: '2' })]) }
const CheckCircleIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), h('polyline', { points: '22 4 12 14.01 9 11.01' })]) }
const AlertIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }), h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })]) }
const XIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })]) }

const route = useRoute()
const router = useRouter()
const orderId = ref(parseInt(route.params.id))
const order = ref(customerOrders.find(o => o.id === orderId.value))

// If order not found, redirect back
if (!order.value) {
  router.push('/customer/orders')
}

// Timeline events based on order status
const timeline = computed(() => {
  const events = []
  
  // Always add order placed
  events.push({
    title: 'Order Placed',
    description: 'Your order has been received and is awaiting review.',
    date: order.value?.date,
    icon: ClockIcon,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  })
  
  // Add based on status
  if (['pending', 'scheduled', 'production', 'ready', 'completed'].includes(order.value?.statusValue)) {
    events.push({
      title: 'Order Confirmed',
      description: 'Order has been reviewed and confirmed.',
      date: order.value?.confirmedDate || order.value?.date,
      icon: CheckIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    })
  }
  
  if (['scheduled', 'production', 'ready', 'completed'].includes(order.value?.statusValue)) {
    events.push({
      title: 'Scheduled for Production',
      description: 'Your order has been scheduled for production.',
      date: order.value?.scheduledDate || order.value?.date,
      icon: CalendarIcon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    })
  }
  
  if (['production', 'ready', 'completed'].includes(order.value?.statusValue)) {
    events.push({
      title: 'Production Started',
      description: 'Your items are now being produced.',
      date: order.value?.productionDate || order.value?.date,
      icon: PackageIcon,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    })
  }
  
  if (['ready', 'completed'].includes(order.value?.statusValue)) {
    events.push({
      title: 'Ready for Pickup/Delivery',
      description: 'Your order is ready and waiting for you.',
      date: order.value?.readyDate || order.value?.date,
      icon: TruckIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    })
  }
  
  if (order.value?.statusValue === 'completed') {
    events.push({
      title: 'Order Completed',
      description: 'Your order has been successfully delivered and completed.',
      date: order.value?.completedDate || order.value?.date,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    })
  }
  
  if (order.value?.statusValue === 'delayed') {
    events.push({
      title: 'Delay Notification',
      description: 'There has been a delay in production. Our team is working to resolve this.',
      date: order.value?.delayDate || order.value?.date,
      icon: AlertIcon,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    })
  }
  
  if (order.value?.statusValue === 'cancelled') {
    events.push({
      title: 'Order Cancelled',
      description: 'This order has been cancelled.',
      date: order.value?.cancelledDate || order.value?.date,
      icon: XIcon,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    })
  }
  
  return events
})

const statusBadgeClass = computed(() => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'production': 'bg-purple-100 text-purple-800',
    'ready': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'delayed': 'bg-orange-100 text-orange-800'
  }
  return classes[order.value?.statusValue] || 'bg-gray-100 text-gray-800'
})

const paymentBadgeClass = computed(() => {
  const classes = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial Payment': 'bg-orange-100 text-orange-800',
    'Pending Payment': 'bg-yellow-100 text-yellow-800'
  }
  return classes[order.value?.paymentStatus] || 'bg-gray-100 text-gray-800'
})

function formatPrice(price) {
  if (price == null) return '₱0'
  return `₱${price.toLocaleString()}`
}

function goBack() {
  router.push('/customer/orders')
}

function contactSupport() {
  alert('Support contact: support@acapshop.com or call (02) 1234-5678')
}

function cancelOrder() {
  if (confirm('Are you sure you want to cancel this order?')) {
    alert('Cancellation request submitted. Our team will process your request.')
    // Here you would call your API
  }
}

function confirmPickup() {
  if (confirm('Have you received your order?')) {
    alert('Thank you for confirming! Your order will be marked as completed.')
    // Here you would call your API
  }
}

function makePayment() {
  alert('Redirecting to payment gateway...')
  // Here you would redirect to payment page
}
</script>