// src/composables/useTemplates.js
import { ref } from 'vue'
import { templatesApi } from '@/api.js'

export function useTemplates() {
  const templates = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const fetchTemplates = async () => {
    isLoading.value = true
    try {
      const response = await templatesApi.getTemplates()
      if (response.success && response.data) {
        templates.value = response.data.map(t => {
          // Process image path to ensure it's a valid URL
          let thumbnail = ''
          if (t.imagePath) {
            if (t.imagePath.startsWith('http://') || t.imagePath.startsWith('https://')) {
              thumbnail = t.imagePath
            } else {
              // Clean the path and construct full URL
              const cleanPath = t.imagePath.replace(/^\/+/, '')
              thumbnail = `${API_BASE_URL}/${cleanPath}`
            }
          } else {
            thumbnail = `${API_BASE_URL}/uploads/templates/default-template.jpg`
          }
          
          return {
            id: t.templateId,
            name: t.name,
            thumbnail: thumbnail,
            lastUsed: t.updatedAt || t.createdAt,
            printSize: t.printSize,
            placement: t.placement,
            notes: t.notes,
            imagePath: t.imagePath
          }
        })
        return { success: true, data: templates.value }
      }
      return { success: false, message: response.message }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

const saveAsTemplate = async (designData, itemName) => {
  const templateName = designData.name
  if (!templateName) {
    console.error('No template name provided')
    return { success: false, message: 'Template name is required', cancelled: false }
  }

  try {
    // If we have an existingImagePath, send as JSON (not FormData)
    if (designData.existingImagePath) {
      console.log('Sending existing image path as JSON:', designData.existingImagePath)
      
      const payload = {
        name: templateName,
        printSize: designData.printSize || '',
        placement: designData.placement || '',
        notes: designData.notes || '',
        existingImagePath: designData.existingImagePath
      }
      
      const response = await templatesApi.createTemplate(payload)
      console.log('Template API response:', response)
      if (response.success) {
        await fetchTemplates()
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message }
    }
    
    // Otherwise, use FormData for file upload
    const formData = new FormData()
    formData.append('name', templateName)
    formData.append('printSize', designData.printSize || '')
    formData.append('placement', designData.placement || '')
    formData.append('notes', designData.notes || '')
    
    if (designData.imageFile) {
      formData.append('image', designData.imageFile)
    }
    
    const response = await templatesApi.createTemplate(formData)
    if (response.success) {
      await fetchTemplates()
      return { success: true, data: response.data }
    }
    return { success: false, message: response.message }
  } catch (err) {
    console.error('Save template error:', err)
    return { success: false, message: err.message }
  }
}

  const deleteTemplate = async (templateId) => {
    try {
      const response = await templatesApi.deleteTemplate(templateId)
      if (response.success) {
        templates.value = templates.value.filter(t => t.id !== templateId)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const updateTemplate = async (templateId, templateData) => {
    try {
      const response = await templatesApi.updateTemplate(templateId, templateData)
      if (response.success) {
        await fetchTemplates()
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  return { 
    templates, 
    isLoading, 
    error, 
    fetchTemplates, 
    saveAsTemplate,
    deleteTemplate,
    updateTemplate
  }
}