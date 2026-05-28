<template>
  <div class="space-y-6">
    <!-- Design Source Toggle -->
    <div class="grid grid-cols-2 gap-3">
      <button
        @click="setDesignSource('upload')"
        class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
        :class="designSource === 'upload'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'"
      >
        Upload New Design
      </button>
      <button
        @click="setDesignSource('saved')"
        class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
        :class="designSource === 'saved'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'"
      >
        Use Saved Template
      </button>
    </div>

    <!-- Upload Panel -->
    <div v-if="designSource === 'upload'" class="space-y-4">
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
        <p class="text-sm font-medium text-gray-700">Drag & drop your files here</p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG, PDF, AI, PSD · Max 20MB each</p>
        <label class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          Browse Files
          <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.ai,.psd" class="hidden" @change="handleFileSelect" />
        </label>
      </div>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Uploading files...</span>
          <span class="text-gray-500">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
        </div>
      </div>

      <!-- Uploaded Files -->
      <div v-if="files.length > 0" class="space-y-2">
        <div v-for="(file, idx) in files" :key="idx" class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <svg v-if="isImageFile(file)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <rect x="2" y="2" width="20" height="20" rx="2.18"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5-6 6-3-3-4 4"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span class="flex-1 text-sm truncate">{{ file.name }}</span>
          <span class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</span>
          <button @click="removeFile(idx)" class="text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Saved Templates Panel -->
    <div v-if="designSource === 'saved'" class="space-y-4">
      <div v-if="templatesLoading" class="text-center py-8">
        <div class="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500 mt-2">Loading templates...</p>
      </div>
      
      <div v-else-if="templates.length === 0" class="text-center py-8 bg-gray-50 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-400 mb-2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="m9 9 6 6m0-6-6 6"/>
        </svg>
        <p class="text-sm text-gray-500">No saved templates yet.</p>
        <p class="text-xs text-gray-400 mt-1">Save your first design as a template to use it here.</p>
      </div>
      
      <div v-else class="grid gap-3 max-h-64 overflow-y-auto">
        <div
          v-for="template in templates"
          :key="template.id"
          @click="selectTemplate(template)"
          class="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          :class="{ 'border-blue-500 bg-blue-50': selectedTemplateId === template.id }"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                v-if="getTemplateImageUrl(template.imagePath || template.thumbnail)" 
                :src="getTemplateImageUrl(template.imagePath || template.thumbnail)" 
                :alt="template.name"
                class="w-full h-full object-cover"
                @error="handleTemplateImageError"
              />
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-400">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5-6 6-3-3-4 4"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">{{ template.name }}</div>
              <div class="text-xs text-gray-500">
                Print: {{ template.printSize || 'Standard' }} · {{ template.placement || 'Front' }}
              </div>
            </div>
            <svg v-if="selectedTemplateId === template.id" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Common Design Fields -->
    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700">Print Size</label>
        <input
          v-model="localPrintSize"
          type="text"
          placeholder="e.g., 3x3 inches"
          class="field"
        />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700">Print Placement</label>
        <select v-model="localPrintPlacement" class="field">
          <option value="">Select placement...</option>
          <option value="Full-Wrap">Full Wrap</option>
          <option value="Front-Only">Front Only</option>
          <option value="Back-Only">Back Only</option>
          <option value="Front-Back">Front & Back</option>
        </select>
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-sm font-medium text-gray-700">Design Notes</label>
      <textarea
        v-model="localDesignNotes"
        rows="3"
        placeholder="Special instructions, color preferences, font choices..."
        class="field resize-none"
      ></textarea>
    </div>

    <!-- Save as Template Button -->
    <div v-if="designSource === 'upload' && hasDesignContent" class="pt-2 border-t">
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
        {{ isSavingTemplate ? 'Saving...' : 'Save as Template' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTemplates } from '@/composables/useTemplates.js'
import { ordersApi } from '@/api.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      designSource: 'upload',
      printSize: '',
      printPlacement: '',
      designNotes: '',
      files: [],
      selectedTemplateId: null,
      selectedTemplate: null
    })
  },
  itemName: { type: String, default: 'Design' }
})

const emit = defineEmits(['update:modelValue', 'design-changed'])

const { templates, isLoading: templatesLoading, fetchTemplates, saveAsTemplate: saveTemplate } = useTemplates()

// Local state
const dragging = ref(false)
const isSavingTemplate = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)

// Local bound properties
const designSource = ref(props.modelValue.designSource || 'upload')
const files = ref(props.modelValue.files || [])
const originalUploadedFiles = ref([])

const localPrintSize = ref(props.modelValue.printSize || '')
const localPrintPlacement = ref(props.modelValue.printPlacement || '')
const localDesignNotes = ref(props.modelValue.designNotes || '')
const selectedTemplateId = ref(props.modelValue.selectedTemplateId || null)

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Check if there's design content to save
const hasDesignContent = computed(() => {
  return files.value.length > 0 || 
         localPrintSize.value.trim() || 
         localPrintPlacement.value || 
         localDesignNotes.value.trim()
})

// Helper function to check if file is an image
function isImageFile(file) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const ext = file.name?.split('.').pop()?.toLowerCase()
  return imageExtensions.includes(ext) || file.type?.startsWith('image/')
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getTemplateImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  let cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  if (cleanPath.startsWith('templates/')) {
    return `${API_BASE_URL}/uploads/${cleanPath}`
  }
  return `${API_BASE_URL}/uploads/templates/${cleanPath}`
}

function handleTemplateImageError(event) {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"%3E%3C/path%3E%3C/svg%3E'
}

// Watch for changes and emit updates
watch([designSource, files, localPrintSize, localPrintPlacement, localDesignNotes, selectedTemplateId], () => {
  const selectedTemp = selectedTemplateId.value ? templates.value.find(t => t.id === selectedTemplateId.value) : null
  
  const designData = {
    designSource: designSource.value,
    files: files.value,
    printSize: localPrintSize.value,
    printPlacement: localPrintPlacement.value,
    designNotes: localDesignNotes.value,
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
  emit('design-changed', designData)
}, { deep: true })

function setDesignSource(source) {
  designSource.value = source
  if (source === 'saved' && templates.value.length === 0) {
    fetchTemplates()
  }
}

function selectTemplate(template) {
  selectedTemplateId.value = template.id || template.templateId
  localPrintSize.value = template.printSize || localPrintSize.value
  localPrintPlacement.value = template.placement || localPrintPlacement.value
  localDesignNotes.value = template.notes || localDesignNotes.value
  
  // IMPORTANT: Pass the image path correctly
  const imageUrl = template.imagePath || template.thumbnail || ''
  
  const designData = {
    designSource: designSource.value,
    files: files.value,
    printSize: localPrintSize.value,
    printPlacement: localPrintPlacement.value,
    designNotes: localDesignNotes.value,
    selectedTemplateId: selectedTemplateId.value,
    selectedTemplate: {
      id: template.id || template.templateId,
      name: template.name,
      thumbnail: imageUrl,
      imagePath: imageUrl,  // ← Make sure this is set
      printSize: template.printSize,
      placement: template.placement,
      notes: template.notes
    }
  }
  
  emit('update:modelValue', designData)
  emit('design-changed', designData)
}

function validateFiles(fileList) {
  const errors = []
  const MAX_SIZE = 20 * 1024 * 1024 // 20MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  
  for (const file of fileList) {
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      errors.push(`${file.name}: Invalid file type. Only images and PDFs are allowed.`)
    }
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name}: File too large. Max 20MB.`)
    }
  }
  return errors
}

function showToast(type, message) {
  // You can implement this with your existing toast system
  console.log(`${type}: ${message}`)
  // If you have a global toast, emit it
  const event = new CustomEvent('show-toast', { detail: { type, message } })
  window.dispatchEvent(event)
}

async function uploadFilesToServer(filesToUpload) {
  isUploading.value = true
  uploadProgress.value = 0
  
  // Store the original File objects BEFORE uploading
  originalUploadedFiles.value = [...filesToUpload]
  
  const formData = new FormData()
  for (const file of filesToUpload) {
    formData.append('files', file)
  }
  
  const interval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 200)
  
  try {
    const response = await ordersApi.uploadDesignFiles(formData)
    if (response.success && response.files) {
      // Merge metadata with reference to original file
      const newFiles = response.files.map((file, idx) => ({
        ...file,
        originalFile: filesToUpload[idx]  // Store reference to original File
      }))
      files.value = [...files.value, ...newFiles]
      showToast('success', `${response.files.length} file(s) uploaded successfully`)
    } else {
      showToast('error', response.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Upload failed:', error)
    showToast('error', error.message || 'Failed to upload files')
  } finally {
    clearInterval(interval)
    uploadProgress.value = 100
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
    }, 500)
  }
}

async function handleFileSelect(e) {
  const newFiles = [...e.target.files]
  const errors = validateFiles(newFiles)
  if (errors.length) {
    alert(errors.join('\n'))
    e.target.value = ''
    return
  }
  
  await uploadFilesToServer(newFiles)
  e.target.value = ''
}

async function handleDrop(e) {
  dragging.value = false
  const newFiles = [...e.dataTransfer.files]
  const errors = validateFiles(newFiles)
  if (errors.length) {
    alert(errors.join('\n'))
    return
  }
  
  await uploadFilesToServer(newFiles)
}

function removeFile(index) {
  files.value.splice(index, 1)
}

async function saveAsTemplate() {
  if (!hasDesignContent.value) {
    alert('Please add some design details before saving as template')
    return
  }
  
  isSavingTemplate.value = true
  try {
    const templateName = prompt('Enter a name for this template:', props.itemName + ' Design')
    if (!templateName) {
      isSavingTemplate.value = false
      return
    }
    
    console.log('Template name entered:', templateName)
    
    // Get the existing image path from the uploaded file
    let existingImagePath = ''
    if (files.value.length > 0 && files.value[0].path) {
      existingImagePath = files.value[0].path
      console.log('Existing image path:', existingImagePath)
    }
    
    if (!existingImagePath) {
      alert('Please upload an image first')
      isSavingTemplate.value = false
      return
    }
    
    const templateData = {
      name: templateName,  // Make sure this is the entered name
      printSize: localPrintSize.value,
      placement: localPrintPlacement.value,
      notes: localDesignNotes.value,
      existingImagePath: existingImagePath
    }
    
    console.log('Saving template with data:', templateData)
    
    const result = await saveTemplate(templateData, props.itemName)
    console.log('Save result:', result)
    
    if (result.success && !result.cancelled) {
      alert('Template saved successfully!')
      await fetchTemplates()
      // Clear files after successful save? Optional
      // files.value = []
    } else if (result.cancelled) {
      // User cancelled
    } else {
      alert(result.message || 'Failed to save template')
    }
  } catch (error) {
    console.error('Error saving template:', error)
    alert('Failed to save template: ' + (error.message || 'Unknown error'))
  } finally {
    isSavingTemplate.value = false
  }
}

// Load templates on mount
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