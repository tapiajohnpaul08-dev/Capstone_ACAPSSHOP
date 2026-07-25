<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Fulfillment Preference</h4>
      <p class="text-xs text-gray-500 mt-0.5">How would you like to receive your order?</p>
    </div>
    <div class="px-6 py-5 space-y-4">

      <!-- Delivery / Pickup toggle -->
      <div class="grid md:grid-cols-2 gap-3">
        <div
          @click="setMethod('delivery')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="modelValue.method === 'delivery'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.method === 'delivery' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.method === 'delivery'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span class="text-sm font-semibold text-gray-800">Delivery</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">We'll deliver to your address</p>
            </div>
          </div>
        </div>

        <div
          @click="setMethod('pickup')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="modelValue.method === 'pickup'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.method === 'pickup' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.method === 'pickup'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600">
                  <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                  <path d="M12 22V12"/>
                  <polyline points="3.29 7 12 12 20.71 7"/>
                </svg>
                <span class="text-sm font-semibold text-gray-800">Pick-up</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Pick up from our location</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery address (only when delivery selected) -->
      <div v-if="modelValue.method === 'delivery'" class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700" for="ff-addr">
          Delivery Address <span class="text-red-500">*</span>
        </label>
        <textarea
          id="ff-addr"
          :value="modelValue.deliveryAddress"
          @input="updateField('deliveryAddress', $event.target.value)"
          @blur="validateDeliveryAddress"
          placeholder="Enter complete delivery address"
          rows="2"
          class="field resize-none"
          :class="{ 
            'border-red-400 ring-1 ring-red-300': deliveryAddressError,
            'border-green-400 ring-1 ring-green-300': isValidDeliveryAddress && modelValue.deliveryAddress
          }"
        ></textarea>
        <p v-if="deliveryAddressError" class="text-xs text-red-500">{{ deliveryAddressError }}</p>
        <p v-else-if="isValidDeliveryAddress && modelValue.deliveryAddress" class="text-xs text-green-500">✓ Valid address</p>
        
        <label class="flex items-center gap-2 cursor-pointer select-none w-fit mt-1">
          <input
            type="checkbox"
            :checked="modelValue.sameAsCustomer"
            @change="handleSameAsCustomer($event.target.checked)"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-xs text-gray-600">Same as customer address</span>
        </label>
      </div>

      <!-- Pickup info -->
      <div v-else class="p-4 bg-gray-50 rounded-lg border text-sm text-gray-600 flex gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500 shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <span class="font-medium text-gray-800">ACAPSHOP — Main Store</span><br/>
          123 Printing Ave., Manila, Philippines<br/>
          <span class="text-xs text-gray-400">Mon–Sat · 8AM–6PM · (02) 1234-5678</span>
        </div>
      </div>

      <!-- Preferred Date Selection -->
      <div class="border-t pt-4 mt-4">
        <div class="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h5 class="font-medium text-gray-800 text-sm">Preferred Date</h5>
          <span class="text-xs text-gray-400">(5-7 business days from today)</span>
        </div>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              :value="modelValue.preferredDate"
              @input="updateField('preferredDate', $event.target.value)"
              :min="minDate"
              :max="maxDate"
              class="field"
              :class="{
                'border-red-400 ring-1 ring-red-300': dateError
              }"
            />
            <p v-if="dateError" class="text-xs text-red-500 mt-1">{{ dateError }}</p>
            <p v-else-if="modelValue.preferredDate" class="text-xs text-green-500 mt-1">✓ Valid date selected</p>
            <p class="text-xs text-gray-400 mt-1">
              Earliest: {{ formatDate(minDate) }} · Latest: {{ formatDate(maxDate) }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Preferred Time</label>
            <select
              v-model="modelValue.preferredTime"
              @change="updateField('preferredTime', $event.target.value)"
              class="field"
            >
              <option value="">Select time slot...</option>
              <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
              <option value="Afternoon (1PM - 5PM)">Afternoon (1PM - 5PM)</option>
              <option value="Evening (5PM - 8PM)">Evening (5PM - 8PM)</option>
              <option value="Anytime">Anytime</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Choose your preferred time slot</p>
          </div>
        </div>

        <!-- Quick selection chips -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="date in quickDates"
            :key="date.label"
            @click="selectQuickDate(date.value)"
            class="px-3 py-1.5 text-xs rounded-full border transition-colors"
            :class="modelValue.preferredDate === date.value
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'"
          >
            {{ date.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { 
    type: Object, 
    required: true,
    default: () => ({
      method: 'delivery',
      deliveryAddress: '',
      sameAsCustomer: false,
      preferredDate: '',
      preferredTime: ''
    })
  },
  customerAddress: { type: String, default: '' },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

// ─── DATE HELPERS ──────────────────────────────────────────────────────────
function getBusinessDaysFromToday(days) {
  const date = new Date()
  let businessDaysAdded = 0
  
  while (businessDaysAdded < days) {
    date.setDate(date.getDate() + 1)
    const dayOfWeek = date.getDay()
    // Skip Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysAdded++
    }
  }
  
  return date
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-PH', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

function toDateInputValue(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// ─── DATE RANGE ────────────────────────────────────────────────────────────
const minDateObj = getBusinessDaysFromToday(5)
const maxDateObj = getBusinessDaysFromToday(7)

const minDate = computed(() => toDateInputValue(minDateObj))
const maxDate = computed(() => toDateInputValue(maxDateObj))

// Quick select dates
const quickDates = computed(() => {
  const dates = []
  for (let i = 5; i <= 7; i++) {
    const date = getBusinessDaysFromToday(i)
    const label = i === 5 ? 'Earliest' : i === 7 ? 'Latest' : `${i} days`
    dates.push({
      label: `${label} (${formatDate(date)})`,
      value: toDateInputValue(date)
    })
  }
  return dates
})

// ─── VALIDATION ────────────────────────────────────────────────────────────
const deliveryAddressTouched = ref(false)

const dateError = computed(() => {
  if (!props.modelValue.preferredDate) return ''
  
  const selected = new Date(props.modelValue.preferredDate)
  const min = new Date(minDate.value)
  const max = new Date(maxDate.value)
  
  // Reset time to compare dates only
  selected.setHours(0, 0, 0, 0)
  min.setHours(0, 0, 0, 0)
  max.setHours(0, 0, 0, 0)
  
  if (selected < min) {
    return `Earliest available date is ${formatDate(min)} (5 business days)`
  }
  if (selected > max) {
    return `Latest available date is ${formatDate(max)} (7 business days)`
  }
  return ''
})

const deliveryAddressError = computed(() => {
  if (!deliveryAddressTouched.value && !props.errors?.deliveryAddress) return ''
  if (props.modelValue.method !== 'delivery') return ''
  if (!props.modelValue.deliveryAddress || !props.modelValue.deliveryAddress.trim()) {
    return 'Delivery address is required'
  }
  if (props.modelValue.deliveryAddress.trim().length < 5) {
    return 'Please enter a complete delivery address'
  }
  return props.errors?.deliveryAddress || ''
})

const isValidDeliveryAddress = computed(() => {
  return deliveryAddressTouched.value && 
         props.modelValue.deliveryAddress && 
         props.modelValue.deliveryAddress.trim().length >= 5 &&
         !deliveryAddressError.value
})

// ─── METHODS ──────────────────────────────────────────────────────────────
function validateDeliveryAddress() {
  deliveryAddressTouched.value = true
}

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
  if (field === 'deliveryAddress') {
    validateDeliveryAddress()
  }
}

function setMethod(method) {
  updateField('method', method)
  if (method === 'pickup') {
    deliveryAddressTouched.value = false
  }
}

function handleSameAsCustomer(checked) {
  updateField('sameAsCustomer', checked)
  if (checked && props.customerAddress) {
    updateField('deliveryAddress', props.customerAddress)
    validateDeliveryAddress()
  } else if (!checked) {
    updateField('deliveryAddress', '')
    deliveryAddressTouched.value = false
  }
}

function selectQuickDate(dateValue) {
  updateField('preferredDate', dateValue)
}

// ─── INITIALIZE DEFAULT DATE ─────────────────────────────────────────────
// Set default date to earliest available (5 business days) if not already set
if (!props.modelValue.preferredDate) {
  const defaultDate = toDateInputValue(getBusinessDaysFromToday(5))
  // Use nextTick to avoid mutating prop directly during render
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      if (!props.modelValue.preferredDate) {
        emit('update:modelValue', { 
          ...props.modelValue, 
          preferredDate: defaultDate 
        })
      }
    })
  })
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