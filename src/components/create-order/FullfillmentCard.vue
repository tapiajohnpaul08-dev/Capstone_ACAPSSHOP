<!-- FulfillmentCard.vue - Full address fields with Region dropdown -->
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

      <!-- Delivery address (only when delivery selected) -->
      <div v-if="modelValue.method === 'delivery'" class="space-y-3 border-t pt-4">
        <h5 class="text-sm font-semibold text-gray-800">Delivery Address <span class="text-red-500">*</span></h5>
        <p class="text-xs text-gray-500">Where should we deliver your order?</p>

        <!-- Saved address banner -->
        <div v-if="showSavedAddressBanner" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" class="text-blue-600 shrink-0 mt-0.5">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-blue-900">Use your saved address</p>
            <p class="text-[11px] text-blue-700 mt-0.5 truncate">{{ savedAddressSummary }}</p>
          </div>
          <button type="button" @click="$emit('use-saved-address')"
            class="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Use
          </button>
        </div>

        <div class="space-y-3">
          <div class="grid md:grid-cols-2 gap-3">
            <!-- Country (Philippines only) -->
          <div>
            <label class="text-sm font-medium text-gray-700">Country <span class="text-red-500">*</span></label>
            <select 
              :value="deliveryAddress.country || 'Philippines'"
              @change="updateDeliveryField('country', $event.target.value)"
              class="field"
            >
              <option value="Philippines">Philippines</option>
            </select>
          </div>

          <!-- Region -->
          <div>
            <label class="text-sm font-medium text-gray-700">Region <span class="text-red-500">*</span>               
 </label>
            <select 
              :value="deliveryAddress.region"
              @change="updateDeliveryField('region', $event.target.value)"
              @blur="validateDeliveryField('region')"
              class="field"
              :class="{ 
                'border-red-400 ring-1 ring-red-300': deliveryErrors.region,
                'border-green-400 ring-1 ring-green-300': isValidDeliveryField('region') && deliveryAddress.region
              }"
            >
              <option value="">Select region...</option>
              <option value="Luzon">Luzon</option>
              <option value="Visayas">Visayas</option>
              <option value="Mindanao">Mindanao</option>
            </select>
            <p v-if="deliveryErrors.region" class="text-xs text-red-500">{{ deliveryErrors.region }}</p>
            <p v-else-if="isValidDeliveryField('region') && deliveryAddress.region" class="text-xs text-green-500">✓ Region selected</p>
          </div>
          </div>

          <div class="grid md:grid-cols-2 gap-3">
            <!-- Province -->
            <div>
              <label class="text-sm font-medium text-gray-700">Province <span class="text-red-500">*</span></label>
              <input
                :value="deliveryAddress.province"
                @input="updateDeliveryField('province', $event.target.value)"
                @blur="validateDeliveryField('province')"
                type="text"
                placeholder="e.g., Metro Manila"
                class="field"
                :class="{ 
                  'border-red-400 ring-1 ring-red-300': deliveryErrors.province,
                  'border-green-400 ring-1 ring-green-300': isValidDeliveryField('province') && deliveryAddress.province
                }"
              />
              <p v-if="deliveryErrors.province" class="text-xs text-red-500">{{ deliveryErrors.province }}</p>
            </div>
            <!-- Postal Code -->
            <div>
              <label class="text-sm font-medium text-gray-700">Postal Code <span class="text-red-500">*</span></label>
              <input
                :value="deliveryAddress.postalCode"
                @input="updateDeliveryField('postalCode', $event.target.value)"
                @blur="validateDeliveryField('postalCode')"
                type="text"
                placeholder="e.g., 1100"
                class="field"
                :class="{ 
                  'border-red-400 ring-1 ring-red-300': deliveryErrors.postalCode,
                  'border-green-400 ring-1 ring-green-300': isValidDeliveryField('postalCode') && deliveryAddress.postalCode
                }"
              />
              <p v-if="deliveryErrors.postalCode" class="text-xs text-red-500">{{ deliveryErrors.postalCode }}</p>
              <p v-else-if="isValidDeliveryField('postalCode') && deliveryAddress.postalCode" class="text-xs text-green-500">✓ Valid postal code</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-3">
            
            <!-- Municipality -->
            <div>
              <label class="text-sm font-medium text-gray-700">Municipality / City <span class="text-red-500">*</span></label>
              <input
                :value="deliveryAddress.municipality"
                @input="updateDeliveryField('municipality', $event.target.value)"
                @blur="validateDeliveryField('municipality')"
                type="text"
                placeholder="e.g., Quezon City"
                class="field"
                :class="{ 
                  'border-red-400 ring-1 ring-red-300': deliveryErrors.municipality,
                  'border-green-400 ring-1 ring-green-300': isValidDeliveryField('municipality') && deliveryAddress.municipality
                }"
              />
              <p v-if="deliveryErrors.municipality" class="text-xs text-red-500">{{ deliveryErrors.municipality }}</p>
            </div>

            <!-- Barangay -->
            <div>
              <label class="text-sm font-medium text-gray-700">Barangay <span class="text-red-500">*</span></label>
              <input
                :value="deliveryAddress.barangay"
                @input="updateDeliveryField('barangay', $event.target.value)"
                @blur="validateDeliveryField('barangay')"
                type="text"
                placeholder="e.g., Barangay 123"
                class="field"
                :class="{ 
                  'border-red-400 ring-1 ring-red-300': deliveryErrors.barangay,
                  'border-green-400 ring-1 ring-green-300': isValidDeliveryField('barangay') && deliveryAddress.barangay
                }"
              />
              <p v-if="deliveryErrors.barangay" class="text-xs text-red-500">{{ deliveryErrors.barangay }}</p>
            </div>
          </div>

          <!-- Street Address (merged field) -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Street Address <span class="text-red-500">*</span>
              <span class="text-xs font-normal text-gray-400">(House/Unit/Flr #, Building Name, Blk/Lot, Purok)</span>
            </label>
            <textarea
              :value="deliveryAddress.streetAddress"
              @input="updateDeliveryField('streetAddress', $event.target.value)"
              @blur="validateDeliveryField('streetAddress')"
              rows="2"
              placeholder="e.g., 123 Unit 4B, Tower A, Block 1 Lot 5, Purok 3"
              class="field resize-none"
              :class="{ 
                'border-red-400 ring-1 ring-red-300': deliveryErrors.streetAddress,
                'border-green-400 ring-1 ring-green-300': isValidDeliveryField('streetAddress') && deliveryAddress.streetAddress
              }"
            ></textarea>
            <p v-if="deliveryErrors.streetAddress" class="text-xs text-red-500">{{ deliveryErrors.streetAddress }}</p>
            <p v-else-if="isValidDeliveryField('streetAddress') && deliveryAddress.streetAddress" class="text-xs text-green-500">✓ Valid address</p>
          </div>

          <!-- Full delivery address preview -->
          <div v-if="hasDeliveryAddressFields" class="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-xs font-medium text-gray-600">Delivery Address Preview</p>
            <p class="text-sm text-gray-800 mt-1">{{ fullDeliveryAddress }}</p>
          </div>
        </div>
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
            <span class="text-blue-600">Your completion date must be at least 7 business days after this date.</span>
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
            <p v-if="isOwnCups" class="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Info class="w-3 h-3" />
              <span v-if="modelValue.ownCupsDeliveryDate">
                Based on your drop-off date ({{ formatDate(modelValue.ownCupsDeliveryDate) }}), the earliest completion date is {{ formatDate(minDate) }}.
              </span>
              <span v-else>
                Please select the date you'll bring your items first — it determines the earliest completion date.
              </span>
            </p>
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
      ownCupsDeliveryDate: '',
      // Delivery address fields
      deliveryCountry: 'Philippines',
      deliveryRegion: '',
      deliveryStreetAddress: '',
      deliveryBarangay: '',
      deliveryMunicipality: '',
      deliveryProvince: '',
      deliveryPostalCode: ''
    })
  },
  customerAddress: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  isOwnCups: { type: Boolean, default: false },
    savedAddress: { type: Object, default: null },

})

const emit = defineEmits(['update:modelValue'])

// Show banner only when we have saved address data AND the current form is missing the main fields
const showSavedAddressBanner = computed(() => {
  const sa = props.savedAddress
  if (!sa) return false
  // Require at least street + municipality + province to be considered "meaningful"
  if (!sa.streetAddress || !sa.municipality || !sa.province) return false

  // If the form already has address data, hide
  const mv = props.modelValue
  const hasAddress = mv.deliveryStreetAddress && mv.deliveryMunicipality && mv.deliveryProvince
  if (hasAddress) return false

  return true
})

const savedAddressSummary = computed(() => {
  const sa = props.savedAddress || {}
  const parts = [
    sa.streetAddress,
    sa.barangay,
    sa.municipality,
    sa.province,
  ].filter(Boolean)
  return parts.join(', ')
})

// ─── DELIVERY ADDRESS STATE ──────────────────────────────────────────────
const deliveryAddress = computed({
  get: () => ({
    country: props.modelValue.deliveryCountry || 'Philippines',
    region: props.modelValue.deliveryRegion || '',
    streetAddress: props.modelValue.deliveryStreetAddress || '',
    barangay: props.modelValue.deliveryBarangay || '',
    municipality: props.modelValue.deliveryMunicipality || '',
    province: props.modelValue.deliveryProvince || '',
    postalCode: props.modelValue.deliveryPostalCode || ''
  }),
  set: (val) => {
    emit('update:modelValue', { 
      ...props.modelValue, 
      deliveryCountry: val.country,
      deliveryRegion: val.region,
      deliveryStreetAddress: val.streetAddress,
      deliveryBarangay: val.barangay,
      deliveryMunicipality: val.municipality,
      deliveryProvince: val.province,
      deliveryPostalCode: val.postalCode
    })
  }
})

// ─── DELIVERY VALIDATION ──────────────────────────────────────────────────
const deliveryErrors = ref({
  region: '',
  streetAddress: '',
  barangay: '',
  municipality: '',
  province: '',
  postalCode: ''
})

const deliveryValidatedFields = ref({
  region: false,
  streetAddress: false,
  barangay: false,
  municipality: false,
  province: false,
  postalCode: false
})

const hasDeliveryAddressFields = computed(() => {
  return deliveryAddress.value.streetAddress || deliveryAddress.value.barangay || deliveryAddress.value.municipality || deliveryAddress.value.province
})

// This concatenates all address fields into a single string for the API
const fullDeliveryAddress = computed(() => {
  const parts = [
    props.modelValue.deliveryStreetAddress,
    props.modelValue.deliveryBarangay,
    props.modelValue.deliveryMunicipality,
    props.modelValue.deliveryProvince,
    props.modelValue.deliveryPostalCode,
    props.modelValue.deliveryRegion,
    props.modelValue.deliveryCountry || 'Philippines'
  ].filter(Boolean)
  return parts.join(', ')
})

function validateDeliveryRegion(value) {
  if (!value || !value.trim()) {
    return 'Region is required'
  }
  return ''
}

function validateDeliveryStreetAddress(value) {
  if (!value || !value.trim()) {
    return 'Street address is required'
  }
  if (value.trim().length < 5) {
    return 'Please enter a complete street address'
  }
  return ''
}

function validateDeliveryBarangay(value) {
  if (!value || !value.trim()) {
    return 'Barangay is required'
  }
  return ''
}

function validateDeliveryMunicipality(value) {
  if (!value || !value.trim()) {
    return 'Municipality is required'
  }
  return ''
}

function validateDeliveryProvince(value) {
  if (!value || !value.trim()) {
    return 'Province is required'
  }
  return ''
}

function validateDeliveryPostalCode(value) {
  if (!value || !value.trim()) {
    return 'Postal code is required'
  }
  if (!/^\d{4}$/.test(value.trim())) {
    return 'Enter a valid 4-digit postal code'
  }
  return ''
}

function validateDeliveryField(field) {
  deliveryValidatedFields.value[field] = true
  switch (field) {
    case 'region':
      deliveryErrors.value.region = validateDeliveryRegion(deliveryAddress.value.region)
      break
    case 'streetAddress':
      deliveryErrors.value.streetAddress = validateDeliveryStreetAddress(deliveryAddress.value.streetAddress)
      break
    case 'barangay':
      deliveryErrors.value.barangay = validateDeliveryBarangay(deliveryAddress.value.barangay)
      break
    case 'municipality':
      deliveryErrors.value.municipality = validateDeliveryMunicipality(deliveryAddress.value.municipality)
      break
    case 'province':
      deliveryErrors.value.province = validateDeliveryProvince(deliveryAddress.value.province)
      break
    case 'postalCode':
      deliveryErrors.value.postalCode = validateDeliveryPostalCode(deliveryAddress.value.postalCode)
      break
  }
}

function isValidDeliveryField(field) {
  return deliveryValidatedFields.value[field] && !deliveryErrors.value[field] && deliveryAddress.value[field]
}

function updateDeliveryField(field, value) {
  const newAddress = { ...deliveryAddress.value, [field]: value }
  deliveryAddress.value = newAddress
  if (deliveryErrors.value[field]) {
    validateDeliveryField(field)
  }
}

// ─── DATE HELPERS ──────────────────────────────────────────────────────────
function addBusinessDays(startDate, days) {
  const date = new Date(startDate)
  date.setHours(0, 0, 0, 0)
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
const MIN_LEAD_DAYS = 3
const MAX_LEAD_DAYS = 10

const referenceDate = computed(() => {
  if (props.isOwnCups && props.modelValue.ownCupsDeliveryDate) {
    const d = new Date(props.modelValue.ownCupsDeliveryDate)
    if (!isNaN(d.getTime())) return d
  }
  return new Date()
})

const minDateObj = computed(() => addBusinessDays(referenceDate.value, MIN_LEAD_DAYS))
const maxDateObj = computed(() => addBusinessDays(referenceDate.value, MAX_LEAD_DAYS))

const minDate = computed(() => toDateInputValue(minDateObj.value))
const maxDate = computed(() => toDateInputValue(maxDateObj.value))
const todayDate = computed(() => getTodayDate())

// ─── VALIDATION ────────────────────────────────────────────────────────────
const deliveryAddressTouched = ref(false)
const dateTouched = ref(false)

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
    return props.isOwnCups && props.modelValue.ownCupsDeliveryDate
      ? `Earliest available date is ${formatDate(min)} (7 business days after your drop-off date)`
      : `Earliest available date is ${formatDate(min)} (7 business days from today)`
  }
  if (selected > max) {
    return `Latest available date is ${formatDate(max)} (${MAX_LEAD_DAYS} business days)`
  }
  return ''
})

const showDeliveryError = computed(() => {
  return deliveryAddressTouched.value && 
         props.modelValue.method === 'delivery' && 
         (!deliveryAddress.value.streetAddress || !deliveryAddress.value.barangay || !deliveryAddress.value.municipality || !deliveryAddress.value.province)
})

// ─── METHODS ──────────────────────────────────────────────────────────────
function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
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

// Watch for changes and re-validate
watch(deliveryAddress, () => {
  if (props.modelValue.method === 'delivery') {
    deliveryAddressTouched.value = true
  }
}, { deep: true })

// If the own-cups drop-off date changes, update the min date
watch(minDate, (newMin) => {
  if (!props.modelValue.preferredDate) return
  const selected = new Date(props.modelValue.preferredDate)
  const min = new Date(newMin)
  selected.setHours(0, 0, 0, 0)
  min.setHours(0, 0, 0, 0)
  if (selected < min) {
    emit('update:modelValue', {
      ...props.modelValue,
      preferredDate: newMin
    })
  }
})

// ─── INITIALIZE DEFAULT DATE ─────────────────────────────────────────────
if (!props.modelValue.preferredDate) {
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      if (!props.modelValue.preferredDate) {
        emit('update:modelValue', { 
          ...props.modelValue, 
          preferredDate: minDate.value 
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