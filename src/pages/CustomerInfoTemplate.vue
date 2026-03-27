<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button 
        @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4"
      >
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Customer Info Template</h1>
      <p class="text-gray-600 mt-1">Manage your default order information</p>
    </div>

    <div class="bg-white rounded-xl border">
      <form @submit.prevent="saveTemplate" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Delivery Address</label>
            <textarea
              v-model="template.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your default delivery address"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Delivery Method</label>
            <select
              v-model="template.deliveryMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pickup">Pick-up</option>
              <option value="standard">Standard Delivery</option>
              <option value="express">Express Delivery</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Payment Method</label>
            <select
              v-model="template.paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bank-transfer">Bank Transfer</option>
              <option value="gcash">GCash</option>
              <option value="paymaya">PayMaya</option>
              <option value="credit-card">Credit Card</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Print Size</label>
            <select
              v-model="template.printSize"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small (2x2 inches)</option>
              <option value="medium">Medium (3x3 inches)</option>
              <option value="large">Large (4x4 inches)</option>
              <option value="wrap">Wrap Around</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Placement</label>
            <select
              v-model="template.placement"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="front">Front Center</option>
              <option value="back">Back</option>
              <option value="side">Side Print</option>
              <option value="wrap">Wrap Around</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Quantity (pcs)</label>
            <input
              v-model.number="template.defaultQuantity"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Template
          </button>
          <button
            type="button"
            @click="goBack"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const template = ref({
  address: '',
  deliveryMethod: 'pickup',
  paymentMethod: 'bank-transfer',
  printSize: 'medium',
  placement: 'front',
  defaultQuantity: 100
})

onMounted(() => {
  // Load saved template from localStorage
  const saved = localStorage.getItem('customerInfoTemplate')
  if (saved) {
    template.value = JSON.parse(saved)
  }
})

function saveTemplate() {
  localStorage.setItem('customerInfoTemplate', JSON.stringify(template.value))
  alert('Customer info template saved successfully!')
  router.push('/customer/profile')
}

function goBack() {
  router.push('/customer/profile')
}
</script>