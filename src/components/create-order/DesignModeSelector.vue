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
          class="px-3 py-1.5 text-xs font-medium rounded-md transition-all inline-flex items-center gap-1.5"
          :class="currentMode === mode.value 
            ? 'bg-white shadow-sm text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'"
          :title="mode.tooltip"
        >
          <component :is="mode.icon" class="w-3.5 h-3.5" />
          {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- Mode Description / Help Text -->
    <div class="mt-3 p-3 rounded-lg text-xs"
      :class="modeHelpClass"
    >
      <div class="flex items-start gap-2">
        <component :is="modeHelpIcon" class="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{{ modeHelpText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { 
  Paintbrush, 
  Palette, 
  Layers, 
  FileText,
  Sparkles
} from 'lucide-vue-next'

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

// Use a local ref to track the current mode
const currentMode = ref(props.modelValue)

// Watch for prop changes and update local ref
watch(() => props.modelValue, (newVal) => {
  currentMode.value = newVal
})

// Define modes with icon components
const availableModes = computed(() => {
  const modes = []
  
  // Always show No Design option
  modes.push(
    { 
      value: 'no-design', 
      label: 'No Design', 
      icon: Paintbrush,
      tooltip: 'Skip design upload, just text/notes only'
    }
  )
  
  // Individual mode - always available
  modes.push(
    { 
      value: 'individual', 
      label: 'Individual', 
      icon: Palette,
      tooltip: 'Each item has its own design'
    }
  )
  
  // Shared mode - only for multiple items
  if (props.itemCount > 1) {
    modes.push(
      { 
        value: 'shared', 
        label: 'Shared Design', 
        icon: Layers,
        tooltip: 'One design for all items'
      }
    )
  }
  
  return modes
})

const modeDescription = computed(() => {
  const descriptions = {
    'no-design': 'Skip design upload - just provide text instructions',
    'individual': `Each of ${props.itemCount} item${props.itemCount > 1 ? 's' : ''} has its own design`,
    'shared': `Upload one design for all ${props.itemCount} items`
  }
  return descriptions[currentMode.value] || 'Select design mode'
})

const modeHelpClass = computed(() => {
  const classes = {
    'no-design': 'bg-gray-50 text-gray-600 border border-gray-200',
    'individual': 'bg-blue-50 text-blue-700 border border-blue-200',
    'shared': 'bg-purple-50 text-purple-700 border border-purple-200'
  }
  return classes[currentMode.value] || 'bg-gray-50 text-gray-600'
})

const modeHelpIcon = computed(() => {
  const icons = {
    'no-design': FileText,
    'individual': Palette,
    'shared': Layers
  }
  return icons[currentMode.value] || Sparkles
})

const modeHelpText = computed(() => {
  const texts = {
    'no-design': 'You can provide text descriptions, notes, or reference images. Our design team will help you create the final artwork.',
    'individual': 'Upload a separate design file for each item. Perfect when each product needs unique artwork.',
    'shared': 'Upload one design file that will be used for all items. You can adjust placement per item.'
  }
  return texts[currentMode.value] || 'Select a design mode to continue'
})

function selectMode(value) {
  // Update local ref
  currentMode.value = value
  // Emit to parent
  emit('update:modelValue', value)
}

// Also update local ref when props change from parent
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== currentMode.value) {
    currentMode.value = newVal
  }
}, { immediate: true })
</script>