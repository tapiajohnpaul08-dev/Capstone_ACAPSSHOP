<!-- components/create-order/DesignManager.vue -->
<template>
  <div class="space-y-4">
    <!-- Design Source Toggle (only show if not in no-design mode) -->
    <div v-if="!isNoDesignMode" class="grid grid-cols-2 gap-3">
      <button
        @click="setDesignSource('upload')"
        class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
        :class="designSource === 'upload'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'"
      >
        {{ hasFiles ? '📎 Change File' : '📤 Upload Design' }}
      </button>
      <button
        @click="setDesignSource('saved')"
        class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
        :class="designSource === 'saved'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'"
      >
        💾 Saved Template
      </button>
    </div>

    <!-- Upload Panel -->
    <div v-if="designSource === 'upload' && !isNoDesignMode" class="space-y-4">
      <!-- File Upload Area -->
      <div
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
        :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-400 mb-2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" x2="12" y1="3" y2="15"/>
        </svg>
        <p class="text-sm font-medium text-gray-700">Drag & drop your design file here</p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG, PDF, AI, PSD · Max 20MB</p>
        <label class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          Browse Files
          <input type="file" accept=".png,.jpg,.jpeg,.pdf,.ai,.psd" class="hidden" @change="handleFileSelect" />
        </label>
      </div>

      <!-- Uploaded File Preview -->
      <div v-if="files.length > 0" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <div class="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate">{{ files[0].name }}</div>
          <div class="text-xs text-green-600">Ready to use</div>
        </div>
        <button @click="removeFile(0)" class="text-gray-400 hover:text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Saved Templates -->
    <div v-if="designSource === 'saved' && !isNoDesignMode" class="space-y-3">
      <div v-if="isLoadingTemplates" class="text-center py-6">
        <div class="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500 mt-2">Loading templates...</p>
      </div>
      
      <div v-else-if="templates.length === 0" class="text-center py-6 bg-gray-50 rounded-xl">
        <p class="text-sm text-gray-500">No saved templates yet.</p>
        <p class="text-xs text-gray-400 mt-1">Save a design from a previous order to use it here.</p>
      </div>
      
      <div v-else class="grid gap-2 max-h-48 overflow-y-auto">
        <div
          v-for="template in templates"
          :key="template.id"
          @click="selectTemplate(template)"
          class="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          :class="{ 'border-blue-500 bg-blue-50': selectedTemplateId === template.id }"
        >
          <div class="flex items-center gap-3">
            <img 
              v-if="template.thumbnail" 
              :src="getImageUrl(template.thumbnail)" 
              class="w-12 h-12 object-cover rounded"
              @error="handleImageError"
            />
            <div class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-400">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5-6 6-3-3-4 4"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">{{ template.name }}</div>
              <div class="text-xs text-gray-500">
                {{ template.printSize || 'Standard' }} · {{ template.placement || 'Front' }}
              </div>
            </div>
            <svg v-if="selectedTemplateId === template.id" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- PRINT PLACEMENT - Always shown for single items or when showPlacement is true -->
    <div v-if="showPlacement || isSingleItem" class="space-y-3">
      <div class="border-t pt-3">
        <h5 class="text-sm font-medium text-gray-700 mb-3">Print Placement</h5>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Print Size</label>
            <input
              v-model="localPrintSize"
              type="text"
              placeholder="e.g., 3x3 inches"
              class="field"
            />
            <p class="text-xs text-gray-400 mt-1">Size of the print on the product</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Print Placement</label>
            <select v-model="localPrintPlacement" class="field">
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
      </div>
    </div>

    <!-- Design Notes (always shown) -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Design Notes</label>
        <span class="text-xs text-gray-400">(Optional but helpful)</span>
      </div>
      <textarea
        v-model="localDesignNotes"
        rows="2"
        placeholder="Describe what you want: colors, style, text, references, etc."
        class="field resize-none"
      ></textarea>
      <p class="text-xs text-gray-400">
        💡 Our design team will use these notes to create or adjust your artwork.
      </p>
    </div>

    <!-- Save as Template (only when there's content) -->
    <div v-if="hasDesignContent && !isNoDesignMode" class="pt-2 border-t">
      <button
        @click="saveAsTemplate"
        :disabled="isSavingTemplate"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
      >
        <svg v-if="!isSavingTemplate" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>  
        </svg>
        <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        💾 Save as Template
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTemplates } from '@/composables/useTemplates.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      designSource: 'upload',
      designNotes: '',
      files: [],
      selectedTemplateId: null,
      selectedTemplate: null,
      printSize: '',
      printPlacement: ''
    })
  },
  itemName: { type: String, default: 'Design' },
  showPlacement: { type: Boolean, default: true }, // Default to true for single items
  isNoDesignMode: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const { templates, isLoading: isLoadingTemplates, fetchTemplates, saveAsTemplate: saveTemplate } = useTemplates()

// Local state
const dragging = ref(false)
const isSavingTemplate = ref(false)

const designSource = ref(props.modelValue.designSource || 'upload')
const files = ref(props.modelValue.files || [])
const localDesignNotes = ref(props.modelValue.designNotes || '')
const localPrintSize = ref(props.modelValue.printSize || '')
const localPrintPlacement = ref(props.modelValue.printPlacement || '')
const selectedTemplateId = ref(props.modelValue.selectedTemplateId || null)

// Check if this is a single item (no need for complex logic, just use prop)
const isSingleItem = computed(() => {
  // This will be determined by the parent component
  // For DesignManager, we just check if showPlacement is true
  return props.showPlacement
})

const hasDesignContent = computed(() => {
  return files.value.length > 0 || 
         localDesignNotes.value.trim() ||
         selectedTemplateId.value ||
         localPrintSize.value.trim() ||
         localPrintPlacement.value
})

const hasFiles = computed(() => files.value.length > 0)

// Watch for changes and emit
watch([designSource, files, localDesignNotes, localPrintSize, localPrintPlacement, selectedTemplateId], () => {
  const selectedTemp = selectedTemplateId.value ? templates.value.find(t => t.id === selectedTemplateId.value) : null
  
  const designData = {
    designSource: designSource.value,
    files: files.value,
    designNotes: localDesignNotes.value,
    printSize: localPrintSize.value,
    printPlacement: localPrintPlacement.value,
    selectedTemplateId: selectedTemplateId.value,
    selectedTemplate: selectedTemp ? {
      id: selectedTemp.id,
      name: selectedTemp.name,
      thumbnail: selectedTemp.imagePath || selectedTemp.thumbnail,
      printSize: selectedTemp.printSize,
      placement: selectedTemp.placement,
      notes: selectedTemp.notes
    } : null
  }
  emit('update:modelValue', designData)
}, { deep: true })

function setDesignSource(source) {
  designSource.value = source
  if (source === 'saved' && templates.value.length === 0) {
    fetchTemplates()
  }
}

function selectTemplate(template) {
  selectedTemplateId.value = template.id || template.templateId
  localDesignNotes.value = template.notes || localDesignNotes.value
  localPrintSize.value = template.printSize || localPrintSize.value
  localPrintPlacement.value = template.placement || localPrintPlacement.value
}

function validateFiles(fileList) {
  const MAX_SIZE = 20 * 1024 * 1024
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  
  for (const file of fileList) {
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      alert(`${file.name}: Invalid file type. Only images and PDFs are allowed.`)
      return false
    }
    if (file.size > MAX_SIZE) {
      alert(`${file.name}: File too large. Max 20MB.`)
      return false
    }
  }
  return true
}

async function handleFileSelect(e) {
  const newFiles = [...e.target.files]
  if (!validateFiles(newFiles)) {
    e.target.value = ''
    return
  }
  files.value = newFiles
  e.target.value = ''
}

async function handleDrop(e) {
  dragging.value = false
  const newFiles = [...e.dataTransfer.files]
  if (!validateFiles(newFiles)) return
  files.value = newFiles
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  return `${base}/${path.replace(/^\/+/, '')}`
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"%3E%3C/path%3E%3C/svg%3E'
}

async function saveAsTemplate() {
  if (!hasDesignContent.value) {
    alert('Please add some design content before saving as template')
    return
  }
  
  isSavingTemplate.value = true
  try {
    const templateName = prompt('Enter a name for this template:', props.itemName + ' Design')
    if (!templateName) {
      isSavingTemplate.value = false
      return
    }
    
    let existingImagePath = ''
    if (files.value.length > 0 && files.value[0].path) {
      existingImagePath = files.value[0].path
    }
    
    const templateData = {
      name: templateName,
      printSize: localPrintSize.value,
      placement: localPrintPlacement.value,
      notes: localDesignNotes.value,
      existingImagePath: existingImagePath
    }
    
    const result = await saveTemplate(templateData, props.itemName)
    if (result.success && !result.cancelled) {
      alert('Template saved successfully!')
      await fetchTemplates()
    }
  } catch (error) {
    console.error('Error saving template:', error)
    alert('Failed to save template: ' + (error.message || 'Unknown error'))
  } finally {
    isSavingTemplate.value = false
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
textarea.field {
  @apply h-auto py-2;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>