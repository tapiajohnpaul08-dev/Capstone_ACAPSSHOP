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
        <div class="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
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

      <!-- Products Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md group"
          :class="product.inStock ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'"
        >
          <!-- Image -->
          <div class="relative">
            <img :src="product.image" :alt="product.name" class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute top-2 left-2 flex flex-col gap-1">
              <span v-if="product.featured" class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white leading-tight">Featured</span>
              <span v-if="product.popular" class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-600 text-white leading-tight">Popular</span>
            </div>
            <span
              class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight"
              :class="product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
            </span>
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
            <!-- Buttons -->
            <div class="mt-2 flex gap-1.5">
              <button
                @click.stop="product.inStock && openAddToCart(product)"
                class="flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                :disabled="!product.inStock"
              >
                Add to Cart
              </button>
              <button
                class="flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors"
                :class="product.inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400'"
                :disabled="!product.inStock"
                @click.stop="product.inStock && orderCompanyProduct(product)"
              >
                {{ product.inStock ? 'Order Now' : 'Out of Stock' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredProducts.length === 0" class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <p class="text-gray-400 text-sm">No products found.</p>
        <button @click="searchQuery = ''; selectedCategory = 'all'" class="mt-2 text-xs text-blue-600 hover:underline">Clear filters</button>
      </div>
    </div>

    <!-- Add to Cart Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showAddToCartModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="closeModal"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-blue-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img :src="modalProduct?.image" :alt="modalProduct?.name" class="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ modalProduct?.name }}</h3>
                  <p class="text-xs text-gray-400">{{ modalProduct?.category }}</p>
                </div>
              </div>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <!-- Size selector -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Size <span class="text-red-500">*</span></label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="size in modalProduct?.sizes"
                    :key="size.name"
                    @click="modalForm.size = size.name"
                    class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
                    :class="modalForm.size === size.name
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
                  >
                    {{ size.name }}
                    <span class="ml-1 opacity-75">₱{{ size.price.toFixed(2) }}/pc</span>
                  </button>
                </div>
                <p v-if="modalErrors.size" class="mt-1 text-xs text-red-500">{{ modalErrors.size }}</p>
              </div>

              <!-- Quantity -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                  Quantity <span class="text-red-500">*</span>
                  <span class="font-normal text-gray-400 ml-1">(min {{ modalProduct?.minOrder }} pcs)</span>
                </label>
                <div class="flex items-center gap-2">
                  <button
                    @click="adjustQty(-500)"
                    class="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                    :disabled="modalForm.quantity <= (modalProduct?.minOrder || 500)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
                  </button>
                  <input
                    v-model.number="modalForm.quantity"
                    type="number"
                    :min="modalProduct?.minOrder"
                    step="500"
                    class="flex-1 text-center border border-gray-300 rounded-lg py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    @click="adjustQty(500)"
                    class="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
                <p v-if="modalErrors.quantity" class="mt-1 text-xs text-red-500">{{ modalErrors.quantity }}</p>
              </div>

              <!-- Print placement -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Print Placement</label>
                <select
                  v-model="modalForm.printPlacement"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select placement...</option>
                  <option value="full-wrap">Full Wrap</option>
                  <option value="front-only">Front Only</option>
                  <option value="back-only">Back Only</option>
                  <option value="front-back">Front & Back</option>
                </select>
              </div>

              <!-- Price estimate -->
              <div v-if="modalForm.size && modalForm.quantity >= (modalProduct?.minOrder || 500)" class="bg-blue-50 rounded-xl p-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">Estimated Total</span>
                  <span class="text-lg font-bold text-blue-700">{{ estimatedTotal }}</span>
                </div>
                <p class="text-[11px] text-gray-400">Based on {{ modalForm.quantity.toLocaleString() }} pcs × {{ modalForm.size }}</p>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                @click="closeModal"
                class="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >Cancel</button>
              <button
                @click="confirmAddToCart"
                class="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

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
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.size }} · {{ item.quantity.toLocaleString() }} pcs</p>
                  <p v-if="item.printPlacement" class="text-xs text-gray-400 capitalize">{{ item.printPlacement.replace('-', ' ') }}</p>
                  <p class="text-sm font-bold text-blue-600 mt-0.5">{{ item.estimatedTotal }}</p>
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
                @click="cart = []"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { products, getPriceForQuantity } from '@/data/catalogData'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('all')
const showAddToCartModal = ref(false)
const showCart = ref(false)
const modalProduct = ref(null)
const cart = ref([])
const toast = ref({ show: false, message: '' })

const modalForm = ref({ size: '', quantity: 500, printPlacement: '', designNotes: '' })
const modalErrors = ref({ size: '', quantity: '' })

const howItWorks = [
  { number: 1, title: 'Place Your Order', description: 'Pick a product or bring your own cups, upload your design.' },
  { number: 2, title: 'Design Review', description: 'Our team reviews and contacts you for approval.' },
  { number: 3, title: 'Production & Delivery', description: 'We print and deliver or you pick up.' }
]

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Cups', label: 'Cups' },
  { value: 'Paper Cups', label: 'Paper Cups' },
]

const cartCount = computed(() => cart.value.length)

const filteredProducts = computed(() => {
  let list = [...products]
  if (selectedCategory.value !== 'all') {
    list = list.filter(p => p.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subcategory?.toLowerCase().includes(q))
  }
  return list
})

const estimatedTotal = computed(() => {
  if (!modalProduct.value || !modalForm.value.size || !modalForm.value.quantity) return null
  const total = getPriceForQuantity(modalProduct.value, modalForm.value.size, modalForm.value.quantity)
  if (!total) return null
  return `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
})

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

function openAddToCart(product) {
  modalProduct.value = product
  modalForm.value = {
    size: product.sizes[0]?.name || '',
    quantity: product.minOrder,
    printPlacement: '',
    designNotes: ''
  }
  modalErrors.value = { size: '', quantity: '' }
  showAddToCartModal.value = true
}

function closeModal() {
  showAddToCartModal.value = false
  modalProduct.value = null
}

function adjustQty(delta) {
  const min = modalProduct.value?.minOrder || 500
  modalForm.value.quantity = Math.max(min, (modalForm.value.quantity || min) + delta)
}

function confirmAddToCart() {
  modalErrors.value = { size: '', quantity: '' }
  let valid = true

  if (!modalForm.value.size) {
    modalErrors.value.size = 'Please select a size.'
    valid = false
  }
  const min = modalProduct.value?.minOrder || 500
  if (!modalForm.value.quantity || modalForm.value.quantity < min) {
    modalErrors.value.quantity = `Minimum order is ${min} pcs.`
    valid = false
  }
  if (!valid) return

  cart.value.push({
    productId: modalProduct.value.id,
    name: modalProduct.value.name,
    image: modalProduct.value.image,
    category: modalProduct.value.category,
    size: modalForm.value.size,
    quantity: modalForm.value.quantity,
    printPlacement: modalForm.value.printPlacement,
    designNotes: modalForm.value.designNotes,
    estimatedTotal: estimatedTotal.value,
  })

  closeModal()
  showToast(`${modalProduct.value?.name} added to cart!`)
}

function removeFromCart(idx) {
  cart.value.splice(idx, 1)
}

function openCart() {
  showCart.value = true
}

function proceedToOrder() {
  sessionStorage.setItem('pendingCart', JSON.stringify(cart.value))
  showCart.value = false
  router.push('/customer/orders/create?type=company-product&source=cart')
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function createOwnCupsOrder() {
  router.push('/customer/orders/create?type=own-cups')
}

function orderCompanyProduct(product) {
  router.push(`/customer/orders/create?type=company-product&productId=${product.id}`)
}
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