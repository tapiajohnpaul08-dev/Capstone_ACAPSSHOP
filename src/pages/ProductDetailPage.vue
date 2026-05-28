<!-- src/views/customer/ProductDetailPage.vue - Fixed image size -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Back Button -->
      <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Products
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-gray-500 mt-2">Loading product details...</p>
      </div>

      <!-- Product Detail -->
      <div v-else-if="product" class="flex flex-col lg:flex-row gap-8">
        <!-- Product Image - Fixed size panel -->
        <div class="lg:w-1/2">
          <div class="bg-white rounded-2xl border p-6 sticky top-24">
            <div class="aspect-square w-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
              <img 
                :src="productImageUrl" 
                :alt="product.name"
                class="w-full h-full object-contain"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="lg:w-1/2">
          <div class="bg-white rounded-2xl border p-6">
            <div class="mb-4">
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{ product.category }}</span>
              <h1 class="text-2xl font-bold text-gray-900 mt-2">{{ product.name }}</h1>
              <p class="text-gray-500 text-sm mt-1">Minimum Order: {{ product.minOrder?.toLocaleString() }} pcs</p>
            </div>

            <!-- Size Selection -->
            <div class="mb-6">
              <label class="text-sm font-medium text-gray-700 block mb-2">Select Size</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="size in product.sizes"
                  :key="size.name"
                  @click="selectedSize = size"
                  class="p-3 rounded-xl border-2 text-left transition-all"
                  :class="selectedSize?.name === size.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="font-semibold">{{ size.name }}</div>
                  <div class="text-sm text-gray-600">₱{{ size.price.toLocaleString() }}/pc</div>
                  <div class="text-xs" :class="size.stock > 0 ? 'text-green-600' : 'text-red-500'">
                    {{ size.stock > 0 ? `${size.stock.toLocaleString()} in stock` : 'Out of stock' }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Quantity Selection -->
            <div class="mb-6">
              <label class="text-sm font-medium text-gray-700 block mb-2">Quantity</label>
              <div class="flex items-center gap-3">
                <button
                  @click="updateQuantity(-500)"
                  :disabled="quantity <= (product.minOrder || 500)"
                  class="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                  </svg>
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  @change="validateQuantity"
                  :min="product.minOrder || 500"
                  :max="selectedSize?.stock || 0"
                  step="500"
                  class="w-32 text-center py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  @click="updateQuantity(500)"
                  :disabled="selectedSize && quantity >= selectedSize.stock"
                  class="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/><path d="M12 5v14"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">
                Min: {{ product.minOrder?.toLocaleString() }} pcs · Multiples of 500
                <span v-if="selectedSize?.stock > 0"> · Max: {{ selectedSize.stock?.toLocaleString() }} pcs</span>
              </p>
            </div>

            <!-- Price Summary -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Unit Price</span>
                <span class="font-medium">₱{{ getUnitPrice().toLocaleString() }}/pc</span>
              </div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Quantity</span>
                <span class="font-medium">{{ quantity.toLocaleString() }} pcs</span>
              </div>
              <div class="border-t pt-2 mt-2">
                <div class="flex justify-between">
                  <span class="font-semibold text-gray-900">Total Price</span>
                  <span class="text-xl font-bold text-blue-600">₱{{ getTotalPrice().toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                @click="addToCart"
                :disabled="!selectedSize || selectedSize.stock === 0"
                class="flex-1 py-3 rounded-xl font-semibold transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                @click="orderNow"
                :disabled="!selectedSize || selectedSize.stock === 0"
                class="flex-1 py-3 rounded-xl font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Order Now
              </button>
            </div>

            <!-- Product Description -->
            <div class="mt-6 pt-6 border-t">
              <h3 class="font-semibold text-gray-900 mb-2">Product Description</h3>
              <p class="text-sm text-gray-600">{{ product.description || 'No description available.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-4">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-gray-500">Product not found</p>
        <button @click="router.push('/customer/dashboard')" class="mt-4 text-blue-600 hover:underline">Return to Shop</button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi } from '@/api'

const route = useRoute()
const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const product = ref(null)
const selectedSize = ref(null)
const quantity = ref(500)
const loading = ref(true)
const toast = ref({ show: false, message: '' })

// Computed image URL with proper handling
const productImageUrl = computed(() => {
  if (!product.value?.image) return `${API_BASE_URL}/uploads/products/default-product.jpg`
  
  const imagePath = product.value.image
  
  // If it's already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Remove leading slashes
  let cleanPath = imagePath.replace(/^\/+/, '')
  
  // Handle different path formats
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  if (cleanPath.startsWith('products/')) {
    return `${API_BASE_URL}/uploads/${cleanPath}`
  }
  
  // Default: assume it's a filename in products folder
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
})

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function handleImageError(e) {
  console.error('Image failed to load:', e.target.src)
  e.target.src = `${API_BASE_URL}/uploads/products/default-product.jpg`
  e.target.onerror = () => {
    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
  }
}

function getUnitPrice() {
  if (!selectedSize.value || !quantity.value) return 0
  
  let unitPrice = selectedSize.value.price
  const qty = quantity.value
  
  if (qty >= 5000 && selectedSize.value.bulkPrices?.[5000]) {
    unitPrice = selectedSize.value.bulkPrices[5000] / 5000
  } else if (qty >= 2000 && selectedSize.value.bulkPrices?.[2000]) {
    unitPrice = selectedSize.value.bulkPrices[2000] / 2000
  } else if (qty >= 1000 && selectedSize.value.bulkPrices?.[1000]) {
    unitPrice = selectedSize.value.bulkPrices[1000] / 1000
  } else if (qty >= 500 && selectedSize.value.bulkPrices?.[500]) {
    unitPrice = selectedSize.value.bulkPrices[500] / 500
  }
  
  return unitPrice
}

function getTotalPrice() {
  return getUnitPrice() * quantity.value
}

function updateQuantity(delta) {
  const newQty = quantity.value + delta
  const min = product.value?.minOrder || 500
  const max = selectedSize.value?.stock || 0
  
  if (newQty >= min && (max === 0 || newQty <= max)) {
    quantity.value = newQty
  }
}

function validateQuantity() {
  const min = product.value?.minOrder || 500
  const max = selectedSize.value?.stock || 0
  
  if (quantity.value < min) quantity.value = min
  if (max > 0 && quantity.value > max) quantity.value = max
  if (quantity.value % 500 !== 0) {
    quantity.value = Math.round(quantity.value / 500) * 500
  }
}

function addToCart() {
  if (!selectedSize.value) {
    showToast('Please select a size')
    return
  }
  
  if (selectedSize.value.stock === 0) {
    showToast('This size is out of stock')
    return
  }
  
  const cart = JSON.parse(localStorage.getItem('customerCart') || '[]')
  
  // Log what we're saving
  console.log('Adding to cart:', {
    productId: product.value.id,
    name: product.value.name,
    size: selectedSize.value.name,
    quantity: quantity.value
  })
  
  // Calculate the price with bulk discount
  let unitPrice = selectedSize.value.price
  const qty = quantity.value
  
  if (qty >= 5000 && selectedSize.value.bulkPrices?.[5000]) {
    unitPrice = selectedSize.value.bulkPrices[5000] / 5000
  } else if (qty >= 2000 && selectedSize.value.bulkPrices?.[2000]) {
    unitPrice = selectedSize.value.bulkPrices[2000] / 2000
  } else if (qty >= 1000 && selectedSize.value.bulkPrices?.[1000]) {
    unitPrice = selectedSize.value.bulkPrices[1000] / 1000
  } else if (qty >= 500 && selectedSize.value.bulkPrices?.[500]) {
    unitPrice = selectedSize.value.bulkPrices[500] / 500
  }
  
  const estimatedTotal = unitPrice * quantity.value
  
  const existingItemIndex = cart.findIndex(
    item => item.productId === product.value.id && item.size === selectedSize.value.name
  )
  
  const cartItem = {
    productId: product.value.id,
    name: product.value.name,
    image: product.value.image,
    category: product.value.category,
    size: selectedSize.value.name,  // This is the key field
    quantity: quantity.value,
    printPlacement: '',
    printSize: '',
    designNotes: '',
    estimatedTotal: estimatedTotal,
    sizes: product.value.sizes,
    minOrder: product.value.minOrder,
    unitPrice: unitPrice
  }
  
  if (existingItemIndex !== -1) {
    cart[existingItemIndex] = cartItem
  } else {
    cart.push(cartItem)
  }
  
  localStorage.setItem('customerCart', JSON.stringify(cart))
  
  // Verify saved cart
  const savedCart = JSON.parse(localStorage.getItem('customerCart') || '[]')
  console.log('Cart after save:', savedCart)
  
  showToast(`${product.value.name} (${selectedSize.value.name}) added to cart!`)
}

function orderNow() {
  const token = localStorage.getItem('customerToken')
  if (!token) {
    showToast('Please login to place an order')
    setTimeout(() => router.push('/customer/login'), 1500)
    return
  }
  
  // Pass both product ID and selected size/quantity
  router.push(`/customer/orders/create?type=company-product&productId=${product.value.id}&size=${selectedSize.value?.name || ''}&quantity=${quantity.value}`)
}

onMounted(async () => {
  const productId = route.params.id
  console.log('Product ID from route:', productId)
  
  if (productId) {
    try {
      const response = await productsApi.getProductById(productId)
      console.log('API Response:', response)
      
      if (response.success && response.data) {
        product.value = response.data
        console.log('Product loaded:', product.value)
        console.log('Product image path:', product.value.image)
        console.log('Computed image URL:', productImageUrl.value)
        
        // Select first size with stock, or first size overall
        selectedSize.value = product.value.sizes?.find(s => s.stock > 0) || product.value.sizes?.[0]
        quantity.value = product.value.minOrder || 500
      } else {
        console.error('Failed to load product:', response.message)
        showToast('Failed to load product details')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      showToast('Error loading product details')
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>