<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="order">
      <!-- Back Button -->
      <button @click="goBack" class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm">
        <ArrowLeft class="w-4 h-4" />
        Back to Orders
      </button>

      <!-- Order Header -->
      <div class="bg-white rounded-xl border overflow-hidden mb-4">
        <div class="px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-lg font-bold">{{ order.orderNumber || order.orderId || 'Order #' + order.id }}</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass">
                {{ formatStatus(order.status) }}
              </span>
              <span class="text-xs text-gray-500">{{ formatDate(order.createdAt || order.date) }}</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-xs text-gray-500">Total</div>
                <div class="text-lg font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
              </div>
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="paymentBadgeClass">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2 px-5 py-2.5 bg-gray-50 text-xs">
          <div class="flex items-center gap-1.5">
            <Package class="w-3.5 h-3.5 text-gray-500" />
            <span class="text-gray-600">{{ order.items?.length || 1 }} items</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Layers class="w-3.5 h-3.5 text-gray-500" />
            <span class="text-gray-600">{{ getTotalQuantity().toLocaleString() }} pcs</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Truck class="w-3.5 h-3.5 text-gray-500" />
            <span class="text-gray-600">{{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-gray-500" />
            <span class="text-gray-600">{{ order.preferredDate ? formatDate(order.preferredDate) : 'TBD' }}</span>
          </div>
          <div v-if="order.driverDetails && isDelivery" class="flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-gray-500" />
            <span class="text-gray-600">{{ order.driverDetails.driverName }}</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Left Column: Order Timeline -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl border overflow-hidden">
            <!-- Timeline Header -->
            <div class="px-5 py-3 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-blue-600" />
                <h3 class="font-semibold text-sm">Order Timeline</h3>
              </div>
              <div class="flex items-center gap-3 flex-wrap">
                <!-- Production Schedule Badge -->
                <span v-if="order.productionSchedule" class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Calendar class="w-3 h-3" />
                  Production: {{ formatProductionDate(order.productionSchedule) }}
                </span>
                <!-- Delivery Driver Info -->
                <span v-if="order.driverDetails && isDelivery" class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Truck class="w-3 h-3" />
                  {{ order.driverDetails.driverName }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ order.statusHistory?.length || 0 }} updates
                </span>
              </div>
            </div>

            <!-- Timeline Content -->
            <div class="p-5">
              <div v-if="filteredStatusHistory && filteredStatusHistory.length > 0" class="relative">
                <!-- Vertical Line -->
                <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div v-for="(event, index) in filteredStatusHistory" :key="index" class="relative pl-10 pb-6 last:pb-0">
                  <!-- Timeline Dot with Icon -->
                  <div class="absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 border-white" :class="getTimelineIconColor(event.status, index)">
                    <component :is="getTimelineIcon(event.status)" class="w-3 h-3" />
                  </div>
                  
                  <!-- Timeline Content -->
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-sm text-gray-900">{{ formatStatus(event.status) }}</span>
                        <span class="text-xs text-gray-400">{{ formatDateShort(event.timestamp) }}</span>
                      </div>
                      
                      <!-- Customer-Friendly Status Description -->
                      <div class="mt-1">
                        <p class="text-sm text-gray-600">
                          {{ getStatusDescription(event.status) }}
                        </p>
                      </div>
                      
                      <!-- Custom Notes (if any) -->
                      <p v-if="event.notes && event.notes !== 'null' && event.notes !== 'Order created'" class="text-sm text-gray-500 mt-0.5 italic">
                        "{{ event.notes }}"
                      </p>
                      
                      <!-- Production Schedule on Scheduled -->
                      <div v-if="event.status === 'Scheduled' && event.productionSchedule" class="mt-1 flex items-center gap-1.5">
                        <Calendar class="w-3 h-3 text-blue-500" />
                        <span class="text-xs text-blue-600 font-medium">
                          Production scheduled: {{ formatProductionDate(event.productionSchedule) }}
                        </span>
                      </div>
                      
                      <!-- Driver Details on Out for Delivery -->
                      <div v-if="event.status === 'Out for Delivery' && order.driverDetails && isDelivery" class="mt-1 flex flex-wrap items-center gap-2">
                        <span class="text-xs text-gray-500 flex items-center gap-1">
                          <User class="w-3 h-3" />
                          Driver: {{ order.driverDetails.driverName }}
                        </span>
                        <span class="text-xs text-gray-500 flex items-center gap-1">
                          <Phone class="w-3 h-3" />
                          {{ order.driverDetails.driverPhone || 'N/A' }}
                        </span>
                        <span class="text-xs text-gray-500 flex items-center gap-1">
                          <Truck class="w-3 h-3" />
                          {{ order.driverDetails.truckDescription || order.driverDetails.plateNumber || 'N/A' }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Status Badge -->
                    <span v-if="index === 0" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium whitespace-nowrap flex items-center gap-1">
                      <CheckCircle class="w-3 h-3" />
                      Current
                    </span>
                    <span v-else-if="event.status === 'Completed'" class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium whitespace-nowrap flex items-center gap-1">
                      <CheckCircle class="w-3 h-3" />
                      Done
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-500 py-6 text-sm">
                No timeline updates yet
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Details -->
        <div class="space-y-3">
          <!-- Items Summary -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <div class="px-4 py-2.5 border-b bg-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <ShoppingBag class="w-4 h-4 text-blue-600" />
                <h4 class="font-semibold text-sm">Items</h4>
              </div>
              <span class="text-xs text-gray-500">{{ order.items?.length || 1 }}</span>
            </div>
            <div class="max-h-48 overflow-y-auto divide-y">
              <div v-for="(item, idx) in (order.items || [])" :key="idx" class="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-3">
                  <img 
                    v-if="!order.isProvided"
                    :src="getImageUrl(item.image || order.image)" 
                    :alt="item.name"
                    class="w-10 h-10 object-cover rounded border"
                    @error="handleImageError"
                  />
                  <div v-else class="w-10 h-10 bg-purple-100 rounded border flex items-center justify-center">
                    <Package class="w-4 h-4 text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">{{ item.name }}</div>
                    <div class="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                      <span>{{ item.size || 'N/A' }}</span>
                      <span class="text-gray-300">•</span>
                      <span>{{ formatNumber(item.quantity) }} pcs</span>
                      <span v-if="item.printPlacement" class="text-blue-500">• {{ formatPlacement(item.printPlacement) }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-semibold text-blue-600">{{ formatPrice(item.estimatedTotal || item.totalPrice) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-2 border-t bg-gray-50 flex justify-between font-semibold text-sm">
              <span>Subtotal</span>
              <span class="text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</span>
            </div>
          </div>

          <!-- Customer & Delivery Info -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <button 
              @click="showDetails = !showDetails"
              class="w-full px-4 py-2.5 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-2">
                <Info class="w-4 h-4 text-blue-600" />
                <span class="font-semibold text-sm">Order Details</span>
              </div>
              <ChevronDown :class="['w-4 h-4 transition-transform', showDetails ? 'rotate-180' : '']" />
            </button>
            <div v-show="showDetails" class="p-4 space-y-2 text-sm">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <div class="text-xs text-gray-500">Customer</div>
                  <div class="font-medium truncate">{{ order.customerName || order.customer?.name || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Email</div>
                  <div class="font-medium truncate text-blue-600">{{ order.customerEmail || order.customer?.email || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Phone</div>
                  <div class="font-medium">{{ order.customerPhone || order.customer?.phone || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Supply Type</div>
                  <div class="font-medium">{{ order.isProvided ? 'Own Cups' : 'Company Cups' }}</div>
                </div>
                <div class="col-span-2">
                  <div class="text-xs text-gray-500">Address</div>
                  <div class="font-medium">{{ order.address || order.customer?.address || order.deliveryAddress || 'N/A' }}</div>
                </div>
                <div v-if="order.preferredTime">
                  <div class="text-xs text-gray-500">Preferred Time</div>
                  <div class="font-medium">{{ order.preferredTime }}</div>
                </div>
                <div v-if="order.expectedDelivery">
                  <div class="text-xs text-gray-500">Expected Delivery</div>
                  <div class="font-medium">{{ formatDate(order.expectedDelivery) }}</div>
                </div>
                <div v-if="order.productionSchedule">
                  <div class="text-xs text-gray-500">Production Schedule</div>
                  <div class="font-medium text-blue-600">{{ formatProductionDate(order.productionSchedule) }}</div>
                </div>
              </div>
              
              <!-- Driver Details -->
              <div v-if="order.driverDetails && isDelivery" class="mt-2 p-3 bg-green-50 rounded border border-green-200">
                <div class="text-xs font-medium text-green-800 flex items-center gap-1.5">
                  <Truck class="w-3.5 h-3.5" />
                  Delivery Driver Details
                </div>
                <div class="grid grid-cols-2 gap-1 mt-1 text-xs">
                  <div>
                    <span class="text-gray-500">Driver:</span>
                    <span class="font-medium">{{ order.driverDetails.driverName }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Phone:</span>
                    <span class="font-medium">{{ order.driverDetails.driverPhone || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Vehicle:</span>
                    <span class="font-medium">{{ order.driverDetails.truckDescription || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Plate #:</span>
                    <span class="font-medium">{{ order.driverDetails.plateNumber || 'N/A' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="order.notes" class="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <div class="text-xs font-medium text-yellow-800">Order Notes</div>
                <div class="text-sm text-yellow-700">{{ order.notes }}</div>
              </div>
            </div>
          </div>

          <!-- Design Summary -->
          <div v-if="hasDesignDetails" class="bg-white rounded-xl border overflow-hidden">
            <button 
              @click="showDesign = !showDesign"
              class="w-full px-4 py-2.5 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-2">
                <Palette class="w-4 h-4 text-blue-600" />
                <span class="font-semibold text-sm">Design Info</span>
              </div>
              <ChevronDown :class="['w-4 h-4 transition-transform', showDesign ? 'rotate-180' : '']" />
            </button>
            <div v-show="showDesign" class="p-3 space-y-2 text-sm max-h-40 overflow-y-auto">
              <div v-for="(item, idx) in order.items" :key="idx" class="border-b last:border-0 pb-2 last:pb-0">
                <div class="text-xs text-gray-500">{{ item.name }}</div>
                <div class="flex flex-wrap gap-2 text-xs">
                  <span class="px-2 py-0.5 bg-gray-100 rounded">{{ getDesignSourceLabel(item.designSource || item.design?.source) }}</span>
                  <span v-if="item.printPlacement" class="px-2 py-0.5 bg-gray-100 rounded">{{ formatPlacement(item.printPlacement) }}</span>
                  <span v-if="item.printSize" class="px-2 py-0.5 bg-gray-100 rounded">{{ item.printSize }}</span>
                  <span v-if="item.selectedTemplate?.name" class="px-2 py-0.5 bg-gray-100 rounded">Template: {{ item.selectedTemplate.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button @click="contactSupport" class="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium inline-flex items-center gap-1.5">
          <Phone class="w-3.5 h-3.5" />
          Support
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'scheduled'" 
          @click="showCancelConfirm = true" 
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
        >
          <XCircle class="w-3.5 h-3.5" />
          Cancel Order
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'cancelled'" 
          @click="orderAgain" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          Order Again
        </button>

        <button 
          @click="printOrder" 
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
        >
          <Printer class="w-3.5 h-3.5" />
          Print
        </button>
      </div>

      <!-- Completed Order Summary -->
      <div v-if="order.status?.toLowerCase() === 'completed'" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-start gap-3">
          <CheckCircle class="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 class="font-semibold text-green-800 text-sm">Order Completed</h4>
            <p class="text-sm text-green-700">
              Your order has been successfully completed on {{ formatDate(order.updatedAt || order.completedAt) }}.
              <span v-if="isDelivery">It has been delivered to your address.</span>
              <span v-else>It is ready for pickup at our store.</span>
            </p>
            <div class="mt-2 flex flex-wrap gap-3 text-xs text-green-600">
              <span class="flex items-center gap-1">
                <Calendar class="w-3 h-3" />
                Completed: {{ formatDate(order.updatedAt || order.completedAt) }}
              </span>
              <span v-if="order.driverDetails && isDelivery" class="flex items-center gap-1">
                <User class="w-3 h-3" />
                Delivered by: {{ order.driverDetails.driverName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Order Not Found -->
    <div v-else class="text-center py-12">
      <Package class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500 text-lg">Order not found</p>
      <p class="text-gray-400 text-sm mt-1">The order you're looking for doesn't exist or has been removed.</p>
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
import { 
  ArrowLeft, 
  Package, 
  Layers, 
  Truck, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Info, 
  ChevronDown, 
  Palette, 
  Phone, 
  XCircle, 
  RefreshCw, 
  Printer,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-vue-next'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── TIMELINE ICONS ──────────────────────────────────────────────────────
const ClockIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) }
const CalendarIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })]) }
const PackageIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }), h('path', { d: 'M12 22V12' }), h('polyline', { points: '3.29 7 12 12 20.71 7' })]) }
const TruckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }), h('path', { d: 'M15 18H9' }), h('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }), h('circle', { cx: '17', cy: '18', r: '2' }), h('circle', { cx: '7', cy: '18', r: '2' })]) }
const CheckCircleIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), h('polyline', { points: '22 4 12 14.01 9 11.01' })]) }
const XIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })]) }

const route = useRoute()
const router = useRouter()
const { fetchOrder, cancelOrder } = useOrders()

// ─── STATE ──────────────────────────────────────────────────────────────
const order = ref(null)
const isLoading = ref(true)
const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')
const showDetails = ref(false)
const showDesign = ref(false)

// ─── COMPUTED ──────────────────────────────────────────────────────────
const isDelivery = computed(() => {
  const method = order.value?.receivingMode || order.value?.deliveryMethod || ''
  return method.toLowerCase() === 'delivery'
})

const filteredStatusHistory = computed(() => {
  if (!order.value?.statusHistory) return []
  
  // Filter out "Out for Delivery" if receiving method is not delivery
  return order.value.statusHistory.filter(event => {
    if (event.status === 'Out for Delivery' && !isDelivery.value) {
      return false
    }
    return true
  })
})

const hasDesignDetails = computed(() => {
  if (!order.value?.items) return false
  return order.value.items.some(item => 
    item.design || 
    item.printSize || 
    item.printPlacement || 
    item.designNotes || 
    item.files?.length ||
    item.selectedTemplateId
  )
})

// ─── STATUS DESCRIPTIONS ──────────────────────────────────────────────
function getStatusDescription(status) {
  const descriptions = {
    'pending': 'Your order has been placed and is waiting for review by our team.',
    'scheduled': 'Your order has been reviewed and scheduled for production.',
    'in production': 'Your order is now in production. Our team is working on it.',
    'out for delivery': 'Your order is on its way! A driver has been assigned for delivery.',
    'completed': 'Your order has been successfully completed.',
    'cancelled': 'This order has been cancelled.'
  }
  return descriptions[status?.toLowerCase()] || 'Status update'
}

// ─── HELPERS ──────────────────────────────────────────────────────────
function getTotalQuantity() {
  if (!order.value?.items) return order.value?.quantity || 0
  return order.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

function getDesignSourceLabel(source) {
  const labels = {
    'upload': 'Uploaded',
    'saved': 'Template',
    'no-design': 'Description'
  }
  return labels[source] || source || 'N/A'
}

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

function getTimelineIconColor(status, index) {
  const statusLower = status?.toLowerCase() || ''
  
  if (statusLower === 'completed' && index === 0) {
    return 'bg-green-500 text-white ring-2 ring-green-300'
  }
  
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-600',
    'scheduled': 'bg-blue-100 text-blue-600',
    'in production': 'bg-purple-100 text-purple-600',
    'out for delivery': 'bg-green-100 text-green-600',
    'completed': 'bg-green-500 text-white',
    'cancelled': 'bg-red-100 text-red-600'
  }
  return colors[statusLower] || 'bg-gray-100 text-gray-600'
}

// ─── FORMATTING FUNCTIONS ────────────────────────────────────────────
function getImageUrl(imagePath) {
  if (!imagePath) return '/placeholder-image.png'
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
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

function formatPlacement(placement) {
  if (!placement) return ''
  const map = {
    'back-only': 'Back Only',
    'front-only': 'Front Only',
    'both': 'Front & Back',
    'full-wrap': 'Full Wrap',
    'wrap-around': 'Wrap Around',
    'top-bottom': 'Top & Bottom'
  }
  return map[placement?.toLowerCase()] || placement
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

function formatDateShort(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

function formatProductionDate(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

// ─── BADGE CLASSES ────────────────────────────────────────────────────
const statusBadgeClass = computed(() => {
  const status = order.value?.status?.toLowerCase() || ''
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'in production': 'bg-purple-100 text-purple-800',
    'out for delivery': 'bg-green-100 text-green-800',
    'completed': 'bg-green-100 text-green-800',
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

// ─── ACTIONS ──────────────────────────────────────────────────────────
function goBack() { 
  router.push('/customer/orders') 
}

function contactSupport() { 
  window.location.href = 'mailto:support@acapshop.com?subject=Order Support'
}

function printOrder() {
  window.print()
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

// ─── LIFECYCLE ────────────────────────────────────────────────────────
onMounted(async () => {
  const res = await fetchOrder(route.params.id)
  if (res.success) {
    order.value = res.order
    if (!order.value.items && order.value.product) {
      order.value.items = [{
        name: order.value.product,
        image: order.value.image,
        size: order.value.sizes,
        quantity: order.value.quantity,
        totalPrice: order.value.totalAmount,
        design: order.value.designDetails?.[0] || null
      }]
    }
  }
  isLoading.value = false
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }

/* Print Styles */
@media print {
  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }
  .bg-white {
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
  }
  .bg-gray-50 {
    background-color: #f9fafb !important;
  }
  .bg-gradient-to-r {
    background: #f9fafb !important;
  }
  button, .action-buttons {
    display: none !important;
  }
  .border-b {
    border-bottom: 1px solid #e5e7eb !important;
  }
  .p-6, .px-6, .py-6 {
    padding: 1rem !important;
  }
}
</style>