<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Back button + header -->
    <div class="mb-6">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back
      </button>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1 text-sm">
            <span v-if="orderType === 'own-cups'">You'll provide your own cups for printing.</span>
            <span v-else-if="isCartOrder"
              >You're ordering {{ cartItems.length }} product(s) from your cart.</span
            >
            <span v-else>Ordering from our product catalog — we supply & print.</span>
          </p>
        </div>
        <span
          class="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 mt-1"
          :class="
            orderType === 'own-cups' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          "
        >
          {{ orderType === 'own-cups' ? '📦 Own Cups' : '🛒 Multi-Item Order' }}
        </span>
      </div>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      <div v-for="(step, i) in steps" :key="step.key" class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
            :class="
              currentStep > i
                ? 'bg-blue-600 text-white'
                : currentStep === i
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
            "
          >
            <svg
              v-if="currentStep > i"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium hidden sm:block"
            :class="
              currentStep === i
                ? 'text-blue-600'
                : currentStep > i
                  ? 'text-gray-500'
                  : 'text-gray-400'
            "
            >{{ step.label }}</span
          >
        </div>
        <div v-if="i < steps.length - 1" class="w-8 h-px bg-gray-200 shrink-0"></div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main form area -->
      <div class="flex-1 space-y-5">
        <!-- Step 0: Multi-Product Details (Cart Items) -->
        <transition name="fade">
          <div v-if="currentStep === 0 && isCartOrder" class="space-y-4" key="cart-items">
            <div class="bg-white rounded-xl border">
              <div class="px-6 pt-6 pb-4 border-b">
                <h4 class="font-semibold text-gray-900">Cart Items ({{ cartItems.length }})</h4>
                <p class="text-xs text-gray-500 mt-0.5">
                  Review and customize each item before ordering
                </p>
              </div>
              <div class="divide-y">
                <div v-for="(item, index) in cartItems" :key="index" class="p-6">
                  <div class="flex gap-4">
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div class="flex-1">
                      <div class="flex items-start justify-between">
                        <div>
                          <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
                          <p class="text-sm text-gray-500">{{ item.category }}</p>
                        </div>
                        <button
                          @click="removeItem(index)"
                          class="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>

                      <div class="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label class="text-xs font-medium text-gray-600">Size</label>
                          <select
                            v-model="item.size"
                            class="w-full mt-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option
                              v-for="size in getProductSizes(item.productId)"
                              :key="size.name"
                              :value="size.name"
                            >
                              {{ size.name }} - ₱{{ size.price }}/pc
                            </option>
                          </select>
                        </div>
                        <div>
                          <label class="text-xs font-medium text-gray-600">Quantity</label>
                          <div class="flex items-center gap-1 mt-1">
                            <button
                              @click="adjustItemQuantity(index, -500)"
                              class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              :disabled="item.quantity <= getMinOrder(item.productId)"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <input
                              v-model.number="item.quantity"
                              type="number"
                              :min="getMinOrder(item.productId)"
                              step="500"
                              class="flex-1 text-center border rounded-lg py-1.5 text-sm"
                            />
                            <button
                              @click="adjustItemQuantity(index, 500)"
                              class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </button>
                          </div>
                          <p class="text-xs text-gray-400 mt-1">
                            Min: {{ getMinOrder(item.productId) }} pcs
                          </p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label class="text-xs font-medium text-gray-600">Print Placement</label>
                          <select
                            v-model="item.printPlacement"
                            class="w-full mt-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select placement...</option>
                            <option value="full-wrap">Full Wrap</option>
                            <option value="front-only">Front Only</option>
                            <option value="back-only">Back Only</option>
                            <option value="front-back">Front & Back</option>
                          </select>
                        </div>
                        <div>
                          <label class="text-xs font-medium text-gray-600">Print Size</label>
                          <input
                            v-model="item.printSize"
                            type="text"
                            placeholder="e.g., 3x3 inches"
                            class="w-full mt-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div class="mt-3">
                        <label class="text-xs font-medium text-gray-600">Design Notes</label>
                        <textarea
                          v-model="item.designNotes"
                          rows="2"
                          placeholder="Special instructions, color preferences..."
                          class="w-full mt-1 px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                      </div>

                      <div class="mt-3 pt-2 border-t text-right">
                        <span class="text-sm font-semibold text-blue-600"
                          >Item Total: {{ calculateItemTotal(item) }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Step 0: Single Product Details (Own Cups or Single Company Product) -->
        <transition name="fade">
          <ProductDetailsCard
            v-if="currentStep === 0 && !isCartOrder"
            key="single-product"
            v-model="productDetails"
            :order-type="orderType"
            :selected-product="selectedProduct"
            :errors="errors.product"
            @change-product="router.push('/customer/catalog')"
          />
        </transition>

        <!-- Step 1: Design Info -->
        <transition name="fade">
          <DesignInfoCard
            v-if="currentStep === 1"
            key="design-info"
            v-model="designInfo"
            :errors="errors.design"
          />
        </transition>

        <!-- Step 2: Customer Info -->
        <transition name="fade">
          <CustomerInfoCard
            v-if="currentStep === 2"
            key="customer-info"
            v-model="customerInfo"
            :errors="errors.customer"
          />
        </transition>

        <!-- Step 3: Fulfillment -->
        <transition name="fade">
          <FulfillmentCard
            v-if="currentStep === 3"
            key="fulfillment"
            v-model="fulfillment"
            :customer-address="customerInfo.address"
            :errors="errors.fulfillment"
          />
        </transition>

        <!-- Navigation buttons -->
        <div class="flex justify-between pt-2">
          <button
            v-if="currentStep > 0"
            @click="currentStep--"
            class="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Previous
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < steps.length - 1"
            @click="nextStep"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Continue
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Sidebar summary -->
      <div class="lg:w-80">
        <OrderSummaryCard
          :order-type="orderType"
          :selected-product="selectedProduct"
          :product-type="productDetails.productType"
          :quantity="productDetails.quantity"
          :sizes="productDetails.sizes"
          :design-source="designInfo.designSource"
          :files-count="designInfo.files?.length || 0"
          :fulfillment="fulfillment.method"
          :cart-items="cartItems"
          :is-cart-order="isCartOrder"
          :can-submit="currentStep === steps.length - 1 && isFormValid"
          :is-submitting="isSubmitting"
          :validation-hints="validationHints"
          @submit="handleSubmit"
        />
      </div>
    </div>

    <!-- Success overlay -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="router.push('/customer/orders')"
    >
      <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-green-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Order Submitted!</h3>
        <p class="text-gray-500 text-sm mb-6">
          We've received your order and will be in touch within 1–2 business days for design
          approval.
        </p>
        <button
          @click="router.push('/customer/orders')"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View My Orders
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { products, getPriceForQuantity } from '@/data/catalogData'
import ProductDetailsCard from '@/components/create-order/ProductDetailsCard.vue'
import DesignInfoCard from '@/components/create-order/DesignInfoCard.vue'
import CustomerInfoCard from '@/components/create-order/CustomerInfoCard.vue'
import FulfillmentCard from '@/components/create-order/FullfillmentCard.vue'
import OrderSummaryCard from '@/components/create-order/OrderSummaryCard.vue'

const route = useRoute()
const router = useRouter()

// ─── Order type ───────────────────────────────────────────────────────────────
const orderType = computed(() =>
  route.query.type === 'company-product' ? 'company-product' : 'own-cups',
)
const isCartOrder = computed(() => route.query.source === 'cart')
const selectedProduct = computed(() => {
  if (orderType.value !== 'company-product' || isCartOrder.value) return null
  const id = parseInt(route.query.productId)
  return products.find((p) => p.id === id) || null
})

// ─── Cart items from session storage ─────────────────────────────────────────
const cartItems = ref([])

onMounted(() => {
  // Load cart items from session storage
  const pendingCart = sessionStorage.getItem('pendingCart')
  if (pendingCart && isCartOrder.value) {
    cartItems.value = JSON.parse(pendingCart)
  }

  // Load customer info from localStorage
  customerInfo.value.name = localStorage.getItem('userName') || ''
  customerInfo.value.email = localStorage.getItem('userEmail') || ''
})

function getProductSizes(productId) {
  const product = products.find((p) => p.id === productId)
  return product?.sizes || []
}

function getMinOrder(productId) {
  const product = products.find((p) => p.id === productId)
  return product?.minOrder || 500
}

function calculateItemTotal(item) {
  const product = products.find((p) => p.id === item.productId)
  if (!product) return '₱0'

  // Get the selected size object
  const selectedSize = product.sizes?.find((s) => s.name === item.size)
  if (!selectedSize) return '₱0'

  // Calculate based on quantity with bulk pricing
  const quantity = item.quantity
  let unitPrice = selectedSize.price

  // Apply bulk pricing if available
  if (quantity >= 5000 && selectedSize.bulkPrices?.[5000]) {
    unitPrice = selectedSize.bulkPrices[5000] / 5000
  } else if (quantity >= 2000 && selectedSize.bulkPrices?.[2000]) {
    unitPrice = selectedSize.bulkPrices[2000] / 2000
  } else if (quantity >= 1000 && selectedSize.bulkPrices?.[1000]) {
    unitPrice = selectedSize.bulkPrices[1000] / 1000
  } else if (quantity >= 500 && selectedSize.bulkPrices?.[500]) {
    unitPrice = selectedSize.bulkPrices[500] / 500
  }

  const total = unitPrice * quantity
  return `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function adjustItemQuantity(index, delta) {
  const min = getMinOrder(cartItems.value[index].productId)
  const newQty = cartItems.value[index].quantity + delta
  if (newQty >= min) {
    cartItems.value[index].quantity = newQty
  }
}

function removeItem(index) {
  cartItems.value.splice(index, 1)
}

// ─── Steps ───────────────────────────────────────────────────────────────────
const steps = [
  { key: 'product', label: isCartOrder.value ? 'Cart Items' : 'Product Details' },
  { key: 'design', label: 'Design' },
  { key: 'customer', label: 'Customer Info' },
  { key: 'fulfillment', label: 'Fulfillment' },
]
const currentStep = ref(0)

// ─── Form state ───────────────────────────────────────────────────────────────
const productDetails = ref({
  productType: '',
  quantity: '',
  sizes: '',
  specifications: '',
})

const designInfo = ref({
  designSource: 'upload',
  files: [],
  printSize: '',
  printPlacement: '',
  designNotes: '',
})

const customerInfo = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  saveAsDefault: false,
})

const fulfillment = ref({
  method: 'delivery',
  deliveryAddress: '',
  sameAsCustomer: false,
  preferredDate: '',
})

// ─── Validation ──────────────────────────────────────────────────────────────
const errors = ref({ product: {}, design: {}, customer: {}, fulfillment: {} })

function validateCurrentStep() {
  errors.value = { product: {}, design: {}, customer: {}, fulfillment: {} }
  let valid = true

  // Step 0 — Product Details
  if (currentStep.value === 0) {
    if (!isCartOrder.value) {
      if (orderType.value === 'own-cups' && !productDetails.value.productType.trim()) {
        errors.value.product.productType = 'Product type is required.'
        valid = false
      }
      if (!productDetails.value.quantity || Number(productDetails.value.quantity) < 1) {
        errors.value.product.quantity = 'Enter a valid quantity.'
        valid = false
      }
      if (orderType.value === 'company-product' && selectedProduct.value) {
        if (Number(productDetails.value.quantity) < selectedProduct.value.minOrder) {
          errors.value.product.quantity = `Minimum order is ${selectedProduct.value.minOrder} pcs.`
          valid = false
        }
      }
    } else {
      // Cart items validation
      if (cartItems.value.length === 0) {
        alert('Your cart is empty. Please add items to continue.')
        router.push('/customer/catalog')
        return false
      }
      for (const item of cartItems.value) {
        if (!item.size) {
          alert(`Please select a size for ${item.name}`)
          return false
        }
        if (!item.quantity || item.quantity < getMinOrder(item.productId)) {
          alert(`${item.name} quantity must be at least ${getMinOrder(item.productId)} pcs`)
          return false
        }
      }
    }
  }

  // Step 1 — Design (no required fields currently)

  // Step 2 — Customer Info
  if (currentStep.value === 2) {
    if (!customerInfo.value.name.trim()) {
      errors.value.customer.name = 'Full name is required.'
      valid = false
    }
    if (!customerInfo.value.email.trim()) {
      errors.value.customer.email = 'Email is required.'
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value.email)) {
      errors.value.customer.email = 'Enter a valid email.'
      valid = false
    }
    if (!customerInfo.value.phone.trim()) {
      errors.value.customer.phone = 'Phone number is required.'
      valid = false
    }
    if (!customerInfo.value.address.trim()) {
      errors.value.customer.address = 'Address is required.'
      valid = false
    }
  }

  // Step 3 — Fulfillment
  if (currentStep.value === 3) {
    if (fulfillment.value.method === 'delivery' && !fulfillment.value.deliveryAddress.trim()) {
      errors.value.fulfillment.deliveryAddress = 'Delivery address is required.'
      valid = false
    }
  }

  return valid
}

function nextStep() {
  if (validateCurrentStep()) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const isFormValid = computed(() => {
  if (isCartOrder.value) {
    return (
      cartItems.value.length > 0 &&
      customerInfo.value.name.trim() &&
      customerInfo.value.email.trim() &&
      customerInfo.value.phone.trim() &&
      customerInfo.value.address.trim() &&
      (fulfillment.value.method === 'pickup' || fulfillment.value.deliveryAddress.trim())
    )
  }
  return (
    productDetails.value.quantity &&
    (orderType.value === 'company-product' || productDetails.value.productType.trim()) &&
    customerInfo.value.name.trim() &&
    customerInfo.value.email.trim() &&
    customerInfo.value.phone.trim() &&
    customerInfo.value.address.trim() &&
    (fulfillment.value.method === 'pickup' || fulfillment.value.deliveryAddress.trim())
  )
})

const validationHints = computed(() => {
  if (currentStep.value < steps.length - 1) return []
  const hints = []
  if (!customerInfo.value.name.trim()) hints.push('Customer name required')
  if (!productDetails.value.quantity && !isCartOrder.value) hints.push('Quantity required')
  if (isCartOrder.value && cartItems.value.length === 0) hints.push('No items in cart')
  if (
    orderType.value === 'own-cups' &&
    !productDetails.value.productType.trim() &&
    !isCartOrder.value
  )
    hints.push('Product type required')
  if (fulfillment.value.method === 'delivery' && !fulfillment.value.deliveryAddress.trim())
    hints.push('Delivery address required')
  return hints
})

// ─── Submit ───────────────────────────────────────────────────────────────────
const isSubmitting = ref(false)
const showSuccess = ref(false)

async function handleSubmit() {
  if (!validateCurrentStep()) return
  isSubmitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Prepare order data
  const orderData = {
    type: orderType.value,
    items: isCartOrder.value
      ? cartItems.value
      : [
          {
            product: selectedProduct.value,
            details: productDetails.value,
            design: designInfo.value,
          },
        ],
    customer: customerInfo.value,
    fulfillment: fulfillment.value,
  }

  console.log('Order submitted:', orderData)
  isSubmitting.value = false
  showSuccess.value = true
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
