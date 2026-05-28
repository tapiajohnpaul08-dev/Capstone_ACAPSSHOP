<template>
  <div class="container mx-auto px-4 py-6">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="order">
      <button @click="goBack" class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Back to Orders
      </button>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold">{{ order.orderNumber || order.orderId || 'Order #' + order.id }}</h1>
          <p class="text-gray-600 mt-1">{{ formatDate(order.createdAt || order.date) }}</p>
        </div>
        <div class="flex gap-2">
          <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusBadgeClass">{{ formatStatus(order.status) }}</span>
          <span v-if="order.delayBadge" class="px-3 py-1 rounded-full text-sm font-medium border border-orange-600 text-orange-600 bg-orange-50">Delayed</span>
        </div>
      </div>

      <!-- Multi-Item Orders Section -->
      <div v-if="order.items && order.items.length > 1" class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <h3 class="font-semibold">Order Items ({{ order.items.length }})</h3>
        </div>
        <div class="divide-y">
          <div v-for="(item, idx) in order.items" :key="idx" class="p-6">
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Fixed: Use getImageUrl function for item image -->
              <img 
                :src="getImageUrl(item.image)" 
                :alt="item.name" 
                class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                @error="handleImageError"
              />
              <div class="flex-1">
                <h4 class="font-semibold">{{ item.name }}</h4>
                <div class="text-sm text-gray-600 mt-1">Size: {{ item.size || item.sizes || 'N/A' }}</div>
                <div class="text-sm text-gray-600">Quantity: {{ formatNumber(item.quantity) }} pcs</div>
                
                <!-- Print details -->
                <div v-if="item.printSize || item.printPlacement" class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <div class="font-medium text-gray-700 mb-1">Print Details:</div>
                  <div v-if="item.printSize">Print Size: {{ item.printSize }}</div>
                  <div v-if="item.printPlacement">Placement: {{ formatPlacement(item.printPlacement) }}</div>
                  <div v-if="item.designNotes">Notes: {{ item.designNotes }}</div>
                </div>
              </div>
              <div class="flex-shrink-0 text-right">
                <div class="text-sm text-gray-600">Item Total</div>
                <div class="text-md font-bold text-blue-600">{{ formatPrice(item.estimatedTotal || item.totalPrice) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 flex justify-between font-semibold">
          <span>Order Total</span>
          <span class="text-blue-600 text-xl font-bold">{{ formatPrice(order.totalAmount || order.amount) }}</span>
        </div>
      </div>

      <!-- Single Product Order -->
      <div v-else-if="order.items && order.items.length === 1" class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="p-6 border-b">
          <div class="flex flex-col md:flex-row gap-4">
            <img v-if="!order.isProvided"
              :src="getImageUrl(order.items[0].image || order.image)" 
              :alt="order.items[0].name || order.product" 
              class="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              @error="handleImageError"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.items[0].name || order.product }}</h3>
              <div class="text-sm text-gray-600 mt-1">Size: {{ order.items[0].size || order.items[0].sizes || order.sizes || 'N/A' }}</div>
              <div class="text-sm text-gray-600">Quantity: {{ formatNumber(order.items[0].quantity || order.quantity) }} pcs</div>
              <div class="mt-2 flex flex-wrap gap-3 text-sm">
                <span class="flex items-center gap-1 text-gray-600">📦 {{ order.isProvided ? 'Own Cups' : 'Company Cups' }}</span>
                <span class="flex items-center gap-1 text-gray-600">📍 {{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}</span>
              </div>
            </div>
            <div class="flex-shrink-0 text-right">
              <div class="text-sm text-gray-600">Total Amount</div>
              <div class="text-2xl font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium" :class="paymentBadgeClass">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legacy single product format -->
      <div v-else-if="order.product" class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="p-6 border-b">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Fixed: Use getImageUrl function -->
            <img 
              :src="getImageUrl(order.image)" 
              :alt="order.product" 
              class="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              @error="handleImageError"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.product }}</h3>
              <div class="text-sm text-gray-600 mt-1">Quantity: {{ formatNumber(order.quantity) }} pcs</div>
              <div class="text-sm text-gray-600">Sizes: {{ order.sizes || 'N/A' }}</div>
              <div class="mt-2 flex flex-wrap gap-3 text-sm">
                <span class="flex items-center gap-1 text-gray-600">📦 {{ order.isProvided ? 'Own Cups' : 'Company Cups' }}</span>
                <span class="flex items-center gap-1 text-gray-600">📍 {{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}</span>
              </div>
            </div>
            <div class="flex-shrink-0 text-right">
              <div class="text-sm text-gray-600">Total Amount</div>
              <div class="text-2xl font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium" :class="paymentBadgeClass">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Information Section -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <h3 class="font-semibold">Customer Information</h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Full Name</div>
            <div class="font-medium">{{ order.customerName || order.customer?.name || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Company</div>
            <div class="font-medium">{{ order.company || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Email</div>
            <div class="font-medium">{{ order.customerEmail || order.customer?.email || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Phone</div>
            <div class="font-medium">{{ order.customerPhone || order.customer?.phone || 'N/A' }}</div>
          </div>
          <div class="md:col-span-2">
            <div class="text-xs text-gray-500">Address</div>
            <div class="font-medium">{{ order.address || order.customer?.address || order.deliveryAddress || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- Fulfillment Information -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <h3 class="font-semibold">Fulfillment Details</h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Method</div>
            <div class="font-medium capitalize">{{ order.receivingMode || order.deliveryMethod || order.fulfillment?.method || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Expected Delivery</div>
            <div class="font-medium">{{ order.expectedDelivery  || 'N/A' }}</div>
          </div>
          <div v-if="order.receivingMode === 'Delivery' || order.deliveryMethod === 'Delivery' || order.fulfillment?.method === 'delivery'">
            <div class="text-xs text-gray-500">Delivery Address</div>
            <div class="font-medium">{{ order.address || order.deliveryAddress || order.fulfillment?.deliveryAddress || 'N/A' }}</div>
          </div>
          <div v-if="order.receivingMode === 'Pick-up' || order.deliveryMethod === 'Pick-up' || order.fulfillment?.method === 'pickup'">
            <div class="text-xs text-gray-500">Pickup Location</div>
            <div class="font-medium">{{ order.fulfillment?.pickupLocation || 'ACAPSHOP — Main Store, 123 Printing Ave., Manila' }}</div>
          </div>
        </div>
      </div>

      <!-- Order Timeline -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <h3 class="font-semibold">Order Timeline</h3>
        </div>
        <div class="p-6">
          <div v-if="order.statusHistory && order.statusHistory.length" class="space-y-4">
            <div v-for="(event, index) in order.statusHistory" :key="index" class="flex gap-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getTimelineIconColor(event.status)">
                  <component :is="getTimelineIcon(event.status)" class="w-4 h-4" />
                </div>
                <div v-if="index < order.statusHistory.length - 1" class="w-0.5 h-8 bg-gray-200 mx-auto mt-1"></div>
              </div>
              <div class="flex-1 pb-4">
                <div class="flex flex-wrap justify-between items-start gap-2">
                  <span class="font-medium text-gray-900">{{ formatStatus(event.status) }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(event.timestamp) }}</span>
                </div>
                <p v-if="event.notes" class="text-sm text-gray-600 mt-1">{{ event.notes }}</p>
                <p v-if="event.updatedBy" class="text-xs text-gray-400 mt-1">Updated by: {{ event.updatedBy }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-4">
            No timeline available
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 flex-wrap">
        <button @click="contactSupport" class="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          Contact Support
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'completed'" 
          @click="submitFeedback" 
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Submit Feedback
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'pending'" 
          @click="showCancelConfirm = true" 
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Cancel Order
        </button>
        
        <button 
          v-if="order.paymentStatus === 'Unpaid' && order.status?.toLowerCase() !== 'cancelled'" 
          @click="makePayment" 
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Make Payment
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'cancelled'" 
          @click="orderAgain" 
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Order Again
        </button>
      </div>
    </template>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Order not found.</p>
      <button @click="goBack" class="mt-4 text-blue-600 hover:underline">Back to Orders</button>
    </div>

    <!-- Cancel Confirmation Modal -->
    <ConfirmationModal
      v-model:visible="showCancelConfirm"
      title="Cancel Order"
      :message="`Are you sure you want to cancel ${order?.orderNumber || order?.orderId}? This cannot be undone.`"
      type="danger"
      close-label="Keep Order"
      confirm-label="Cancel Order"
      confirm-loading-label="Cancelling..."
      :is-loading="isCancelling"
      @confirm="handleCancel"
      @close="showCancelConfirm = false"
    />

    <!-- Feedback Modal -->
    <FeedbackModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :status="feedbackStatus"
      :message="feedbackMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders.js'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Timeline Icons
const ClockIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) }
const CheckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('polyline', { points: '20 6 9 17 4 12' })]) }
const CalendarIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })]) }
const PackageIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }), h('path', { d: 'M12 22V12' }), h('polyline', { points: '3.29 7 12 12 20.71 7' })]) }
const TruckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }), h('path', { d: 'M15 18H9' }), h('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }), h('circle', { cx: '17', cy: '18', r: '2' }), h('circle', { cx: '7', cy: '18', r: '2' })]) }
const CheckCircleIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), h('polyline', { points: '22 4 12 14.01 9 11.01' })]) }
const XIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })]) }

const route = useRoute()
const router = useRouter()
const { fetchOrder, cancelOrder } = useOrders()

const order = ref(null)
const isLoading = ref(true)
const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

function getTimelineIcon(status) {
  const statusLower = status?.toLowerCase() || ''
  const icons = {
    'pending': ClockIcon,
    'scheduled': CalendarIcon,
    'in production': PackageIcon,
    'out for delivery': TruckIcon,
    'completed': CheckCircleIcon,
    'cancelled': XIcon
  }
  return icons[statusLower] || ClockIcon
}

function getTimelineIconColor(status) {
  const statusLower = status?.toLowerCase() || ''
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-600',
    'scheduled': 'bg-blue-100 text-blue-600',
    'in production': 'bg-purple-100 text-purple-600',
    'out for delivery': 'bg-green-100 text-green-600',
    'completed': 'bg-green-100 text-green-600',
    'cancelled': 'bg-red-100 text-red-600'
  }
  return colors[statusLower] || 'bg-gray-100 text-gray-600'
}

onMounted(async () => {
  const res = await fetchOrder(route.params.id)
  if (res.success) {
    console.log('Fetched order:', res.order)
    order.value = res.order
    // Ensure items array exists for backwards compatibility
    if (!order.value.items && order.value.product) {
      order.value.items = [{
        name: order.value.product,
        image: order.value.image,
        size: order.value.sizes,
        quantity: order.value.quantity,
        totalPrice: order.value.totalAmount
      }]
    }
  }
  isLoading.value = false
})

// Helper functions
function getImageUrl(imagePath) {
  if (!imagePath) return '/placeholder-image.png'
  if (imagePath.startsWith('http')) return imagePath
  // Remove leading slashes
  const cleanPath = imagePath.replace(/^\/+/, '')
  // Handle different path formats
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = '/placeholder-image.png'
}

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

const statusBadgeClass = computed(() => {
  const status = order.value?.status?.toLowerCase() || ''
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'in production': 'bg-purple-100 text-purple-800',
    'out for delivery': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

const paymentBadgeClass = computed(() => {
  const status = order.value?.paymentStatus
  const classes = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial': 'bg-orange-100 text-orange-800',
    'Unpaid': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

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
  if (price === undefined || price === null || isNaN(price)) return '₱0'
  return `₱${Number(price).toLocaleString()}`
}

function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0'
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

function goBack() { 
  router.push('/customer/orders') 
}

function contactSupport() { 
  window.location.href = 'mailto:support@acapshop.com?subject=Order Support'
}

function makePayment() {
  alert('Payment feature coming soon!')
}

function orderAgain() {
  if (order.value.items && order.value.items.length > 1) {
    const itemsToReorder = order.value.items.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      category: item.category,
      size: item.size,
      quantity: item.quantity,
      printPlacement: item.printPlacement || '',
      printSize: item.printSize || '',
      designNotes: item.designNotes || '',
      inStock: true
    }))
    sessionStorage.setItem('pendingCart', JSON.stringify(itemsToReorder))
    router.push('/customer/orders/create?type=company-product&source=cart')
  } else if (order.value.items && order.value.items.length === 1) {
    const item = order.value.items[0]
    if (item.productId) {
      router.push(`/customer/orders/create?type=company-product&productId=${item.productId}`)
    } else if (order.value.isProvided) {
      const ownCupsData = {
        productType: item.name,
        quantity: item.quantity,
        sizes: item.size,
        specifications: item.designNotes || ''
      }
      sessionStorage.setItem('pendingOwnCups', JSON.stringify(ownCupsData))
      router.push('/customer/orders/create?type=own-cups')
    }
  } else if (order.value.productId) {
    router.push(`/customer/orders/create?type=company-product&productId=${order.value.productId}`)
  } else if (order.value.isProvided) {
    const ownCupsData = {
      productType: order.value.product,
      quantity: order.value.quantity,
      sizes: order.value.sizes,
      specifications: ''
    }
    sessionStorage.setItem('pendingOwnCups', JSON.stringify(ownCupsData))
    router.push('/customer/orders/create?type=own-cups')
  } else {
    router.push('/customer/dashboard')
  }
}

function submitFeedback() {
  alert('Feedback feature coming soon!')
}

async function handleCancel() {
  isCancelling.value = true
  const res = await cancelOrder(order.value.id)
  isCancelling.value = false
  showCancelConfirm.value = false
  if (res.success) {
    order.value.status = 'cancelled'
    feedbackTitle.value = 'Order Cancelled'
    feedbackMessage.value = 'Your cancellation request has been processed.'
    feedbackStatus.value = 'success'
  } else {
    feedbackTitle.value = 'Cancellation Failed'
    feedbackMessage.value = res.message || 'Something went wrong.'
    feedbackStatus.value = 'error'
  }
  feedbackVisible.value = true
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>