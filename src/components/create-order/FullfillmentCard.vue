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
          placeholder="Enter complete delivery address"
          rows="2"
          class="field resize-none"
          :class="{ 'border-red-400 ring-1 ring-red-300': errors.deliveryAddress }"
        ></textarea>
        <p v-if="errors.deliveryAddress" class="text-xs text-red-500">{{ errors.deliveryAddress }}</p>
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

      <!-- Preferred date -->
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700" for="ff-date">
          Preferred {{ modelValue.method === 'delivery' ? 'Delivery' : 'Pickup' }} Date
        </label>
        <input
          id="ff-date"
          :value="modelValue.preferredDate"
          @input="updateField('preferredDate', $event.target.value)"
          type="date"
          :min="minDate"
          class="field"
        />
        <p class="text-xs text-gray-400">Subject to production schedule. We'll confirm with you.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  customerAddress: { type: String, default: '' },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const minDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function setMethod(method) {
  updateField('method', method)
}

function handleSameAsCustomer(checked) {
  updateField('sameAsCustomer', checked)
  if (checked && props.customerAddress) {
    updateField('deliveryAddress', props.customerAddress)
  }
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