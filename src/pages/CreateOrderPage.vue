<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Header -->
    <div class="mb-6">
      <button @click="router.back()" class="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center gap-1">
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1 text-sm">
            <span v-if="isOwnCups">You'll provide your own cups for printing.</span>
            <span v-else-if="isCartOrder">You're ordering {{ orderProducts.length }} product(s).</span>
            <span v-else>Order from our catalog — we supply & print.</span>
          </p>
        </div>
        <span class="px-3 py-1.5 rounded-full flex gap-3 text-xs font-semibold" :class="orderBadgeClass">
          <ShoppingCart v-if="isCartOrder" class="w-3.5 h-3.5" />
          <Package v-else class="w-3.5 h-3.5" />
          {{ orderBadgeText }}
        </span>
      </div>
    </div>

    <!-- Dynamic Steps Progress -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto">
      <div
        v-for="(step, i) in activeSteps"
        :key="step.key"
        class="flex items-center gap-2 whitespace-nowrap"
      >
        <button
          @click="goToStep(i)"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="getStepClass(i)"
          :disabled="!step.enabled"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
            :class="getStepBadgeClass(i)"
          >
            {{ getStepBadge(i) }}
          </span>
          {{ step.label }}
          <!-- Show validation status on step buttons -->
          <span v-if="i < currentStep" class="text-green-500">
            <CheckCircle class="w-3 h-3" />
          </span>
          <span v-else-if="i === currentStep && !isStepValid" class="text-red-400">
            <AlertCircle class="w-3 h-3" />
          </span>
        </button>
        <span v-if="i < activeSteps.length - 1" class="text-gray-300">→</span>
      </div>
    </div>

    <!-- Step Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 space-y-5">
        <!-- STEP 0: PRODUCT SELECTION -->
        <div v-if="currentStep === 0">
          <ProductSelector
            v-model="orderProducts"
            :order-type="orderType"
            :is-cart-order="isCartOrder"
            :selected-product="selectedProductData"
            :is-own-cups="isOwnCups"
            @product-changed="onProductChanged"
          />
          
          <!-- Step Validation Status -->
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ step0Errors[0] || 'Please complete all required fields' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                All product details complete
              </span>
            </div>
            <button
              @click="nextStep"
              :disabled="!isStepValid"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {{ orderProducts.length > 1 ? 'Configure Designs' : 'Add Design' }}
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- STEP 1: DESIGN MODE SELECTION -->
        <div v-if="currentStep === 1">
          <DesignModeSelector
  v-model="designMode"
  :item-count="orderProducts.length"
  :has-design-required="false"
  :is-own-cups="isOwnCups"
/>

          <!-- Design Upload -->
          <div v-if="designMode !== 'no-design'" class="mt-4">
            <div v-if="designMode === 'shared'">
              <DesignManager
                v-model="sharedDesign"
                item-name="Shared Design"
                :show-placement="false"
                :is-no-design-mode="false"
                @design-changed="onSharedDesignChanged"
              />
            </div>

            <div v-else class="space-y-4">
              <div v-for="(item, idx) in orderProducts" :key="idx" class="bg-white rounded-xl border overflow-hidden">
                <div class="px-6 py-4 border-b bg-gray-50">
                  <div class="flex items-center gap-3">
                    <img :src="getImageUrl(item.image)" class="w-10 h-10 object-cover rounded-lg" @error="handleImageError" />
                    <div>
                      <h4 class="font-semibold">{{ item.name }}</h4>
                      <p class="text-xs text-gray-500">{{ item.size }} · {{ item.quantity }} pcs</p>
                    </div>
                  </div>
                </div>
                <div class="px-6 py-5">
                  <DesignManager
                    v-model="itemDesigns[idx]"
                    :item-name="item.name"
                    :show-placement="orderProducts.length === 1"
                    :is-no-design-mode="false"
                    @design-changed="(design) => updateItemDesign(idx, design)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-xl border p-6">
            <div class="flex items-start gap-3">
              <FileText class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 class="font-semibold text-gray-900">No Design</h4>
                <p class="text-sm text-gray-500">
                  The product will be produced plain, as is, with no print or design applied.
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ step1Errors[0] || 'Please complete design details' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Design details complete
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="previousStep" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ← Back
              </button>
              <button
                @click="nextStep"
                :disabled="!isStepValid"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {{ designMode === 'shared' && orderProducts.length > 1 ? 'Set Placement' : 'Enter Info' }}
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 2: PLACEMENT -->
        <div v-if="currentStep === 2 && designMode === 'shared' && orderProducts.length > 1">
          <PlacementManager
            v-model="placementSettings"
            :items="orderProducts"
            description="Set the print placement for each item using the shared design."
          />
          
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ stepPlacementErrors[0] || 'Please set placement for all items' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Placement settings complete
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="previousStep" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Back
              </button>
              <button
                @click="nextStep"
                :disabled="!isStepValid"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                Enter Info
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3: CUSTOMER & DELIVERY -->
        <div v-if="getStepKey(currentStep) === 'info'" class="space-y-5">
          <CustomerInfoCard v-model="customerInfo" :errors="errors.customer" />
<FulfillmentCard 
  v-model="fulfillment" 
  :customer-address="customerInfo.address" 
  :errors="errors.fulfillment"
  :is-own-cups="isOwnCups"
/>          
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ stepInfoErrors[0] || 'Please complete all customer and delivery details' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Customer and delivery details complete
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="previousStep" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Back
              </button>
              <button
                @click="nextStep"
                :disabled="!isStepValid"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                Payment
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 4: PAYMENT -->
        <div v-if="getStepKey(currentStep) === 'payment'" class="space-y-5">
          <PaymentMethodCard v-model="paymentMethod" :total-amount="totalAmount" />
          
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ stepPaymentErrors[0] || 'Please select a payment method' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Payment method selected
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="previousStep" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Back
              </button>
              <button
                @click="nextStep"
                :disabled="!isStepValid"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                Review Order
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 5: REVIEW -->
        <div v-if="getStepKey(currentStep) === 'review'">
          <div class="bg-white rounded-xl border p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-gray-900">Review Your Order</h4>
              <span v-if="isFormValid" class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Ready to submit
              </span>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Order Type</span>
                <p class="font-medium">{{ orderBadgeText }}</p>
              </div>
              <div>
                <span class="text-gray-500">Design Mode</span>
                <p class="font-medium capitalize">{{ designMode }}</p>
              </div>
              <div>
                <span class="text-gray-500">Items</span>
                <p class="font-medium">{{ orderProducts.length }}</p>
              </div>
              <div>
                <span class="text-gray-500">Total Quantity</span>
                <p class="font-medium">{{ totalQuantity.toLocaleString() }} pcs</p>
              </div>
              <div>
                <span class="text-gray-500">Delivery Method</span>
                <p class="font-medium">{{ fulfillment.method === 'pickup' ? 'Pick-up' : 'Delivery' }}</p>
              </div>
              <div>
                <span class="text-gray-500">Payment Method</span>
                <p class="font-medium capitalize">{{ paymentMethod.method === 'cod' ? 'Cash on Delivery' : paymentMethod.method }}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <h5 class="font-semibold text-sm text-gray-700 mb-3">Items</h5>
              <div class="space-y-2">
                <div
                  v-for="(item, idx) in orderProducts"
                  :key="idx"
                  class="flex justify-between text-sm bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <span class="font-medium">{{ item.name }}</span>
                    <span class="text-gray-500 ml-2">{{ item.size }} · {{ item.quantity }} pcs</span>
                  </div>
                  <span class="text-blue-600">₱{{ calculateItemTotal(item).toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="border-t pt-4 flex justify-between items-center">
              <span class="font-bold text-lg">Total</span>
              <span class="text-2xl font-bold text-blue-600">₱{{ totalAmount.toLocaleString() }}</span>
            </div>

            <div v-if="validationHints.length > 0" class="space-y-1.5">
              <div
                v-for="hint in validationHints"
                :key="hint"
                class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2"
              >
                <AlertCircle class="w-3 h-3" />
                {{ hint }}
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <button @click="previousStep" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              ← Back
            </button>
            
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:w-80">
        <OrderSummaryCard
          :order-type="orderType"
          :selected-product="selectedProductData"
          :quantity="totalQuantity"
          :sizes="orderSizes"
          :cart-items="orderProducts"
          :is-cart-order="isCartOrder"
          :payment-method="paymentMethod.method"
          :total-amount="totalAmount"
          :can-submit="isFormValid && currentStep === getLastStepIndex()"
          :is-submitting="isSubmitting"
          :validation-hints="validationHints"
          @submit="handleSubmit"
          :has-design="hasDesign"

        />
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="router.push('/customer/orders')">
      <div class="bg-white rounded-2xl p-8 max-w-sm text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-xl font-bold mb-2">Order Submitted!</h3>
        <p class="text-gray-500 text-sm mb-6">
          We'll contact you within 1-2 business days for design approval and payment confirmation.
        </p>
        <button @click="router.push('/customer/orders')" class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          View My Orders
        </button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <AlertCircle v-if="toast.type === 'error'" class="w-4 h-4 text-red-400" />
          <CheckCircle v-else class="w-4 h-4 text-green-400" />
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart.js'
import { useTemplates } from '@/composables/useTemplates.js'
import CustomerInfoCard from '@/components/create-order/CustomerInfoCard.vue'
import FulfillmentCard from '@/components/create-order/FullfillmentCard.vue'
import PaymentMethodCard from '@/components/create-order/PaymentMethodCard.vue'
import OrderSummaryCard from '@/components/create-order/OrderSummaryCard.vue'
import DesignManager from '@/components/create-order/DesignManager.vue'
import DesignModeSelector from '@/components/create-order/DesignModeSelector.vue'
import PlacementManager from '@/components/create-order/PlacementManager.vue'
import ProductSelector from '@/components/create-order/ProductSelector.vue'
import { productsApi, ordersApi } from '@/api.js'
import { PHONE_REGEX, EMAIL_REGEX } from '@/constants/orderConstants'

import { ShoppingCart, Package } from 'lucide-vue-next'


const route = useRoute()
const router = useRouter()
const { loadCart } = useCart()
const { fetchTemplates } = useTemplates()

// ─── STATE ──────────────────────────────────────────────────────────────────
const isSubmitting = ref(false)
const showSuccess = ref(false)
const toast = ref({ show: false, message: '' })
const selectedProductData = ref(null)
const orderProducts = ref([])
const itemDesigns = ref([])
const sharedDesign = ref({
  designSource: 'upload',
  files: [],
  printSize: '',
  printPlacement: '',
  designNotes: '',
  selectedTemplateId: null,
  selectedTemplate: null
})
const itemVariantSettings = ref([])
const placementSettings = ref([])
// Fixed note applied automatically when the customer chooses 'no-design' (plain product, as is)
const NO_DESIGN_FIXED_NOTE = 'No design - plain product, as is.'
const customerInfo = ref({ 
  name: '', 
  company: '', 
  email: '', 
  phone: '', 
  address: '',
  postalCode: '',
  saveAsDefault: false 
})
const fulfillment = ref({ method: 'delivery', deliveryAddress: '', sameAsCustomer: false })
const paymentMethod = ref({ method: 'cod', bankName: '', referenceNumber: '', paymentStatus: 'pending' })
const errors = ref({ customer: {}, fulfillment: {} })

// ─── DESIGN MODE ───────────────────────────────────────────────────────────
const designMode = ref('individual')

// ─── STEPS ──────────────────────────────────────────────────────────────────
const activeSteps = computed(() => {
  const steps = [
    { key: 'product', label: 'Products', enabled: true }
  ]
  steps.push({ key: 'design', label: 'Design', enabled: orderProducts.value.length > 0 })
  if (designMode.value === 'shared' && orderProducts.value.length > 1) {
    steps.push({ key: 'placement', label: 'Placement', enabled: true })
  }
  steps.push(
    { key: 'info', label: 'Info', enabled: true },
    { key: 'payment', label: 'Payment', enabled: true },
    { key: 'review', label: 'Review', enabled: true }
  )
  return steps
})

const hasDesign = computed(() => {
  // Check if design mode is not 'no-design'
  if (designMode.value === 'no-design') return false
  
  // Check shared design
  if (designMode.value === 'shared') {
    const design = sharedDesign.value
    return !!(design.designSource === 'upload' && design.files?.length > 0) ||
           !!(design.designSource === 'saved' && design.selectedTemplateId)
  }
  
  // Check individual designs
  if (designMode.value === 'individual') {
    for (const design of itemDesigns.value) {
      if (design.designSource === 'upload' && design.files?.length > 0) {
        return true
      }
      if (design.designSource === 'saved' && design.selectedTemplateId) {
        return true
      }
    }
  }
  
  return false
})

const currentStep = ref(0)

function getStepKey(index) {
  const step = activeSteps.value[index]
  return step?.key || ''
}

function getLastStepIndex() {
  return activeSteps.value.length - 1
}

// ─── COMPUTED ──────────────────────────────────────────────────────────────
const orderType = computed(() => route.query.type === 'company-product' ? 'company-product' : 'own-cups')
const isCartOrder = computed(() => route.query.source === 'cart')
const isOwnCups = computed(() => orderType.value === 'own-cups')

const orderBadgeClass = computed(() => 
  isOwnCups.value ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
)
const orderBadgeText = computed(() => 
  isOwnCups.value ? 'Own Items' : (isCartOrder.value ? 'Multi-Item' : 'Single Product')
)

const totalQuantity = computed(() => 
  orderProducts.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
)
const orderSizes = computed(() => 
  orderProducts.value.map(p => p.size).join(', ')
)

const totalAmount = computed(() => {
  let total = 0
  for (const product of orderProducts.value) {
    total += calculateItemTotal(product)
  }
  return total
})

function calculateItemTotal(item) {
  if (item.estimatedTotal) return item.estimatedTotal
  if (item.unitPrice && item.quantity) {
    return item.unitPrice * item.quantity
  }
  if (item.sizes && item.size) {
    const size = item.sizes.find(s => s.name === item.size)
    if (size) {
      let unitPrice = size.price
      const qty = item.quantity
      if (qty >= 5000 && size.bulkPrices?.[5000]) {
        unitPrice = size.bulkPrices[5000] / 5000
      } else if (qty >= 2000 && size.bulkPrices?.[2000]) {
        unitPrice = size.bulkPrices[2000] / 2000
      } else if (qty >= 1000 && size.bulkPrices?.[1000]) {
        unitPrice = size.bulkPrices[1000] / 1000
      } else if (qty >= 500 && size.bulkPrices?.[500]) {
        unitPrice = size.bulkPrices[500] / 500
      }
      return unitPrice * qty
    }
  }
  return 0
}

// ─── VALIDATION ────────────────────────────────────────────────────────────
const step0Errors = computed(() => {
  const errorsList = []
  if (isOwnCups.value) {
    if (!orderProducts.value[0]?.productType?.trim()) errorsList.push('Product type is required')
    if (!orderProducts.value[0]?.sizes?.trim()) errorsList.push('Cup size is required')
    if (!orderProducts.value[0]?.quantity || orderProducts.value[0]?.quantity < 500) {
      errorsList.push('Quantity must be at least 500 pcs')
    }
  } else if (orderProducts.value.length === 0) {
    errorsList.push('No products selected')
  } else {
    for (const productItem of orderProducts.value) {
      if (!productItem.size) errorsList.push(`Please select a size for "${productItem.name}"`)
      const minOrder = productItem.minOrder || 500
      if (!productItem.quantity || productItem.quantity < minOrder) {
        errorsList.push(`"${productItem.name}" quantity must be at least ${minOrder.toLocaleString()} pcs`)
      }
    }
  }
  return errorsList
})

const step1Errors = computed(() => {
  const errorsList = []
  
  if (designMode.value === 'no-design') {
    // No design mode - plain product as is, nothing to validate
    return errorsList
  }
  
  if (designMode.value === 'shared') {
    const design = sharedDesign.value
    if (design.designSource === 'upload') {
      if (!design.files || design.files.length === 0) {
        errorsList.push('Please upload a design image or select a template')
      }
    } else if (design.designSource === 'saved') {
      if (!design.selectedTemplateId) {
        errorsList.push('Please select a saved template')
      }
    }
  } else {
    // Individual mode
    for (let i = 0; i < orderProducts.value.length; i++) {
      const design = itemDesigns.value[i]
      const productName = orderProducts.value[i]?.name
      
      if (!design) {
        errorsList.push(`Design details required for "${productName}"`)
        continue
      }
      
      if (design.designSource === 'upload') {
        const hasFiles = design.files && design.files.length > 0
        const hasNotes = design.designNotes && design.designNotes.trim()
        if (!hasFiles && !hasNotes) {
          errorsList.push(`Please upload a design or add notes for "${productName}"`)
        }
      } else if (design.designSource === 'saved') {
        if (!design.selectedTemplateId) {
          errorsList.push(`Please select a saved template for "${productName}"`)
        }
      }
    }
  }
  return errorsList
})

const stepPlacementErrors = computed(() => {
  if (designMode.value !== 'shared' || orderProducts.value.length <= 1) return []
  const errorsList = []
  for (let i = 0; i < orderProducts.value.length; i++) {
    const settings = placementSettings.value[i] || itemVariantSettings.value[i]
    if (!settings?.printPlacement) {
      errorsList.push(`Please select placement for "${orderProducts.value[i].name}"`)
    }
  }
  return errorsList
})

const stepInfoErrors = computed(() => {
  const errorsList = []
  if (!customerInfo.value.name?.trim()) errorsList.push('Customer name required')
  if (!customerInfo.value.email?.trim() || !EMAIL_REGEX.test(customerInfo.value.email)) {
    errorsList.push('Valid email required')
  }
  const phoneClean = customerInfo.value.phone?.replace(/[\s\-\(\)]/g, '') || ''
  if (!phoneClean || !PHONE_REGEX.test(phoneClean)) {
    errorsList.push('Valid phone required')
  }
  if (!customerInfo.value.address?.trim()) errorsList.push('Address required')
  if (fulfillment.value.method === 'delivery' && !fulfillment.value.deliveryAddress?.trim()) {
    errorsList.push('Delivery address required')
  }
  return errorsList
})

const stepPaymentErrors = computed(() => {
  const errorsList = []
  if (!paymentMethod.value.method) errorsList.push('Please select a payment method')
  if (paymentMethod.value.method === 'bank_transfer' && !paymentMethod.value.bankName) {
    errorsList.push('Please select a bank')
  }
  return errorsList
})

const isStepValid = computed(() => {
  const step = currentStep.value
  const active = activeSteps.value[step]
  
  if (!active) return false
  
  switch (active.key) {
    case 'product':
      return step0Errors.value.length === 0 && orderProducts.value.length > 0
    case 'design':
      return step1Errors.value.length === 0
    case 'placement':
      return stepPlacementErrors.value.length === 0
    case 'info':
      return stepInfoErrors.value.length === 0
    case 'payment':
      return stepPaymentErrors.value.length === 0
    case 'review':
      return true
    default:
      return false
  }
})

const isFormValid = computed(() => {
  return step0Errors.value.length === 0 &&
    step1Errors.value.length === 0 &&
    stepPlacementErrors.value.length === 0 &&
    stepInfoErrors.value.length === 0 &&
    stepPaymentErrors.value.length === 0
})

const validationHints = computed(() => {
  const allErrors = [
    ...step0Errors.value,
    ...step1Errors.value,
    ...stepPlacementErrors.value,
    ...stepInfoErrors.value,
    ...stepPaymentErrors.value
  ]
  return allErrors
})

// ─── STEP NAVIGATION ──────────────────────────────────────────────────────
function getStepClass(index) {
  const isActive = currentStep.value === index
  const isCompleted = currentStep.value > index
  const step = activeSteps.value[index]
  
  if (!step?.enabled) return 'opacity-50 cursor-not-allowed'
  if (isActive) return 'bg-blue-50 text-blue-700 border border-blue-200'
  if (isCompleted) return 'text-gray-500'
  return 'text-gray-400 hover:text-gray-600'
}

function getStepBadge(index) {
  if (currentStep.value > index) return '✓'
  return index + 1
}

function getStepBadgeClass(index) {
  const isActive = currentStep.value === index
  const isCompleted = currentStep.value > index
  
  if (isCompleted) return 'bg-green-500 text-white'
  if (isActive) return 'bg-blue-600 text-white'
  return 'bg-gray-200 text-gray-500'
}

function goToStep(index) {
  const step = activeSteps.value[index]
  if (step?.enabled) {
    currentStep.value = index
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function nextStep() {
  if (isStepValid.value && currentStep.value < activeSteps.value.length - 1) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ─── METHODS ──────────────────────────────────────────────────────────────
function getImageUrl(path) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  if (!path) return `${base}/uploads/products/default-product.jpg`
  if (path.startsWith('http')) return path
  return `${base}/${path.replace(/^\/+/, '')}`
}

function handleImageError(e) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  e.target.src = `${base}/uploads/products/default-product.jpg`
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function onProductChanged(products) {
  orderProducts.value = products
  itemDesigns.value = products.map(() => ({
    designSource: 'upload',
    printSize: '',
    printPlacement: '',
    designNotes: '',
    files: [],
    selectedTemplateId: null,
    selectedTemplate: null
  }))
  itemVariantSettings.value = products.map(() => ({
    printSize: '',
    printPlacement: '',
    designNotes: ''
  }))
  placementSettings.value = products.map(() => ({
    printSize: '',
    printPlacement: '',
    designNotes: ''
  }))
}

function updateItemDesign(index, design) {
  itemDesigns.value[index] = design
}

function onSharedDesignChanged(design) {
  sharedDesign.value = design
}

// ─── SUBMIT ───────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true

  try {
    const itemsArray = []
    let totalAmount = 0
    
    if (designMode.value === 'no-design') {
      // No design mode - just use design notes
      for (let i = 0; i < orderProducts.value.length; i++) {
        const product = orderProducts.value[i]
        const item = buildItemPayload(product, {
          designImage: '',
          designSource: 'no-design',
          selectedTemplateId: null,
          selectedTemplate: null,
          printSize: '',
          printPlacement: '',
          designNotes: NO_DESIGN_FIXED_NOTE,
          files: []
        })
        itemsArray.push(item)
        totalAmount += calculateItemTotal(product)
      }
    } else if (designMode.value === 'shared') {
      // Shared design mode - one design for all items
      const designImage = getDesignImage(sharedDesign.value)
      
      for (let i = 0; i < orderProducts.value.length; i++) {
        const product = orderProducts.value[i]
        // For single item in shared mode, use shared design placement
        // For multiple items, use placementSettings
        const settings = orderProducts.value.length > 1 
          ? (placementSettings.value[i] || itemVariantSettings.value[i] || {})
          : sharedDesign.value
        
        const item = buildItemPayload(product, {
          designImage,
          designSource: sharedDesign.value.designSource,
          selectedTemplateId: sharedDesign.value.selectedTemplateId,
          selectedTemplate: sharedDesign.value.selectedTemplate,
          printSize: settings.printSize || sharedDesign.value.printSize || '',
          printPlacement: settings.printPlacement || sharedDesign.value.printPlacement || '',
          designNotes: settings.designNotes || sharedDesign.value.designNotes || '',
          files: sharedDesign.value.files || []
        })
        
        itemsArray.push(item)
        totalAmount += calculateItemTotal(product)
      }
    } else {
      // Individual design mode - each item has its own design (with placement)
      for (let i = 0; i < orderProducts.value.length; i++) {
        const product = orderProducts.value[i]
        const design = itemDesigns.value[i] || {}
        const designImage = getDesignImage(design)
        
        const item = buildItemPayload(product, {
          designImage,
          designSource: design.designSource || 'upload',
          selectedTemplateId: design.selectedTemplateId || null,
          selectedTemplate: design.selectedTemplate || null,
          printSize: design.printSize || '',
          printPlacement: design.printPlacement || '',
          designNotes: design.designNotes || '',
          files: design.files || []
        })
        
        itemsArray.push(item)
        totalAmount += calculateItemTotal(product)
      }
    }

    // Calculate prices for each item
    for (const item of itemsArray) {
      if (item.productId) {
        try {
          const priceResult = await productsApi.calculatePrice(item.productId, item.size, item.quantity)
          if (priceResult.success && priceResult.data) {
            item.estimatedTotal = priceResult.data.total
          }
        } catch (error) {
          console.error('Error calculating price:', error)
        }
      }
    }

    const orderData = {
      items: itemsArray,
      quantity: itemsArray.reduce((sum, item) => sum + (item.quantity || 0), 0),
      address: customerInfo.value.address,
      postalCode: customerInfo.value.postalCode || '',
      receivingMode: fulfillment.value.method === 'pickup' ? 'Pick-up' : 'Delivery',
      paymentMethod: paymentMethod.value.method,
      paymentDetails: paymentMethod.value.method === 'bank_transfer' ? {
        bankName: paymentMethod.value.bankName,
        referenceNumber: paymentMethod.value.referenceNumber
      } : null,
      isProvided: isOwnCups.value,
      amount: totalAmount || itemsArray.reduce((sum, i) => sum + (i.estimatedTotal || 0), 0),
      customerName: customerInfo.value.name,
      customerEmail: customerInfo.value.email,
      customerPhone: customerInfo.value.phone,
      notes: generateOrderNotes(),
      preferredTime: fulfillment.value.preferredTime || '',
      fromCustomerToCompanyDeliveryDate: fulfillment.value.ownCupsDeliveryDate || '',
      customer: {
        name: customerInfo.value.name,
        email: customerInfo.value.email,
        phone: customerInfo.value.phone,
        company: customerInfo.value.company
      }
    }

    console.log('Submitting order:', orderData)

    const response = await ordersApi.createOrder(orderData)
    
    if (response.success) {
      if (isCartOrder.value) {
        localStorage.removeItem('customerCart')
        sessionStorage.removeItem('pendingCart')
      }
      if (customerInfo.value.saveAsDefault) {
        localStorage.setItem('defaultCustomerInfo', JSON.stringify(customerInfo.value))
      }
      showSuccess.value = true
    } else {
      showToast(response.message || 'Failed to submit order')
    }
  } catch (error) {
    console.error('Submit error:', error)
    showToast(error.message || 'Error submitting order')
  } finally {
    isSubmitting.value = false
  }
}

// In CreateOrderPage.vue - Fix the buildItemPayload function

function buildItemPayload(product, design) {
  // Get the design image URL from the uploaded files
  let designImage = ''
  let designFiles = []
  
  if (design.designSource === 'upload') {
    // Check if we have uploaded files with Cloudinary URLs
    if (design.files && design.files.length > 0) {
      // The files should now have path/url from Cloudinary
      const firstFile = design.files[0]
      designImage = firstFile.path || firstFile.url || ''
      
      // Store all files with their Cloudinary URLs
      designFiles = design.files.map(f => ({
        name: f.name || '',
        size: f.size || 0,
        type: f.type || '',
        path: f.path || f.url || '',
        url: f.url || f.path || ''
      }))
    }
  } else if (design.designSource === 'saved' && design.selectedTemplate) {
    designImage = design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || ''
  }
  
  if (isOwnCups.value) {
    return {
      productId: null,
      name: product.productType || 'Customer Provided Items',
      category: 'Customer Provided',
      size: product.sizes || 'Custom',
      quantity: product.quantity || 500,
      designSource: design.designSource || 'upload',
      designImage: designImage,
      printSize: design.printSize || '',
      printPlacement: design.printPlacement || '',
      designNotes: design.designNotes || '',
      files: designFiles,
      selectedTemplateId: design.selectedTemplateId || null,
      selectedTemplate: design.selectedTemplate || null,
      estimatedTotal: 0
    }
  }
  
  return {
    productId: product.productId,
    name: product.name,
    category: product.category,
    size: product.size,
    quantity: product.quantity,
    designSource: design.designSource || 'upload',
    designImage: designImage,
    printSize: design.printSize || '',
    printPlacement: design.printPlacement || '',
    designNotes: design.designNotes || '',
    files: designFiles,
    selectedTemplateId: design.selectedTemplateId || null,
    selectedTemplate: design.selectedTemplate || null
  }
}

function getDesignImage(design) {
  if (!design) return ''
  if (design.designSource === 'upload' && design.files?.length > 0) {
    return design.files[0].path || ''
  }
  if (design.designSource === 'saved' && design.selectedTemplate) {
    return design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || ''
  }
  return ''
}

function generateOrderNotes() {
  const modeLabels = {
    'no-design': 'No Design - Plain product as is',
    'individual': 'Individual Designs',
    'shared': 'Shared Design'
  }
  const modeLabel = modeLabels[designMode.value] || 'Custom Design'
  const itemNames = orderProducts.value.map(i => i.name).join(', ')
  return `${modeLabel} | Items: ${itemNames}`
}

// ─── WATCHERS ─────────────────────────────────────────────────────────────
// Auto-detect design mode based on item count
watch(orderProducts, (newProducts) => {
  if (newProducts.length === 0) return
  
  // If only one item, default to individual mode with placement shown
  if (newProducts.length === 1) {
    if (designMode.value === 'shared') {
      designMode.value = 'individual'
    }
  }
}, { immediate: true })


// ✅ Helper to parse product data from query params
function parseProductDataFromQuery() {
  const productId = route.query.productId
  const productName = route.query.productName
  const productImage = route.query.productImage
  const productCategory = route.query.productCategory
  const minOrder = parseInt(route.query.minOrder) || 500
  const size = route.query.size
  const quantity = parseInt(route.query.quantity) || minOrder
  
  // Parse product data if available
  let productData = null
  if (route.query.productData) {
    try {
      productData = JSON.parse(route.query.productData)
    } catch (e) {
      console.error('Error parsing product data:', e)
    }
  }
  
  return { productId, productName, productImage, productCategory, minOrder, size, quantity, productData }
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────
onMounted(async () => {

  // ✅ Check if coming from product detail page with params
  const { productId, productName, productImage, productCategory, minOrder, size, quantity, productData } = parseProductDataFromQuery()

  // Load cart data
  if (isCartOrder.value) {
    const pendingCart = sessionStorage.getItem('pendingCart')
    if (pendingCart) {
      orderProducts.value = JSON.parse(pendingCart)
    } else {
      loadCart()
      const savedCart = localStorage.getItem('customerCart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        orderProducts.value = parsedCart.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          category: item.category,
          size: item.size || '',
          quantity: item.quantity,
          printPlacement: item.printPlacement || '',
          printSize: item.printSize || '',
          designNotes: item.designNotes || '',
          estimatedTotal: item.estimatedTotal || 0,
          sizes: item.sizes || [],
          minOrder: item.minOrder || 500,
          unitPrice: item.unitPrice || 0
        }))
      }
    }
    
    // Initialize designs
    itemDesigns.value = orderProducts.value.map(() => ({
      designSource: 'upload',
      printSize: '',
      printPlacement: '',
      designNotes: '',
      files: [],
      selectedTemplateId: null,
      selectedTemplate: null
    }))
    itemVariantSettings.value = orderProducts.value.map(() => ({
      printSize: '',
      printPlacement: '',
      designNotes: ''
    }))
    placementSettings.value = orderProducts.value.map(() => ({
      printSize: '',
      printPlacement: '',
      designNotes: ''
    }))
  }

 // ✅ Single product order from Product Detail Page
  if (!isCartOrder.value && orderType.value === 'company-product') {
    // If we have product data from query params, use it
    if (productId && productData) {
      selectedProductData.value = productData
      
      // ✅ Use the size from query, fallback to first available
      let defaultSize = size
      
      // If size is not provided or invalid, use first available
      if (!defaultSize || !productData.sizes?.find(s => s.name === defaultSize)) {
        defaultSize = productData.sizes?.[0]?.name || ''
      }
      
      // ✅ Set the quantity
      const defaultQuantity = quantity || minOrder || productData.minOrder || 500
      
      console.log('🔧 Setting default values:', { defaultSize, defaultQuantity })
      
      // Find the unit price for the selected size
      const selectedSizeObj = productData.sizes?.find(s => s.name === defaultSize)
      
      orderProducts.value = [{
        productId: productId,
        name: productName || productData.name,
        image: productImage || productData.image,
        category: productCategory || productData.category,
        size: defaultSize, // ✅ Set the size from query
        quantity: defaultQuantity,
        minOrder: minOrder || productData.minOrder || 500,
        sizes: productData.sizes || [],
        unitPrice: selectedSizeObj?.price || 0
      }]
      
      // ✅ Set design mode to individual for single product
      designMode.value = 'individual'
      
      // Initialize designs
      itemDesigns.value = [{
        designSource: 'upload',
        printSize: '',
        printPlacement: '',
        designNotes: '',
        files: [],
        selectedTemplateId: null,
        selectedTemplate: null
      }]
      
      console.log('✅ Order products set:', orderProducts.value)
      
    } else if (productId) {
      // Fallback: fetch product from API
      const response = await productsApi.getProductById(productId)
      if (response.success && response.data) {
        selectedProductData.value = response.data
        
        // ✅ Use size from query or fallback to first
        let defaultSize = size
        if (!defaultSize || !response.data.sizes?.find(s => s.name === defaultSize)) {
          defaultSize = response.data.sizes?.[0]?.name || ''
        }
        
        const defaultQuantity = quantity || response.data.minOrder || 500
        
        orderProducts.value = [{
          productId: response.data.id,
          name: response.data.name,
          image: response.data.image,
          category: response.data.category,
          size: defaultSize,
          quantity: defaultQuantity,
          minOrder: response.data.minOrder,
          sizes: response.data.sizes,
          unitPrice: response.data.sizes?.find(s => s.name === defaultSize)?.price || 0
        }]
        
        itemDesigns.value = [{
          designSource: 'upload',
          printSize: '',
          printPlacement: '',
          designNotes: '',
          files: [],
          selectedTemplateId: null,
          selectedTemplate: null
        }]
        designMode.value = 'individual'
      }
    }
  }


  // Own cups
  if (isOwnCups.value) {
    orderProducts.value = [{
      productType: '',
      sizes: '',
      quantity: 500
    }]
    itemDesigns.value = [{
      designSource: 'upload',
      printSize: '',
      printPlacement: '',
      designNotes: '',
      files: [],
      selectedTemplateId: null,
      selectedTemplate: null
    }]
    itemVariantSettings.value = [{
      printSize: '',
      printPlacement: '',
      designNotes: ''
    }]
    placementSettings.value = [{
      printSize: '',
      printPlacement: '',
      designNotes: ''
    }]
    // For own cups, default to individual mode since they're bringing their own items and must provide design
    designMode.value = 'individual'

    const pendingOwnCups = sessionStorage.getItem('pendingOwnCups')
    if (pendingOwnCups) {
      const data = JSON.parse(pendingOwnCups)
      if (data.ownCupsDeliveryDate) {
        fulfillment.value.ownCupsDeliveryDate = data.ownCupsDeliveryDate
      }
    }
  }

  // Load saved customer info
  const saved = localStorage.getItem('defaultCustomerInfo')
  if (saved) {
    const data = JSON.parse(saved)
    customerInfo.value = { ...customerInfo.value, ...data }
  }

  await fetchTemplates()
})
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
textarea.field {
  @apply h-auto py-2;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>