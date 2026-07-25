<!-- components/create-order/DesignModeSelector.vue -->
<template>
  <div class="bg-white rounded-xl border p-4">
    <div class="flex items-center justify-between">
      <div>
        <h4 class="font-semibold text-gray-900">Design Configuration</h4>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ modeDescription }}
        </p>
      </div>
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
        <button
          v-for="mode in availableModes"
          :key="mode.value"
          @click="selectMode(mode.value)"
          class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
          :class="selected === mode.value 
            ? 'bg-white shadow-sm text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'"
          :title="mode.tooltip"
        >
          {{ mode.icon }} {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- Mode Description / Help Text -->
    <div class="mt-3 p-3 rounded-lg text-xs"
      :class="modeHelpClass"
    >
      <div class="flex items-start gap-2">
        <span class="mt-0.5">{{ modeHelpIcon }}</span>
        <span>{{ modeHelpText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { 
    type: String, 
    default: 'no-design',
    validator: (val) => ['no-design', 'individual', 'shared'].includes(val)
  },
  itemCount: { type: Number, default: 1 },
  hasDesignRequired: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const availableModes = computed(() => {
  const modes = [
    { 
      value: 'no-design', 
      label: 'No Design', 
      icon: '📝',
      tooltip: 'Skip design upload, just text/notes only'
    }
  ]
  
  if (props.itemCount > 1) {
    modes.push(
      { 
        value: 'shared', 
        label: 'Shared Design', 
        icon: '🔄',
        tooltip: 'One design for all items'
      }
    )
  }
  
  modes.push(
    { 
      value: 'individual', 
      label: 'Individual', 
      icon: '🎨',
      tooltip: 'Each item has its own design'
    }
  )
  
  return modes
})

const selected = computed({
  get: () => {
    // Auto-select no-design for single item if no design needed
    if (props.itemCount === 1 && !props.hasDesignRequired) {
      return 'no-design'
    }
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

const modeDescription = computed(() => {
  const descriptions = {
    'no-design': `Skip design upload - just provide text instructions`,
    'individual': `Each of ${props.itemCount} item${props.itemCount > 1 ? 's' : ''} has its own design`,
    'shared': `Upload one design for all ${props.itemCount} items`
  }
  return descriptions[selected.value] || 'Select design mode'
})

const modeHelpClass = computed(() => {
  const classes = {
    'no-design': 'bg-gray-50 text-gray-600 border border-gray-200',
    'individual': 'bg-blue-50 text-blue-700 border border-blue-200',
    'shared': 'bg-purple-50 text-purple-700 border border-purple-200'
  }
  return classes[selected.value] || 'bg-gray-50 text-gray-600'
})

const modeHelpIcon = computed(() => {
  const icons = {
    'no-design': '📋',
    'individual': '🎨',
    'shared': '🔄'
  }
  return icons[selected.value] || '💡'
})

const modeHelpText = computed(() => {
  const texts = {
    'no-design': 'You can provide text descriptions, notes, or reference images. Our design team will help you create the final artwork.',
    'individual': 'Upload a separate design file for each item. Perfect when each product needs unique artwork.',
    'shared': 'Upload one design file that will be used for all items. You can adjust placement per item.'
  }
  return texts[selected.value] || 'Select a design mode to continue'
})

function selectMode(value) {
  if (props.itemCount < 2 && value === 'shared') {
    emit('update:modelValue', 'no-design')
    return
  }
  emit('update:modelValue', value)
}
</script>