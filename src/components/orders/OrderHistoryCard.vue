<!-- src/components/orders/OrderHistoryCard.vue -->
<template>
  <div class="bg-white rounded-xl border p-4">
    <!-- Simple content -->
    <div class="flex justify-between">
      <div>
        <div class="font-semibold">{{ order.orderNumber }}</div>
        <div class="text-sm text-gray-600">{{ order.date }}</div>
      </div>
      <span class="px-2 py-1 rounded-md text-xs font-medium" :class="statusClass">
        {{ order.status }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const statusClass = computed(() => {
  return props.order.status === 'Completed' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
})
</script>