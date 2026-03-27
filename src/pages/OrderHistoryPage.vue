<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <button 
        @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4"
      >
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Order History</h1>
      <p class="text-gray-600 mt-1">View all your completed and cancelled orders</p>
    </div>

    <!-- Simple display without complex components -->
    <div v-if="orders.length > 0" class="space-y-4">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewOrderDetails(order)"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">{{ order.orderNumber }}</div>
            <div class="text-sm text-gray-600">{{ order.date }}</div>
            <div class="text-sm mt-1">{{ order.product }} - {{ order.quantity }} pcs</div>
          </div>
          <div class="text-right">
            <span 
              class="inline-flex px-2 py-1 rounded-md text-xs font-medium"
              :class="order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ order.status }}
            </span>
            <div class="font-bold text-blue-600 mt-1">₱{{ order.totalAmount.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">No order history found.</p>
      <button 
        @click="addSampleData"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Load Sample Orders
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const orders = ref([])

function goBack() {
  router.push('/customer/profile')
}

function addSampleData() {
  orders.value = [
    {
      id: 1020,
      orderNumber: 'Order #1020',
      date: 'February 28, 2024',
      status: 'Completed',
      product: 'Glass Coffee Mugs',
      quantity: 1000,
      size: '12oz',
      totalAmount: 520000,
      supplyType: 'Company Cups',
      deliveryMethod: 'Delivery'
    },
    {
      id: 1018,
      orderNumber: 'Order #1018',
      date: 'March 8, 2024',
      status: 'Cancelled',
      product: 'Stainless Steel Tumblers',
      quantity: 1500,
      size: '16oz, 20oz',
      totalAmount: 1020000,
      supplyType: 'Own Cups',
      deliveryMethod: 'Delivery'
    },
    {
      id: 1015,
      orderNumber: 'Order #1015',
      date: 'January 20, 2024',
      status: 'Completed',
      product: 'Travel Coffee Cups',
      quantity: 2000,
      size: '16oz',
      totalAmount: 1180000,
      supplyType: 'Company Cups',
      deliveryMethod: 'Pick-up'
    }
  ]
}

function viewOrderDetails(order) {
  router.push(`/customer/orders/${order.id}`)
}
</script>