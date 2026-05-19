<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <button @click="goBack" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Order History</h1>
      <p class="text-gray-600 mt-1">View all your completed and cancelled orders</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="historicOrders.length > 0" class="space-y-4">
      <div
        v-for="order in historicOrders"
        :key="order.id"
        class="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewOrderDetails(order)"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">{{ order.orderNumber }}</div>
            <div class="text-sm text-gray-600">{{ order.date }}</div>
            <div class="text-sm mt-1">{{ order.product }} — {{ order.quantity?.toLocaleString() }} pcs</div>
          </div>
          <div class="text-right">
            <span
              class="inline-flex px-2 py-1 rounded-md text-xs font-medium"
              :class="order.statusValue === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ order.status }}
            </span>
            <div class="font-bold text-blue-600 mt-1">₱{{ order.totalAmount?.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">No completed or cancelled orders yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders.js'

const router = useRouter()
const { orders, fetchOrders } = useOrders()
const isLoading = ref(true)

const historicOrders = computed(() =>
  orders.value.filter((o) => ['completed', 'cancelled'].includes(o.statusValue))
)

function goBack() { router.push('/customer/profile') }
function viewOrderDetails(order) { router.push(`/customer/orders/${order.id}`) }

onMounted(async () => {
  await fetchOrders()
  isLoading.value = false
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>