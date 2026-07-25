<template>
  <div class="space-y-4">
    <!-- Design Source Toggle -->
    <div v-if="!isNoDesignMode" class="grid grid-cols-2 gap-3">
      <button
        @click="setDesignSource('upload')"
        class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
        :class="designSource === 'upload'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'"
      >
          <Upload class="w-4 h-4 inline mr-1" />
        {{ hasFiles ? 'Change File' : 'Upload Design' }}

      </button>
      <button
        @click="setDesignSource('saved')"
        class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
        :class="designSource === 'saved'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'"
      >
              <Library class="w-4 h-4 inline mr-1" />

         Saved Template
      </button>
    </div>

    <!-- Upload Panel -->
    <div v-if="designSource === 'upload' && !isNoDesignMode" class="space-y-4">
      <div
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
        :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'"
      >
                <UploadCloud class="w-8 h-8 mx-auto text-gray-400 mb-2" />

        <p class="text-sm font-medium text-gray-700">Drag & drop your design file here</p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG, PDF, AI, PSD · Max 20MB</p>
        <label class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
          <FolderOpen class="w-4 h-4" />
          Browse Files
          <input type="file" accept=".png,.jpg,.jpeg,.pdf,.ai,.psd" class="hidden" @change="handleFileSelect" />
        </label>
      </div>

      <div v-if="files.length > 0" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <div class="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                    <FileCheck class="w-5 h-5 text-green-600" />

        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate">{{ files[0].name }}</div>
          <div class="text-xs text-green-600">Ready to use</div>
        </div>
        <button @click="removeFile(0)" class="text-gray-400 hover:text-red-500">
                    <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Saved Templates -->
    <div v-if="designSource === 'saved' && !isNoDesignMode" class="space-y-3">
      <div v-if="isLoadingTemplates" class="text-center py-6">
        <Loader2 class="w-6 h-6 mx-auto text-blue-600 animate-spin" />
        <p class="text-sm text-gray-500 mt-2">Loading templates...</p>
      </div>
      
      <div v-else-if="templates.length === 0" class="text-center py-6 bg-gray-50 rounded-xl">
                <LayoutTemplate class="w-8 h-8 mx-auto text-gray-400 mb-2" />

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
              :src="template.thumbnail" 
              class="w-12 h-12 object-cover rounded"
              @error="handleImageError"
            />
            <div class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center" v-else>
                           <Image class="w-5 h-5 text-gray-400" />

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

    <!-- Print Placement -->
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

    <!-- Design Notes -->
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
                <Lightbulb class="w-3 h-3" />

         Our design team will use these notes to create or adjust your artwork.
      </p>
    </div>

    <!-- Save as Template -->
    <div v-if="hasDesignContent && !isNoDesignMode" class="pt-2 border-t">
      <button
        @click="saveAsTemplate"
        :disabled="isSavingTemplate"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
      >
        <Save v-if="!isSavingTemplate" class="w-4 h-4" />
        <Loader2 v-else class="w-4 h-4 animate-spin" />
        {{ isSavingTemplate ? 'Saving...' : 'Save as Template' }}
      </button>
    </div>

    <!-- Save Template Modal -->
    <SimpleModal
      v-model:visible="saveModalVisible"
      title="Save as Template"
      message="Enter a name for this template"
      icon-type="info"
      confirm-label="Save"
      cancel-label="Cancel"
      :show-input="true"
      :input-value="templateName"
      :input-placeholder="'Enter template name...'"
      :loading="isSavingTemplate"
      @update:input-value="templateName = $event"
      @confirm="confirmSaveTemplate"
      @close="saveModalVisible = false"
    />

    <!-- Feedback Modal -->
   <SimpleModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :message="feedbackMessage"
      :icon-type="feedbackStatus"
      :show-cancel="false"
      confirm-label="Got it"
      @confirm="feedbackVisible = false"
    />
  </div>
</template>

<script setup>
import { 
  Upload, 
  Library, 
  UploadCloud, 
  FolderOpen, 
  FileCheck, 
  X, 
  Loader2, 
  LayoutTemplate,
  Image,
  Check,
  Lightbulb,
  Save,
  Sparkles
} from 'lucide-vue-next'
import { ref, computed, watch, onMounted } from 'vue'
import { useTemplates } from '@/composables/useTemplates.js'
import SimpleModal from '@/modals/SimpleModal.vue'

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
  showPlacement: { type: Boolean, default: true },
  isNoDesignMode: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const { templates, isLoading: isLoadingTemplates, fetchTemplates, saveAsTemplate: saveTemplate } = useTemplates()

// ── State ──────────────────────────────────────────────────────────────────────
const dragging = ref(false)
const isSavingTemplate = ref(false)
const saveModalVisible = ref(false)
const templateName = ref('')

// Feedback
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')
const feedbackIcon = ref('')

const designSource = ref(props.modelValue.designSource || 'upload')
const files = ref(props.modelValue.files || [])
const localDesignNotes = ref(props.modelValue.designNotes || '')
const localPrintSize = ref(props.modelValue.printSize || '')
const localPrintPlacement = ref(props.modelValue.printPlacement || '')
const selectedTemplateId = ref(props.modelValue.selectedTemplateId || null)

const isSingleItem = computed(() => props.showPlacement)
const hasDesignContent = computed(() => {
  return files.value.length > 0 || 
         localDesignNotes.value.trim() ||
         selectedTemplateId.value ||
         localPrintSize.value.trim() ||
         localPrintPlacement.value
})
const hasFiles = computed(() => files.value.length > 0)

// ── Functions ──────────────────────────────────────────────────────────────────
function showFeedback(title, message, status = 'success') {
  const icons = {
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️'
  }
  feedbackTitle.value = title
  feedbackMessage.value = message
  feedbackStatus.value = status
  feedbackIcon.value = icons[status] || icons['info']
  feedbackVisible.value = true
}

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
      thumbnail: selectedTemp.thumbnail,
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
      showFeedback('Invalid File', `${file.name}: Only images and PDFs are allowed.`, 'error')
      return false
    }
    if (file.size > MAX_SIZE) {
      showFeedback('File Too Large', `${file.name}: Max 20MB.`, 'error')
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

function handleImageError(e) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  e.target.src = `${API_BASE_URL}/uploads/templates/default-template.jpg`
}

// ── Save as Template ──────────────────────────────────────────────────────────
async function saveAsTemplate() {
  if (!hasDesignContent.value) {
    showFeedback('No Content', 'Please add some design content before saving as template.', 'warning')
    return
  }
  
  // Show the save modal
  templateName.value = `${props.itemName} Design`
  saveModalVisible.value = true
}

async function confirmSaveTemplate() {
  if (!templateName.value?.trim()) {
    showFeedback('Invalid Name', 'Please enter a template name.', 'warning')
    return
  }
  
  isSavingTemplate.value = true
  
  try {
    let existingImagePath = ''
    if (files.value.length > 0 && files.value[0].path) {
      existingImagePath = files.value[0].path
    }
    
    const templateData = {
      name: templateName.value.trim(),
      printSize: localPrintSize.value,
      placement: localPrintPlacement.value,
      notes: localDesignNotes.value,
      existingImagePath: existingImagePath
    }
    
    const result = await saveTemplate(templateData, props.itemName)
    
    if (result.success && !result.cancelled) {
      saveModalVisible.value = false
      showFeedback('Template Saved', `"${templateName.value.trim()}" has been saved successfully!`, 'success')
      await fetchTemplates()
    } else if (result.cancelled) {
      // User cancelled
    } else {
      showFeedback('Save Failed', result.message || 'Failed to save template.', 'error')
    }
  } catch (error) {
    console.error('Error saving template:', error)
    showFeedback('Error', error.message || 'Something went wrong.', 'error')
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