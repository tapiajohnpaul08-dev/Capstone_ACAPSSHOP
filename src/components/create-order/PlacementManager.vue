<!-- components/create-order/PlacementManager.vue -->
<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Print Placement</h4>
      <p class="text-xs text-gray-500 mt-0.5">
        {{ description }}
      </p>
    </div>
    <div class="px-6 py-5 space-y-4">
      <!-- Single Item Placement -->
      <div v-if="!isMultiItem" class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700">Print Size</label>
          <input
            v-model="localPlacement.printSize"
            type="text"
            placeholder="e.g., 3x3 inches"
            class="field"
          />
          <p class="text-xs text-gray-400 mt-1">Size of the print on the product</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Print Placement</label>
          <select v-model="localPlacement.printPlacement" class="field">
            <option value="">Select placement...</option>
            <option value="Full-Wrap">Full Wrap</option>
            <option value="Front-Only">Front Only</option>
            <option value="Back-Only">Back Only</option>
            <option value="Front-Back">Front & Back</option>
            <option value="Wrap-Around">Wrap Around</option>
            <option value="Top-Bottom">Top & Bottom</option>
          </select>
          <p class="text-xs text-gray-400 mt-1">Where the design appears on the product</p>
        </div>
      </div>

      <!-- Multi-Item Placement -->
      <div v-else class="space-y-4">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="border-b last:border-0 pb-4 last:pb-0"
        >
          <div class="flex items-center gap-3 mb-3">
            <span class="text-sm font-medium">{{ item.name }}</span>
            <span class="text-xs text-gray-400">{{ item.size }}</span>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Print Size</label>
              <input
                v-model="localPlacements[idx].printSize"
                type="text"
                placeholder="e.g., 3x3 inches"
                class="field"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Print Placement</label>
              <select v-model="localPlacements[idx].printPlacement" class="field">
                <option value="">Select placement...</option>
                <option value="Full-Wrap">Full Wrap</option>
                <option value="Front-Only">Front Only</option>
                <option value="Back-Only">Back Only</option>
                <option value="Front-Back">Front & Back</option>
                <option value="Wrap-Around">Wrap Around</option>
                <option value="Top-Bottom">Top & Bottom</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div>
            <p class="text-xs font-medium text-blue-800">💡 Placement Tips</p>
            <ul class="text-xs text-blue-600 mt-1 space-y-0.5">
              <li>• <strong>Full Wrap</strong> - Design covers the entire product surface</li>
              <li>• <strong>Front Only</strong> - Design appears on the front face</li>
              <li>• <strong>Front & Back</strong> - Same design on both sides</li>
              <li>• <strong>Wrap Around</strong> - Design wraps around the product</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  items: {
    type: Array,
    default: () => []
  },
  description: {
    type: String,
    default: 'Specify where and how the design should appear on your products.'
  }
})

const emit = defineEmits(['update:modelValue'])

const isMultiItem = computed(() => props.items.length > 1)

// Single item placement
const localPlacement = ref({
  printSize: props.modelValue.printSize || '',
  printPlacement: props.modelValue.printPlacement || ''
})

// Multi-item placements
const localPlacements = ref(
  props.items.map(() => ({
    printSize: '',
    printPlacement: ''
  }))
)

// Watch single item changes
watch(localPlacement, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// Watch multi-item changes
watch(localPlacements, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// Initialize from props
watch(() => props.modelValue, (newVal) => {
  if (!isMultiItem.value && newVal) {
    localPlacement.value = {
      printSize: newVal.printSize || '',
      printPlacement: newVal.printPlacement || ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style>