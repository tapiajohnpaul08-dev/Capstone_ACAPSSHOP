<!-- src/components/design/DesignTemplateCard.vue -->
<template>
  <div class="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Template Image -->
    <div class="relative aspect-square bg-gray-100">
      <img 
        :src="template.thumbnail" 
        :alt="template.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div class="absolute top-2 right-2 flex gap-1">
        <button 
          @click.stop="$emit('rename', template)"
          class="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
          title="Rename"
        >
          <PenSquare class="w-3.5 h-3.5 text-gray-700" />
        </button>
        <button 
          @click.stop="$emit('delete', template)"
          class="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
          title="Delete"
        >
          <Trash2 class="w-3.5 h-3.5 text-gray-700" />
        </button>
      </div>
      <div v-if="template.placement" class="absolute bottom-2 left-2">
        <span class="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
          {{ formatPlacement(template.placement) }}
        </span>
      </div>
    </div>

    <!-- Template Info -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 truncate" :title="template.name">
        {{ template.name }}
      </h3>
      
      <div class="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
        <span v-if="template.printSize" class="flex items-center gap-1">
          <Ruler class="w-3 h-3" />
          {{ template.printSize }}
        </span>
        <span v-if="template.notes" class="flex items-center gap-1">
          <FileText class="w-3 h-3" />
          {{ truncateNotes(template.notes) }}
        </span>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <span class="text-xs text-gray-400">
          {{ formatDate(template.createdAt || template.updatedAt) }}
        </span>
        <button 
          @click.stop="$emit('use', template)"
          class="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
        >
          <Sparkles class="w-3 h-3" />
          Use Template
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  PenSquare, 
  Trash2, 
  Ruler, 
  FileText, 
  Sparkles 
} from 'lucide-vue-next'

defineProps({
  template: {
    type: Object,
    required: true
  }
})

defineEmits(['rename', 'delete', 'use'])

function handleImageError(event) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  event.target.src = `${API_BASE_URL}/uploads/templates/default-template.jpg`
}

function formatPlacement(placement) {
  const map = {
    'back-only': 'Back Only',
    'front-only': 'Front Only',
    'both': 'Front & Back',
    'full-wrap': 'Full Wrap',
    'wrap-around': 'Wrap Around',
    'top-bottom': 'Top & Bottom'
  }
  return map[placement?.toLowerCase()] || placement
}

function truncateNotes(notes) {
  if (!notes) return ''
  return notes.length > 20 ? notes.substring(0, 20) + '...' : notes
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}
</script>