// src/composables/useOrders.js
import { ref } from 'vue'
import { ordersApi } from '@/api'

export function useOrders() {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all orders for current customer
  const fetchOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await ordersApi.getMyOrders()
      if (response.success && response.data) {
        // Transform backend data to frontend format
        orders.value = response.data.map(transformOrderToFrontend)
        return { success: true, data: orders.value }
      } else {
        error.value = response.message || 'Failed to fetch orders'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Fetch single order by ID
  const fetchOrder = async (orderId) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordersApi.getMyOrderById(orderId)
          console.log('orderRes:', response.data)

      if (response.success && response.data) {
        const order = transformOrderToFrontend(response.data)
        return { success: true, order }
      } else {
        error.value = response.message || 'Order not found'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Cancel order
  const cancelOrder = async (orderId) => {
    loading.value = true
    try {
      const response = await ordersApi.cancelMyOrder(orderId)
      if (response.success) {
        // Update local orders list
        const index = orders.value.findIndex(o => o.id === orderId || o.orderId === orderId)
        if (index !== -1) {
          orders.value[index].status = 'cancelled'
          orders.value[index].statusValue = 'cancelled'
        }
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Submit order (create new)
  const submitOrder = async (orderData) => {
    console.log('orderData:', orderData);
    
    loading.value = true
    try {
      const response = await ordersApi.createOrder(orderData)
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Transform backend order to frontend format
  const transformOrderToFrontend = (backendOrder) => {
    // Determine status value for UI
    let statusValue = backendOrder.status?.toLowerCase() || 'pending'
    // Map status to UI values
    const statusMap = {
      'pending': 'pending',
      'scheduled': 'scheduled',
      'in production': 'production',
      'out for delivery': 'ready',
      'completed': 'completed',
      'cancelled': 'cancelled'
    }
    
    // Create items array from either items or single product
    let items = []
    if (backendOrder.items && backendOrder.items.length > 0) {
      items = backendOrder.items.map(item => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        size: item.size,
        quantity: item.quantity,
        estimatedTotal: item.estimatedTotal,
        image: item.image,
        design: {
          source: item.designSource,
          printSize: item.printSize,
          printPlacement: item.printPlacement,
          designNotes: item.designNotes,
          files: item.files
        }
      }))
    } else if (backendOrder.productName) {
      items = [{
        productId: backendOrder.productId,
        name: backendOrder.productName,
        size: backendOrder.size,
        quantity: backendOrder.quantity,
        image: null,
        design: backendOrder.designDetails?.[0] || null
      }]
    }

    return {
      id: backendOrder.orderId || backendOrder.orderNumber,
      orderId: backendOrder.orderId || backendOrder.orderNumber,
      orderNumber: backendOrder.orderNumber || backendOrder.orderId,
      status: backendOrder.status,
      statusValue: statusMap[backendOrder.status?.toLowerCase()] || 'pending',
      paymentStatus: backendOrder.paymentStatus,
      isProvided: backendOrder.isProvided, // ← ADD THIS LINE
      supplyType: backendOrder.isProvided ? 'Own Cups' : 'Company Cups',
      deliveryMethod: backendOrder.receivingMode || 'Delivery',
      totalAmount: backendOrder.amount || backendOrder.totalAmount || 0,
      product: backendOrder.productName,
      quantity: backendOrder.quantity,
      sizes: backendOrder.size,
      image: backendOrder.productImage || null,
      date: backendOrder.orderedAt ? new Date(backendOrder.orderedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      createdAt: backendOrder.orderedAt || backendOrder.createdAt,
      items: items,
      customerName: backendOrder.customerName,
      customerEmail: backendOrder.customerEmail,
      customerPhone: backendOrder.customerPhone,
      address: backendOrder.address,
      company: backendOrder.customer?.company || '',
      fulfillment: backendOrder.fulfillment || {
        method: backendOrder.receivingMode === 'Pick-up' ? 'pickup' : 'delivery',
        deliveryAddress: backendOrder.address
      },
      designDetails: backendOrder.designDetails,
      expectedDelivery: backendOrder.expectedDelivery ? new Date(backendOrder.expectedDelivery).toLocaleDateString() : null,
      statusHistory: backendOrder.statusHistory
    }
  }

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    cancelOrder,
    submitOrder
  }
}