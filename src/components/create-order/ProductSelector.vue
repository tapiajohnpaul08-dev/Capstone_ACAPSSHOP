<!-- src/components/create-order/ProductSelector.vue -->
<template>
  <div class="space-y-4">
    <!-- Cart Items / Multi-item order -->
    <div v-if="isCartOrder && modelValue.length > 0">
      <div v-for="(item, idx) in modelValue" :key="idx" class="bg-white rounded-xl border overflow-hidden mb-4">
        <div class="p-4">
          <div class="flex gap-4">
            <img :src="getImageUrl(item.image)" class="w-20 h-20 object-cover rounded-lg border" @error="handleImageError" />
            <div class="flex-1">
              <div class="flex justify-between">
                <div>
                  <h3 class="font-semibold">{{ item.name }}</h3>
                  <p class="text-sm text-gray-500">{{ item.category }}</p>
                  <p class="text-xs text-blue-600 mt-1">Selected Size: {{ item.size || 'Not selected' }}</p>
                </div>
                <button v-if="isCartOrder" @click="removeItem(idx)" class="text-red-500 hover:text-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label class="text-xs font-medium text-gray-700">Size</label>
                  <!-- Show loading state while fetching sizes -->
                  <div v-if="loadingSizes[item.productId]" class="text-sm text-gray-400">Loading sizes...</div>
                  <select v-else v-model="item.size" @change="updateItem(idx, 'size', $event.target.value)" class="field text-sm">
                    <option value="" disabled>Select size...</option>
                    <option v-for="size in getSizesForItem(item)" :key="size.name" :value="size.name">
                      {{ size.name }} — ₱{{ size.price.toLocaleString() }}/pc
                      <span v-if="size.stock > 0"> ({{ size.stock.toLocaleString() }} in stock)</span>
                      <span v-else class="text-red-500"> (Out of stock)</span>
                    </option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-700">Quantity</label>
                  <div class="flex items-center gap-2">
                    <button type="button" @click="updateQuantity(idx, -500)" :disabled="item.quantity <= (item.minOrder || 500)" class="w-8 h-8 border rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
                    </button>
                    <input type="number" v-model.number="item.quantity" @input="updateItem(idx, 'quantity', $event.target.value)" :min="item.minOrder || 500" step="500" class="field text-center" />
                    <button type="button" @click="updateQuantity(idx, 500)" class="w-8 h-8 border rounded-md flex items-center justify-center hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Min: {{ item.minOrder || 500 }} pcs · Multiples of 500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Single Product Order -->
    <div v-else-if="!isCartOrder && selectedProductData" class="bg-white rounded-xl border p-4">
      <div class="flex gap-4">
        <img :src="getImageUrl(selectedProductData.image)" class="w-24 h-24 object-cover rounded-lg border" @error="handleImageError" />
        <div class="flex-1">
          <h3 class="font-semibold text-lg">{{ selectedProductData.name }}</h3>
          <p class="text-sm text-gray-500">{{ selectedProductData.category }}</p>
          <p class="text-xs text-gray-400 mt-1">Min Order: {{ selectedProductData.minOrder || 500 }} pcs</p>
          
          <div class="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label class="text-xs font-medium text-gray-700">Size <span class="text-red-500">*</span></label>
              <select v-model="selectedSize" @change="onSizeChange" class="field text-sm">
                <option value="" disabled>Select size...</option>
                <option v-for="size in selectedProductData.sizes" :key="size.name" :value="size.name">
                  {{ size.name }} — ₱{{ size.price.toLocaleString() }}/pc
                  <span v-if="size.stock > 0"> ({{ size.stock.toLocaleString() }} in stock)</span>
                  <span v-else class="text-red-500"> (Out of stock)</span>
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700">Quantity <span class="text-red-500">*</span></label>
              <div class="flex items-center gap-2">
                <button type="button" @click="updateSingleQuantity(-500)" :disabled="singleQuantity <= (selectedProductData.minOrder || 500)" class="w-8 h-8 border rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
                </button>
                <input type="number" v-model.number="singleQuantity" @input="onQuantityChange" :min="selectedProductData.minOrder || 500" step="500" class="field text-center" />
                <button type="button" @click="updateSingleQuantity(500)" class="w-8 h-8 border rounded-md flex items-center justify-center hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">Min: {{ selectedProductData.minOrder || 500 }} pcs · Multiples of 500</p>
              <p v-if="getSelectedSizeStock > 0 && singleQuantity > getSelectedSizeStock" class="text-xs text-red-500 mt-1">
                ⚠️ Only {{ getSelectedSizeStock.toLocaleString() }} pcs in stock
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Own Cups Order -->
    <div v-else-if="isOwnCups" class="bg-white rounded-xl border p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700">Product Type <span class="text-red-500">*</span></label>
          <input v-model="ownCupsData.productType" type="text" placeholder="e.g., Coffee Cups, Tumblers" class="field" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Cup Size <span class="text-red-500">*</span></label>
          <input v-model="ownCupsData.sizes" type="text" placeholder="e.g., 12oz, 16oz" class="field" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Quantity <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-2">
            <button type="button" @click="updateOwnCupsQuantity(-500)" :disabled="ownCupsData.quantity <= 500" class="w-8 h-8 border rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
            </button>
            <input type="number" v-model.number="ownCupsData.quantity" min="500" step="500" class="field text-center" />
            <button type="button" @click="updateOwnCupsQuantity(500)" class="w-8 h-8 border rounded-md flex items-center justify-center hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">Min: 500 pcs</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { productsApi } from '@/api'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  orderType: { type: String, default: 'company-product' },
  isCartOrder: { type: Boolean, default: false },
  selectedProduct: { type: Object, default: null },
  isOwnCups: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'product-changed'])

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Single product state
const selectedSize = ref('')
const singleQuantity = ref(500)
const ownCupsData = ref({
  productType: '',
  sizes: '',
  quantity: 500
})

// Loading state for each product's sizes
const loadingSizes = ref({})

// Get selected product data from props or use local ref
const selectedProductData = computed(() => props.selectedProduct)

// Get stock for selected size
const getSelectedSizeStock = computed(() => {
  if (!selectedProductData.value || !selectedSize.value) return 0
  const size = selectedProductData.value.sizes?.find(s => s.name === selectedSize.value)
  return size?.stock || 0
})

function getImageUrl(imagePath) {
  if (!imagePath) return `${API_BASE_URL}/uploads/products/default-product.jpg`
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) return `${API_BASE_URL}/${cleanPath}`
  if (cleanPath.startsWith('products/')) return `${API_BASE_URL}/uploads/${cleanPath}`
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(e) {
  e.target.src = `${API_BASE_URL}/uploads/products/default-product.jpg`
}

// Get sizes for a specific item - uses cached sizes or fetches
function getSizesForItem(item) {
  // If item already has sizes array, use it
  if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0) {
    return item.sizes
  }
  return []
}

// Fetch sizes for a product and update the item
async function fetchAndUpdateSizes(item, index) {
  if (!item.productId) return
  
  // If already has sizes, skip
  if (item.sizes && item.sizes.length > 0) return
  
  loadingSizes.value[item.productId] = true
  
  try {
    const response = await productsApi.getProductById(item.productId)
    if (response.success && response.data && response.data.sizes) {
      const newItems = [...props.modelValue]
      newItems[index] = {
        ...newItems[index],
        sizes: response.data.sizes
      }
      emit('update:modelValue', newItems)
    }
  } catch (error) {
    console.error('Error fetching sizes for', item.name, error)
  } finally {
    loadingSizes.value[item.productId] = false
  }
}

// Watch for cart items and fetch sizes if needed
watch(() => props.modelValue, (newItems) => {
  if (props.isCartOrder && newItems.length > 0) {
    newItems.forEach((item, index) => {
      if (item.productId && (!item.sizes || item.sizes.length === 0)) {
        fetchAndUpdateSizes(item, index)
      }
    })
  }
}, { immediate: true, deep: true })

function updateItem(index, field, value) {
  const newItems = [...props.modelValue]
  if (field === 'quantity') {
    newItems[index][field] = parseInt(value) || 0
  } else {
    newItems[index][field] = value
  }
  emit('update:modelValue', newItems)
  emit('product-changed', newItems)
}

function updateQuantity(index, delta) {
  const newItems = [...props.modelValue]
  const newQty = (newItems[index].quantity || 0) + delta
  const min = newItems[index].minOrder || 500
  if (newQty >= min) {
    newItems[index].quantity = newQty
    emit('update:modelValue', newItems)
    emit('product-changed', newItems)
  }
}

function removeItem(index) {
  const newItems = [...props.modelValue]
  newItems.splice(index, 1)
  emit('update:modelValue', newItems)
  emit('product-changed', newItems)
}

function onSizeChange() {
  const minOrder = selectedProductData.value?.minOrder || 500
  singleQuantity.value = minOrder
  
  const updatedProduct = {
    productId: selectedProductData.value?.id,
    name: selectedProductData.value?.name,
    image: selectedProductData.value?.image,
    category: selectedProductData.value?.category,
    size: selectedSize.value,
    quantity: singleQuantity.value,
    minOrder: selectedProductData.value?.minOrder,
    sizes: selectedProductData.value?.sizes
  }
  emit('update:modelValue', [updatedProduct])
  emit('product-changed', [updatedProduct])
}

function onQuantityChange() {
  const updatedProduct = {
    productId: selectedProductData.value?.id,
    name: selectedProductData.value?.name,
    image: selectedProductData.value?.image,
    category: selectedProductData.value?.category,
    size: selectedSize.value,
    quantity: singleQuantity.value,
    minOrder: selectedProductData.value?.minOrder,
    sizes: selectedProductData.value?.sizes
  }
  emit('update:modelValue', [updatedProduct])
  emit('product-changed', [updatedProduct])
}

function updateSingleQuantity(delta) {
  const newQty = singleQuantity.value + delta
  const min = selectedProductData.value?.minOrder || 500
  const maxStock = getSelectedSizeStock.value
  if (newQty >= min && (maxStock === 0 || newQty <= maxStock)) {
    singleQuantity.value = newQty
    onQuantityChange()
  }
}

function updateOwnCupsQuantity(delta) {
  const newQty = ownCupsData.value.quantity + delta
  if (newQty >= 500) {
    ownCupsData.value.quantity = newQty
    emit('product-changed', [ownCupsData.value])
  }
}

// Initialize single product data when selectedProduct changes
watch(() => props.selectedProduct, (newProduct) => {
  if (newProduct && newProduct.sizes && newProduct.sizes.length > 0) {
    selectedSize.value = newProduct.sizes[0]?.name || ''
    singleQuantity.value = newProduct.minOrder || 500
  }
}, { immediate: true })

// Watch for own cups data changes
watch(ownCupsData, (newVal) => {
  emit('product-changed', [newVal])
}, { deep: true })
</script>

<style scoped>
.field {
  @apply w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>