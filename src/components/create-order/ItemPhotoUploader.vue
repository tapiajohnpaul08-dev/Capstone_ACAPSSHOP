<template>
  <div class="space-y-3">

    <!-- Uploaded thumbnails -->
    <div
      v-if="modelValue.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 gap-3"
    >
      <div
        v-for="(url, idx) in modelValue"
        :key="url + idx"
        class="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50"
      >
        <img
          :src="url"
          :alt="`Item photo ${idx + 1}`"
          class="w-full h-full object-cover"
        />
        <button
          type="button"
          @click="removePhoto(idx)"
          :disabled="disabled"
          class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full
                 bg-black/60 text-white
                 opacity-0 group-hover:opacity-100 focus:opacity-100
                 transition-opacity disabled:opacity-0
                 flex items-center justify-center"
          title="Remove"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Add more tile -->
      <button
        type="button"
        @click="triggerUpload"
        :disabled="disabled || uploading || modelValue.length >= maxFiles"
        class="aspect-square rounded-lg border-2 border-dashed border-gray-300
               flex flex-col items-center justify-center gap-1
               text-gray-400 hover:text-blue-600 hover:border-blue-400
               transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus class="w-5 h-5" />
        <span class="text-[11px] font-medium">Add</span>
      </button>
    </div>

    <!-- Empty dropzone -->
    <button
      v-else
      type="button"
      @click="triggerUpload"
      :disabled="disabled || uploading"
      class="w-full rounded-lg border-2 border-dashed border-gray-300
             px-6 py-8 flex flex-col items-center justify-center gap-2
             text-gray-500 hover:border-blue-400 hover:text-blue-600
             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Camera class="w-6 h-6" />
      <span class="text-sm font-medium">
        {{ uploading ? 'Uploading…' : 'Click to upload item photos' }}
      </span>
      <span class="text-[11px] text-gray-400">
        JPG, PNG, WEBP — up to {{ maxFiles }} photos
      </span>
    </button>

    <!-- Progress / error -->
    <div v-if="uploading" class="text-xs text-blue-600 flex items-center gap-1.5">
      <Loader2 class="w-3 h-3 animate-spin" />
      Uploading…
    </div>
    <p v-else-if="errorMessage" class="text-xs text-red-500 flex items-center gap-1">
      <AlertCircle class="w-3 h-3" />
      {{ errorMessage }}
    </p>

    <input
      ref="inputRef"
      data-item-photo-upload
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFiles"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Camera, Plus, X, Loader2, AlertCircle } from 'lucide-vue-next'
import { ordersApi } from '@/api.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  maxFiles: { type: Number, default: 5 },
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const uploading = ref(false)
const errorMessage = ref('')

function triggerUpload() {
  if (props.disabled || uploading.value) return
  errorMessage.value = ''
  inputRef.value?.click()
}

function removePhoto(idx) {
  if (props.disabled) return
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

async function handleFiles(event) {
  const input = event.target
  const picked = Array.from(input.files || [])
  input.value = ''

  if (picked.length === 0) return

  const slotsLeft = props.maxFiles - props.modelValue.length
  if (slotsLeft <= 0) {
    errorMessage.value = `You can upload up to ${props.maxFiles} photos.`
    return
  }

  const toUpload = picked.slice(0, slotsLeft)
  if (picked.length > slotsLeft) {
    errorMessage.value = `Only the first ${slotsLeft} photo(s) were uploaded — max is ${props.maxFiles}.`
  } else {
    errorMessage.value = ''
  }

  const nonImage = toUpload.find((f) => !String(f.type || '').startsWith('image/'))
  if (nonImage) {
    errorMessage.value = `"${nonImage.name}" is not an image. Please upload photos only.`
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    toUpload.forEach((file) => formData.append('files', file))

    const response = await ordersApi.uploadDesignFiles(formData)

    if (!response?.success || !Array.isArray(response.files)) {
      throw new Error(response?.message || 'Upload failed')
    }

    const urls = response.files
      .map((f) => f.url || f.path || f.secure_url)
      .filter(Boolean)

    if (urls.length === 0) {
      throw new Error('Upload succeeded but no URLs were returned')
    }

    emit('update:modelValue', [...props.modelValue, ...urls])
    errorMessage.value = ''
  } catch (err) {
    console.error('Item photo upload failed:', err)
    errorMessage.value = err?.message || 'Upload failed. Please try again.'
  } finally {
    uploading.value = false
  }
}
</script>