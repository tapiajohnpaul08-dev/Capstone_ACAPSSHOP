<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">

    <!-- Back button + header -->
    <div class="mb-6">
      <button @click="router.back()" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Back
      </button>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1 text-sm">
            <span v-if="orderType === 'own-cups'">You'll provide your own cups for printing.</span>
            <span v-else>Ordering from our product catalog — we supply & print.</span>
          </p>
        </div>
        <!-- Order type badge -->
        <span
          class="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 mt-1"
          :class="orderType === 'own-cups' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
        >
          {{ orderType === 'own-cups' ? '📦 Own Cups' : '🏪 Company Product' }}
        </span>
      </div>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      <div
        v-for="(step, i) in steps"
        :key="step.key"
        class="flex items-center gap-2 shrink-0"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
            :class="currentStep > i
              ? 'bg-blue-600 text-white'
              : currentStep === i
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-200 text-gray-500'"
          >
            <svg v-if="currentStep > i" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium hidden sm:block"
            :class="currentStep === i ? 'text-blue-600' : currentStep > i ? 'text-gray-500' : 'text-gray-400'"
          >{{ step.label }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="w-8 h-px bg-gray-200 shrink-0"></div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main form area -->
      <div class="flex-1 space-y-5">

        <!-- Step 0: Customer Info -->
        <transition name="fade">
          <CustomerInfoCard
            v-if="currentStep === 0"
            v-model="customerInfo"
            :errors="errors.customer"
          />
        </transition>

        <!-- Step 1: Product Details -->
        <transition name="fade">
          <ProductDetailsCard
            v-if="currentStep === 1"
            v-model="productDetails"
            :order-type="orderType"
            :selected-product="selectedProduct"
            :errors="errors.product"
            @change-product="router.push('/customer/catalog')"
          />
        </transition>

        <!-- Step 2: Design Info -->
        <transition name="fade">
          <DesignInfoCard
            v-if="currentStep === 2"
            v-model="designInfo"
            :errors="errors.design"
          />
        </transition>

        <!-- Step 3: Fulfillment -->
        <transition name="fade">
          <FulfillmentCard
            v-if="currentStep === 3"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Sidebar summary — always visible -->
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
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-green-600">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Order Submitted!</h3>
        <p class="text-gray-500 text-sm mb-6">
          We've received your order and will be in touch within 1–2 business days for design approval.
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
import { products } from '@/data/catalogData'
import CustomerInfoCard from '@/components/create-order/CustomerInfoCard.vue'
import ProductDetailsCard from '@/components/create-order/ProductDetailsCard.vue'
import DesignInfoCard from '@/components/create-order/DesignInfoCard.vue'
import FulfillmentCard from '@/components/create-order/FullfillmentCard.vue'
import OrderSummaryCard from '@/components/create-order/OrderSummaryCard.vue'

const route = useRoute()
const router = useRouter()

// ─── Determine order type from query param ────────────────────────────────────
const orderType = computed(() => route.query.type === 'company-product' ? 'company-product' : 'own-cups')
const selectedProduct = computed(() => {
  if (orderType.value !== 'company-product') return null
  const id = parseInt(route.query.productId)
  return products.find(p => p.id === id) || null
})

// ─── Steps ────────────────────────────────────────────────────────────────────
const steps = [
  { key: 'customer', label: 'Customer Info' },
  { key: 'product', label: 'Product Details' },
  { key: 'design', label: 'Design' },
  { key: 'fulfillment', label: 'Fulfillment' }
]
const currentStep = ref(0)

// ─── Form state ───────────────────────────────────────────────────────────────
const customerInfo = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  saveAsDefault: false
})

const productDetails = ref({
  productType: '',
  quantity: '',
  sizes: '',
  specifications: ''
})

const designInfo = ref({
  designSource: 'upload',
  files: [],
  printSize: '',
  printPlacement: '',
  designNotes: ''
})

const fulfillment = ref({
  method: 'delivery',
  deliveryAddress: '',
  sameAsCustomer: false,
  preferredDate: ''
})

// ─── Pre-fill from localStorage ───────────────────────────────────────────────
onMounted(() => {
  const name = localStorage.getItem('userName') || ''
  const email = localStorage.getItem('userEmail') || ''
  customerInfo.value.name = name
  customerInfo.value.email = email
})

// ─── Validation ───────────────────────────────────────────────────────────────
const errors = ref({ customer: {}, product: {}, design: {}, fulfillment: {} })

function validateCurrentStep() {
  errors.value = { customer: {}, product: {}, design: {}, fulfillment: {} }
  let valid = true

  if (currentStep.value === 0) {
    if (!customerInfo.value.name.trim()) { errors.value.customer.name = 'Full name is required.'; valid = false }
    if (!customerInfo.value.email.trim()) { errors.value.customer.email = 'Email is required.'; valid = false }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value.email)) { errors.value.customer.email = 'Enter a valid email.'; valid = false }
    if (!customerInfo.value.phone.trim()) { errors.value.customer.phone = 'Phone number is required.'; valid = false }
    if (!customerInfo.value.address.trim()) { errors.value.customer.address = 'Address is required.'; valid = false }
  }

  if (currentStep.value === 1) {
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
  }

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
  return (
    customerInfo.value.name.trim() &&
    customerInfo.value.email.trim() &&
    customerInfo.value.phone.trim() &&
    customerInfo.value.address.trim() &&
    productDetails.value.quantity &&
    (orderType.value === 'company-product' || productDetails.value.productType.trim()) &&
    (fulfillment.value.method === 'pickup' || fulfillment.value.deliveryAddress.trim())
  )
})

const validationHints = computed(() => {
  if (currentStep.value < steps.length - 1) return []
  const hints = []
  if (!customerInfo.value.name.trim()) hints.push('Customer name required')
  if (!productDetails.value.quantity) hints.push('Quantity required')
  if (orderType.value === 'own-cups' && !productDetails.value.productType.trim()) hints.push('Product type required')
  if (fulfillment.value.method === 'delivery' && !fulfillment.value.deliveryAddress.trim()) hints.push('Delivery address required')
  return hints
})

// ─── Submit ───────────────────────────────────────────────────────────────────
const isSubmitting = ref(false)
const showSuccess = ref(false)

async function handleSubmit() {
  if (!validateCurrentStep()) return
  isSubmitting.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  isSubmitting.value = false
  showSuccess.value = true
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>