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
          @click="!disabled && setMethod('delivery')"
          class="p-4 rounded-lg border-2 transition-all cursor-pointer"
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

      <!-- Delivery address -->
      <div v-if="modelValue.method === 'delivery'" class="space-y-3 border-t pt-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h5 class="text-sm font-semibold text-gray-800">
              Delivery Address <span class="text-red-500">*</span>
            </h5>
            <p class="text-xs text-gray-500">Where should we deliver your order?</p>
          </div>
          <button
            type="button"
            @click="toggleManualEntry"
            class="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {{ useManualEntry ? '← Back to dropdowns' : 'Enter manually' }}
          </button>
        </div>

        <!-- Saved addresses dropdown -->
        <div v-if="savedAddresses && savedAddresses.length > 0" class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">Use a Saved Address</label>
          <select
            :value="selectedAddressId"
            @change="selectSavedAddress($event.target.value)"
            class="field"
          >
            <option value="">— Choose a saved address or enter manually —</option>
            <option
              v-for="addr in savedAddresses"
              :key="addr._id"
              :value="addr._id"
            >
              {{ addr.label || 'Address' }}{{ addr.isDefault ? ' (Default)' : '' }} · {{ shorten(addr) }}
            </option>
          </select>
        </div>

        <!-- Saved address banner (legacy) -->
        <div v-if="showSavedAddressBanner"
          class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 flex items-start gap-2">
          <MapPin class="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-blue-900">Use your saved address</p>
            <p class="text-[11px] text-blue-700 mt-0.5 truncate">{{ savedAddressSummary }}</p>
          </div>
          <button type="button" @click="$emit('use-saved-address')"
            class="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Use
          </button>
        </div>

        <!-- API error -->
        <div v-if="addressApiError && !useManualEntry"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex items-start gap-2">
          <AlertCircle class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p class="text-[11px] text-amber-800">
            {{ addressApiError }}
            <button type="button" class="font-semibold underline ml-1" @click="useManualEntry = true">
              Switch to manual entry
            </button>
          </p>
        </div>

        <div class="space-y-3">
          <!-- ============================================================ -->
          <!-- ✅ DROPDOWN MODE                                              -->
          <!-- ============================================================ -->
          <template v-if="!useManualEntry">
            <div class="grid md:grid-cols-2 gap-3">
              <!-- Country -->
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Country <span class="text-red-500">*</span>
                </label>
                <select
                  :value="deliveryAddress.country || 'Philippines'"
                  @change="updateDeliveryField('country', $event.target.value)"
                  class="field"
                >
                  <option value="Philippines">Philippines</option>
                </select>
              </div>

              <!-- Region — Luzon / Visayas / Mindanao -->
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Region <span class="text-red-500">*</span>
                </label>
                <select
                  :value="deliveryAddress.region"
                  @change="onRegionChange($event.target.value)"
                  @blur="validateDeliveryField('region')"
                  class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  :disabled="disabled || loadingProvinces"
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
                <p v-else-if="isValidDeliveryField('region') && deliveryAddress.region" class="text-xs text-green-500">
                  ✓ Region selected
                </p>
              </div>
            </div>

            <!-- Province / Municipality -->
            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Province <span class="text-red-500">*</span>
                </label>
                <select
                  :value="deliveryAddress.province"
                  @change="onProvinceChange($event.target.value)"
                  @blur="validateDeliveryField('province')"
                  class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  :disabled="disabled || !deliveryAddress.region || loadingProvinces"
                  :class="{
                    'border-red-400 ring-1 ring-red-300': deliveryErrors.province,
                    'border-green-400 ring-1 ring-green-300': isValidDeliveryField('province') && deliveryAddress.province
                  }"
                >
                  <option value="">{{ provincePlaceholder }}</option>
                  <option v-for="p in provinces" :key="p.code" :value="p.name">
                    {{ p.name }}
                  </option>
                </select>
                <p v-if="deliveryErrors.province" class="text-xs text-red-500">{{ deliveryErrors.province }}</p>
                <p v-else-if="isValidDeliveryField('province') && deliveryAddress.province" class="text-xs text-green-500 truncate">
                  ✓ {{ deliveryAddress.province }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">
                  Municipality / City <span class="text-red-500">*</span>
                </label>
                <select
                  :value="deliveryAddress.municipality"
                  @change="onMunicipalityChange($event.target.value)"
                  @blur="validateDeliveryField('municipality')"
                  class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  :disabled="disabled || !deliveryAddress.province || loadingCities"
                  :class="{
                    'border-red-400 ring-1 ring-red-300': deliveryErrors.municipality,
                    'border-green-400 ring-1 ring-green-300': isValidDeliveryField('municipality') && deliveryAddress.municipality
                  }"
                >
                  <option value="">{{ cityPlaceholder }}</option>
                  <option v-for="c in cities" :key="c.code" :value="c.name">
                    {{ c.name }}
                  </option>
                </select>
                <p v-if="deliveryErrors.municipality" class="text-xs text-red-500">{{ deliveryErrors.municipality }}</p>
                <p v-else-if="isValidDeliveryField('municipality') && deliveryAddress.municipality" class="text-xs text-green-500 truncate">
                  ✓ {{ deliveryAddress.municipality }}
                </p>
              </div>
            </div>

            <!-- Barangay / Postal Code -->
            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Barangay <span class="text-red-500">*</span>
                </label>
                <select
                  :value="deliveryAddress.barangay"
                  @change="onBarangayChange($event.target.value)"
                  @blur="validateDeliveryField('barangay')"
                  class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  :disabled="disabled || !deliveryAddress.municipality || loadingBarangays"
                  :class="{
                    'border-red-400 ring-1 ring-red-300': deliveryErrors.barangay,
                    'border-green-400 ring-1 ring-green-300': isValidDeliveryField('barangay') && deliveryAddress.barangay
                  }"
                >
                  <option value="">{{ barangayPlaceholder }}</option>
                  <option v-for="b in barangays" :key="b.code" :value="b.name">
                    {{ b.name }}
                  </option>
                </select>
                <p v-if="deliveryErrors.barangay" class="text-xs text-red-500">{{ deliveryErrors.barangay }}</p>
                <p v-else-if="isValidDeliveryField('barangay') && deliveryAddress.barangay" class="text-xs text-green-500 truncate">
                  ✓ {{ deliveryAddress.barangay }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">
                  Postal Code <span class="text-red-500">*</span>
                </label>
                <input
                  :value="deliveryAddress.postalCode"
                  @input="updateDeliveryField('postalCode', $event.target.value)"
                  @blur="validateDeliveryField('postalCode')"
                  type="text"
                  inputmode="numeric"
                  maxlength="4"
                  placeholder="e.g., 1100"
                  class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  :disabled="disabled"
                  :class="{
                    'border-red-400 ring-1 ring-red-300': deliveryErrors.postalCode,
                    'border-green-400 ring-1 ring-green-300': isValidDeliveryField('postalCode') && deliveryAddress.postalCode
                  }"
                />
                <p v-if="deliveryErrors.postalCode" class="text-xs text-red-500">{{ deliveryErrors.postalCode }}</p>
                <p v-else-if="isValidDeliveryField('postalCode') && deliveryAddress.postalCode" class="text-xs text-green-500">
                  ✓ Valid postal code
                </p>
              </div>
            </div>
          </template>

          <!-- ============================================================ -->
          <!-- ✅ MANUAL MODE                                               -->
          <!-- ============================================================ -->
          <template v-else>
            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Region <span class="text-red-500">*</span>
                </label>
                <select
                  :value="deliveryAddress.region"
                  @change="updateDeliveryField('region', $event.target.value)"
                  @blur="validateDeliveryField('region')"
                  class="field"
                  :disabled="disabled"
                  :class="{ 'border-red-400 ring-1 ring-red-300': deliveryErrors.region }"
                >
                  <option value="">Select region...</option>
                  <option value="Luzon">Luzon</option>
                  <option value="Visayas">Visayas</option>
                  <option value="Mindanao">Mindanao</option>
                </select>
                <p v-if="deliveryErrors.region" class="text-xs text-red-500">{{ deliveryErrors.region }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Province <span class="text-red-500">*</span>
                </label>
                <input
                  :value="deliveryAddress.province"
                  @input="updateDeliveryField('province', $event.target.value)"
                  @blur="validateDeliveryField('province')"
                  type="text"
                  placeholder="e.g., Metro Manila"
                  class="field"
                  :disabled="disabled"
                  :class="{ 'border-red-400 ring-1 ring-red-300': deliveryErrors.province }"
                />
                <p v-if="deliveryErrors.province" class="text-xs text-red-500">{{ deliveryErrors.province }}</p>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Municipality / City <span class="text-red-500">*</span>
                </label>
                <input
                  :value="deliveryAddress.municipality"
                  @input="updateDeliveryField('municipality', $event.target.value)"
                  @blur="validateDeliveryField('municipality')"
                  type="text"
                  placeholder="e.g., Quezon City"
                  class="field"
                  :disabled="disabled"
                  :class="{ 'border-red-400 ring-1 ring-red-300': deliveryErrors.municipality }"
                />
                <p v-if="deliveryErrors.municipality" class="text-xs text-red-500">{{ deliveryErrors.municipality }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Barangay <span class="text-red-500">*</span>
                </label>
                <input
                  :value="deliveryAddress.barangay"
                  @input="updateDeliveryField('barangay', $event.target.value)"
                  @blur="validateDeliveryField('barangay')"
                  type="text"
                  placeholder="e.g., Barangay 123"
                  class="field"
                  :disabled="disabled"
                  :class="{ 'border-red-400 ring-1 ring-red-300': deliveryErrors.barangay }"
                />
                <p v-if="deliveryErrors.barangay" class="text-xs text-red-500">{{ deliveryErrors.barangay }}</p>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700">
                  Postal Code <span class="text-red-500">*</span>
                </label>
                <input
                  :value="deliveryAddress.postalCode"
                  @input="updateDeliveryField('postalCode', $event.target.value)"
                  @blur="validateDeliveryField('postalCode')"
                  type="text"
                  inputmode="numeric"
                  maxlength="4"
                  placeholder="e.g., 1100"
                  class="field"
                  :disabled="disabled"
                  :class="{ 'border-red-400 ring-1 ring-red-300': deliveryErrors.postalCode }"
                />
                <p v-if="deliveryErrors.postalCode" class="text-xs text-red-500">{{ deliveryErrors.postalCode }}</p>
              </div>
            </div>
          </template>

          <!-- Street Address -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Street Address <span class="text-red-500">*</span>
              <span class="text-xs font-normal text-gray-400">
                (House/Unit/Flr #, Building Name, Blk/Lot, Purok)
              </span>
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
            <p v-else-if="isValidDeliveryField('streetAddress') && deliveryAddress.streetAddress" class="text-xs text-green-500">
              ✓ Valid address
            </p>
          </div>

          <!-- Preview -->
          <div v-if="hasDeliveryAddressFields" class="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-xs font-medium text-gray-600">Delivery Address Preview</p>
            <p class="text-sm text-gray-800 mt-1">{{ fullDeliveryAddress }}</p>
          </div>

          <label
            v-if="modelValue.method === 'delivery' && hasDeliveryAddressFields"
            class="flex items-center gap-2 mt-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :checked="modelValue.saveAddressAsDefault"
              @change="updateField('saveAddressAsDefault', $event.target.checked)"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-600">Save this address for future orders</span>
          </label>
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
      <!-- Customer delivery date — only for own cups                    -->
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
            class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            :disabled="disabled"
          />
          <p class="text-xs text-gray-400 mt-1">
            Select the date you'll bring your items to our store.
            <span class="text-blue-600">Your completion date must be at least 7 business days after this date.</span>
          </p>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- Expected delivery / completion date                           -->
      <!-- ============================================================ -->
      <div class="border-t pt-4 mt-4">
        <div class="flex items-center gap-2 mb-3">
          <Calendar class="w-4 h-4 text-blue-500" />
          <h5 class="font-medium text-gray-800 text-sm">
            {{ isOwnCups ? 'When do you want to receive your finished items?' : 'When do you want to receive your order?' }}
          </h5>
          <span class="text-xs text-gray-400">
            ({{ isOwnCups ? 'Completion Date' : 'Delivery Date' }})
          </span>
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
              class="field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              :disabled="disabled"
              :class="{
                'border-red-400 ring-1 ring-red-300': dateError && !isValidDate,
                'border-green-400 ring-1 ring-green-300': isValidDate && modelValue.preferredDate
              }"
            />
            <div class="flex justify-between items-center mt-1">
              <div>
                <p v-if="dateError && !isValidDate" class="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" /> {{ dateError }}
                </p>
                <p v-else-if="isValidDate && modelValue.preferredDate" class="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle class="w-3 h-3" /> Valid date selected
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
                Based on your drop-off date ({{ formatDate(modelValue.ownCupsDeliveryDate) }}),
                the earliest completion date is {{ formatDate(minDate) }}.
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import {
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
  Info,
  AlertCircle,
} from 'lucide-vue-next'
import { usePhilippineAddress } from '@/composables/usePhilippineAddress'

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
      saveAddressAsDefault: false,
      deliveryCountry: 'Philippines',
      deliveryRegion: '',
      deliveryStreetAddress: '',
      deliveryBarangay: '',
      deliveryMunicipality: '',
      deliveryProvince: '',
      deliveryPostalCode: '',
    }),
  },
  customerAddress: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  isOwnCups: { type: Boolean, default: false },
  savedAddress: { type: Object, default: null },
  savedAddresses: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'use-saved-address'])

// ─── PHILIPPINE ADDRESS COMPOSABLE ────────────────────────────────────────
const {
  provinces,
  cities,
  barangays,
  loadingProvinces,
  loadingCities,
  loadingBarangays,
  errorMessage: addressApiError,
  loadProvincesByIslandGroup,
  loadCities,
  loadBarangays,
  findByName,
} = usePhilippineAddress()

const useManualEntry = ref(false)

// ─── SAVED ADDRESSES ──────────────────────────────────────────────────────
const showSavedAddressBanner = computed(() => {
  const sa = props.savedAddress
  if (!sa) return false
  if (!sa.streetAddress || !sa.municipality || !sa.province) return false
  const mv = props.modelValue
  const hasAddress = mv.deliveryStreetAddress && mv.deliveryMunicipality && mv.deliveryProvince
  return !hasAddress
})

const selectedAddressId = ref('')

function shorten(addr) {
  return [addr.streetAddress, addr.municipality, addr.province]
    .filter(Boolean)
    .join(', ')
    .slice(0, 40)
}

const savedAddressSummary = computed(() => {
  const sa = props.savedAddress || {}
  return [sa.streetAddress, sa.barangay, sa.municipality, sa.province]
    .filter(Boolean)
    .join(', ')
})

async function selectSavedAddress(addressId) {
  selectedAddressId.value = addressId
  if (!addressId) return

  const addr = props.savedAddresses.find((a) => a._id === addressId)
  if (!addr) return

  emit('update:modelValue', {
    ...props.modelValue,
    deliveryStreetAddress: addr.streetAddress || '',
    deliveryBarangay: addr.barangay || '',
    deliveryMunicipality: addr.municipality || '',
    deliveryProvince: addr.province || '',
    deliveryPostalCode: addr.postalCode || '',
    deliveryRegion: addr.region || '',
    deliveryCountry: addr.country || 'Philippines',
    saveAddressAsDefault: false,
  })

  clearDeliveryErrors()
  await nextTick()
  await hydrateFromNames()
  revalidateAll()
}

// ─── DELIVERY ADDRESS STATE ───────────────────────────────────────────────
const deliveryAddress = computed({
  get: () => ({
    country: props.modelValue.deliveryCountry || 'Philippines',
    region: props.modelValue.deliveryRegion || '',
    province: props.modelValue.deliveryProvince || '',
    municipality: props.modelValue.deliveryMunicipality || '',
    barangay: props.modelValue.deliveryBarangay || '',
    streetAddress: props.modelValue.deliveryStreetAddress || '',
    postalCode: props.modelValue.deliveryPostalCode || '',
  }),
  set: (val) => {
    emit('update:modelValue', {
      ...props.modelValue,
      deliveryCountry: val.country,
      deliveryRegion: val.region,
      deliveryProvince: val.province,
      deliveryMunicipality: val.municipality,
      deliveryBarangay: val.barangay,
      deliveryStreetAddress: val.streetAddress,
      deliveryPostalCode: val.postalCode,
    })
  },
})

// ─── VALIDATION ───────────────────────────────────────────────────────────
const deliveryErrors = ref({
  region: '',
  streetAddress: '',
  barangay: '',
  municipality: '',
  province: '',
  postalCode: '',
})

const deliveryValidatedFields = ref({
  region: false,
  streetAddress: false,
  barangay: false,
  municipality: false,
  province: false,
  postalCode: false,
})

const hasDeliveryAddressFields = computed(() => {
  const a = deliveryAddress.value
  return a.streetAddress || a.barangay || a.municipality || a.province
})

const fullDeliveryAddress = computed(() => {
  const parts = [
    props.modelValue.deliveryStreetAddress,
    props.modelValue.deliveryBarangay,
    props.modelValue.deliveryMunicipality,
    props.modelValue.deliveryProvince,
    props.modelValue.deliveryPostalCode,
    props.modelValue.deliveryRegion,
    props.modelValue.deliveryCountry || 'Philippines',
  ].filter(Boolean)
  return parts.join(', ')
})

function validateDeliveryRegion(v) {
  return v && v.trim() ? '' : 'Region is required'
}
function validateDeliveryStreetAddress(v) {
  if (!v || !v.trim()) return 'Street address is required'
  if (v.trim().length < 5) return 'Please enter a complete street address'
  return ''
}
function validateDeliveryBarangay(v) {
  return v && v.trim() ? '' : 'Barangay is required'
}
function validateDeliveryMunicipality(v) {
  return v && v.trim() ? '' : 'Municipality is required'
}
function validateDeliveryProvince(v) {
  return v && v.trim() ? '' : 'Province is required'
}
function validateDeliveryPostalCode(v) {
  if (!v || !v.trim()) return 'Postal code is required'
  if (!/^\d{4}$/.test(v.trim())) return 'Enter a valid 4-digit postal code'
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
  return (
    deliveryValidatedFields.value[field] &&
    !deliveryErrors.value[field] &&
    deliveryAddress.value[field]
  )
}

function updateDeliveryField(field, value) {
  deliveryAddress.value = { ...deliveryAddress.value, [field]: value }
  if (deliveryErrors.value[field]) validateDeliveryField(field)
}

function clearDeliveryErrors() {
  deliveryErrors.value = {
    region: '',
    streetAddress: '',
    barangay: '',
    municipality: '',
    province: '',
    postalCode: '',
  }
}

function revalidateAll() {
  ;['region', 'streetAddress', 'barangay', 'municipality', 'province', 'postalCode'].forEach(
    (f) => validateDeliveryField(f)
  )
}

// ─── CASCADING HANDLERS ───────────────────────────────────────────────────
async function onRegionChange(newRegion) {
  // Clear downstream fields in a single emit to avoid churn
  emit('update:modelValue', {
    ...props.modelValue,
    deliveryRegion: newRegion,
    deliveryProvince: '',
    deliveryMunicipality: '',
    deliveryBarangay: '',
  })

  if (!newRegion) {
    provinces.value = []
    cities.value = []
    barangays.value = []
    return
  }

  await loadProvincesByIslandGroup(newRegion)

  deliveryErrors.value.province = ''
  deliveryErrors.value.municipality = ''
  deliveryErrors.value.barangay = ''
  validateDeliveryField('region')
}

async function onProvinceChange(provinceName) {
  emit('update:modelValue', {
    ...props.modelValue,
    deliveryProvince: provinceName,
    deliveryMunicipality: '',
    deliveryBarangay: '',
  })

  if (!provinceName) {
    cities.value = []
    barangays.value = []
    return
  }

  const province = findByName(provinces.value, provinceName)
  if (!province) return

  await loadCities({ provinceCode: province.code })

  deliveryErrors.value.municipality = ''
  deliveryErrors.value.barangay = ''
  validateDeliveryField('province')
}

async function onMunicipalityChange(muniName) {
  emit('update:modelValue', {
    ...props.modelValue,
    deliveryMunicipality: muniName,
    deliveryBarangay: '',
  })

  if (!muniName) {
    barangays.value = []
    return
  }

  const muni = findByName(cities.value, muniName)
  if (!muni) return

  await loadBarangays(muni.code)

  deliveryErrors.value.barangay = ''
  validateDeliveryField('municipality')
}

function onBarangayChange(brgyName) {
  emit('update:modelValue', {
    ...props.modelValue,
    deliveryBarangay: brgyName,
  })
  validateDeliveryField('barangay')
}

// ─── HYDRATION ────────────────────────────────────────────────────────────
// Load the correct dropdown options from names already in the model (for
// prefilled customer profiles or previously-saved addresses).
async function hydrateFromNames() {
  const mv = props.modelValue
  if (!mv.deliveryRegion) return

  await loadProvincesByIslandGroup(mv.deliveryRegion)
  if (!mv.deliveryProvince) return

  const province = findByName(provinces.value, mv.deliveryProvince)
  if (!province) return

  await loadCities({ provinceCode: province.code })
  if (!mv.deliveryMunicipality) return

  const muni = findByName(cities.value, mv.deliveryMunicipality)
  if (!muni) return

  await loadBarangays(muni.code)
}

async function toggleManualEntry() {
  useManualEntry.value = !useManualEntry.value
  if (!useManualEntry.value) {
    await hydrateFromNames()
    revalidateAll()
  }
}

// ─── PLACEHOLDERS ─────────────────────────────────────────────────────────
const provincePlaceholder = computed(() => {
  if (!deliveryAddress.value.region) return 'Select a region first'
  if (loadingProvinces.value) return 'Loading provinces…'
  if (!provinces.value.length) return 'No provinces available'
  return 'Select province...'
})

const cityPlaceholder = computed(() => {
  if (!deliveryAddress.value.province) return 'Select a province first'
  if (loadingCities.value) return 'Loading cities…'
  return 'Select city / municipality...'
})

const barangayPlaceholder = computed(() => {
  if (!deliveryAddress.value.municipality) return 'Select a city / municipality first'
  if (loadingBarangays.value) return 'Loading barangays…'
  return 'Select barangay...'
})

// ─── DATE HELPERS ─────────────────────────────────────────────────────────
function addBusinessDays(startDate, days) {
  const date = new Date(startDate)
  date.setHours(0, 0, 0, 0)
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return date
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
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
  return toDateInputValue(new Date())
}

// ─── DATE RANGE ───────────────────────────────────────────────────────────
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

// ─── DATE VALIDATION ──────────────────────────────────────────────────────
const deliveryAddressTouched = ref(false)
const dateTouched = ref(false)

const isValidDate = computed(() => {
  if (!props.modelValue.preferredDate) return false
  const s = new Date(props.modelValue.preferredDate)
  const mn = new Date(minDate.value)
  const mx = new Date(maxDate.value)
  s.setHours(0, 0, 0, 0); mn.setHours(0, 0, 0, 0); mx.setHours(0, 0, 0, 0)
  return s >= mn && s <= mx
})

const dateError = computed(() => {
  if (!dateTouched.value && !props.errors?.preferredDate) return ''
  if (!props.modelValue.preferredDate) return 'Please select a preferred date'

  const s = new Date(props.modelValue.preferredDate)
  const mn = new Date(minDate.value)
  const mx = new Date(maxDate.value)
  s.setHours(0, 0, 0, 0); mn.setHours(0, 0, 0, 0); mx.setHours(0, 0, 0, 0)

  if (s < mn) {
    return props.isOwnCups && props.modelValue.ownCupsDeliveryDate
      ? `Earliest available date is ${formatDate(mn)} (7 business days after your drop-off date)`
      : `Earliest available date is ${formatDate(mn)} (7 business days from today)`
  }
  if (s > mx) {
    return `Latest available date is ${formatDate(mx)} (${MAX_LEAD_DAYS} business days)`
  }
  return ''
})

const showDeliveryError = computed(
  () =>
    deliveryAddressTouched.value &&
    props.modelValue.method === 'delivery' &&
    (!deliveryAddress.value.streetAddress ||
      !deliveryAddress.value.barangay ||
      !deliveryAddress.value.municipality ||
      !deliveryAddress.value.province)
)

// ─── MISC ─────────────────────────────────────────────────────────────────
function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
  if (field === 'preferredDate') dateTouched.value = true
}

function setMethod(method) {
  updateField('method', method)
  if (method === 'pickup') deliveryAddressTouched.value = false
}

// ─── WATCHERS ─────────────────────────────────────────────────────────────
watch(
  deliveryAddress,
  () => {
    if (props.modelValue.method === 'delivery') deliveryAddressTouched.value = true
  },
  { deep: true }
)

watch(minDate, (newMin) => {
  if (!props.modelValue.preferredDate) return
  const s = new Date(props.modelValue.preferredDate)
  const mn = new Date(newMin)
  s.setHours(0, 0, 0, 0); mn.setHours(0, 0, 0, 0)
  if (s < mn) {
    emit('update:modelValue', { ...props.modelValue, preferredDate: newMin })
  }
})

// ─── INIT ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (props.modelValue.deliveryRegion) {
    await hydrateFromNames()
  }
})

if (!props.modelValue.preferredDate) {
  nextTick(() => {
    if (!props.modelValue.preferredDate) {
      emit('update:modelValue', { ...props.modelValue, preferredDate: minDate.value })
    }
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