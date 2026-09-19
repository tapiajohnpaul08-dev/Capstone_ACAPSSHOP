// src/composables/useCart.js
import { ref, computed } from 'vue'

export function useCart() {
  const cartItems = ref([])

  // ✅ FIX — Track which items are selected for checkout.
  // Uses a Set of item indexes for O(1) lookups. Persisted to localStorage
  // so refreshing the page keeps the selection.
  const selectedIndexes = ref(new Set())

  const loadCart = () => {
    const savedCart = localStorage.getItem('customerCart')
    if (savedCart) {
      cartItems.value = JSON.parse(savedCart)
    }
    // ✅ Default: select ALL items (matches previous behavior)
    const savedSelection = localStorage.getItem('customerCartSelection')
    if (savedSelection) {
      try {
        const arr = JSON.parse(savedSelection)
        selectedIndexes.value = new Set(arr)
      } catch (e) {
        selectedIndexes.value = new Set(cartItems.value.map((_, i) => i))
      }
    } else {
      selectedIndexes.value = new Set(cartItems.value.map((_, i) => i))
    }
  }

  const saveCart = () => {
    localStorage.setItem('customerCart', JSON.stringify(cartItems.value))
    // ✅ Persist selection alongside cart
    localStorage.setItem(
      'customerCartSelection',
      JSON.stringify(Array.from(selectedIndexes.value)),
    )
  }

  // ✅ NEW — Selection helpers
  const toggleItemSelection = (index) => {
    const s = new Set(selectedIndexes.value)
    if (s.has(index)) s.delete(index)
    else s.add(index)
    selectedIndexes.value = s
    saveCart()
  }

  const selectAll = () => {
    selectedIndexes.value = new Set(cartItems.value.map((_, i) => i))
    saveCart()
  }

  const deselectAll = () => {
    selectedIndexes.value = new Set()
    saveCart()
  }

  const isItemSelected = (index) => selectedIndexes.value.has(index)

  // ✅ NEW — Get only the checked items (with original indexes preserved)
  const selectedItems = computed(() =>
    cartItems.value
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => selectedIndexes.value.has(index)),
  )

  // ✅ NEW — Cart subtotal for only selected items
  const selectedSubtotal = computed(() =>
    selectedItems.value.reduce(
      (sum, { item }) => sum + (item.estimatedTotal || 0),
      0,
    ),
  )

  const selectedCount = computed(() => selectedIndexes.value.size)

  // ─── Existing methods (unchanged) ────────────────────────────────
  const addToCart = (product, size, quantity, estimatedTotal) => {
    cartItems.value.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      size: size,
      quantity: quantity,
      printPlacement: '',
      printSize: '',
      designNotes: '',
      designSource: 'upload',
      files: [],
      selectedTemplateId: null,
      selectedTemplate: null,
      estimatedTotal: estimatedTotal,
      createdAt: new Date().toISOString()
    })
    // ✅ Auto-select the newly added item
    const s = new Set(selectedIndexes.value)
    s.add(cartItems.value.length - 1)
    selectedIndexes.value = s
    saveCart()
  }

  const removeFromCart = (index) => {
    cartItems.value.splice(index, 1)
    // ✅ Rebuild selection index set — all indexes after the removed one shift
    const s = new Set()
    for (const i of selectedIndexes.value) {
      if (i < index) s.add(i)
      else if (i > index) s.add(i - 1)
    }
    selectedIndexes.value = s
    saveCart()
  }

  const clearCart = () => {
    cartItems.value = []
    selectedIndexes.value = new Set()
    saveCart()
  }

  const updateQuantity = (index, quantity) => {
    if (cartItems.value[index]) {
      cartItems.value[index].quantity = quantity
      saveCart()
    }
  }

  const updateItemDesign = (index, designData) => {
    if (cartItems.value[index]) {
      cartItems.value[index] = { ...cartItems.value[index], ...designData }
      saveCart()
    }
  }

  const cartCount = computed(() => cartItems.value.length)

  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0),
  )

  // ✅ NEW — Only push SELECTED items into sessionStorage for checkout
  const prepareForCheckout = () => {
    const selected = selectedItems.value.map(({ item }) => item)
    sessionStorage.setItem('pendingCart', JSON.stringify(selected))
    return selected
  }

  // ✅ NEW — Remove only the checked items after successful order
  const removeSelectedFromCart = () => {
    const keep = cartItems.value.filter(
      (_, index) => !selectedIndexes.value.has(index),
    )
    cartItems.value = keep
    selectedIndexes.value = new Set(keep.map((_, i) => i))
    saveCart()
  }

  return {
    cartItems,
    cartCount,
    cartTotal,
    // ✅ NEW
    selectedIndexes,
    selectedItems,
    selectedSubtotal,
    selectedCount,
    toggleItemSelection,
    selectAll,
    deselectAll,
    isItemSelected,
    removeSelectedFromCart,
    // existing
    loadCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    updateItemDesign,
    prepareForCheckout,
  }
}