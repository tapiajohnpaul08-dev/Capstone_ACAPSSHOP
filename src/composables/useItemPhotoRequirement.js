// src/composables/useItemPhotoRequirement.js
import { computed } from 'vue'

/**
 * True if the given item/payload carries at least one photo of the
 * customer's own physical item.
 *
 * Mirrors `hasItemPhoto()` in services/OrderServices.js so both sides
 * agree on what "has a photo" means.
 */
export function hasItemPhoto(item) {
  if (!item) return false

  if (Array.isArray(item.itemPhotos)) {
    if (item.itemPhotos.some((u) => typeof u === 'string' && u.trim())) {
      return true
    }
  }

  if (typeof item.itemPhoto === 'string' && item.itemPhoto.trim()) {
    return true
  }

  return false
}

/**
 * @param {import('vue').Ref<boolean>} isProvidedRef
 *   Ref that is `true` when the customer is supplying their own items.
 *
 * @param {import('vue').Ref<Array<string>>} itemPhotosRef
 *   Ref holding the array of uploaded photo URLs.
 */
export function useItemPhotoRequirement(isProvidedRef, itemPhotosRef) {
  const requiresItemPhoto = computed(() => isProvidedRef.value === true)

  const hasAnyItemPhoto = computed(() => {
    if (!requiresItemPhoto.value) return false
    const arr = itemPhotosRef.value
    if (!Array.isArray(arr)) return false
    return arr.some((u) => typeof u === 'string' && u.trim())
  })

  const itemPhotoError = computed(() => {
    if (!requiresItemPhoto.value) return ''
    if (hasAnyItemPhoto.value) return ''
    return 'Please upload at least one photo of your own item — we need to see what it looks like before we can print on it.'
  })

  const canSubmit = computed(() => !itemPhotoError.value)

  const itemPhotoCount = computed(() => {
    const arr = itemPhotosRef.value
    if (!Array.isArray(arr)) return 0
    return arr.filter((u) => typeof u === 'string' && u.trim()).length
  })

  return {
    requiresItemPhoto,
    hasAnyItemPhoto,
    itemPhotoError,
    canSubmit,
    itemPhotoCount,
  }
}