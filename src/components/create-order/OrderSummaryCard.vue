<template>
  <div class="bg-white rounded-xl border lg:sticky lg:top-20">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">
        {{ variant === 'compact' ? 'Quick Summary' : 'Order Summary' }}
      </h4>
      <p v-if="variant === 'compact'" class="text-xs text-gray-500 mt-0.5">
        Full details reviewed before submit.
      </p>
    </div>

    <div class="px-6 py-5 space-y-4">

      <!-- ======================== COMPACT ======================== -->
      <template v-if="variant === 'compact'">
        <!-- Item count + total qty -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Items</span>
            <span class="font-medium text-gray-800">
              {{ itemCount }} {{ itemCount === 1 ? 'product' : 'products' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Total Quantity</span>
            <span class="font-medium text-gray-800">
              {{ totalQuantity.toLocaleString() }} pcs
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Fulfillment</span>
            <span class="font-medium text-gray-800 capitalize">
              {{ fulfillment?.method === 'pickup' ? 'Pick-up' : 'Delivery' }}
            </span>
          </div>
        </div>

        <!-- Total preview -->
        <div class="border-t pt-3 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-gray-900">Estimated Total</span>
            <span class="text-lg font-bold text-blue-600">
              ₱{{ (totalAmount || 0).toLocaleString() }}
            </span>
          </div>
          <p class="text-[11px] text-gray-400 italic leading-snug">
            Final price confirmed in chat after review.
          </p>
        </div>

        <!-- Next button (optional, only shown if parent passes canProceed) -->
        <button
          v-if="showNextButton"
          @click="$emit('next')"
          :disabled="!canProceed"
          class="w-full h-10 rounded-lg font-semibold text-sm transition-all"
          :class="canProceed
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
        >
          Continue
        </button>
      </template>

      <!-- ========================= FULL ========================== -->
      <template v-else>

        <!-- Order type badge -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2 py-1 rounded-md text-xs font-semibold"
            :class="orderType === 'own-cups'
              ? 'bg-purple-100 text-purple-700'
              : isCartOrder && cartItems?.length > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'">
            {{ orderType === 'own-cups'
              ? 'Own Cups'
              : isCartOrder && cartItems?.length > 0
                ? 'Multi-Item Order'
                : 'Company Product' }}
          </span>
          <span v-if="hasDesign" class="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
            🎨 With Design
          </span>
        </div>

        <!-- Customer info -->
        <div v-if="customerInfo?.name" class="flex items-center gap-2 text-xs text-gray-500 -mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" class="shrink-0 text-gray-400">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="truncate">
            {{ customerInfo.name }}<span v-if="customerInfo.company"> · {{ customerInfo.company }}</span><span
              v-if="customerInfo.phone"> · {{ customerInfo.phone }}</span>
          </span>
        </div>

        <!-- Items -->
        <div v-if="isCartOrder && cartItems && cartItems.length > 0" class="space-y-3">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Items ({{ cartItems.length }})
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div v-for="(item, idx) in cartItems" :key="idx" class="flex gap-2 text-sm">
              <div class="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                <img :src="getImageUrl(item.image)" :alt="item.name" class="w-full h-full object-cover"
                  @error="handleImageError" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ item.size || 'Select size' }} · {{ (item.quantity || 0).toLocaleString() }} pcs
                </p>
                <p v-if="item.printPlacement || item.printSize" class="text-xs text-gray-400 capitalize">
                  {{ item.printPlacement ? item.printPlacement.replace('-', ' ') : '' }}<span
                    v-if="item.printPlacement && item.printSize"> · </span>{{ item.printSize || '' }}
                </p>
                <p v-if="item.designSource" class="text-xs text-gray-400">
                  {{ item.designSource === 'upload' ? 'New upload'
                    : item.designSource === 'saved' ? 'Saved template'
                    : 'No design' }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-blue-600">{{ calculateCartItemTotal(item) }}</p>
              </div>
            </div>
          </div>
          <div class="border-t pt-2 flex justify-between font-semibold text-sm">
            <span>Items Subtotal</span>
            <span class="text-blue-600">{{ cartSubtotal }}</span>
          </div>
        </div>

        <!-- Single product -->
        <div v-else>
          <div v-if="orderType === 'company-product' && selectedProduct" class="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <img :src="getImageUrl(selectedProduct.image)" :alt="selectedProduct.name"
              class="w-12 h-12 object-cover rounded-md shrink-0" @error="handleImageError" />
            <div class="min-w-0">
              <div class="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                {{ selectedProduct.name }}
              </div>
              <div class="text-xs text-gray-500 mt-0.5">{{ selectedProduct.category }}</div>
            </div>
          </div>

          <div class="space-y-2.5 text-sm mt-3">
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
              <span class="font-medium text-gray-800">
                {{ designSource === 'upload' ? 'New Upload'
                  : designSource === 'saved' ? 'Saved Template'
                  : 'No Design' }}
              </span>
            </div>
            <div v-if="printPlacement || printSize" class="flex justify-between">
              <span class="text-gray-500">Print Placement</span>
              <span class="font-medium text-gray-800 text-right max-w-[55%] truncate capitalize">
                {{ printPlacement ? printPlacement.replace('-', ' ') : '' }}<span
                  v-if="printPlacement && printSize"> · </span>{{ printSize }}
              </span>
            </div>
            <div v-if="specifications" class="flex justify-between">
              <span class="text-gray-500">Specifications</span>
              <span class="font-medium text-gray-800 text-right max-w-[55%] truncate">{{ specifications }}</span>
            </div>
            <div v-if="filesCount > 0" class="flex justify-between">
              <span class="text-gray-500">Files</span>
              <span class="font-medium text-gray-800">{{ filesCount }} file{{ filesCount > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Fulfillment -->
        <div v-if="fulfillment" class="border-t pt-4 space-y-2.5">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fulfillment</div>
          <div class="space-y-2 text-sm">
            <div v-if="orderType === 'own-cups' && ownCupsDeliveryDate" class="flex justify-between">
              <span class="text-gray-500">Your Drop-off Date</span>
              <span class="font-medium text-gray-800">{{ formatDate(ownCupsDeliveryDate) }}</span>
            </div>
            <div class="flex flex-col justify-between">
              <span class="text-gray-500">Estimated Delivery / Pick-up</span>
              <span class="font-medium text-gray-800">{{ estimatedETA }}</span>
            </div>
            <div v-if="preferredTime" class="flex justify-between">
              <span class="text-gray-500">Preferred Time</span>
              <span class="font-medium text-gray-800">{{ preferredTime }}</span>
            </div>
            <div v-if="fulfillment === 'delivery' && deliveryAddress" class="flex justify-between gap-3">
              <span class="text-gray-500 shrink-0">Deliver To</span>
              <span class="font-medium text-gray-800 text-right">{{ deliveryAddress }}</span>
            </div>
            <div v-else-if="fulfillment === 'pickup'" class="flex justify-between">
              <span class="text-gray-500">Pick-up At</span>
              <span class="font-medium text-gray-800 text-right">ACAPS Trading — Main Store</span>
            </div>
          </div>
        </div>

        <!-- Cost breakdown -->
        <div class="border-t pt-4 space-y-2">
          <div v-if="!isCartOrder && orderType === 'company-product' && selectedProduct && quantity"
            class="space-y-1.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Unit price (est.)</span>
              <span class="text-gray-700">{{ getUnitPrice() }}</span>
            </div>
          </div>

          <div class="space-y-1.5 pt-2 border-t border-gray-100">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Products Total</span>
              <span class="font-medium text-gray-800">{{ productTotalDisplay }}</span>
            </div>

            <div v-if="hasDesign || orderType === 'own-cups'" class="flex justify-between text-sm">
              <span class="text-gray-500">
                {{ orderType === 'own-cups' ? 'Printing Service' : 'Design Fee' }}
              </span>
              <span class="font-medium text-gray-800">₱{{ FEES.DESIGN_AND_PRINTING_SERVICE_FEE.toLocaleString() }}</span>
            </div>

            <div v-if="orderType === 'company-product'" class="flex justify-between text-sm">
              <span class="text-gray-500">Shipping Fee</span>
              <span class="font-medium text-gray-800">₱{{ shippingFee.toLocaleString() }}</span>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
              <span class="font-semibold text-gray-900">Estimated Total</span>
              <span class="text-xl font-bold text-blue-600">{{ estimatedTotalDisplay }}</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-400 leading-snug">
          Final price confirmed after review and approval.
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let FEES = {
  DESIGN_AND_PRINTING_SERVICE_FEE: 500,
}

const props = defineProps({
  // 'compact' for steps 0-2 (minimal info), 'full' for step 3 (everything)
  variant: { type: String, default: 'full' },

  orderType: { type: String, required: true },
  selectedProduct: { type: Object, default: null },
  productType: { type: String, default: '' },
  quantity: { type: [String, Number], default: '' },
  sizes: { type: String, default: '' },
  designSource: { type: String, default: '' },
  filesCount: { type: Number, default: 0 },
  fulfillment: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cod' }, // kept for compat, unused
  totalAmount: { type: Number, default: 0 },
  canSubmit: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  validationHints: { type: Array, default: () => [] },
  cartItems: { type: Array, default: () => [] },
  isCartOrder: { type: Boolean, default: false },
  hasDesign: { type: Boolean, default: false },
  customerInfo: { type: Object, default: () => ({}) },
  deliveryAddress: { type: String, default: '' },
  preferredDate: { type: String, default: '' },
  preferredTime: { type: String, default: '' },
  ownCupsDeliveryDate: { type: String, default: '' },
  printSize: { type: String, default: '' },
  printPlacement: { type: String, default: '' },
  specifications: { type: String, default: '' },
  paymentDetails: { type: Object, default: () => ({}) }, // kept for compat, unused
  shippingFee: { type: Number, default: 0 },

  // Compact variant extras
  showNextButton: { type: Boolean, default: false },
  canProceed: { type: Boolean, default: false },
  itemCount: { type: Number, default: 0 },
  totalQuantity: { type: Number, default: 0 },
})

const emit = defineEmits(['submit', 'next'])

// ── helpers ──────────────────────────────────────────
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

function formatDate(dateValue, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateValue) return ''
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-PH', options)
}

const estimatedETA = computed(() => {
  if (props.preferredDate) return formatDate(props.preferredDate)
  return '3-7 business days'
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
      if (qty >= 5000 && size.bulkPrices?.[5000]) unitPrice = size.bulkPrices[5000] / 5000
      else if (qty >= 2000 && size.bulkPrices?.[2000]) unitPrice = size.bulkPrices[2000] / 2000
      else if (qty >= 1000 && size.bulkPrices?.[1000]) unitPrice = size.bulkPrices[1000] / 1000
      else if (qty >= 500 && size.bulkPrices?.[500]) unitPrice = size.bulkPrices[500] / 500
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
        if (qty >= 5000 && size.bulkPrices?.[5000]) unitPrice = size.bulkPrices[5000] / 5000
        else if (qty >= 2000 && size.bulkPrices?.[2000]) unitPrice = size.bulkPrices[2000] / 2000
        else if (qty >= 1000 && size.bulkPrices?.[1000]) unitPrice = size.bulkPrices[1000] / 1000
        else if (qty >= 500 && size.bulkPrices?.[500]) unitPrice = size.bulkPrices[500] / 500
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

const productTotalDisplay = computed(() => {
  if (props.orderType === 'own-cups') return '₱0.00'

  if (props.cartItems && props.cartItems.length > 0) {
    let total = 0
    for (const item of props.cartItems) {
      if (item.estimatedTotal && item.estimatedTotal > 0) {
        total += item.estimatedTotal
      } else if (item.sizes && item.size) {
        const size = item.sizes.find(s => s.name === item.size)
        if (size) {
          let unitPrice = size.price
          const qty = item.quantity
          if (qty >= 5000 && size.bulkPrices?.[5000]) unitPrice = size.bulkPrices[5000] / 5000
          else if (qty >= 2000 && size.bulkPrices?.[2000]) unitPrice = size.bulkPrices[2000] / 2000
          else if (qty >= 1000 && size.bulkPrices?.[1000]) unitPrice = size.bulkPrices[1000] / 1000
          else if (qty >= 500 && size.bulkPrices?.[500]) unitPrice = size.bulkPrices[500] / 500
          total += unitPrice * qty
        }
      }
    }
    return `₱${total.toLocaleString()}`
  }

  const qty = Number(props.quantity)
  if (!qty || isNaN(qty)) return '₱0.00'

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
  return '₱0.00'
})

const estimatedTotalDisplay = computed(() => {
  if (props.totalAmount !== undefined && props.totalAmount > 0) {
    return `₱${props.totalAmount.toLocaleString()}`
  }
  let total = 0
  const productTotalStr = productTotalDisplay.value.replace(/[₱,]/g, '')
  const productTotal = parseFloat(productTotalStr) || 0
  total += productTotal
  if (props.hasDesign || props.orderType === 'own-cups') {
    total += FEES.DESIGN_AND_PRINTING_SERVICE_FEE
  }
  return `₱${total.toLocaleString()}`
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
</style>