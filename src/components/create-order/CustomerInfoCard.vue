<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Customer Information</h4>
      <p class="text-xs text-gray-500 mt-0.5">Pre-filled from your account. Edit if needed.</p>
    </div>

    <!-- Saved profile banner -->
    <div v-if="showSavedBanner" class="px-6 pt-4">
      <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" class="text-blue-600 shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-blue-900">We have your saved info</p>
          <p class="text-[11px] text-blue-700 mt-0.5 leading-snug">
            {{ savedSummary }}
          </p>
        </div>
        <button type="button" @click="$emit('use-saved')"
          class="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          Use it
        </button>
      </div>
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
        </div>
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
import { ref, watch, computed } from 'vue'
import { PHONE_REGEX, EMAIL_REGEX } from '@/constants/orderConstants'

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  savedProfile: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'use-saved'])

// Show banner only when there is a saved profile AND the form is currently
// missing the main fields (name / email / phone)
const showSavedBanner = computed(() => {
  const sp = props.savedProfile
  if (!sp) return false
  if (!sp.name && !sp.email && !sp.phone) return false

  // If the form already has name + email + phone, don't offer again
  const mv = props.modelValue
  const hasAll = mv.name?.trim() && mv.email?.trim() && mv.phone?.trim()
  if (hasAll) return false

  return true
})

const savedSummary = computed(() => {
  const sp = props.savedProfile || {}
  const parts = []
  if (sp.name) parts.push(sp.name)
  if (sp.email) parts.push(sp.email)
  if (sp.phone) parts.push(sp.phone)
  return parts.join(' · ')
})

// Local validation errors
const localErrors = ref({
  name: '',
  email: '',
  phone: ''
})

// Track which fields have been validated
const validatedFields = ref({
  name: false,
  email: false,
  phone: false
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