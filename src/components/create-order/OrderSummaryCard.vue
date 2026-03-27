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
            : 'bg-blue-100 text-blue-700'"
        >
          {{ orderType === 'own-cups' ? 'Own Cups' : 'Company Product' }}
        </span>
        <span class="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
          {{ fulfillment || '—' }}
        </span>
      </div>

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
          <span class="text-gray-500">Sizes</span>
          <span class="font-medium text-gray-800">{{ sizes }}</span>
        </div>
        <div v-if="designSource" class="flex justify-between">
          <span class="text-gray-500">Design</span>
          <span class="font-medium text-gray-800">{{ designSource === 'upload' ? 'New Upload' : 'Saved Template' }}</span>
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
          <span class="text-xl font-bold text-blue-600">{{ estimatedTotal }}</span>
        </div>
        <p class="text-xs text-gray-400 leading-snug">
          Final price confirmed after design review and approval.
        </p>
      </div>

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
  validationHints: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit'])

function getUnitPrice() {
  if (!props.selectedProduct || !props.selectedProduct.sizes) return '—'
  const firstSize = props.selectedProduct.sizes[0]
  if (!firstSize || !firstSize.price) return '—'
  return `₱${firstSize.price.toFixed(2)}`
}

const estimatedTotal = computed(() => {
  if (!props.quantity || isNaN(Number(props.quantity))) return '₱0'
  const qty = Number(props.quantity)
  
  if (props.orderType === 'company-product' && props.selectedProduct && props.selectedProduct.sizes) {
    const firstSize = props.selectedProduct.sizes[0]
    if (!firstSize || !firstSize.price) return '₱0'
    
    // Check bulk pricing
    let unitPrice = firstSize.price
    if (qty >= 5000 && firstSize.bulkPrices?.[5000]) unitPrice = firstSize.bulkPrices[5000] / 5000
    else if (qty >= 2000 && firstSize.bulkPrices?.[2000]) unitPrice = firstSize.bulkPrices[2000] / 2000
    else if (qty >= 1000 && firstSize.bulkPrices?.[1000]) unitPrice = firstSize.bulkPrices[1000] / 1000
    else if (qty >= 500 && firstSize.bulkPrices?.[500]) unitPrice = firstSize.bulkPrices[500] / 500
    
    return `₱${(unitPrice * qty).toLocaleString()}`
  }
  
  return '₱0'
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>