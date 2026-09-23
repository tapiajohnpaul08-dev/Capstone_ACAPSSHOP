<!-- components/chat/NegotiationOrderPanel.vue -->
<template>
  <div class="h-full flex flex-col">

    <!-- ── Panel header (mirrors chat header styling) ── -->
    <div class="shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-white">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 text-sm leading-tight">Negotiation</h4>
            <p class="text-xs text-gray-500 font-mono">{{ order.orderId }}</p>
          </div>
        </div>
        <button @click="$emit('clear')"
          class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Close negotiation panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Body (scrollable if content grows) ── -->
    <div class="flex-1 overflow-y-auto">

      <!-- Status row -->
      <div class="px-4 sm:px-5 py-3 border-b bg-white">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            :class="statusBadgeClass(order.status)">
            {{ order.status || 'Pending' }}
          </span>
          <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            :class="paymentBadgeClass(order.paymentStatus)">
            {{ order.paymentStatus || 'Unpaid' }}
          </span>
          <span v-if="order.negotiationStatus === 'in_progress'"
            class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            In Negotiation
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-2 truncate">
          <strong class="text-gray-700">{{ order.customerName || 'Customer' }}</strong>
          <span v-if="order.customerEmail"> · {{ order.customerEmail }}</span>
        </p>
      </div>

      <!-- Order details -->
      <div class="px-4 sm:px-5 py-3 sm:py-4 space-y-2.5 sm:space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wide">Order Details</p>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span class="text-gray-500">Product Subtotal</span>
            <span class="font-semibold text-gray-900">₱{{ formatNumber(productSubtotal) }}</span>
          </div>
          <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span class="text-gray-500">Design &amp; Printing Fee</span>
            <span class="font-semibold text-gray-900">₱{{ formatNumber(order.designFee || 0) }}</span>
          </div>
          <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span class="text-gray-500">Shipping Fee</span>
            <span class="font-semibold text-gray-900">₱{{ formatNumber(order.shippingFee || 0) }}</span>
          </div>
          <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span class="text-gray-500">Delivery Method</span>
            <span class="font-semibold text-gray-900">{{ order.receivingMode || 'Pick-up' }}</span>
          </div>
          <div v-if="order.quantity" class="flex items-center justify-between py-1.5">
            <span class="text-gray-500">Quantity</span>
            <span class="font-semibold text-gray-900">{{ formatNumber(order.quantity) }} pcs</span>
          </div>
        </div>
      </div>

      <!-- Total card -->
      <div class="px-4 sm:px-5 pb-3 sm:pb-4">
        <div class="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
            <span class="text-xl font-black text-blue-600">₱{{ formatNumber(order.amount || 0) }}</span>
          </div>
          <p class="text-[10px] text-gray-400 italic mt-1 leading-snug">
            Final price confirmed with the admin in chat.
          </p>
        </div>
      </div>

      <!-- Info note -->
      <div class="px-4 sm:px-5 pb-3 sm:pb-4">
        <div class="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" class="text-blue-500 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span class="leading-snug">
            The admin may adjust pricing. You'll see changes here in real time.
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ order: { type: Object, required: true } })
defineEmits(['clear'])

const productSubtotal = computed(() => {
  const o = props.order
  if (!o) return 0
  if (o.isProvided) return 0
  if (Array.isArray(o.items) && o.items.length > 0) {
    return o.items.reduce((sum, it) => sum + (it.estimatedTotal || 0), 0)
  }
  return 0
})

function formatNumber(n) {
  if (!n && n !== 0) return '0'
  return Number(n).toLocaleString()
}

function statusBadgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (s === 'confirmed') return 'bg-green-100 text-green-700'
  if (s === 'scheduled') return 'bg-purple-100 text-purple-700'
  if (s === 'in production') return 'bg-blue-100 text-blue-700'
  if (s === 'out for delivery') return 'bg-cyan-100 text-cyan-700'
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
}

function paymentBadgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'paid') return 'bg-green-100 text-green-700'
  if (s === 'partial') return 'bg-orange-100 text-orange-700'
  if (s === 'unpaid') return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
}
</script>