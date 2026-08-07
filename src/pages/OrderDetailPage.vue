<template>
  <div class="container mx-auto px-4 py-4 max-w-6xl">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="order">
      <!-- Back Button -->
      <button @click="goBack" class="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-3 transition-colors text-xs">
        <ArrowLeft class="w-3.5 h-3.5" />
        Back
      </button>

      <!-- Order Header - Compact -->
      <div class="bg-white rounded-xl border overflow-hidden mb-3">
        <div class="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-white flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-sm font-bold">{{ order.orderNumber || order.orderId || 'Order #' + order.id }}</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="statusBadgeClass">
              {{ displayStatus }}
            </span>
            <span class="text-[10px] text-gray-400">{{ formatDate(order.createdAt || order.date) }}</span>

            <span v-if="order.isProvided" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600">
              Please bring your Item at {{ formatDateShort(order.fromCustomerToCompanyDeliveryDate) }}
                
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-[10px] text-gray-400">Total</div>
              <div class="text-base font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="paymentBadgeClass">
              {{ order.paymentStatus || 'Unpaid' }}
            </span>
          </div>
        </div>

        <!-- Quick Stats Row - Compact -->
        <div class="grid grid-cols-3 md:grid-cols-5 gap-1 px-4 py-1.5 bg-gray-50 text-[10px]">
          <div class="flex items-center gap-1">
            <Package class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ order.items?.length || 1 }} items</span>
          </div>
          <div class="flex items-center gap-1">
            <Layers class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ getTotalQuantity().toLocaleString() }} pcs</span>
          </div>
          <div class="flex items-center gap-1">
            <Truck class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Calendar class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ order.expectedDelivery ? formatDateShort(order.expectedDelivery) : 'TBD' }}</span>
          </div>
          <div v-if="order.driverDetails && isDelivery" class="flex items-center gap-1">
            <User class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600 truncate">{{ order.driverDetails.driverName }}</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout - Compact -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <!-- Left Column: Order Timeline -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl border overflow-hidden">
            <!-- Timeline Header - Compact -->
            <div class="px-4 py-2 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-1">
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-blue-600" />
                <h3 class="font-semibold text-xs">Timeline</h3>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span v-if="order.productionSchedule" class="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Calendar class="w-2.5 h-2.5" />
                  {{ formatProductionDate(order.productionSchedule) }}
                </span>
                <span v-if="order.driverDetails && isDelivery" class="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Truck class="w-2.5 h-2.5" />
                  {{ order.driverDetails.driverName }}
                </span>
                <span class="text-[10px] text-gray-400">{{ order.statusHistory?.length || 0 }} updates</span>
              </div>
            </div>

            <!-- Timeline Content - Compact -->
            <div class="p-3 max-h-[280px] overflow-y-auto">
              <div v-if="filteredStatusHistory && filteredStatusHistory.length > 0" class="relative">
                <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div v-for="(event, index) in filteredStatusHistory" :key="index" class="relative pl-7 pb-3 last:pb-0">
                  <div class="absolute left-0 top-0 w-4 h-4 rounded-full flex items-center justify-center z-10 border border-white" :class="getTimelineIconColor(event.status, index)">
                    <component :is="getTimelineIcon(event.status)" class="w-2 h-2" />
                  </div>
                  
                  <div class="flex flex-wrap items-start justify-between gap-1">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-semibold text-xs text-gray-900">{{ formatStatusForDisplay(event.status) }}</span>
                        <span class="text-[10px] text-gray-400">{{ formatDateShort(event.timestamp) }}</span>
                      </div>
                      <p class="text-[11px] text-gray-500 mt-0.5">{{ getStatusDescription(event.status) }}</p>
                      <p v-if="event.notes && event.notes !== 'null' && event.notes !== 'Order created'" class="text-[11px] text-gray-400 mt-0.5 italic truncate">
                        "{{ event.notes }}"
                      </p>
                      <div v-if="event.status === 'Scheduled' && event.productionSchedule" class="mt-0.5 flex items-center gap-1">
                        <Calendar class="w-2.5 h-2.5 text-blue-500" />
                        <span class="text-[10px] text-blue-600">Scheduled: {{ formatProductionDate(event.productionSchedule) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-400 py-3 text-xs">
                No timeline updates yet
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Details - Compact -->
        <div class="space-y-2">
          <!-- Items Summary - Compact -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <div class="px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <ShoppingBag class="w-3.5 h-3.5 text-blue-600" />
                <h4 class="font-semibold text-xs">Items</h4>
              </div>
              <span class="text-[10px] text-gray-400">{{ order.items?.length || 1 }}</span>
            </div>
            <div class="max-h-32 overflow-y-auto divide-y">
              <div v-for="(item, idx) in (order.items || [])" :key="idx" class="px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                  <img 
                    v-if="!order.isProvided"
                    :src="getImageUrl(item.image || order.image)" 
                    :alt="item.name"
                    class="w-7 h-7 object-cover rounded border"
                    @error="handleImageError"
                  />
                  <div v-else class="w-7 h-7 bg-purple-100 rounded border flex items-center justify-center">
                    <Package class="w-3 h-3 text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium truncate">{{ item.name }}</div>
                    <div class="text-[10px] text-gray-400 flex items-center gap-1 flex-wrap">
                      <span>{{ item.size || 'N/A' }}</span>
                      <span class="text-gray-300">•</span>
                      <span>{{ formatNumber(item.quantity) }} pcs</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-semibold text-blue-600">{{ formatPrice(item.estimatedTotal || item.totalPrice) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-3 py-1 border-t bg-gray-50 flex justify-between font-semibold text-xs">
              <span>Subtotal</span>
              <span class="text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</span>
            </div>
          </div>

          <!-- ✅ PAYMENT BREAKDOWN - Compact -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <div class="px-3 py-1.5 border-b bg-gray-50 flex items-center gap-1.5">
              <DollarSign class="w-3.5 h-3.5 text-blue-600" />
              <h4 class="font-semibold text-xs">Payment</h4>
              <span class="ml-auto text-[10px] font-medium" :class="paymentBadgeClass">
                {{ order.paymentStatus || 'Unpaid' }}
              </span>
            </div>
            <div class="p-2.5 space-y-1 text-xs">
              <!-- Products Total -->
              <div class="flex justify-between">
                <span class="text-gray-500">Products</span>
                <span class="font-medium">{{ formatPrice(productsTotal) }}</span>
              </div>

              <!-- Design Fee -->
              <div v-if="hasDesignDetails" class="flex justify-between">
                <span class="text-gray-500">Design Fee</span>
                <span class="font-medium">{{ formatPrice(designFee) }}</span>
              </div>

              <!-- Printing Service Fee -->
              <div v-if="order.isProvided" class="flex justify-between">
                <span class="text-gray-500">Printing Service</span>
                <span class="font-medium">{{ formatPrice(printingServiceFee) }}</span>
              </div>

              <!-- Total -->
              <div class="flex justify-between pt-1 border-t border-gray-200 font-bold text-xs">
                <span>Total</span>
                <span class="text-blue-600">{{ formatPrice(calculatedTotal) }}</span>
              </div>

              <!-- Partial Payments -->
              <div v-if="order.partialPayments && order.partialPayments.length > 0" class="pt-1 border-t border-gray-100">
                <div class="flex justify-between text-[10px]">
                  <span class="text-gray-400">Paid</span>
                  <span class="font-medium text-green-600">{{ formatPrice(getTotalPaid) }}</span>
                </div>
                <div v-if="order.paymentStatus === 'Partial'" class="flex justify-between text-[10px]">
                  <span class="text-gray-400">Balance</span>
                  <span class="font-medium text-red-500">{{ formatPrice(getRemainingBalance) }}</span>
                </div>
              </div>

              <!-- Fee Notes -->
              <div class="mt-1 p-1.5 bg-gray-50 rounded text-[9px] text-gray-400 leading-tight">
                <span v-if="hasDesignDetails && !order.isProvided">* ₱500 design fee for custom artwork</span>
                <span v-else-if="order.isProvided">* ₱500 printing service fee</span>
                <span v-else class="text-gray-300">No additional fees</span>
              </div>
            </div>
          </div>

          <!-- Customer Info - Compact (Collapsible) -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <button 
              @click="showDetails = !showDetails"
              class="w-full px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <Info class="w-3.5 h-3.5 text-blue-600" />
                <span class="font-semibold text-xs">Details</span>
              </div>
              <ChevronDown :class="['w-3.5 h-3.5 transition-transform', showDetails ? 'rotate-180' : '']" />
            </button>
            <div v-show="showDetails" class="p-2.5 space-y-1 text-xs">
              <div class="grid grid-cols-2 gap-1">
                <div>
                  <div class="text-[10px] text-gray-400">Customer</div>
                  <div class="font-medium truncate">{{ order.customerName || order.customer?.name || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">Email</div>
                  <div class="font-medium truncate text-blue-600">{{ order.customerEmail || order.customer?.email || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">Phone</div>
                  <div class="font-medium">{{ order.customerPhone || order.customer?.phone || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">Type</div>
                  <div class="font-medium">{{ order.isProvided ? 'Own Cups' : 'Company Cups' }}</div>
                </div>
              </div>
              <div class="text-[10px] text-gray-400">Address</div>
              <div class="font-medium text-xs">{{ order.address || order.customer?.address || order.deliveryAddress || 'N/A' }}</div>
              <div v-if="order.driverDetails && isDelivery" class="mt-1 p-1.5 bg-green-50 rounded border border-green-200 text-[10px]">
                <span class="font-medium text-green-700">Driver:</span> {{ order.driverDetails.driverName }}
                <span class="ml-2 text-gray-500">•</span>
                <span class="text-gray-500">{{ order.driverDetails.driverPhone || 'N/A' }}</span>
              </div>
              <div v-if="order.notes" class="mt-1 p-1.5 bg-yellow-50 rounded border border-yellow-200 text-[10px] text-yellow-700">
                {{ order.notes }}
              </div>
            </div>
          </div>

          <!-- Design Summary - Compact (Collapsible) -->
          <div v-if="hasDesignDetails" class="bg-white rounded-xl border overflow-hidden">
            <button 
              @click="showDesign = !showDesign"
              class="w-full px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <Palette class="w-3.5 h-3.5 text-blue-600" />
                <span class="font-semibold text-xs">Design</span>
              </div>
              <ChevronDown :class="['w-3.5 h-3.5 transition-transform', showDesign ? 'rotate-180' : '']" />
            </button>
            <div v-show="showDesign" class="p-2 space-y-1 text-xs max-h-24 overflow-y-auto">
              <div v-for="(item, idx) in order.items" :key="idx" class="border-b last:border-0 pb-1 last:pb-0">
                <div class="text-[10px] text-gray-400">{{ item.name }}</div>
                <div class="flex flex-wrap gap-1 text-[10px]">
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded">{{ getDesignSourceLabel(item.designSource || item.design?.source) }}</span>
                  <span v-if="item.printPlacement" class="px-1.5 py-0.5 bg-gray-100 rounded">{{ formatPlacement(item.printPlacement) }}</span>
                  <span v-if="item.printSize" class="px-1.5 py-0.5 bg-gray-100 rounded">{{ item.printSize }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Compact -->
      <div class="flex flex-wrap gap-1.5 mt-3">
        <button @click="contactSupport" class="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-[10px] font-medium inline-flex items-center gap-1">
          <Phone class="w-3 h-3" />
          Support
        </button>
        
        <button 
          v-if="['pending', 'scheduled'].includes(order.status?.toLowerCase())" 
          @click="showCancelConfirm = true" 
          class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <XCircle class="w-3 h-3" />
          Cancel
        </button>

        <button 
          v-if="isOutForDelivery && !order.isReceived" 
          @click="handleToggleReceived"
          class="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <CheckCircle class="w-3 h-3" />
          {{ isDelivery ? 'Received' : 'Picked Up' }}
        </button>

        <button 
          v-if="isOutForDelivery && order.isReceived" 
          disabled
          class="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-[10px] font-medium inline-flex items-center gap-1"
        >
          <CheckCircle class="w-3 h-3" />
          {{ isDelivery ? 'Received ✓' : 'Picked Up ✓' }}
        </button>

        <button 
          v-if="order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'cancelled'" 
          @click="orderAgain" 
          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <RefreshCw class="w-3 h-3" />
          Reorder
        </button>

        <button 
          @click="printOrder" 
          class="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <Printer class="w-3 h-3" />
          Print
        </button>

        <button v-if="order.status === 'Completed'"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
            Submit Feedback
        </button>
      </div>

      <!-- Status Messages - Compact -->
      <div v-if="isOutForDelivery && !order.isReceived" class="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-2">
          <Truck class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-blue-800 text-xs">{{ isDelivery ? 'Out for Delivery!' : 'Ready for Pickup!' }}</h4>
            <p class="text-xs text-blue-700">
              <span v-if="isDelivery && order.driverDetails">
                Driver <strong>{{ order.driverDetails.driverName }}</strong> is delivering your items.
              </span>
              <span v-else>Your order is ready for pickup.</span>
            </p>
          </div>
        </div>
      </div>

      <div v-if="isOutForDelivery && order.isReceived" class="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-green-800 text-xs">{{ isDelivery ? 'Order Received!' : 'Picked Up!' }}</h4>
            <p class="text-xs text-green-700">{{ isDelivery ? 'Thank you for confirming receipt.' : 'Thank you for picking up your order.' }}</p>
          </div>
        </div>
      </div>

      <div v-if="order.status?.toLowerCase() === 'completed'" class="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-green-800 text-xs">Order Completed</h4>
            <p class="text-xs text-green-700">{{ isDelivery ? 'Delivered successfully.' : 'Pickup completed.' }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Order Not Found -->
    <div v-else class="text-center py-12">
      <Package class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">Order not found</p>
      <button @click="goBack" class="mt-2 text-blue-600 hover:underline text-sm">Back to Orders</button>
    </div>

    <!-- Modals -->
    <ConfirmationModal
      v-model:visible="showCancelConfirm"
      title="Cancel Order"
      :message="`Cancel ${order?.orderNumber || order?.orderId}?`"
      type="danger"
      close-label="Keep"
      confirm-label="Cancel"
      confirm-loading-label="Cancelling..."
      :is-loading="isCancelling"
      @confirm="handleCancel"
      @close="showCancelConfirm = false"
    />

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
import { ordersApi } from '@/api'
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
  User,
  DollarSign
} from 'lucide-vue-next'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const STATIC_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '')

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

const isOutForDelivery = computed(() => {
  if (!order.value) return false
  const status = order.value.status?.toLowerCase() || ''
  return status === 'out for delivery'
})

const displayStatus = computed(() => {
  if (!order.value) return 'Pending'
  const status = order.value.status || 'Pending'
  if (status === 'Out for Delivery' && order.value.receivingMode === 'Pick-up') {
    return 'Ready to Pick-up'
  }
  return status
})

const filteredStatusHistory = computed(() => {
  if (!order.value?.statusHistory) return []
  return order.value.statusHistory.filter(event => {
    if (event.status === 'Out for Delivery' && order.value.receivingMode === 'Pick-up') {
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

// ─── PAYMENT BREAKDOWN COMPUTED ──────────────────────────────────────
const DESIGN_FEE = 500
const PRINTING_SERVICE_FEE = 500

const productsTotal = computed(() => {
  if (!order.value?.items) return 0
  let total = 0
  for (const item of order.value.items) {
    total += (item.estimatedTotal || item.totalPrice || 0)
  }
  return total
})

const designFee = computed(() => {
  return hasDesignDetails.value ? DESIGN_FEE : 0
})

const printingServiceFee = computed(() => {
  return order.value?.isProvided ? PRINTING_SERVICE_FEE : 0
})

const calculatedTotal = computed(() => {
  return productsTotal.value + designFee.value + printingServiceFee.value
})

const getTotalPaid = computed(() => {
  if (!order.value?.partialPayments) return 0
  return order.value.partialPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
})

const getRemainingBalance = computed(() => {
  const total = order.value?.totalAmount || order.value?.amount || 0
  return total - getTotalPaid.value
})

// ─── STATUS DESCRIPTIONS ──────────────────────────────────────────────
function getStatusDescription(status) {
  const displayStatus = status === 'Out for Delivery' && order.value?.receivingMode === 'Pick-up' 
    ? 'Ready to Pick-up' 
    : status
    
  const descriptions = {
    'pending': 'Your order has been placed and is waiting for review by our team.',
    'scheduled': 'Your order has been reviewed and scheduled for production.',
    'in production': 'Your order is now in production. Our team is working on it.',
    'out for delivery': order.value?.receivingMode === 'Pick-up' 
      ? 'Your order is ready for pickup at our store.' 
      : 'Your order is on its way! A driver has been assigned for delivery.',
    'ready to pick-up': 'Your order is ready for pickup at our store. Please visit us to collect your items.',
    'completed': 'Your order has been successfully completed.',
    'cancelled': 'This order has been cancelled.'
  }
  return descriptions[status?.toLowerCase()] || descriptions[displayStatus?.toLowerCase()] || 'Status update'
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
  const displayStatus = status === 'Out for Delivery' && order.value?.receivingMode === 'Pick-up' 
    ? 'Ready to Pick-up' 
    : status
    
  const statusLower = displayStatus?.toLowerCase() || status?.toLowerCase() || ''
  const icons = {
    'pending': ClockIcon,
    'scheduled': CalendarIcon,
    'in production': PackageIcon,
    'out for delivery': TruckIcon,
    'ready to pick-up': TruckIcon,
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
    'ready to pick-up': 'bg-green-100 text-green-600',
    'completed': 'bg-green-500 text-white',
    'cancelled': 'bg-red-100 text-red-600'
  }
  return colors[statusLower] || 'bg-gray-100 text-gray-600'
}

// ─── FORMATTING FUNCTIONS ────────────────────────────────────────────
function getImageUrl(imagePath) {
  if (!imagePath) return `${STATIC_BASE_URL}/uploads/products/default-product.jpg`
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) {
    return `${STATIC_BASE_URL}/${cleanPath}`
  }
  return `${STATIC_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = `${STATIC_BASE_URL}/uploads/products/default-product.jpg`
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending Review',
    'scheduled': 'Scheduled',
    'in production': 'In Production',
    'out for delivery': 'Out for Delivery',
    'ready to pick-up': 'Ready to Pick-up',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status?.toLowerCase()] || status || 'Pending'
}

function formatStatusForDisplay(status) {
  const displayStatus = status === 'Out for Delivery' && order.value?.receivingMode === 'Pick-up' 
    ? 'Ready to Pick-up' 
    : status
    
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in production': 'In Production',
    'out for delivery': order.value?.receivingMode === 'Pick-up' ? 'Ready to Pick-up' : 'Out for Delivery',
    'ready to pick-up': 'Ready to Pick-up',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[displayStatus?.toLowerCase()] || displayStatus || 'Pending'
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
      year: 'numeric',
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
      year: 'numeric'
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
  const status = displayStatus.value?.toLowerCase() || ''
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'in production': 'bg-purple-100 text-purple-800',
    'out for delivery': 'bg-green-100 text-green-800',
    'ready to pick-up': 'bg-green-100 text-green-800',
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

async function handleToggleReceived() {
  if (!order.value?.orderId) {
    showFeedback('error', 'Error', 'Order ID not found');
    return;
  }
  
  try {
    const response = await ordersApi.toggleReceivedStatus(
      order.value.orderId, 
      true
    );
    
    if (response.success) {
      order.value.isReceived = true;
      order.value.status = 'Completed';
      
      if (!order.value.statusHistory) {
        order.value.statusHistory = [];
      }
      order.value.statusHistory.push({
        status: 'Completed',
        timestamp: new Date(),
        notes: isDelivery.value ? 'Order marked as received by customer' : 'Customer picked up the order'
      });
      
      showFeedback('success', 
        isDelivery.value ? 'Order Received!' : 'Order Picked Up!', 
        isDelivery.value 
          ? 'Thank you for confirming receipt of your order.' 
          : 'Thank you for picking up your order. We hope you enjoy your items!'
      );
    } else {
      showFeedback('error', 'Failed', response.message || 'Could not mark order as received');
    }
  } catch (error) {
    console.error('Error marking order as received:', error);
    showFeedback('error', 'Error', 'An unexpected error occurred');
  }
}

function showFeedback(status, title, message) {
  feedbackStatus.value = status;
  feedbackTitle.value = title;
  feedbackMessage.value = message;
  feedbackVisible.value = true;
}

async function handleCancel() {
  isCancelling.value = true
  const res = await cancelOrder(order.value.id)
  isCancelling.value = false
  showCancelConfirm.value = false
  if (res.success) {
    order.value.status = 'cancelled'
    showFeedback('success', 'Order Cancelled', 'Your cancellation request has been processed.')
  } else {
    showFeedback('error', 'Cancellation Failed', res.message || 'Something went wrong.')
  }
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────
onMounted(async () => {
  const res = await fetchOrder(route.params.id)
  if (res.success) {
    order.value = res.order
    console.log('Order loaded:', order.value)
    console.log('Products total:', productsTotal.value)
    console.log('Design fee:', designFee.value)
    console.log('Printing fee:', printingServiceFee.value)
    console.log('Calculated total:', calculatedTotal.value)
    
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

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 3px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

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
  button, .action-buttons {
    display: none !important;
  }
}
</style>