// src/composables/useCart.js
import { ref, computed } from 'vue'

export function useCart() {
  const cartItems = ref([])

  // Load cart from localStorage
  const loadCart = () => {
    const savedCart = localStorage.getItem('customerCart')
    if (savedCart) {
      cartItems.value = JSON.parse(savedCart)
    }
  }

  // Save cart to localStorage
  const saveCart = () => {
    localStorage.setItem('customerCart', JSON.stringify(cartItems.value))
  }

  // Add item to cart
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
    saveCart()
  }

  // Remove item from cart
  const removeFromCart = (index) => {
    cartItems.value.splice(index, 1)
    saveCart()
  }

  // Clear cart
  const clearCart = () => {
    cartItems.value = []
    saveCart()
  }

  // Update item quantity
  const updateQuantity = (index, quantity) => {
    if (cartItems.value[index]) {
      cartItems.value[index].quantity = quantity
      saveCart()
    }
  }

  // Update item design
  const updateItemDesign = (index, designData) => {
    if (cartItems.value[index]) {
      cartItems.value[index] = { ...cartItems.value[index], ...designData }
      saveCart()
    }
  }

  // Get cart count
  const cartCount = computed(() => cartItems.value.length)

  // Get cart total
  const cartTotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0)
  })

  // Prepare cart for checkout
  const prepareForCheckout = () => {
    sessionStorage.setItem('pendingCart', JSON.stringify(cartItems.value))
    return cartItems.value
  }

  return {
    cartItems,
    cartCount,
    cartTotal,
    loadCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    updateItemDesign,
    prepareForCheckout
  }
}