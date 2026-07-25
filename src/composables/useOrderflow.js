// composables/useOrderFlow.js
import { ref, computed, reactive } from 'vue'

export const ORDER_STEPS = {
  PRODUCT_SELECTION: 0,
  DESIGN_CONFIG: 1,
  DESIGN_UPLOAD: 2,
  CUSTOMER_INFO: 3,
  FULFILLMENT: 4,
  PAYMENT: 5,
  REVIEW: 6
}

export const DESIGN_MODES = {
  INDIVIDUAL: 'individual',
  SHARED: 'shared',
  HYBRID: 'hybrid'
}

export function useOrderFlow() {
  const state = reactive({
    currentStep: ORDER_STEPS.PRODUCT_SELECTION,
    orderType: null, // 'single' | 'multi' | 'own-cups'
    designMode: DESIGN_MODES.INDIVIDUAL,
    items: [],
    sharedDesign: null,
    designGroups: [],
    customerInfo: {},
    fulfillment: {},
    payment: {},
    isSubmitting: false
  })

  const stepValidation = {
    [ORDER_STEPS.PRODUCT_SELECTION]: () => {
      return state.items.length > 0 && state.items.every(item => 
        item.quantity >= (item.minOrder || 500) && 
        (state.orderType === 'own-cups' || item.size)
      )
    },
    [ORDER_STEPS.DESIGN_CONFIG]: () => {
      if (state.designMode === DESIGN_MODES.SHARED) {
        return state.sharedDesign !== null
      }
      if (state.designMode === DESIGN_MODES.INDIVIDUAL) {
        return state.items.every(item => item.design !== null)
      }
      // Hybrid: at least one design group
      return state.designGroups.length > 0
    },
    [ORDER_STEPS.DESIGN_UPLOAD]: () => {
      // Deeper validation: files uploaded or templates selected
      if (state.designMode === DESIGN_MODES.SHARED) {
        return hasValidDesign(state.sharedDesign)
      }
      if (state.designMode === DESIGN_MODES.HYBRID) {
        return state.designGroups.every(group => hasValidDesign(group.design))
      }
      return state.items.every(item => hasValidDesign(item.design))
    },
    [ORDER_STEPS.CUSTOMER_INFO]: () => {
      const info = state.customerInfo
      return info.name && info.email && info.phone && info.address
    },
    [ORDER_STEPS.FULFILLMENT]: () => {
      const { method, deliveryAddress } = state.fulfillment
      if (method === 'delivery') return deliveryAddress?.trim()
      return method === 'pickup'
    },
    [ORDER_STEPS.PAYMENT]: () => {
      return state.payment.method && 
        (state.payment.method === 'cod' || state.payment.bankName)
    },
    [ORDER_STEPS.REVIEW]: () => {
      // Check all previous steps are valid
      return Object.values(ORDER_STEPS).every(step => {
        if (typeof step === 'string') return true
        return step === ORDER_STEPS.REVIEW || stepValidation[step]?.()
      })
    }
  }

  function hasValidDesign(design) {
    if (!design) return false
    if (design.designSource === 'upload') {
      return design.files?.length > 0 || design.printSize || design.printPlacement
    }
    if (design.designSource === 'saved') {
      return design.selectedTemplateId !== null
    }
    return false
  }

  const canGoNext = computed(() => {
    return stepValidation[state.currentStep]?.() !== false
  })

  const canGoPrevious = computed(() => {
    return state.currentStep > ORDER_STEPS.PRODUCT_SELECTION
  })

  function nextStep() {
    if (canGoNext.value && state.currentStep < ORDER_STEPS.REVIEW) {
      state.currentStep++
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    }
    return false
  }

  function previousStep() {
    if (canGoPrevious.value) {
      state.currentStep--
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    }
    return false
  }

  function goToStep(step) {
    if (step >= ORDER_STEPS.PRODUCT_SELECTION && step <= ORDER_STEPS.REVIEW) {
      state.currentStep = step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Auto-detect design mode based on items
  function autoDetectDesignMode() {
    const itemCount = state.items.length
    
    if (itemCount === 1) {
      state.designMode = DESIGN_MODES.INDIVIDUAL
      return
    }
    
    // Check if items have similar category (suggest shared)
    const categories = state.items.map(i => i.category)
    const uniqueCategories = new Set(categories)
    if (uniqueCategories.size === 1) {
      // All same category - suggest shared design
      state.designMode = DESIGN_MODES.SHARED
    } else {
      state.designMode = DESIGN_MODES.INDIVIDUAL
    }
  }

  // Build order payload based on design mode
  function buildOrderPayload() {
    const basePayload = {
      customerName: state.customerInfo.name,
      customerEmail: state.customerInfo.email,
      customerPhone: state.customerInfo.phone,
      address: state.customerInfo.address,
      postalCode: state.customerInfo.postalCode || '',
      receivingMode: state.fulfillment.method === 'pickup' ? 'Pick-up' : 'Delivery',
      paymentMethod: state.payment.method,
      isProvided: state.orderType === 'own-cups'
    }

    let items = []

    if (state.designMode === DESIGN_MODES.SHARED) {
      // All items share one design
      const sharedDesign = state.sharedDesign
      const designImage = getDesignImage(sharedDesign)
      
      items = state.items.map(item => ({
        productId: state.orderType === 'own-cups' ? null : item.productId,
        name: state.orderType === 'own-cups' ? item.productType : item.name,
        category: state.orderType === 'own-cups' ? 'Customer Provided' : item.category,
        size: item.size,
        quantity: item.quantity,
        designImage: designImage,
        designSource: sharedDesign.designSource,
        printSize: item.printSize || sharedDesign.printSize,
        printPlacement: item.printPlacement || sharedDesign.printPlacement,
        designNotes: item.designNotes || sharedDesign.designNotes,
        selectedTemplateId: sharedDesign.selectedTemplateId,
        selectedTemplate: sharedDesign.selectedTemplate
      }))
    } else if (state.designMode === DESIGN_MODES.INDIVIDUAL) {
      // Each item has its own design
      items = state.items.map(item => ({
        productId: state.orderType === 'own-cups' ? null : item.productId,
        name: state.orderType === 'own-cups' ? item.productType : item.name,
        category: state.orderType === 'own-cups' ? 'Customer Provided' : item.category,
        size: item.size,
        quantity: item.quantity,
        designImage: getDesignImage(item.design),
        designSource: item.design.designSource,
        printSize: item.design.printSize,
        printPlacement: item.design.printPlacement,
        designNotes: item.design.designNotes,
        files: item.design.files || [],
        selectedTemplateId: item.design.selectedTemplateId,
        selectedTemplate: item.design.selectedTemplate
      }))
    } else {
      // HYBRID: Items can be in groups
      // ... hybrid logic
    }

    return {
      ...basePayload,
      items,
      amount: calculateTotal(items),
      quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      notes: generateOrderNotes(items, state.designMode)
    }
  }

  function getDesignImage(design) {
    if (!design) return ''
    if (design.designSource === 'upload' && design.files?.length > 0) {
      return design.files[0].path || ''
    }
    if (design.designSource === 'saved' && design.selectedTemplate) {
      return design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || ''
    }
    return ''
  }

  function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0)
  }

  function generateOrderNotes(items, mode) {
    const modeLabels = {
      [DESIGN_MODES.INDIVIDUAL]: 'Each item has unique design',
      [DESIGN_MODES.SHARED]: 'All items share one design',
      [DESIGN_MODES.HYBRID]: 'Mixed design configuration'
    }
    const itemNames = items.map(i => i.name).join(', ')
    return `${modeLabels[mode]} | Items: ${itemNames}`
  }

  return {
    state,
    stepValidation,
    canGoNext,
    canGoPrevious,
    nextStep,
    previousStep,
    goToStep,
    autoDetectDesignMode,
    buildOrderPayload,
    ORDER_STEPS,
    DESIGN_MODES
  }
}