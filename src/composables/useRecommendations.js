// composables/useRecommendations.js
export function useRecommendations(orderItems, designMode) {
  const recommendations = computed(() => {
    const recs = []
    
    if (orderItems.length > 1) {
      const categories = orderItems.map(i => i.category)
      const uniqueCategories = new Set(categories)
      
      if (uniqueCategories.size === 1 && designMode.value === 'individual') {
        recs.push({
          type: 'tip',
          message: 'All items are from the same category. Consider using a shared design for brand consistency.',
          action: 'Switch to Shared Design'
        })
      }
      
      if (uniqueCategories.size > 1 && designMode.value === 'shared') {
        recs.push({
          type: 'tip',
          message: 'Your items are from different categories. Individual designs might work better.',
          action: 'Switch to Individual Designs'
        })
      }
    }
    
    // Check for bulk discount opportunities
    const totalQty = orderItems.reduce((sum, i) => sum + i.quantity, 0)
    if (totalQty >= 5000) {
      recs.push({
        type: 'savings',
        message: `You qualify for bulk pricing! Orders over 5,000 pcs get special rates.`,
        action: 'Show Bulk Pricing'
      })
    }
    
    return recs
  })
  
  return { recommendations }
}