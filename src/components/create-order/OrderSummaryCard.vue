<template>
  <div class="bg-white rounded-xl border lg:sticky lg:top-20">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Order Summary</h4>
    </div>
    <div class="px-6 py-5 space-y-4">

      <!-- Order type badge -->
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 rounded-md text-xs font-semibold"
          :class="orderType === 'own-cups'
            ? 'bg-purple-100 text-purple-700'
            : isCartOrder && cartItems?.length > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'"
        >
          {{ orderType === 'own-cups' ? 'Own Cups' : isCartOrder && cartItems?.length > 0 ? 'Multi-Item Order' : 'Company Product' }}
        </span>
        <span class="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
          {{ fulfillment || '—' }}
        </span>
      </div>

      <!-- Cart Items Section (for multi-item orders) -->
      <div v-if="isCartOrder && cartItems && cartItems.length > 0" class="space-y-3">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items ({{ cartItems.length }})</div>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div v-for="(item, idx) in cartItems" :key="idx" class="flex gap-2 text-sm">
            <div class="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-800 truncate">{{ item.name }}</p>
              <p class="text-xs text-gray-500">{{ item.size }} · {{ item.quantity.toLocaleString() }} pcs</p>
              <p v-if="item.printPlacement" class="text-xs text-gray-400 capitalize">{{ item.printPlacement.replace('-', ' ') }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-blue-600">{{ calculateCartItemTotal(item) }}</p>
            </div>
          </div>
        </div>
        <div class="border-t pt-2 flex justify-between font-semibold">
          <span>Subtotal</span>
          <span class="text-blue-600">{{ cartSubtotal }}</span>
        </div>
      </div>

      <!-- Single Product Section -->
      <div v-else>
        <!-- Selected product (company) -->
        <div v-if="orderType === 'company-product' && selectedProduct" class="flex gap-3 p-3 bg-gray-50 rounded-lg">
          <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-12 h-12 object-cover rounded-md shrink-0" />
          <div class="min-w-0">
            <div class="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{{ selectedProduct.name }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ selectedProduct.category }}</div>
          </div>
        </div>

        <!-- Summary rows -->
        <div class="space-y-2.5 text-sm">
          <div v-if="orderType === 'own-cups' && productType" class="flex justify-between">
            <span class="text-gray-500">Product Type</span>
            <span class="font-medium text-gray-800 text-right max-w-[55%] truncate">{{ productType }}</span>
          </div>
          <div v-if="quantity" class="flex justify-between">
            <span class="text-gray-500">Quantity</span>
            <span class="font-medium text-gray-800">{{ Number(quantity).toLocaleString() }} pcs</span>
          </div>
           <div v-if="sizes" class="flex justify-between">
    <span class="text-gray-500">Size</span>
    <span class="font-medium text-gray-800">{{ sizes }}</span>
  </div>
          <div v-if="designSource" class="flex justify-between">
            <span class="text-gray-500">Design</span>
            <span class="font-medium text-gray-800">{{ designSource === 'upload' ? 'New Upload' : 'Saved Template' }}</span>
          </div>
          <!-- FIXED: ETA display now shows actual days -->
          <div class="flex justify-between">
            <span class="text-gray-500">ETA</span>
            <span class="font-medium text-gray-800">{{ estimatedETA }}</span>
          </div>
          <div v-if="filesCount > 0" class="flex justify-between">
            <span class="text-gray-500">Files</span>
            <span class="font-medium text-gray-800">{{ filesCount }} file{{ filesCount > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Pricing -->
        <div class="border-t pt-4 space-y-2">
          <div v-if="orderType === 'company-product' && selectedProduct && quantity" class="space-y-1.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Unit price (est.)</span>
              <span class="text-gray-700">{{ getUnitPrice() }}</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-900">Estimated Total</span>
            <span class="text-xl font-bold text-blue-600">{{ singleProductTotal }}</span>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-400 leading-snug">
        Final price confirmed after design review and approval.
      </p>

      <!-- Validation hints -->
      <div v-if="validationHints.length > 0" class="space-y-1.5">
        <div
          v-for="hint in validationHints"
          :key="hint"
          class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ hint }}
        </div>
      </div>

      <!-- Submit -->
      <button
        @click="emit('submit')"
        :disabled="!canSubmit || isSubmitting"
        class="w-full h-11 rounded-lg font-semibold text-sm transition-all"
        :class="canSubmit && !isSubmitting
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
      >
        <span v-if="isSubmitting" class="inline-flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Submitting...
        </span>
        <span v-else>Submit Order</span>
      </button>

      <p class="text-center text-xs text-gray-400">
        You'll receive a confirmation email once submitted.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getPriceForQuantity } from '@/data/catalogData'
import { ETA_CONFIG } from '@/constants/orderConstants'

const props = defineProps({
  orderType: { type: String, required: true },
  selectedProduct: { type: Object, default: null },
  productType: { type: String, default: '' },
  quantity: { type: [String, Number], default: '' },
  sizes: { type: String, default: '' },
  designSource: { type: String, default: '' },
  filesCount: { type: Number, default: 0 },
  fulfillment: { type: String, default: '' },
  canSubmit: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  validationHints: { type: Array, default: () => [] },
  cartItems: { type: Array, default: () => [] },
  isCartOrder: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

// NEW: Calculate ETA based on design source
const estimatedETA = computed(() => {
  if (!props.designSource) return '—'
  const days = props.designSource === 'upload' 
    ? ETA_CONFIG.UPLOAD_DAYS 
    : ETA_CONFIG.SAVED_TEMPLATE_DAYS
  return `${days} business days`
})

function calculateCartItemTotal(item) {
  const total = getPriceForQuantity(item.productId, item.size, item.quantity)
  return total ? `₱${total.toLocaleString()}` : '₱0'
}

const cartSubtotal = computed(() => {
  let total = 0
  for (const item of props.cartItems) {
    const itemTotal = getPriceForQuantity(item.productId, item.size, item.quantity)
    if (itemTotal) total += itemTotal
  }
  return `₱${total.toLocaleString()}`
})

function getUnitPrice() {
  if (!props.selectedProduct || !props.selectedProduct.sizes) return '—'
  const firstSize = props.selectedProduct.sizes[0]
  if (!firstSize || !firstSize.price) return '—'
  return `₱${firstSize.price.toFixed(2)}`
}

// FIXED: Improved bulk pricing calculation
const singleProductTotal = computed(() => {
  if (!props.quantity || isNaN(Number(props.quantity))) return '₱0'
  const qty = Number(props.quantity)
  
  if (props.orderType === 'company-product' && props.selectedProduct && props.selectedProduct.sizes) {
    const firstSize = props.selectedProduct.sizes[0]
    if (!firstSize || !firstSize.price) return '₱0'
    
    let unitPrice = firstSize.price
    
    // Use bulk pricing if available
    if (firstSize.bulkPrices) {
      const bulkThresholds = Object.keys(firstSize.bulkPrices)
        .map(Number)
        .sort((a, b) => b - a) // Descending order
      
      for (const threshold of bulkThresholds) {
        if (qty >= threshold) {
          unitPrice = firstSize.bulkPrices[threshold] / threshold
          break
        }
      }
    }
    
    return `₱${(unitPrice * qty).toLocaleString()}`
  }
  
  if (props.orderType === 'own-cups' && props.quantity) {
    return '₱0 (Price upon review)'
  }
  
  return '₱0'
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>