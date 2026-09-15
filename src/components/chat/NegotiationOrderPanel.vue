<!-- components/chat/NegotiationOrderPanel.vue -->
<template>
  <div class="rounded-xl border bg-gradient-to-r from-blue-50 to-white p-3">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-blue-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span class="text-xs font-bold text-gray-900">Discussing</span>
        <span class="text-xs font-mono text-blue-600 font-semibold">{{ order.orderId }}</span>
      </div>
      <button @click="$emit('clear')" class="text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-2 gap-2 text-xs">
      <div>
        <p class="text-gray-400 text-[10px] uppercase">Product Subtotal</p>
        <p class="font-semibold text-gray-800">₱{{ formatNumber(productSubtotal) }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-[10px] uppercase">Design & Printing Service Fee</p>
        <p class="font-semibold text-gray-800">₱{{ formatNumber(order.designFee || 0) }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-[10px] uppercase">Shipping Fee</p>
        <p class="font-semibold text-gray-800">₱{{ formatNumber(order.shippingFee || 0) }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-[10px] uppercase">Delivery Method</p>
        <p class="font-semibold text-gray-800">{{ order.receivingMode || 'Pick-up' }}</p>
      </div>
    </div>

    <div class="border-t border-blue-100 mt-3 pt-3 flex items-center justify-between">
      <span class="text-xs font-bold text-gray-900">Total</span>
      <span class="text-base font-black text-blue-600">₱{{ formatNumber(order.amount || 0) }}</span>
    </div>

    <p class="text-[10px] text-gray-500 mt-2 italic">
      The admin may adjust pricing. You'll see updates here in real time.
    </p>
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
</script>