// src/composables/useTemplates.js
import { ref } from 'vue'
import { templatesApi } from '@/api.js'

export function useTemplates() {
  const templates = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  console.log('API Base URL in useTemplates:', API_BASE_URL)
  const fetchTemplates = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await templatesApi.getTemplates()
      console.log('Fetch templates response:', response)
      
      if (response.success && response.data) {
        templates.value = response.data.map(t => {
          let thumbnail = ''
          if (t.imagePath) {
            if (t.imagePath.startsWith('http://') || t.imagePath.startsWith('https://')) {
              thumbnail = t.imagePath
            } else {
              const cleanPath = t.imagePath.replace(/^\/+/, '')
              thumbnail = `${API_BASE_URL}/${cleanPath}`
            }
          } else {
            thumbnail = `${API_BASE_URL}/uploads/templates/default-template.jpg`
          }
          
          return {
            id: t.templateId || t.id,
            templateId: t.templateId || t.id,
            name: t.name || 'Untitled Template',
            thumbnail: thumbnail,
            imagePath: t.imagePath,
            printSize: t.printSize || '',
            placement: t.placement || '',
            notes: t.notes || '',
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          }
        })
        return { success: true, data: templates.value }
      }
      return { success: false, message: response.message || 'Failed to fetch templates' }
    } catch (err) {
      error.value = err.message
      console.error('Fetch templates error:', err)
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
      console.log('Saving template with data:', designData)
      
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
        return { success: false, message: response.message || 'Failed to save template' }
      }
      
      const formData = new FormData()
      formData.append('name', templateName)
      formData.append('printSize', designData.printSize || '')
      formData.append('placement', designData.placement || '')
      formData.append('notes', designData.notes || '')
      
      if (designData.imageFile) {
        formData.append('image', designData.imageFile)
      }
      
      const response = await templatesApi.createTemplate(formData)
      console.log('Template API response (formdata):', response)
      if (response.success) {
        await fetchTemplates()
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message || 'Failed to save template' }
    } catch (err) {
      console.error('Save template error:', err)
      return { success: false, message: err.message, cancelled: false }
    }
  }

  const deleteTemplate = async (templateId) => {
    try {
      const response = await templatesApi.deleteTemplate(templateId)
      if (response.success) {
        templates.value = templates.value.filter(t => t.id !== templateId && t.templateId !== templateId)
        return { success: true }
      }
      return { success: false, message: response.message || 'Failed to delete template' }
    } catch (err) {
      console.error('Delete template error:', err)
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
      return { success: false, message: response.message || 'Failed to update template' }
    } catch (err) {
      console.error('Update template error:', err)
      return { success: false, message: err.message }
    }
  }

  const renameTemplate = async (templateId, newName) => {
    try {
      const response = await templatesApi.updateTemplate(templateId, { name: newName })
      if (response.success) {
        await fetchTemplates()
        return { success: true }
      }
      return { success: false, message: response.message || 'Failed to rename template' }
    } catch (err) {
      console.error('Rename template error:', err)
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
    updateTemplate,
    renameTemplate
  }
}