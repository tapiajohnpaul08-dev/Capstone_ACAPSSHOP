<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Customer Information</h4>
      <p class="text-xs text-gray-500 mt-0.5">Pre-filled from your account. Edit if needed.</p>
    </div>
    <div class="px-6 py-5 space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="ci-name">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
            id="ci-name"
            :value="modelValue.name"
            @input="updateField('name', $event.target.value)"
            @blur="validateField('name')"
            type="text"
            placeholder="Enter your full name"
            class="field"
            :class="{ 
              'border-red-400 ring-1 ring-red-300': localErrors.name,
              'border-green-400 ring-1 ring-green-300': isValidField('name') && modelValue.name
            }"
          />
          <p v-if="localErrors.name" class="text-xs text-red-500">{{ localErrors.name }}</p>
          <p v-else-if="isValidField('name') && modelValue.name" class="text-xs text-green-500">✓ Valid name</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="ci-company">Company Name</label>
          <input
            id="ci-company"
            :value="modelValue.company"
            @input="updateField('company', $event.target.value)"
            type="text"
            placeholder="Enter company name (optional)"
            class="field"
          />
          <p class="text-xs text-gray-400">Optional</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="ci-email">
            Email Address <span class="text-red-500">*</span>
          </label>
          <input
            id="ci-email"
            :value="modelValue.email"
            @input="updateField('email', $event.target.value)"
            @blur="validateField('email')"
            type="email"
            placeholder="your@email.com"
            class="field"
            :class="{ 
              'border-red-400 ring-1 ring-red-300': localErrors.email,
              'border-green-400 ring-1 ring-green-300': isValidField('email') && modelValue.email
            }"
          />
          <p v-if="localErrors.email" class="text-xs text-red-500">{{ localErrors.email }}</p>
          <p v-else-if="isValidField('email') && modelValue.email" class="text-xs text-green-500">✓ Valid email</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="ci-phone">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <input
            id="ci-phone"
            :value="modelValue.phone"
            @input="handlePhoneInput($event.target.value)"
            @blur="validateField('phone')"
            type="tel"
            placeholder="+63 912 345 6789"
            class="field"
            :class="{ 
              'border-red-400 ring-1 ring-red-300': localErrors.phone,
              'border-green-400 ring-1 ring-green-300': isValidField('phone') && modelValue.phone
            }"
          />
          <p v-if="localErrors.phone" class="text-xs text-red-500">{{ localErrors.phone }}</p>
          <p v-else-if="isValidField('phone') && modelValue.phone" class="text-xs text-green-500">✓ Valid phone number</p>
          <p class="text-xs text-gray-400">Format: +63XXXXXXXXXX or 09XXXXXXXXX</p>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700" for="ci-address">
          Address <span class="text-red-500">*</span>
        </label>
        <textarea
          id="ci-address"
          :value="modelValue.address"
          @input="updateField('address', $event.target.value)"
          @blur="validateField('address')"
          placeholder="Enter your complete address"
          rows="2"
          class="field resize-none"
          :class="{ 
            'border-red-400 ring-1 ring-red-300': localErrors.address,
            'border-green-400 ring-1 ring-green-300': isValidField('address') && modelValue.address
          }"
        ></textarea>
        <p v-if="localErrors.address" class="text-xs text-red-500">{{ localErrors.address }}</p>
        <p v-else-if="isValidField('address') && modelValue.address" class="text-xs text-green-500">✓ Valid address</p>
      </div>

      <label class="flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          :checked="modelValue.saveAsDefault"
          @change="updateField('saveAsDefault', $event.target.checked)"
          class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-600">Save as default for future orders</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PHONE_REGEX, EMAIL_REGEX } from '@/constants/orderConstants'

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

// Local validation errors
const localErrors = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

// Track which fields have been validated
const validatedFields = ref({
  name: false,
  email: false,
  phone: false,
  address: false
})

// Validation functions
function validateName(value) {
  if (!value || !value.trim()) {
    return 'Full name is required'
  }
  if (value.trim().length < 2) {
    return 'Name must be at least 2 characters'
  }
  return ''
}

function validateEmail(value) {
  if (!value || !value.trim()) {
    return 'Email is required'
  }
  if (!EMAIL_REGEX.test(value)) {
    return 'Enter a valid email address (e.g., name@example.com)'
  }
  return ''
}

function validatePhone(value) {
  const cleanValue = value.replace(/[\s\-\(\)]/g, '')
  if (!cleanValue) {
    return 'Phone number is required'
  }
  if (!PHONE_REGEX.test(cleanValue)) {
    return 'Enter a valid Philippine phone number (e.g., +63XXXXXXXXXX or 09XXXXXXXXX)'
  }
  return ''
}

function validateAddress(value) {
  if (!value || !value.trim()) {
    return 'Address is required'
  }
  if (value.trim().length < 5) {
    return 'Please enter a complete address'
  }
  return ''
}

function validateField(field) {
  validatedFields.value[field] = true
  switch (field) {
    case 'name':
      localErrors.value.name = validateName(props.modelValue.name)
      break
    case 'email':
      localErrors.value.email = validateEmail(props.modelValue.email)
      break
    case 'phone':
      localErrors.value.phone = validatePhone(props.modelValue.phone)
      break
    case 'address':
      localErrors.value.address = validateAddress(props.modelValue.address)
      break
  }
}

function isValidField(field) {
  return validatedFields.value[field] && !localErrors.value[field] && props.modelValue[field]
}

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
  // Clear error when user starts typing
  if (localErrors.value[field]) {
    validateField(field)
  }
}

function handlePhoneInput(value) {
  updateField('phone', value)
  if (validatedFields.value.phone) {
    validateField('phone')
  }
}

// Watch for external errors
watch(() => props.errors, (newErrors) => {
  if (newErrors.name) localErrors.value.name = newErrors.name
  if (newErrors.email) localErrors.value.email = newErrors.email
  if (newErrors.phone) localErrors.value.phone = newErrors.phone
  if (newErrors.address) localErrors.value.address = newErrors.address
}, { deep: true })
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
textarea.field {
  @apply h-auto py-2;
}
</style>