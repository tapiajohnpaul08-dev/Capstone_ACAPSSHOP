<template>
  <div class="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Product Image -->
      <div class="flex-shrink-0">
        <img 
          :src="item.image" 
          :alt="item.name" 
          class="w-24 h-24 object-cover rounded-lg"
        />
      </div>

      <!-- Product Info -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ item.category }}</p>
            <p class="text-sm text-gray-600 mt-1">Size: {{ item.size }}</p>
          </div>
          <div class="text-right">
            <div class="font-bold text-blue-600">{{ formatPrice(item.price) }}</div>
            <div class="text-xs text-gray-500 mt-1">per piece</div>
          </div>
        </div>

        <!-- Quantity and Actions -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-2">
            <button 
              @click="decreaseQuantity"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              :disabled="item.quantity <= 1"
            >
              <Minus class="h-4 w-4 text-gray-600" />
            </button>
            <span class="w-12 text-center font-medium">{{ item.quantity }}</span>
            <button 
              @click="increaseQuantity"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus class="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          <button 
            @click="removeItem"
            class="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
          >
            <Trash2 class="h-4 w-4" />
            Remove
          </button>
        </div>

        <!-- Item Total -->
        <div class="mt-3 pt-3 border-t text-right">
          <span class="text-sm text-gray-600">Item Total: </span>
          <span class="font-semibold text-gray-900">{{ formatPrice(item.price * item.quantity) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Minus, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-quantity', 'remove'])

function formatPrice(price) {
  return `₱${price.toLocaleString()}`
}

function increaseQuantity() {
  emit('update-quantity', props.item.id, props.item.quantity + 1)
}

function decreaseQuantity() {
  if (props.item.quantity > 1) {
    emit('update-quantity', props.item.id, props.item.quantity - 1)
  }
}

function removeItem() {
  emit('remove', props.item.id)
}
</script>