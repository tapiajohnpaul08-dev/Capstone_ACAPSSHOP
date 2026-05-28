<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Header -->
    <div class="mb-6">
      <button @click="router.back()" class="text-sm text-gray-500 hover:text-gray-800 mb-4">← Back</button>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1 text-sm">
            <span v-if="isOwnCups">You'll provide your own cups for printing.</span>
            <span v-else-if="isCartOrder">You're ordering {{ orderProducts.length }} product(s).</span>
            <span v-else>Order from our catalog — we supply & print.</span>
          </p>
        </div>
        <span class="px-3 py-1.5 rounded-full text-xs font-semibold" :class="orderBadgeClass">
          {{ orderBadgeText }}
        </span>
      </div>
    </div>

    <!-- Simplified Steps -->
    <div class="flex items-center gap-2 mb-8">
      <div v-for="(step, i) in steps" :key="step.key" class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" :class="stepClass(i)">
            <span v-if="currentStep > i">✓</span>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="text-xs font-medium hidden sm:block" :class="stepTextClass(i)">{{ step.label }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="w-8 h-px bg-gray-200"></div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 space-y-5">
        <!-- Step 0: Product Selection -->
        <div v-if="currentStep === 0">
          <ProductSelector
            v-model="orderProducts"
            :order-type="orderType"
            :is-cart-order="isCartOrder"
            :selected-product="selectedProductData"
            :is-own-cups="isOwnCups"
            @product-changed="onProductChanged"
          />
          <div v-if="step0Errors.length > 0" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div v-for="(error, idx) in step0Errors" :key="idx" class="text-xs text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Step 1: Design (Consolidated) -->
        <div v-if="currentStep === 1">
          <div class="space-y-6">
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
                  @design-changed="(design) => updateItemDesign(idx, design)"
                />
              </div>
            </div>
          </div>
          <div v-if="step1Errors.length > 0" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div v-for="(error, idx) in step1Errors" :key="idx" class="text-xs text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Step 2: Customer & Delivery (Consolidated) -->
        <div v-if="currentStep === 2" class="space-y-5">
          <CustomerInfoCard v-model="customerInfo" :errors="errors.customer" />
          <FulfillmentCard v-model="fulfillment" :customer-address="customerInfo.address" :errors="errors.fulfillment" />
        </div>

        <!-- Step 3: Payment Method (NEW) -->
        <div v-if="currentStep === 3">
          <PaymentMethodCard v-model="paymentMethod" :total-amount="totalAmount" />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center pt-4">
          <button 
            v-if="currentStep > 0" 
            @click="currentStep--" 
            class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
          <div v-else></div>
          
          <button 
            v-if="currentStep < steps.length - 1" 
            @click="nextStep" 
            :disabled="!isStepValid"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
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
          :can-submit="currentStep === steps.length - 1 && isFormValid"
          :is-submitting="isSubmitting"
          :validation-hints="validationHints"
          @submit="handleSubmit"
        />
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="router.push('/customer/orders')">
      <div class="bg-white rounded-2xl p-8 max-w-sm text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Order Submitted!</h3>
        <p class="text-gray-500 text-sm mb-6">
          We'll contact you within 1-2 business days for design approval and payment confirmation.
        </p>
        <button @click="router.push('/customer/orders')" class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View My Orders</button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart.js'
import { useTemplates } from '@/composables/useTemplates.js'
import CustomerInfoCard from '@/components/create-order/CustomerInfoCard.vue'
import FulfillmentCard from '@/components/create-order/FullfillmentCard.vue'
import PaymentMethodCard from '@/components/create-order/PaymentMethodCard.vue'
import OrderSummaryCard from '@/components/create-order/OrderSummaryCard.vue'
import DesignManager from '@/components/create-order/DesignManager.vue'
import ProductSelector from '@/components/create-order/ProductSelector.vue'
import { productsApi, ordersApi } from '@/api.js'
import { PHONE_REGEX, EMAIL_REGEX } from '@/constants/orderConstants'

const route = useRoute()
const router = useRouter()
const { loadCart } = useCart()
const { fetchTemplates } = useTemplates()

// State
const isSubmitting = ref(false)
const showSuccess = ref(false)
const toast = ref({ show: false, message: '' })
const selectedProductData = ref(null)
const orderProducts = ref([])
const itemDesigns = ref([])
const customerInfo = ref({ name: '', company: '', email: '', phone: '', address: '', saveAsDefault: false })
const fulfillment = ref({ method: 'delivery', deliveryAddress: '', sameAsCustomer: false })
const paymentMethod = ref({ method: 'cod', bankName: '', referenceNumber: '', paymentStatus: 'pending' })
const errors = ref({ customer: {}, fulfillment: {} })
const currentStep = ref(0)

// Steps - Reduced from 4 to 4 (consolidated customer & delivery)
const steps = [
  { key: 'product', label: 'Products' },
  { key: 'design', label: 'Design' },
  { key: 'info', label: 'Info & Delivery' },
  { key: 'payment', label: 'Payment' }
]

const orderType = computed(() => route.query.type === 'company-product' ? 'company-product' : 'own-cups')
const isCartOrder = computed(() => route.query.source === 'cart')
const isOwnCups = computed(() => orderType.value === 'own-cups')

const orderBadgeClass = computed(() => isOwnCups.value ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')
const orderBadgeText = computed(() => isOwnCups.value ? '📦 Own Cups' : (isCartOrder.value ? '🛒 Multi-Item' : 'Single Product'))

const totalQuantity = computed(() => orderProducts.value.reduce((sum, p) => sum + (p.quantity || 0), 0))
const orderSizes = computed(() => orderProducts.value.map(p => p.size).join(', '))

// Calculate total amount
const totalAmount = computed(() => {
  let total = 0
  for (const product of orderProducts.value) {
    total += (product.quantity || 0) * (product.unitPrice || 0)
  }
  return total
})

// Step Validation
const step0Errors = computed(() => {
  const errorsList = []
  if (isOwnCups.value) {
    if (!orderProducts.value[0]?.productType?.trim()) errorsList.push('Product type is required')
    if (!orderProducts.value[0]?.sizes?.trim()) errorsList.push('Cup size is required')
    if (!orderProducts.value[0]?.quantity || orderProducts.value[0]?.quantity < 500) errorsList.push('Quantity must be at least 500 pcs')
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
  for (let i = 0; i < orderProducts.value.length; i++) {
    const design = itemDesigns.value[i]
    const productName = orderProducts.value[i]?.name
    
    if (design?.designSource === 'upload') {
      const hasFiles = design.files && design.files.length > 0
      const hasPrintSize = design.printSize && design.printSize.trim()
      const hasPrintPlacement = design.printPlacement && design.printPlacement.trim()
      if (!hasFiles && !hasPrintSize && !hasPrintPlacement) {
        errorsList.push(`Please provide design details for "${productName}"`)
      }
    } else if (design?.designSource === 'saved') {
      if (!design.selectedTemplateId) {
        errorsList.push(`Please select a saved template for "${productName}"`)
      }
    }
  }
  return errorsList
})

const step2Errors = computed(() => {
  const errorsList = []
  if (!customerInfo.value.name.trim()) errorsList.push('Customer name required')
  if (!customerInfo.value.email.trim() || !EMAIL_REGEX.test(customerInfo.value.email)) errorsList.push('Valid email required')
  if (!customerInfo.value.phone.trim() || !PHONE_REGEX.test(customerInfo.value.phone.replace(/[\s\-\(\)]/g, ''))) errorsList.push('Valid phone required')
  if (!customerInfo.value.address.trim()) errorsList.push('Address required')
  if (fulfillment.value.method === 'delivery' && !fulfillment.value.deliveryAddress.trim()) errorsList.push('Delivery address required')
  return errorsList
})

const step3Errors = computed(() => {
  const errorsList = []
  if (!paymentMethod.value.method) errorsList.push('Please select a payment method')
  if (paymentMethod.value.method === 'bank_transfer' && !paymentMethod.value.bankName) errorsList.push('Please select a bank')
  return errorsList
})

const isStepValid = computed(() => {
  if (currentStep.value === 0) return step0Errors.value.length === 0 && orderProducts.value.length > 0
  if (currentStep.value === 1) return step1Errors.value.length === 0
  if (currentStep.value === 2) return step2Errors.value.length === 0
  if (currentStep.value === 3) return step3Errors.value.length === 0
  return false
})

const isFormValid = computed(() => {
  return step0Errors.value.length === 0 &&
    step1Errors.value.length === 0 &&
    step2Errors.value.length === 0 &&
    step3Errors.value.length === 0
})

const validationHints = computed(() => {
  if (currentStep.value < steps.length - 1) return []
  return [...step2Errors.value, ...step3Errors.value]
})

function stepClass(i) {
  if (currentStep.value > i) return 'bg-blue-600 text-white'
  if (currentStep.value === i) return 'bg-blue-600 text-white ring-4 ring-blue-100'
  return 'bg-gray-200 text-gray-500'
}

function stepTextClass(i) {
  if (currentStep.value === i) return 'text-blue-600'
  if (currentStep.value > i) return 'text-gray-500'
  return 'text-gray-400'
}

function getImageUrl(path) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  if (!path) return `${base}/uploads/products/default-product.jpg`
  if (path.startsWith('http')) return path
  return `${base}/uploads/products/${path.replace(/^\/+/, '')}`
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
}

function updateItemDesign(index, design) {
  itemDesigns.value[index] = design
}

function nextStep() {
  if (isStepValid.value) {
    currentStep.value++
    window.scrollTo(0, 0)
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true

  const itemsArray = []
  
  for (let i = 0; i < orderProducts.value.length; i++) {
    const product = orderProducts.value[i]
    const design = itemDesigns.value[i] || {
      designSource: 'upload',
      printSize: '',
      printPlacement: '',
      designNotes: '',
      files: []
    }
    
    let designImage = ''
    if (design.designSource === 'upload' && design.files && design.files.length > 0) {
      designImage = design.files[0].path || ''
    } else if (design.designSource === 'saved' && design.selectedTemplate) {
      designImage = design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || ''
    }
    
    const cleanedFiles = (design.files || []).map(file => ({
      name: file.name || '',
      size: file.size || 0,
      type: file.type || '',
      path: file.path || ''
    }))
    
    // Determine item properties based on order type
    let itemName = ''
    let itemCategory = ''
    let itemSize = ''
    let itemQuantity = 0
    
    if (isOwnCups.value) {
      itemName = product.productType
      itemCategory = 'Customer Provided'
      itemSize = product.sizes || 'Custom'
      itemQuantity = product.quantity || 500
    } else {
      itemName = product.name
      itemCategory = product.category
      itemSize = product.size
      itemQuantity = product.quantity
    }
    
    const item = {
      productId: isOwnCups.value ? null : product.productId,
      name: itemName,
      category: itemCategory,
      size: itemSize,
      quantity: itemQuantity,
      designSource: design.designSource,
      designImage: designImage,
      printSize: design.printSize || '',
      printPlacement: design.printPlacement || '',
      designNotes: design.designNotes || '',
      files: cleanedFiles
    }
    
    if (design.designSource === 'saved' && design.selectedTemplate) {
      item.selectedTemplateId = design.selectedTemplateId
      item.selectedTemplate = {
        id: design.selectedTemplate.id,
        name: design.selectedTemplate.name,
        thumbnail: design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || '',
        printSize: design.selectedTemplate.printSize,
        placement: design.selectedTemplate.placement,
        notes: design.selectedTemplate.notes
      }
    }
    
    itemsArray.push(item)
  }

  // Calculate total amount
  let totalAmount = 0
  if (!isOwnCups.value) {
    for (const item of itemsArray) {
      try {
        const priceResult = await productsApi.calculatePrice(item.productId, item.size, item.quantity)
        if (priceResult.success && priceResult.data) {
          totalAmount += priceResult.data.total
        }
      } catch (error) {
        console.error('Error calculating price:', error)
      }
    }
  }

  // Calculate total quantity across all items for the top-level field
  const totalQuantity = itemsArray.reduce((sum, item) => sum + (item.quantity || 0), 0)

  const orderData = {
    items: itemsArray,
    quantity: totalQuantity,  // ← ADD THIS - Top-level quantity field
    address: customerInfo.value.address,
    receivingMode: fulfillment.value.method === 'pickup' ? 'Pick-up' : 'Delivery',
    paymentMethod: paymentMethod.value.method,
    paymentDetails: paymentMethod.value.method === 'bank_transfer' ? {
      bankName: paymentMethod.value.bankName,
      referenceNumber: paymentMethod.value.referenceNumber
    } : null,
    isProvided: isOwnCups.value,
    amount: totalAmount || totalQuantity,
    customerName: customerInfo.value.name,
    customerEmail: customerInfo.value.email,
    customerPhone: customerInfo.value.phone,
    notes: isOwnCups.value 
      ? `Customer Provided Items: ${itemsArray.map(i => i.name).join(', ')}`
      : `Products: ${orderProducts.value.map(p => p.name).join(', ')}`,
    customer: {
      name: customerInfo.value.name,
      email: customerInfo.value.email,
      phone: customerInfo.value.phone,
      company: customerInfo.value.company
    }
  }

  console.log('Submitting order with quantity:', orderData)

  try {
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

// Load initial data
onMounted(async () => {
if (isCartOrder.value) {
    const pendingCart = sessionStorage.getItem('pendingCart')
    if (pendingCart) {
      orderProducts.value = JSON.parse(pendingCart)
      console.log('Loaded from pendingCart:', orderProducts.value)
    } else {
      loadCart()
      const savedCart = localStorage.getItem('customerCart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        console.log('Raw cart from localStorage:', parsedCart)
        
        // Ensure each cart item has all required fields
        orderProducts.value = parsedCart.map(item => {
          // Log each item to debug
          console.log('Cart item:', {
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            hasSize: !!item.size
          })
          
          return {
            productId: item.productId,
            name: item.name,
            image: item.image,
            category: item.category,
            size: item.size || '',  // Preserve the size
            quantity: item.quantity,
            printPlacement: item.printPlacement || '',
            printSize: item.printSize || '',
            designNotes: item.designNotes || '',
            estimatedTotal: item.estimatedTotal || 0,
            sizes: item.sizes || [],
            minOrder: item.minOrder || 500,
            unitPrice: item.unitPrice || 0
          }
        })
        
        console.log('Processed orderProducts:', orderProducts.value)
      }
    }
    
    // Initialize designs for each product
    itemDesigns.value = orderProducts.value.map((item, idx) => {
      console.log(`Initializing design for item ${idx}:`, item.name, 'size:', item.size)
      return {
        designSource: 'upload',
        printSize: '',
        printPlacement: '',
        designNotes: '',
        files: [],
        selectedTemplateId: null,
        selectedTemplate: null
      }
    })
  }

  if (!isCartOrder.value && orderType.value === 'company-product') {
    const productId = route.query.productId
    const preSelectedSize = route.query.size
    const preSelectedQuantity = route.query.quantity
    
    if (productId) {
      const response = await productsApi.getProductById(productId)
      if (response.success && response.data) {
        selectedProductData.value = response.data
        
        // Find the size that matches the pre-selected size, or use first size
        let selectedSizeName = preSelectedSize || response.data.sizes?.[0]?.name || ''
        let selectedQuantity = preSelectedQuantity ? parseInt(preSelectedQuantity) : (response.data.minOrder || 500)
        
        // Validate quantity is within stock
        const selectedSizeObj = response.data.sizes?.find(s => s.name === selectedSizeName)
        if (selectedSizeObj && selectedSizeObj.stock > 0 && selectedQuantity > selectedSizeObj.stock) {
          selectedQuantity = selectedSizeObj.stock
        }
        
        orderProducts.value = [{
          productId: response.data.id,
          name: response.data.name,
          image: response.data.image,
          category: response.data.category,
          size: selectedSizeName,
          quantity: selectedQuantity,
          minOrder: response.data.minOrder,
          sizes: response.data.sizes,
          unitPrice: selectedSizeObj?.price || response.data.sizes?.[0]?.price || 0
        }]
      }
    }
  }

  if (isOwnCups.value) {
    orderProducts.value = [{
      productType: '',
      sizes: '',
      quantity: 500
    }]
  }

  const saved = localStorage.getItem('defaultCustomerInfo')
  if (saved) {
    const data = JSON.parse(saved)
    customerInfo.value = { ...customerInfo.value, ...data }
  }

  if (orderProducts.value.length > 0 && itemDesigns.value.length === 0) {
    itemDesigns.value = orderProducts.value.map(() => ({
      designSource: 'upload',
      printSize: '',
      printPlacement: '',
      designNotes: '',
      files: [],
      selectedTemplateId: null,
      selectedTemplate: null
    }))
  }

  await fetchTemplates()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>