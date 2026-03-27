<template>
  <div class="bg-white rounded-xl border cursor-pointer hover:shadow-lg transition-shadow">
    <div class="p-4">
      <!-- Template Image -->
      <div class="relative mb-3">
        <img 
          :src="template.image" 
          :alt="template.name" 
          class="w-full h-40 object-cover rounded-lg"
        />
      </div>

      <!-- Template Details -->
      <div class="space-y-2">
        <h3 class="font-semibold">{{ template.name }}</h3>
        
        <div class="text-sm text-gray-600 space-y-1">
          <div class="flex items-center justify-between">
            <span>Print Size:</span>
            <span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium">
              {{ template.printSize }}
            </span>
          </div>
          <div>Placement: {{ template.placement }}</div>
          <div class="text-xs text-gray-500">Created: {{ template.createdAt }}</div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2">
          <button 
            @click.stop="$emit('rename', template)"
            class="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3 text-sm font-medium transition-colors"
          >
            <Pen class="h-3 w-3 mr-1" />
            Rename
          </button>
          <button 
            @click.stop="$emit('delete', template)"
            class="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3 text-sm font-medium transition-colors"
          >
            <Trash2 class="h-3 w-3 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Pen, Trash2 } from 'lucide-vue-next'

defineProps({
  template: {
    type: Object,
    required: true
  }
})

defineEmits(['rename', 'delete'])
</script>