<!-- FulfillmentCard.vue - Fixed with proper date fields -->
<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <div class="flex items-center gap-2">
        <Truck class="w-4 h-4 text-blue-600" />
        <h4 class="font-semibold text-gray-900">Fulfillment Preference</h4>
      </div>
      <p class="text-xs text-gray-500 mt-0.5">How would you like to receive your order?</p>
    </div>
    <div class="px-6 py-5 space-y-4">
      <!-- Delivery / Pickup toggle -->
      <div class="grid md:grid-cols-2 gap-3">
        <div
          @click="setMethod('delivery')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="[
            modelValue.method === 'delivery'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300',
            { 'border-red-400 ring-1 ring-red-300': showDeliveryError && modelValue.method === 'delivery' }
          ]"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.method === 'delivery' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.method === 'delivery'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <Truck class="w-4 h-4 text-gray-600" />
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
                <MapPin class="w-4 h-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-800">Pick-up</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Pick up from our location</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error message for delivery method -->
      <p v-if="showDeliveryError && modelValue.method === 'delivery'" class="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle class="w-3 h-3" />
        Please fill in the delivery address below
      </p>

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
          placeholder="Enter complete delivery address (Street, Barangay, City, Province)"
          rows="2"
          class="field resize-none"
          :class="{ 
            'border-red-400 ring-1 ring-red-300': deliveryAddressError && !isValidDeliveryAddress,
            'border-green-400 ring-1 ring-green-300': isValidDeliveryAddress && modelValue.deliveryAddress
          }"
        ></textarea>
        
        <!-- Character counter -->
        <div class="flex justify-between items-center">
          <div>
            <p v-if="deliveryAddressError && !isValidDeliveryAddress" class="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle class="w-3 h-3" />
              {{ deliveryAddressError }}
            </p>
            <p v-else-if="isValidDeliveryAddress && modelValue.deliveryAddress" class="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle class="w-3 h-3" />
              Valid address
            </p>
          </div>
          <span class="text-xs text-gray-400" v-if="modelValue.deliveryAddress">
            {{ modelValue.deliveryAddress.length }}/{{ minAddressLength }}+ characters
          </span>
        </div>
        
        <label class="flex items-center gap-2 cursor-pointer select-none w-fit mt-1">
          <input
            type="checkbox"
            :checked="modelValue.sameAsCustomer"
            @change="handleSameAsCustomer($event.target.checked)"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-xs text-gray-600 flex items-center gap-1">
            <Copy class="w-3 h-3" />
            Same as customer address
          </span>
        </label>
      </div>

      <!-- Pickup info -->
      <div v-else class="p-4 bg-gray-50 rounded-lg border text-sm text-gray-600 flex gap-3">
        <MapPin class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span class="font-medium text-gray-800">ACAPS Trading — Main Store</span><br/>
          5051 QUE Grande Ext. Valenzuela, 1440 Manila, Philippines<br/>
          <span class="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Clock class="w-3 h-3" />
            Mon–Sat · 8AM–6PM · (02) 1234-5678
          </span>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- ✅ CUSTOMER DELIVERY DATE - ONLY FOR OWN CUPS (isOwnCups)      -->
      <!-- This is when the customer will bring their items to the company -->
      <!-- ============================================================ -->
      <div v-if="isOwnCups" class="border-t pt-4 mt-4">
        <div class="flex items-center gap-2 mb-3">
          <Calendar class="w-4 h-4 text-green-600" />
          <h5 class="font-medium text-gray-800 text-sm">When will you deliver your items to us?</h5>
          <!-- <span class="text-xs text-gray-400">(Own Items Only)</span> -->
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">
            Date You'll Bring Your Items <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            :value="modelValue.ownCupsDeliveryDate"
            @input="updateField('ownCupsDeliveryDate', $event.target.value)"
            :min="todayDate"
            class="field"
          />
          <p class="text-xs text-gray-400 mt-1">
            Select the date you'll bring your items to our store. 
            <span class="text-blue-600">This is separate from your preferred completion date.</span>
          </p>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- ✅ EXPECTED DELIVERY / COMPLETION DATE - FOR ALL ORDERS       -->
      <!-- This is when the customer wants to receive the finished items  -->
      <!-- ============================================================ -->
      <div class="border-t pt-4 mt-4">
        <div class="flex items-center gap-2 mb-3">
          <Calendar class="w-4 h-4 text-blue-500" />
          <h5 class="font-medium text-gray-800 text-sm">
            {{ isOwnCups ? 'When do you want to receive your finished items?' : 'When do you want to receive your order?' }}
          </h5>
          <span class="text-xs text-gray-400">({{ isOwnCups ? 'Completion Date' : 'Delivery Date' }})</span>
        </div>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">
              Date <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              :value="modelValue.preferredDate"
              @input="updateField('preferredDate', $event.target.value)"
              :min="minDate"
              :max="maxDate"
              class="field"
              :class="{
                'border-red-400 ring-1 ring-red-300': dateError && !isValidDate,
                'border-green-400 ring-1 ring-green-300': isValidDate && modelValue.preferredDate
              }"
            />
            <div class="flex justify-between items-center mt-1">
              <div>
                <p v-if="dateError && !isValidDate" class="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  {{ dateError }}
                </p>
                <p v-else-if="isValidDate && modelValue.preferredDate" class="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle class="w-3 h-3" />
                  Valid date selected
                </p>
              </div>
              <span class="text-xs text-gray-400">
                {{ formatDate(modelValue.preferredDate) || 'Select a date' }}
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Info class="w-3 h-3" />
              Earliest: {{ formatDate(minDate) }} · Latest: {{ formatDate(maxDate) }}
            </p>
            <p v-if="isOwnCups && modelValue.ownCupsDeliveryDate && modelValue.preferredDate" class="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Info class="w-3 h-3" />
              Note: Your items must be delivered to us before we can start production.
              <span v-if="new Date(modelValue.ownCupsDeliveryDate) > new Date(modelValue.preferredDate)" class="text-red-500 font-medium">
                (Delivery date is after completion date!)
              </span>
            </p>
          </div>
        </div>

        <!-- Quick selection chips -->
        <div class="mt-3">
          <p class="text-xs text-gray-500 mb-2">Quick select:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="date in quickDates"
              :key="date.label"
              @click="selectQuickDate(date.value)"
              class="px-3 py-1.5 text-xs rounded-full border transition-colors inline-flex items-center gap-1"
              :class="modelValue.preferredDate === date.value
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'"
            >
              <Calendar class="w-3 h-3" />
              {{ date.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  Copy, 
  Clock, 
  Calendar, 
  Info,
  AlertCircle
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: { 
    type: Object, 
    required: true,
    default: () => ({
      method: 'delivery',
      deliveryAddress: '',
      sameAsCustomer: false,
      preferredDate: '',
      preferredTime: '',
      ownCupsDeliveryDate: '' // ✅ Only used for Own Cups
    })
  },
  customerAddress: { type: String, default: '' },
  errors: { type: Object, default: () => ({}) },
  isOwnCups: { type: Boolean, default: false } // ✅ Determines if ownCupsDeliveryDate is shown
})

const emit = defineEmits(['update:modelValue'])

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const minAddressLength = 10

// ─── DATE HELPERS ──────────────────────────────────────────────────────────
function getBusinessDaysFromToday(days) {
  const date = new Date()
  let businessDaysAdded = 0
  
  while (businessDaysAdded < days) {
    date.setDate(date.getDate() + 1)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysAdded++
    }
  }
  
  return date
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch {
    return ''
  }
}

function toDateInputValue(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

function getTodayDate() {
  const today = new Date()
  return toDateInputValue(today)
}

// ─── DATE RANGE ────────────────────────────────────────────────────────────
const minDateObj = getBusinessDaysFromToday(5)
const maxDateObj = getBusinessDaysFromToday(7)

const minDate = computed(() => toDateInputValue(minDateObj))
const maxDate = computed(() => toDateInputValue(maxDateObj))
const todayDate = computed(() => getTodayDate())

// Quick select dates
const quickDates = computed(() => {
  const dates = []
  for (let i = 5; i <= 7; i++) {
    const date = getBusinessDaysFromToday(i)
    const label = i === 5 ? 'Earliest' : i === 7 ? 'Latest' : `${i} days`
    dates.push({
      label: `${label}`,
      value: toDateInputValue(date)
    })
  }
  return dates
})

// ─── VALIDATION ────────────────────────────────────────────────────────────
const deliveryAddressTouched = ref(false)
const dateTouched = ref(false)
const timeTouched = ref(false)

const isValidDate = computed(() => {
  if (!props.modelValue.preferredDate) return false
  const selected = new Date(props.modelValue.preferredDate)
  const min = new Date(minDate.value)
  const max = new Date(maxDate.value)
  
  selected.setHours(0, 0, 0, 0)
  min.setHours(0, 0, 0, 0)
  max.setHours(0, 0, 0, 0)
  
  return selected >= min && selected <= max
})

const dateError = computed(() => {
  if (!dateTouched.value && !props.errors?.preferredDate) return ''
  if (!props.modelValue.preferredDate) {
    return 'Please select a preferred date'
  }
  
  const selected = new Date(props.modelValue.preferredDate)
  const min = new Date(minDate.value)
  const max = new Date(maxDate.value)
  
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

const isValidDeliveryAddress = computed(() => {
  if (props.modelValue.method !== 'delivery') return false
  const address = props.modelValue.deliveryAddress?.trim() || ''
  return address.length >= minAddressLength
})

const deliveryAddressError = computed(() => {
  if (!deliveryAddressTouched.value && !props.errors?.deliveryAddress) return ''
  if (props.modelValue.method !== 'delivery') return ''
  const address = props.modelValue.deliveryAddress?.trim() || ''
  if (!address) {
    return 'Delivery address is required'
  }
  if (address.length < minAddressLength) {
    return `Please enter a complete address (minimum ${minAddressLength} characters)`
  }
  return props.errors?.deliveryAddress || ''
})

const showDeliveryError = computed(() => {
  return deliveryAddressTouched.value && 
         props.modelValue.method === 'delivery' && 
         !isValidDeliveryAddress
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
  if (field === 'preferredDate') {
    dateTouched.value = true
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
    deliveryAddressTouched.value = true
  } else if (!checked) {
    updateField('deliveryAddress', '')
    deliveryAddressTouched.value = false
  }
}

function selectQuickDate(dateValue) {
  updateField('preferredDate', dateValue)
  dateTouched.value = true
}

function validateAllFields() {
  if (props.modelValue.deliveryAddress) {
    deliveryAddressTouched.value = true
  }
  if (props.modelValue.preferredDate) {
    dateTouched.value = true
  }
}

watch(() => props.modelValue, () => {
  validateAllFields()
}, { immediate: true })

// ─── INITIALIZE DEFAULT DATE ─────────────────────────────────────────────
if (!props.modelValue.preferredDate) {
  const defaultDate = toDateInputValue(getBusinessDaysFromToday(5))
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
  @apply h-auto py-2 min-h-[72px];
}
</style>