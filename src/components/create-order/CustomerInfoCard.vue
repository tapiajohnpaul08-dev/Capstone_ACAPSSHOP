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
            type="text"
            placeholder="Enter your full name"
            class="field"
            :class="{ 'border-red-400 ring-1 ring-red-300': errors.name }"
          />
          <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
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
            type="email"
            placeholder="your@email.com"
            class="field"
            :class="{ 'border-red-400 ring-1 ring-red-300': errors.email }"
          />
          <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="ci-phone">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <input
            id="ci-phone"
            :value="modelValue.phone"
            @input="updateField('phone', $event.target.value)"
            type="tel"
            placeholder="+63 912 345 6789"
            class="field"
            :class="{ 'border-red-400 ring-1 ring-red-300': errors.phone }"
          />
          <p v-if="errors.phone" class="text-xs text-red-500">{{ errors.phone }}</p>
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
          placeholder="Enter your complete address"
          rows="2"
          class="field resize-none"
          :class="{ 'border-red-400 ring-1 ring-red-300': errors.address }"
        ></textarea>
        <p v-if="errors.address" class="text-xs text-red-500">{{ errors.address }}</p>
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
const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
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