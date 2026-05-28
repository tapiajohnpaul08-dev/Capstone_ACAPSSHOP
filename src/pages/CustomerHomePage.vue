<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Banner -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Custom Printing Services</h1>
            <p class="text-gray-500 mt-1">Cups, tumblers, lighters — printed with your brand.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <!-- Cart button -->
            <button
              @click="openCart"
              class="relative inline-flex items-center gap-2 px-5 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              Cart
              <span
                v-if="cartCount > 0"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >{{ cartCount }}</span>
            </button>
            <!-- Primary CTA: own cups order -->
            <button
              @click="createOwnCupsOrder"
              class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Create Order (I'll Provide My Items)
            </button>
          </div>
        </div>

        <!-- How it works — compact row -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
          <div v-for="step in howItWorks" :key="step.number" class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">{{ step.number }}</div>
            <div>
              <div class="text-sm font-semibold text-gray-800">{{ step.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5 leading-snug">{{ step.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Section -->
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Section Header + Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Our Products</h2>
          <p class="text-sm text-gray-500 mt-0.5">Browse and order — we supply the product and print your design.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Category tabs -->
          <div class="flex gap-1 bg-white border rounded-lg p-1">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectedCategory = cat.value"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="selectedCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Search -->
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-36"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-gray-500 mt-2">Loading products...</p>
      </div>

      <!-- Products Grid -->
<div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  <div
    v-for="product in filteredProducts"
  :key="product.id"
  @click="goToProductDetail(product)"
  class="bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer group"
>
    <!-- Image -->
    <div class="relative">
      <img 
        :src="getImageUrl(product.image)" 
        :alt="product.name" 
        class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" 
        @error="handleImageError"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gray-100 animate-pulse -z-10"></div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <div class="text-xs text-gray-400 mb-0.5">{{ product.category }}</div>
      <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{{ product.name }}</h3>
      <div class="text-xs text-gray-500 mt-1">{{ getSizeOptions(product) }}</div>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-sm font-bold text-blue-600">{{ formatPrice(product) }}</span>
        <span class="text-[10px] text-gray-400">min {{ product.minOrder }}pcs</span>
      </div>
    </div>
  </div>
</div>

<!-- Remove the buttons - remove this part -->
<!-- The buttons are removed, now clicking the whole card navigates to detail page -->



      <!-- Empty state -->
      <div v-if="!loading && filteredProducts.length === 0" class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <p class="text-gray-400 text-sm">No products found.</p>
        <button @click="searchQuery = ''; selectedCategory = 'all'" class="mt-2 text-xs text-blue-600 hover:underline">Clear filters</button>
      </div>
    </div>

    <!-- Cart Drawer -->
    <Teleport to="body">
      <transition name="drawer">
        <div v-if="showCart" class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/40" @click="showCart = false"></div>
          <div class="relative bg-white w-full max-w-sm shadow-2xl flex flex-col h-full">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="text-base font-bold text-gray-900">
                Cart
                <span class="ml-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{{ cartCount }} item{{ cartCount !== 1 ? 's' : '' }}</span>
              </h3>
              <button @click="showCart = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-300 mb-3">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                <p class="text-sm text-gray-400">Your cart is empty.</p>
              </div>

              <div
                v-for="(item, idx) in cart"
                :key="idx"
                class="flex gap-3 bg-gray-50 rounded-xl p-3"
              >
                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                  <img :src="getImageUrl(item.image)" :alt="item.name" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.size }} · {{ item.quantity.toLocaleString() }} pcs</p>
                  <p v-if="item.printSize" class="text-xs text-gray-400">Print: {{ item.printSize }}</p>
                  <p v-if="item.printPlacement" class="text-xs text-gray-400 capitalize">{{ item.printPlacement.replace('-', ' ') }}</p>
                  <p class="text-sm font-bold text-blue-600 mt-0.5">{{ formatPriceAmount(item.estimatedTotal) }}</p>
                </div>
                <button @click="removeFromCart(idx)" class="text-gray-300 hover:text-red-500 transition-colors self-start mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="cart.length > 0" class="px-5 py-4 border-t border-gray-100 space-y-3">
              <button
                @click="proceedToOrder"
                class="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Proceed to Order
              </button>
              <button
                @click="clearCart"
                class="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >Clear cart</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-green-400">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsApi, ordersApi } from '@/api'

const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'


// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const showCart = ref(false)
const cart = ref([])
const toast = ref({ show: false, message: '' })
const products = ref([])
const loading = ref(true)

const howItWorks = [
  { number: 1, title: 'Place Your Order', description: 'Pick a product or bring your own cups, upload your design.' },
  { number: 2, title: 'Design Review', description: 'Our team reviews and contacts you for approval.' },
  { number: 3, title: 'Production & Delivery', description: 'We print and deliver or you pick up.' }
]

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Plastic Cups', label: 'Plastic Cups' },
  { value: 'Paper Cups', label: 'Paper Cups' },
]

// Computed
const cartCount = computed(() => cart.value.length)

const filteredProducts = computed(() => {
  let list = [...products.value]
  if (selectedCategory.value !== 'all') {
    list = list.filter(p => p.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  }
  return list
})

// Methods
function getImageUrl(imagePath) {
  if (!imagePath) {
    return `${API_BASE_URL}/uploads/products/default-product.jpg`
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Clean the path - remove any leading slashes and ensure proper format
  let cleanPath = imagePath.replace(/^\/+/, '') // Remove leading slashes
  
  // If the path already starts with 'uploads/', use it directly
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  
  // If the path starts with 'products/' (from multer destination)
  if (cleanPath.startsWith('products/')) {
    return `${API_BASE_URL}/uploads/${cleanPath}`
  }
  
  // Default: assume it's just a filename in the products folder
  // Your multer saves to 'uploads/products/' with filename like 'product-123456789-123456789.jpg'
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  console.error('Image failed to load:', event.target.src)
  // Set a fallback image
  event.target.src = `${API_BASE_URL}/uploads/products/default-product.jpg`
  // If even default fails, use a placeholder
  event.target.onerror = () => {
    event.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
  }
}

function getSizeOptions(product) {
  if (!product.sizes || product.sizes.length === 0) return 'Standard size'
  const sizeNames = product.sizes.map(s => s.name).join(', ')
  return sizeNames
}

function formatPrice(product) {
  if (!product.sizes || product.sizes.length === 0) return 'Contact for price'
  let minPrice = Infinity
  let maxPrice = -Infinity
  product.sizes.forEach(size => {
    const price = size.price
    if (price < minPrice) minPrice = price
    if (price > maxPrice) maxPrice = price
  })
  if (minPrice === Infinity) return 'Contact for price'
  if (minPrice === maxPrice) return `₱${minPrice.toFixed(2)}`
  return `₱${minPrice.toFixed(2)} – ₱${maxPrice.toFixed(2)}`
}

function formatPriceAmount(amount) {
  if (!amount) return ''
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

async function addToCart(product) {
  // Find the first size that has stock
  const availableSize = product.sizes?.find(s => s.stock > 0);
  
  if (!availableSize) {
    showToast(`${product.name} is out of stock!`);
    return;
  }
  
  const defaultSize = availableSize.name;
  
  // Calculate estimated price
  let estimatedTotal = null;
  if (defaultSize && product.minOrder) {
    const priceResult = await productsApi.calculatePrice(product.id, defaultSize, product.minOrder);
    if (priceResult.success && priceResult.data) {
      estimatedTotal = priceResult.data.total;
    }
  }
  
  cart.value.push({
    productId: product.id,
    name: product.name,
    image: product.image,
    category: product.category,
    size: defaultSize,
    quantity: product.minOrder || 500,
    printPlacement: '',
    printSize: '',
    designNotes: '',
    estimatedTotal: estimatedTotal,
    sizes: product.sizes || [],
    minOrder: product.minOrder || 500
  });
  
  saveCartToLocalStorage();
  showToast(`${product.name} (${defaultSize}) added to cart!`);
}

// Add this function
function goToProductDetail(product) {
  router.push(`/customer/product/${product.id}`)
}

function removeFromCart(idx) {
  cart.value.splice(idx, 1)
  saveCartToLocalStorage()
}

function clearCart() {
  cart.value = []
  saveCartToLocalStorage()
  showToast('Cart cleared')
}

function saveCartToLocalStorage() {
  localStorage.setItem('customerCart', JSON.stringify(cart.value))
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('customerCart')
  if (savedCart) {
    cart.value = JSON.parse(savedCart)
  }
}

function openCart() {
  showCart.value = true
}

async function proceedToOrder() {
  // Check if user is logged in
  const token = localStorage.getItem('customerToken')
  if (!token) {
    showToast('Please login to proceed with your order')
    setTimeout(() => {
      router.push('/customer/login')
    }, 1500)
    return
  }
  
  // Enrich cart items with all required fields including design info
  const enrichedCart = cart.value.map(item => ({
    productId: item.productId,
    name: item.name,
    image: item.image,
    category: item.category,
    size: item.size,
    quantity: item.quantity,
    printPlacement: item.printPlacement || '',
    printSize: item.printSize || '',
    designNotes: item.designNotes || '',
    designSource: item.designSource || 'upload',
    files: item.files || [],
    selectedTemplateId: item.selectedTemplateId || null,
    selectedTemplate: item.selectedTemplate || null,
    estimatedTotal: item.estimatedTotal
    
  }))
  
  console.log('Saving enriched cart to session:', enrichedCart)
  sessionStorage.setItem('pendingCart', JSON.stringify(enrichedCart))
  showCart.value = false
  router.push('/customer/orders/create?type=company-product&source=cart')
}
function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function createOwnCupsOrder() {
  const token = localStorage.getItem('customerToken')
  if (!token) {
    showToast('Please login to create an order')
    setTimeout(() => {
      router.push('/customer/login')
    }, 1500)
    return
  }
  router.push('/customer/orders/create?type=own-cups')
}

function orderCompanyProduct(product) {
  const token = localStorage.getItem('customerToken')
  if (!token) {
    showToast('Please login to place an order')
    setTimeout(() => {
      router.push('/customer/login')
    }, 1500)
    return
  }
  router.push(`/customer/orders/create?type=company-product&productId=${product.id}`)
}

// Load products from backend
async function loadProducts() {
  loading.value = true
  try {
    const response = await productsApi.getAllProducts()
    console.log('Products response:', response) // Debug log
    
    if (response.success && response.data) {
      products.value = response.data
      // Debug: log first product's image path
      if (response.data.length > 0) {
        console.log('First product image path:', response.data[0].image)
        console.log('Full image URL:', getImageUrl(response.data[0].image))
      }
    } else {
      console.error('Failed to load products:', response.message)
      showToast('Failed to load products')
    }
  } catch (error) {
    console.error('Error loading products:', error)
    showToast('Error loading products')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadProducts()
  loadCartFromLocalStorage()
})
</script>

<style scoped>
/* Modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: scale(0.95); }

/* Drawer */
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active > div:last-child, .drawer-leave-active > div:last-child { transition: transform 0.25s ease; }
.drawer-enter-from > div:last-child, .drawer-leave-to > div:last-child { transform: translateX(100%); }

/* Toast */
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>