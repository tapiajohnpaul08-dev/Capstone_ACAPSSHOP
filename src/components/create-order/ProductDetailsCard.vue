<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Product Details</h4>
      <p v-if="orderType === 'own-cups'" class="text-xs text-gray-500 mt-0.5">
        Tell us about the cups you're bringing in.
      </p>
      <p v-else class="text-xs text-gray-500 mt-0.5">
        Confirm quantity and size for your selected product.
      </p>
    </div>
    <div class="px-6 py-5 space-y-4">

      <!-- Company product: show selected product preview -->
      <div v-if="orderType === 'company-product' && selectedProduct" class="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-16 h-16 object-cover rounded-lg border shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-xs text-blue-600 font-medium">{{ selectedProduct.category }}</div>
          <h3 class="font-semibold text-sm text-gray-900 mt-0.5">{{ selectedProduct.name }}</h3>
          <div class="text-xs text-gray-500 mt-1">Available sizes: {{ getSizeOptions() }}</div>
        </div>
        <button @click="emit('change-product')" class="text-xs text-blue-600 hover:underline shrink-0">Change</button>
      </div>

      <!-- Own cups: product type text field -->
      <div v-if="orderType === 'own-cups'" class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700" for="pd-type">
          Product Type <span class="text-red-500">*</span>
        </label>
        <input
          id="pd-type"
          :value="modelValue.productType"
          @input="updateField('productType', $event.target.value)"
          type="text"
          placeholder="e.g., Coffee Cups, Tumblers, Lighters"
          class="field"
          :class="{ 'border-red-400 ring-1 ring-red-300': errors.productType }"
        />
        <p v-if="errors.productType" class="text-xs text-red-500">{{ errors.productType }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="pd-qty">
            Quantity <span class="text-red-500">*</span>
          </label>
          <input
            id="pd-qty"
            :value="modelValue.quantity"
            @input="updateField('quantity', $event.target.value)"
            type="number"
            min="1"
            :placeholder="quantityPlaceholder"
            class="field"
            :class="{ 'border-red-400 ring-1 ring-red-300': errors.quantity }"
          />
          <p v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</p>
          <p v-if="orderType === 'company-product' && selectedProduct && modelValue.quantity && modelValue.quantity < selectedProduct.minOrder" class="text-xs text-amber-600">
            ⚠️ Minimum order is {{ selectedProduct.minOrder }} pcs
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="pd-sizes">
            Size <span class="text-red-500">*</span>
          </label>
          
          <!-- For company product: radio buttons for single size selection -->
          <div v-if="orderType === 'company-product' && selectedProduct" class="space-y-2">
            <div class="flex flex-wrap gap-3">
              <label
                v-for="size in getSizeNames()"
                :key="size"
                class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors"
                :class="modelValue.sizes === size
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'"
              >
                <input
                  type="radio"
                  :value="size"
                  :checked="modelValue.sizes === size"
                  @change="updateField('sizes', size)"
                  class="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                />
                {{ size }}
                <span class="text-xs text-gray-500 ml-1">
                  (₱{{ getSizePrice(size) }}/pc)
                </span>
              </label>
            </div>
            <p v-if="getSelectedSizePrice && modelValue.quantity" class="text-xs text-gray-500">
              Estimated unit price at {{ formatNumber(modelValue.quantity) }} pcs: 
              <span class="font-semibold text-blue-600">{{ getBulkPrice() }}</span>/pc
            </p>
          </div>
          
          <!-- For own cups: free text input -->
          <input
            v-else
            id="pd-sizes"
            :value="modelValue.sizes"
            @input="updateField('sizes', $event.target.value)"
            type="text"
            placeholder="e.g., 12oz"
            class="field"
            :class="{ 'border-red-400 ring-1 ring-red-300': errors.sizes }"
          />
          <p v-if="errors.sizes" class="text-xs text-red-500">{{ errors.sizes }}</p>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700" for="pd-specs">Product Specifications</label>
        <textarea
          id="pd-specs"
          :value="modelValue.specifications"
          @input="updateField('specifications', $event.target.value)"
          placeholder="Any specific requirements for the products (material, color, etc.)"
          rows="2"
          class="field resize-none"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  orderType: { type: String, required: true },
  selectedProduct: { type: Object, default: null },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'change-product'])

const quantityPlaceholder = computed(() => {
  if (props.orderType === 'company-product' && props.selectedProduct) {
    return `Min. ${props.selectedProduct.minOrder} pcs`
  }
  return 'e.g., 1000'
})

// Computed property for selected size price
const getSelectedSizePrice = computed(() => {
  if (!props.modelValue.sizes) return null
  const sizeName = props.modelValue.sizes
  const size = props.selectedProduct?.sizes?.find(s => (s.name || s) === sizeName)
  return size?.price || null
})

function getSizeNames() {
  if (!props.selectedProduct?.sizes) return []
  return props.selectedProduct.sizes.map(s => s.name || s)
}

function getSizePrice(sizeName) {
  const size = props.selectedProduct?.sizes?.find(s => (s.name || s) === sizeName)
  return size?.price?.toLocaleString() || 0
}

function getSizeOptions() {
  return getSizeNames().join(', ')
}

function getBulkPrice() {
  const qty = Number(props.modelValue.quantity)
  if (!qty || isNaN(qty)) return '—'
  
  const sizeName = props.modelValue.sizes
  if (!sizeName) return '—'
  
  const size = props.selectedProduct?.sizes?.find(s => (s.name || s) === sizeName)
  if (!size) return '—'
  
  let unitPrice = size.price
  
  if (size.bulkPrices) {
    if (qty >= 5000 && size.bulkPrices[5000]) unitPrice = size.bulkPrices[5000] / 5000
    else if (qty >= 2000 && size.bulkPrices[2000]) unitPrice = size.bulkPrices[2000] / 2000
    else if (qty >= 1000 && size.bulkPrices[1000]) unitPrice = size.bulkPrices[1000] / 1000
    else if (qty >= 500 && size.bulkPrices[500]) unitPrice = size.bulkPrices[500] / 500
  }
  
  return `₱${unitPrice.toFixed(2)}`
}

function formatNumber(value) {
  if (!value) return '0'
  return Number(value).toLocaleString()
}

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
textarea.field {
  @apply h-auto py-2;
}
</style>