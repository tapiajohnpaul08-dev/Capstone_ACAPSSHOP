<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Design Information</h4>
      <p class="text-xs text-gray-500 mt-0.5">Upload your artwork or attach design instructions.</p>
    </div>
    <div class="px-6 py-5 space-y-5">

      <!-- Design source toggle -->
      <div class="grid md:grid-cols-2 gap-3">
        <div
          @click="setDesignSource('upload')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="modelValue.designSource === 'upload'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.designSource === 'upload' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.designSource === 'upload'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-800">Upload New Design</div>
              <p class="text-xs text-gray-500 mt-0.5">Upload your logo or artwork files</p>
            </div>
          </div>
        </div>

        <div
          @click="setDesignSource('saved')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="modelValue.designSource === 'saved'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.designSource === 'saved' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.designSource === 'saved'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-800">Use Saved Template</div>
              <p class="text-xs text-gray-500 mt-0.5">Choose from your saved designs</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Panel -->
      <div v-if="modelValue.designSource === 'upload'" class="space-y-4">
        <div
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="handleDrop"
          class="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
          :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-400 mb-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          <p class="text-sm font-medium text-gray-700">Drag & drop your files here</p>
          <p class="text-xs text-gray-400 mt-0.5">PNG, JPG, PDF, AI, PSD · Max 20MB each</p>
          <label class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            Browse Files
            <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.ai,.psd" class="hidden" @change="handleFileSelect" />
          </label>
        </div>

        <!-- Uploaded files list -->
        <div v-if="modelValue.files && modelValue.files.length > 0" class="space-y-2">
          <div
            v-for="(file, index) in modelValue.files"
            :key="index"
            class="flex items-center gap-3 p-3 bg-white border rounded-lg"
          >
            <div class="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</div>
              <div class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</div>
            </div>
            <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <p v-if="errors.files" class="text-xs text-red-500">{{ errors.files }}</p>
      </div>

      <!-- Saved templates -->
      <div v-if="modelValue.designSource === 'saved'" class="space-y-3">
        <div v-if="savedTemplates.length === 0" class="p-6 text-center bg-gray-50 rounded-xl border border-dashed">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-400 mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6m0-6-6 6"/>
          </svg>
          <p class="text-sm text-gray-500">No saved templates yet.</p>
          <p class="text-xs text-gray-400 mt-0.5">Designs from past orders will appear here.</p>
        </div>
        <div v-else class="grid gap-2">
          <div
            v-for="template in savedTemplates"
            :key="template.id"
            @click="selectTemplate(template)"
            class="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            :class="{ 'border-blue-500 bg-blue-50': selectedTemplateId === template.id }"
          >
            <div class="flex items-center gap-3">
              <img :src="template.thumbnail" class="w-10 h-10 object-cover rounded" />
              <div>
                <div class="text-sm font-medium">{{ template.name }}</div>
                <div class="text-xs text-gray-500">Last used: {{ template.lastUsed }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Print specs -->
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="di-size">Print Size</label>
          <input
            id="di-size"
            :value="modelValue.printSize"
            @input="updateField('printSize', $event.target.value)"
            type="text"
            placeholder="e.g., 3×3 inches"
            class="field"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700" for="di-placement">Print Placement</label>
          <input
            id="di-placement"
            :value="modelValue.printPlacement"
            @input="updateField('printPlacement', $event.target.value)"
            type="text"
            placeholder="e.g., Front center, Wrap around"
            class="field"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700" for="di-notes">Design Notes for IT Team</label>
        <textarea
          id="di-notes"
          :value="modelValue.designNotes"
          @input="updateField('designNotes', $event.target.value)"
          placeholder="Special instructions, color preferences, font choices..."
          rows="3"
          class="field resize-none"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const dragging = ref(false)
const savedTemplates = ref([]) // Would be loaded from API/store
const selectedTemplateId = ref(null)

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function setDesignSource(source) {
  updateField('designSource', source)
}

function handleDrop(e) {
  dragging.value = false
  const newFiles = [...(e.dataTransfer.files || [])]
  updateField('files', [...(props.modelValue.files || []), ...newFiles])
}

function handleFileSelect(e) {
  const newFiles = [...(e.target.files || [])]
  updateField('files', [...(props.modelValue.files || []), ...newFiles])
}

function removeFile(index) {
  const updated = [...(props.modelValue.files || [])]
  updated.splice(index, 1)
  updateField('files', updated)
}

function selectTemplate(template) {
  selectedTemplateId.value = template.id
  updateField('selectedTemplate', template)
  updateField('printSize', template.printSize)
  updateField('printPlacement', template.placement)
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
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