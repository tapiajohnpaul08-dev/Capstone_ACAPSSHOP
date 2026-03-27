<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Product Details</h4>
      <p v-if="orderType === 'own-cups'" class="text-xs text-gray-500 mt-0.5">
        Tell us about the cups you're bringing in.
      </p>
      <p v-else class="text-xs text-gray-500 mt-0.5">
        Confirm quantity and sizes for your selected product.
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
            {{ orderType === 'company-product' ? 'Size(s)' : 'Sizes (comma-separated)' }}
          </label>
          <!-- For company product: select from available sizes -->
          <div v-if="orderType === 'company-product' && selectedProduct" class="flex flex-wrap gap-2">
            <label
              v-for="size in getSizeNames()"
              :key="size"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-colors"
              :class="selectedSizes.includes(size)
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'"
            >
              <input
                type="checkbox"
                :value="size"
                :checked="selectedSizes.includes(size)"
                @change="toggleSize(size)"
                class="hidden"
              />
              {{ size }}
            </label>
          </div>
          <!-- For own cups: free text -->
          <input
            v-else
            id="pd-sizes"
            :value="modelValue.sizes"
            @input="updateField('sizes', $event.target.value)"
            type="text"
            placeholder="e.g., 12oz, 16oz"
            class="field"
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

const selectedSizes = computed(() => {
  if (!props.modelValue.sizes) return []
  return props.modelValue.sizes.split(',').map(s => s.trim()).filter(Boolean)
})

function getSizeNames() {
  if (!props.selectedProduct?.sizes) return []
  return props.selectedProduct.sizes.map(s => s.name || s)
}

function getSizeOptions() {
  return getSizeNames().join(', ')
}

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function toggleSize(size) {
  const current = selectedSizes.value
  const updated = current.includes(size)
    ? current.filter(s => s !== size)
    : [...current, size]
  updateField('sizes', updated.join(', '))
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