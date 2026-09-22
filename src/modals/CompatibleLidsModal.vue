<!-- src/components/customer/CompatibleLidsModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="onSkip"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="onSkip" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" class="text-blue-600">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900">Add compatible lids?</h3>
              <p class="text-xs text-gray-500 mt-0.5 leading-snug">
                These lids fit your <strong>{{ cupSize.name }}</strong>
                {{ cupName }}
                <span v-if="cupSize.rimDiameter">({{ cupSize.rimDiameter }}mm rim)</span>.
              </p>
            </div>
            <button @click="onSkip" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            <div
              v-for="lid in compatibleLids"
              :key="lid.id"
              class="border-2 rounded-xl p-3 transition-all"
              :class="selections[lid.id]?.selected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'"
            >
              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  :checked="selections[lid.id]?.selected"
                  @change="toggleLid(lid)"
                  class="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800">{{ lid.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {{ lid.matchingSizes[0].name }}
                    · ₱{{ Number(lid.matchingSizes[0].price).toFixed(2) }}/pc
                  </p>
                </div>
              </label>

              <!-- Quantity — only when selected -->
              <div v-if="selections[lid.id]?.selected" class="mt-2.5 flex items-center gap-2 pl-7">
                <button
                  type="button"
                  @click="adjustQty(lid, -100)"
                  :disabled="selections[lid.id].quantity <= (lid.minOrder || 500)"
                  class="w-8 h-8 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >−</button>
                <input
                  v-model.number="selections[lid.id].quantity"
                  type="number"
                  :min="lid.minOrder || 500"
                  :step="100"
                  class="w-24 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  @click="adjustQty(lid, 100)"
                  class="w-8 h-8 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 shrink-0"
                >+</button>
                <span class="text-xs font-semibold text-gray-600 ml-auto">
                  ₱{{ (selections[lid.id].quantity * lid.matchingSizes[0].price).toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- No lids edge case (shouldn't happen; guarded by parent) -->
            <div v-if="compatibleLids.length === 0" class="py-8 text-center text-sm text-gray-500">
              No compatible lids found.
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 space-y-3">
            <div v-if="selectedCount > 0" class="flex items-center justify-between text-sm">
              <span class="text-gray-500">
                {{ selectedCount }} lid{{ selectedCount !== 1 ? 's' : '' }} selected
              </span>
              <span class="font-bold text-blue-600">
                + ₱{{ totalAdditional.toLocaleString() }}
              </span>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="onSkip"
                class="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No thanks
              </button>
              <button
                type="button"
                @click="onConfirm"
                :disabled="selectedCount === 0"
                class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add {{ selectedCount || '' }} lid{{ selectedCount !== 1 ? 's' : '' }}
              </button>
            </div>

            <p class="text-[11px] text-gray-400 text-center leading-snug">
              Lids are added as separate lines — you can remove them anytime in the cart.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show:            { type: Boolean, default: false },
  cupName:         { type: String,  required: true },
  // The currently-selected cup size { name, rimDiameter, price, stock, ... }
  cupSize:         { type: Object,  default: () => ({}) },
  cupQuantity:     { type: Number,  default: 500 },
  // Each entry is a lid product with a `matchingSizes` array
  // containing only the size(s) that match the cup's rim.
  compatibleLids:  { type: Array,   default: () => [] },
})

const emit = defineEmits(['confirm', 'skip'])

// selections: { [lidId]: { selected: boolean, quantity: number } }
const selections = ref({})

// Rebuild selections every time the compatible list changes.
// Default state: unselected, quantity = max(lid.minOrder, cupQuantity)
watch(
  () => props.compatibleLids,
  (lids) => {
    const next = {}
    for (const lid of lids) {
      next[lid.id] = {
        selected: false,
        quantity: Math.max(lid.minOrder || 500, props.cupQuantity || 500),
      }
    }
    selections.value = next
  },
  { immediate: true },
)

// Reset selections when the modal is reopened
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      const next = {}
      for (const lid of props.compatibleLids) {
        next[lid.id] = {
          selected: false,
          quantity: Math.max(lid.minOrder || 500, props.cupQuantity || 500),
        }
      }
      selections.value = next
    }
  },
)

function toggleLid(lid) {
  if (!selections.value[lid.id]) return
  selections.value[lid.id].selected = !selections.value[lid.id].selected
}

function adjustQty(lid, delta) {
  const s = selections.value[lid.id]
  if (!s) return
  const min = lid.minOrder || 500
  s.quantity = Math.max(min, (s.quantity || 0) + delta)
}

const selectedCount = computed(() =>
  Object.values(selections.value).filter((s) => s.selected).length,
)

const totalAdditional = computed(() => {
  let total = 0
  for (const lid of props.compatibleLids) {
    const s = selections.value[lid.id]
    if (s?.selected) {
      total += (s.quantity || 0) * (lid.matchingSizes[0]?.price || 0)
    }
  }
  return total
})

function onConfirm() {
  const result = props.compatibleLids
    .filter((lid) => selections.value[lid.id]?.selected)
    .map((lid) => {
      const sizeObj = lid.matchingSizes[0]
      const qty = selections.value[lid.id].quantity
      return {
        productId:   lid.id,
        productName: lid.name,
        productImage: lid.image,
        category:    lid.category,
        sizeName:    sizeObj.name,
        rimDiameter: sizeObj.rimDiameter,
        quantity:    qty,
        unitPrice:   sizeObj.price,
        lineTotal:   qty * sizeObj.price,
        itemType:    'lid',
      }
    })
  emit('confirm', result)
}

function onSkip() {
  emit('skip')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }

.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>