// src/composables/useDesigns.js
import { ref } from 'vue'
import { designsApi } from '@/api.js'

const designs = ref([])

export function useDesigns() {
  async function fetchDesigns() {
    const res = await designsApi.getDesigns()
    if (res.success) designs.value = res.designs
    return res
  }

  async function renameDesign(id, name) {
    const res = await designsApi.renameDesign(id, name)
    if (res.success) { const d = designs.value.find((x) => x.id === id); if (d) d.name = name }
    return res
  }

  async function deleteDesign(id) {
    const res = await designsApi.deleteDesign(id)
    if (res.success) designs.value = designs.value.filter((d) => d.id !== id)
    return res
  }

  async function uploadDesign(file) { return designsApi.uploadDesign(file) }

  return { designs, fetchDesigns, renameDesign, deleteDesign, uploadDesign }
}