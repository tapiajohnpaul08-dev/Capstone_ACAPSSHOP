<!-- src/components/create-order/PaymentMethodCard.vue -->
<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <div class="flex items-center gap-2">
        <MessageSquare class="w-4 h-4 text-blue-600" />
        <h4 class="font-semibold text-gray-900">Finalize Your Order</h4>
      </div>
      <p class="text-xs text-gray-500 mt-0.5">
        Payment and final pricing are handled in chat with our team.
      </p>
    </div>

    <div class="px-6 py-5 space-y-5">
      <!-- Steps overview -->
      <div class="space-y-3">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="flex items-start gap-3"
        >
          <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            :class="step.active
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-600 border border-blue-200'">
            {{ idx + 1 }}
          </div>
          <div class="flex-1 pt-0.5">
            <p class="text-sm font-semibold text-gray-800">{{ step.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5 leading-snug">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <!-- Info banner -->
      <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div class="flex items-start gap-3">
          <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div class="text-xs text-blue-800 space-y-1">
            <p class="font-semibold">Why chat?</p>
            <p class="leading-snug">
              We confirm the final price with you before any payment — so you can
              adjust quantity, design, or delivery details without surprises.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <button
        type="button"
        @click="$emit('open-messages')"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-colors"
      >
        <MessageSquare class="w-4 h-4" />
        Preview Messages Page
      </button>

      <p class="text-[11px] text-gray-400 text-center leading-snug">
        After you submit, our admin will reach out in Messages to finalize the
        details and send payment instructions.
      </p>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare, Info } from 'lucide-vue-next'

defineProps({
  // Kept for API compatibility with the parent — no longer used for state
  modelValue: { type: Object, default: () => ({}) },
  totalAmount: { type: Number, default: 0 },
  payableAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  hasDesign: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'open-messages'])

const steps = [
  {
    title: 'You submit this order',
    description: 'We save the items, sizes, quantity, and design you configured.',
    active: true,
  },
  {
    title: 'We review & discuss',
    description: 'Our admin confirms pricing and any adjustments with you in chat.',
    active: false,
  },
  {
    title: 'You receive payment details',
    description: 'We send GCash or bank info through the chat once everything is agreed.',
    active: false,
  },
  {
    title: 'You upload proof',
    description: 'Submit your receipt and your order is officially confirmed.',
    active: false,
  },
]
</script>