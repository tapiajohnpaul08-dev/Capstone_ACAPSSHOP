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
        <span v-if="paymentMethod" class="px-2 py-1 rounded-md text-xs font-medium" 
          :class="paymentMethod === 'cod' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
          {{ paymentMethod === 'cod' ? '💵 COD' : '🏦 Bank Transfer' }}
        </span>
      </div>

      <!-- Cart Items Section -->
 <div v-if="isCartOrder && cartItems && cartItems.length > 0" class="space-y-3">
  <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items ({{ cartItems.length }})</div>
  <div class="space-y-3 max-h-64 overflow-y-auto">
    <div v-for="(item, idx) in cartItems" :key="idx" class="flex gap-2 text-sm">
      <div class="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
        <img :src="getImageUrl(item.image)" :alt="item.name" class="w-full h-full object-cover" @error="handleImageError" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-800 truncate">{{ item.name }}</p>
        <p class="text-xs text-gray-500">{{ item.size || 'Select size' }} · {{ (item.quantity || 0).toLocaleString() }} pcs</p>
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
        <div v-if="orderType === 'company-product' && selectedProduct" class="flex gap-3 p-3 bg-gray-50 rounded-lg">
          <img :src="getImageUrl(selectedProduct.image)" :alt="selectedProduct.name" class="w-12 h-12 object-cover rounded-md shrink-0" @error="handleImageError" />
          <div class="min-w-0">
            <div class="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{{ selectedProduct.name }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ selectedProduct.category }}</div>
          </div>
        </div>

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
          <!-- ETA Display - FIXED -->
          <div class="flex justify-between">
            <span class="text-gray-500">Estimated Delivery</span>
            <span class="font-medium text-gray-800">{{ estimatedETA }}</span>
          </div>
          <div v-if="filesCount > 0" class="flex justify-between">
            <span class="text-gray-500">Files</span>
            <span class="font-medium text-gray-800">{{ filesCount }} file{{ filesCount > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div class="border-t pt-4 space-y-2">
          <div v-if="orderType === 'company-product' && selectedProduct && quantity" class="space-y-1.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Unit price (est.)</span>
              <span class="text-gray-700">{{ getUnitPrice() }}</span>
            </div>
          </div>
          <!-- Estimated Total - FIXED -->
          <div class="flex justify-between items-center pt-2">
            <span class="font-semibold text-gray-900">Estimated Total</span>
            <span class="text-xl font-bold text-blue-600">{{ estimatedTotalDisplay }}</span>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-400 leading-snug">
        Final price confirmed after design review and approval.
      </p>

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const props = defineProps({
  orderType: { type: String, required: true },
  selectedProduct: { type: Object, default: null },
  productType: { type: String, default: '' },
  quantity: { type: [String, Number], default: '' },
  sizes: { type: String, default: '' },
  designSource: { type: String, default: '' },
  filesCount: { type: Number, default: 0 },
  fulfillment: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cod' },
  totalAmount: { type: Number, default: 0 },
  canSubmit: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  validationHints: { type: Array, default: () => [] },
  cartItems: { type: Array, default: () => [] },
  isCartOrder: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

function getImageUrl(imagePath) {
  if (!imagePath) return `${API_BASE_URL}/uploads/products/default-product.jpg`
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) return `${API_BASE_URL}/${cleanPath}`
  if (cleanPath.startsWith('products/')) return `${API_BASE_URL}/uploads/${cleanPath}`
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = `${API_BASE_URL}/uploads/products/default-product.jpg`
}

// ETA based on design source and delivery method
const estimatedETA = computed(() => {
  if (props.designSource === 'upload') {
    return props.fulfillment === 'Delivery' ? '7-10 business days' : '5-7 business days'
  }
  if (props.designSource === 'saved') {
    return props.fulfillment === 'Delivery' ? '5-7 business days' : '3-5 business days'
  }
  return props.fulfillment === 'Delivery' ? '7-10 business days' : '5-7 business days'
})

function calculateCartItemTotal(item) {
  if (item.estimatedTotal && item.estimatedTotal > 0) {
    return `₱${item.estimatedTotal.toLocaleString()}`
  }
  
  if (item.sizes && item.size) {
    const size = item.sizes.find(s => s.name === item.size)
    if (size) {
      let unitPrice = size.price
      const qty = item.quantity
      if (qty >= 5000 && size.bulkPrices?.[5000]) {
        unitPrice = size.bulkPrices[5000] / 5000
      } else if (qty >= 2000 && size.bulkPrices?.[2000]) {
        unitPrice = size.bulkPrices[2000] / 2000
      } else if (qty >= 1000 && size.bulkPrices?.[1000]) {
        unitPrice = size.bulkPrices[1000] / 1000
      } else if (qty >= 500 && size.bulkPrices?.[500]) {
        unitPrice = size.bulkPrices[500] / 500
      }
      return `₱${(unitPrice * qty).toLocaleString()}`
    }
  }
  
  return '₱0'
}
const cartSubtotal = computed(() => {
  let total = 0
  for (const item of props.cartItems) {
    if (item.estimatedTotal && item.estimatedTotal > 0) {
      total += item.estimatedTotal
    } else if (item.sizes && item.size) {
      const size = item.sizes.find(s => s.name === item.size)
      if (size) {
        let unitPrice = size.price
        const qty = item.quantity
        if (qty >= 5000 && size.bulkPrices?.[5000]) {
          unitPrice = size.bulkPrices[5000] / 5000
        } else if (qty >= 2000 && size.bulkPrices?.[2000]) {
          unitPrice = size.bulkPrices[2000] / 2000
        } else if (qty >= 1000 && size.bulkPrices?.[1000]) {
          unitPrice = size.bulkPrices[1000] / 1000
        } else if (qty >= 500 && size.bulkPrices?.[500]) {
          unitPrice = size.bulkPrices[500] / 500
        }
        total += unitPrice * qty
      }
    }
  }
  return `₱${total.toLocaleString()}`
})

function getUnitPrice() {
  const qty = Number(props.quantity)
  if (!qty || isNaN(qty)) return '—'
  
  const size = props.selectedProduct?.sizes?.find(s => s.name === props.sizes)
             ?? props.selectedProduct?.sizes?.[0]
  if (!size?.price) return '—'
  
  let unitPrice = size.price
  const bulkPrices = size.bulkPrices
  
  if (bulkPrices) {
    if (qty >= 5000 && bulkPrices[5000]) unitPrice = bulkPrices[5000] / 5000
    else if (qty >= 2000 && bulkPrices[2000]) unitPrice = bulkPrices[2000] / 2000
    else if (qty >= 1000 && bulkPrices[1000]) unitPrice = bulkPrices[1000] / 1000
    else if (qty >= 500 && bulkPrices[500]) unitPrice = bulkPrices[500] / 500
  }
  
  return `₱${unitPrice.toFixed(2)}`
}

// Estimated total display - FIXED
const estimatedTotalDisplay = computed(() => {
  // For own cups orders
  if (props.orderType === 'own-cups') {
    return '₱0 (Price upon review)'
  }
  
  // For cart orders (multi-item)
  if (props.cartItems && props.cartItems.length > 0) {
    let total = 0
    for (const item of props.cartItems) {
      // Calculate price per item based on quantity and bulk pricing
      let itemTotal = 0
      if (item.estimatedTotal && item.estimatedTotal > 0) {
        itemTotal = item.estimatedTotal
      } else if (item.sizes && item.size) {
        const size = item.sizes.find(s => s.name === item.size)
        if (size) {
          let unitPrice = size.price
          const qty = item.quantity
          if (qty >= 5000 && size.bulkPrices?.[5000]) {
            unitPrice = size.bulkPrices[5000] / 5000
          } else if (qty >= 2000 && size.bulkPrices?.[2000]) {
            unitPrice = size.bulkPrices[2000] / 2000
          } else if (qty >= 1000 && size.bulkPrices?.[1000]) {
            unitPrice = size.bulkPrices[1000] / 1000
          } else if (qty >= 500 && size.bulkPrices?.[500]) {
            unitPrice = size.bulkPrices[500] / 500
          }
          itemTotal = unitPrice * qty
        }
      }
      total += itemTotal
    }
    return `₱${total.toLocaleString()}`
  }
  
  // For single product orders
  const qty = Number(props.quantity)
  if (!qty || isNaN(qty)) return '₱0'
  
  const size = props.selectedProduct?.sizes?.find(s => s.name === props.sizes)
             ?? props.selectedProduct?.sizes?.[0]
  if (size?.price) {
    let unitPrice = size.price
    const bulkPrices = size.bulkPrices
    if (bulkPrices) {
      if (qty >= 5000 && bulkPrices[5000]) unitPrice = bulkPrices[5000] / 5000
      else if (qty >= 2000 && bulkPrices[2000]) unitPrice = bulkPrices[2000] / 2000
      else if (qty >= 1000 && bulkPrices[1000]) unitPrice = bulkPrices[1000] / 1000
      else if (qty >= 500 && bulkPrices[500]) unitPrice = bulkPrices[500] / 500
    }
    return `₱${(unitPrice * qty).toLocaleString()}`
  }
  
  return '₱0'
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>