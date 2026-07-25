// src/composables/useDesigns.js
import { ref } from 'vue'
import { useTemplates } from './useTemplates.js'

export function useDesigns() {
  const { templates, isLoading, fetchTemplates, deleteTemplate, renameTemplate, updateTemplate } = useTemplates()
  
  // Alias for backward compatibility
  const designs = templates
  
  return {
    designs,
    isLoading,
    fetchDesigns: fetchTemplates,
    deleteDesign: deleteTemplate,
    renameDesign: renameTemplate,
    updateDesign: updateTemplate
  }
}