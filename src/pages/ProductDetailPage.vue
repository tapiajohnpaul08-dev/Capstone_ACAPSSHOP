<!-- src/views/customer/ProductDetailPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Back Button -->
      <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft class="w-5 h-5" />
        Back to Products
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-gray-500 mt-2">Loading product details...</p>
      </div>

      <!-- Product Detail -->
      <div v-else-if="product" class="flex flex-col lg:flex-row gap-8">
        <!-- Product Image -->
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
                  <div class="text-xs" :class="size.stock > 500 ? 'text-green-600' : 'text-red-500'">
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
                  <Minus class="w-4 h-4" />
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
                  <Plus class="w-4 h-4" />
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
            <div v-if="checkToken()" class="flex gap-3">
              <button
                @click="addToCart"
                :disabled="!selectedSize || selectedSize.stock < product.minOrder"
                class="flex-1 py-3 rounded-xl font-semibold transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart class="w-4 h-4 inline mr-2" />
                Add to Cart
              </button>
              <button
                @click="orderNow"
                :disabled="!selectedSize || selectedSize.stock < product.minOrder"
                class="flex-1 py-3 rounded-xl font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Order Now
              </button>
            </div>

            <div v-else class="flex flex-col gap-3">
              <!-- Add to Cart Button -->
            <button 
              @click="addToCart"
              class="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!selectedSize || selectedSize.stock < product.minOrder"
            >
              Add to Cart
            </button>

            <!-- Login prompt -->
            <p class="text-xs text-gray-400 text-center mt-2">
              Need an account? <router-link to="/customer/signup" class="text-blue-600 hover:underline">Sign up</router-link> or 
              <router-link to="/customer/login" class="text-blue-600 hover:underline">log in</router-link>
            </p>
            </div>

            <!-- Product Description -->
            <div class="mt-6 pt-6 border-t">
              <h3 class="font-semibold text-gray-900 mb-2">Product Description</h3>
              <p class="text-sm text-gray-600">{{ product.description || 'No description available.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ FEEDBACK SECTION - Displayed below product -->
      <div v-if="product && !loading" class="mt-8">
        <div class="bg-white rounded-2xl border overflow-hidden">
          <!-- Feedback Header -->
          <div class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MessageSquare class="w-5 h-5 text-blue-600" />
              <h3 class="font-semibold text-gray-900">Customer Reviews</h3>
              <span v-if="feedbackStats.totalReviews > 0" class="text-sm text-gray-500">
                ({{ feedbackStats.totalReviews }} reviews)
              </span>
            </div>
            <div v-if="feedbackStats.totalReviews > 0" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="w-4 h-4"
                  :class="star <= Math.round(feedbackStats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                />
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ feedbackStats.averageRating.toFixed(1) }}</span>
            </div>
          </div>

          <!-- Loading Feedbacks -->
          <div v-if="feedbackLoading" class="p-6 text-center">
            <Loader2 class="w-6 h-6 mx-auto text-blue-600 animate-spin" />
            <p class="text-gray-500 mt-2 text-sm">Loading reviews...</p>
          </div>

          <!-- No Feedbacks -->
          <div v-else-if="feedbacks.length === 0" class="p-6 text-center">
            <MessageSquare class="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p class="text-gray-500 text-sm">No reviews yet for this product.</p>
            <p class="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
          </div>

          <!-- Feedbacks List -->
          <div v-else class="divide-y">
            <div 
              v-for="feedback in feedbacks" 
              :key="feedback.feedbackId || feedback._id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <!-- Feedback Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {{ (feedback.customerName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-sm text-gray-900">{{ feedback.customerName || 'Anonymous' }}</p>
                      <div class="flex items-center gap-2">
                        <div class="flex gap-0.5">
                          <Star 
                            v-for="star in 5" 
                            :key="star" 
                            class="w-3.5 h-3.5"
                            :class="star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                          />
                        </div>
                        <span class="text-xs text-gray-400">{{ formatDate(feedback.submittedAt || feedback.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span v-if="feedback.isVerified" class="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle class="w-3 h-3" /> Verified Purchase
                </span>
              </div>

              <!-- Feedback Content -->
              <div class="ml-10 mt-2">
                <p v-if="feedback.title" class="text-sm font-medium text-gray-800">{{ feedback.title }}</p>
                <p class="text-sm text-gray-600 mt-0.5">{{ feedback.comment }}</p>

                <!-- Pros -->
                <div v-if="feedback.pros && feedback.pros.length > 0" class="mt-2">
                  <p class="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ThumbsUp class="w-3 h-3 text-green-600" /> What they liked:
                  </p>
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span v-for="(pro, idx) in feedback.pros" :key="idx" class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      {{ pro }}
                    </span>
                  </div>
                </div>

                <!-- Cons -->
                <div v-if="feedback.cons && feedback.cons.length > 0" class="mt-2">
                  <p class="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ThumbsDown class="w-3 h-3 text-red-600" /> What could be improved:
                  </p>
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span v-for="(con, idx) in feedback.cons" :key="idx" class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                      {{ con }}
                    </span>
                  </div>
                </div>

                <!-- Helpful Button -->
                <button 
                  @click="markHelpful(feedback.feedbackId || feedback._id)"
                  class="mt-2 text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <ThumbsUp class="w-3 h-3" />
                  Helpful ({{ feedback.helpfulCount || 0 }})
                </button>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="feedbacks.length > 0 && feedbackPagination.hasMore" class="px-6 py-3 border-t bg-gray-50 text-center">
            <button 
              @click="loadMoreFeedbacks"
              :disabled="feedbackLoadingMore"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              <span v-if="feedbackLoadingMore" class="inline-flex items-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin" /> Loading more...
              </span>
              <span v-else>Load More Reviews</span>
            </button>
          </div>

          <!-- Rating Summary -->
          <div v-if="feedbackStats.totalReviews > 0" class="px-6 py-3 border-t bg-gray-50 flex flex-wrap items-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500">Average Rating:</span>
              <span class="font-semibold text-gray-900">{{ feedbackStats.averageRating.toFixed(1) }}</span>
              <div class="flex gap-0.5">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="w-3.5 h-3.5"
                  :class="star <= Math.round(feedbackStats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                />
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-500">Distribution:</span>
              <div v-for="rating in [5,4,3,2,1]" :key="rating" class="flex items-center gap-1">
                <span class="text-xs text-gray-500">{{ rating }}★</span>
                <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-yellow-400 rounded-full"
                    :style="{ width: getPercentage(rating) + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-400">{{ feedbackStats.distribution?.[rating] || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-16">
        <Package class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500">Product not found</p>
        <button @click="router.push('/customer/dashboard')" class="mt-4 text-blue-600 hover:underline">Return to Shop</button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2">
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4 text-green-400" />
          <AlertCircle v-else class="w-4 h-4 text-red-400" />
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi, feedBackApi } from '@/api'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Package
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Product State ──────────────────────────────────────────────────────
const product = ref(null)
const selectedSize = ref(null)
const quantity = ref(500)
const loading = ref(true)
const toast = ref({ show: false, message: '', type: 'success' })

// ─── Feedback State ──────────────────────────────────────────────────────
const feedbacks = ref([])
const feedbackStats = ref({
  totalReviews: 0,
  averageRating: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
})
const feedbackLoading = ref(false)
const feedbackLoadingMore = ref(false)
const feedbackPagination = ref({
  page: 1,
  limit: 5,
  hasMore: true,
  total: 0
})




// Computed image URL
const productImageUrl = computed(() => {
  if (!product.value?.image) return `${API_BASE_URL}/uploads/products/default-product.jpg`
  
  const imagePath = product.value.image
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  let cleanPath = imagePath.replace(/^\/+/, '')
  
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  if (cleanPath.startsWith('products/')) {
    return `${API_BASE_URL}/uploads/${cleanPath}`
  }
  
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function checkToken() {
  const token = localStorage.getItem('customerToken')
  if (!token) {
    // showToast('Please login to continue', 'error')
    // setTimeout(() => router.push('/customer/login'), 1500)
    return false
  }
  return true
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
  // ... existing addToCart logic ...
  if (!selectedSize.value) {
    showToast('Please select a size', 'error')
    return
  }
  
  if (selectedSize.value.stock === 0) {
    showToast('This size is out of stock', 'error')
    return
  }
  
  const cart = JSON.parse(localStorage.getItem('customerCart') || '[]')
  
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
    size: selectedSize.value.name,
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
  showToast(`${product.value.name} (${selectedSize.value.name}) added to cart!`, 'success')
}

function orderNow() {
  // ... existing orderNow logic ...
  const token = localStorage.getItem('customerToken')
  if (!token) {
    showToast('Please login to place an order', 'error')
    setTimeout(() => router.push('/customer/login'), 1500)
    return
  }
  
  if (!selectedSize.value) {
    showToast('Please select a size', 'error')
    return
  }
  
  router.push({
    path: '/customer/orders/create',
    query: {
      type: 'company-product',
      source: 'product-detail',
      productId: product.value.id,
      productName: product.value.name,
      productImage: product.value.image || '',
      productCategory: product.value.category || '',
      minOrder: product.value.minOrder || 500,
      size: selectedSize.value.name || selectedSize.value,
      sizePrice: selectedSize.value.price || '',
      sizeStock: selectedSize.value.stock || '',
      quantity: quantity.value,
      productData: JSON.stringify({
        id: product.value.id,
        name: product.value.name,
        image: product.value.image,
        category: product.value.category,
        minOrder: product.value.minOrder,
        sizes: product.value.sizes,
        description: product.value.description || ''
      })
    }
  })
}

// ─── FEEDBACK FUNCTIONS ──────────────────────────────────────────────

async function loadProductFeedbacks(productId, page = 1, limit = 5) {
  if (!productId) return
  
  try {
    const response = await feedBackApi.getProductFeedback(productId, limit, page)
    
    if (response.success && response.data) {
      if (page === 1) {
        feedbacks.value = response.data
      } else {
        feedbacks.value = [...feedbacks.value, ...response.data]
      }
      
      feedbackPagination.value = {
        page: page,
        limit: limit,
        hasMore: response.pagination ? page < response.pagination.pages : false,
        total: response.pagination?.total || 0
      }
    }
  } catch (error) {
    console.error('Error loading product feedbacks:', error)
  }
}

async function loadFeedbackStats(productId) {
  if (!productId) return
  
  try {
    const response = await feedBackApi.getProductFeedbackStats(productId)
    
    if (response.success && response.data) {
      feedbackStats.value = {
        totalReviews: response.data.totalReviews || 0,
        averageRating: response.data.averageRating || 0,
        distribution: response.data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }
  } catch (error) {
    console.error('Error loading feedback stats:', error)
  }
}

async function loadMoreFeedbacks() {
  if (feedbackLoadingMore.value || !feedbackPagination.value.hasMore) return
  
  feedbackLoadingMore.value = true
  const nextPage = feedbackPagination.value.page + 1
  
  await loadProductFeedbacks(product.value.id, nextPage, feedbackPagination.value.limit)
  feedbackLoadingMore.value = false
}

async function markHelpful(feedbackId) {
  try {
    const response = await feedBackApi.markHelpful(feedbackId)
    
    if (response.success) {
      // Update local feedback count
      const feedback = feedbacks.value.find(f => (f.feedbackId || f._id) === feedbackId)
      if (feedback) {
        feedback.helpfulCount = (feedback.helpfulCount || 0) + 1
      }
      showToast('Thanks for your feedback!', 'success')
    }
  } catch (error) {
    console.error('Error marking helpful:', error)
  }
}

function getPercentage(rating) {
  const total = feedbackStats.value.totalReviews || 0
  if (total === 0) return 0
  const count = feedbackStats.value.distribution?.[rating] || 0
  return Math.round((count / total) * 100)
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

// ─── LIFECYCLE ─────────────────────────────────────────────────────────

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
        
        // ✅ Load feedbacks
        feedbackLoading.value = true
        await Promise.all([
          loadProductFeedbacks(product.value.id, 1, 5),
          loadFeedbackStats(product.value.id)
        ])
        feedbackLoading.value = false
      } else {
        console.error('Failed to load product:', response.message)
        showToast('Failed to load product details', 'error')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      showToast('Error loading product details', 'error')
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