<template>
  <div
    class="bg-white rounded-xl border cursor-pointer hover:shadow-lg transition-shadow"
    :class="{ 'opacity-60': !product.inStock }"
    @click="$emit('click', product)"
  >
    <div class="p-4">
      <!-- Product Image -->
      <div class="relative mb-3">
        <img :src="product.image" :alt="product.name" class="w-full h-40 object-cover rounded-lg" />

        <!-- Badges (Top Left) -->
        <div class="absolute top-2 left-2 flex flex-col gap-1">
          <span
            v-if="product.featured"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-600 text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-3 w-3 mr-1"
            >
              <path
                d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
              />
            </svg>
            Featured
          </span>
          <span
            v-if="product.popular"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-600 text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-3 w-3 mr-1"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Popular
          </span>
        </div>

        <!-- Status Badge (Top Right) -->
        <div class="absolute top-2 right-2">
          <span
            class="px-2 py-0.5 rounded-md text-xs font-medium"
            :class="product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ product.inStock ? 'Available' : 'Out of Stock' }}
          </span>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="font-semibold text-sm line-clamp-2">
          {{ product.name }} - {{ selectedSize?.name || product.sizes[0]?.name }}
        </h3>

        <!-- Size Selector -->
        <select v-model="selectedSize" class="text-xs border rounded px-2 py-1 w-full">
          <option v-for="size in product.sizes" :key="size.name" :value="size">
            {{ size.name }}
          </option>
        </select>

        <!-- Quantity Selector -->
        <select v-model="selectedQuantity" class="text-xs border rounded px-2 py-1 w-full">
          <option value="500">
            500 pcs - ₱{{ selectedSize?.bulkPrices[500].toLocaleString() }}
          </option>
          <option value="1000">
            1000 pcs - ₱{{ selectedSize?.bulkPrices[1000].toLocaleString() }}
          </option>
          <option value="2000">
            2000 pcs - ₱{{ selectedSize?.bulkPrices[2000].toLocaleString() }}
          </option>
          <option value="5000">
            5000 pcs - ₱{{ selectedSize?.bulkPrices[5000].toLocaleString() }}
          </option>
        </select>

        <div class="font-semibold text-blue-600">
          ₱{{ (selectedSize?.bulkPrices[selectedQuantity] || 0).toLocaleString() }}
        </div>
        <div class="text-xs text-gray-500">
          ₱{{ (selectedSize?.bulkPrices[selectedQuantity] / selectedQuantity || 0).toFixed(2) }}/pc
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

function formatPrice(price) {
  if (price.min === 0 && price.max === 0) {
    return 'Contact for price'
  }
  if (price.min === price.max) {
    return `₱${price.min.toLocaleString()}`
  }
  return `₱${price.min.toLocaleString()} - ₱${price.max.toLocaleString()}`
}
</script>
