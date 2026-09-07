<!-- src/components/create-order/PaymentMethodCard.vue -->
<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6 pb-4 border-b">
      <h4 class="font-semibold text-gray-900">Payment Method</h4>
      <p class="text-xs text-gray-500 mt-0.5">Select how you'd like to pay for your order</p>
    </div>
    <div class="px-6 py-5 space-y-4">

      <!-- Payment Options -->
      <div class="grid gap-3">
        <!-- COD Option -->
        <div
          @click="selectMethod('cod')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="modelValue.method === 'cod'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.method === 'cod' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.method === 'cod'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="text-sm font-semibold text-gray-800">Cash on Delivery (COD)</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Pay when you receive your order</p>
              <div class="mt-2 text-xs text-gray-400">
                <span class="font-medium">Note:</span> Orders will be processed after design approval. Payment upon delivery.
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Transfer / Online Banking Option -->
        <!-- <div
          @click="selectMethod('bank_transfer')"
          class="p-4 rounded-lg border-2 cursor-pointer transition-all"
          :class="modelValue.method === 'bank_transfer'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start gap-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
              :class="modelValue.method === 'bank_transfer' ? 'border-blue-600' : 'border-gray-300'">
              <div v-if="modelValue.method === 'bank_transfer'" class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <path d="M22 10h-6M2 10h6"/>
                  <circle cx="12" cy="14" r="1"/>
                </svg>
                <span class="text-sm font-semibold text-gray-800">Online Banking / Bank Transfer</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Pay via bank transfer before production</p>
            </div>
          </div>
        </div> -->
      </div>

      <!-- Bank Selection (only when bank transfer selected) -->
      <div v-if="modelValue.method === 'bank_transfer'" class="space-y-4 pt-2 animate-slide-down">
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-xs font-semibold text-blue-800 mb-2">Our Bank Accounts</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">BPI</p>
                <p class="text-xs text-gray-600">Account: 1234-5678-90</p>
                <p class="text-xs text-gray-600">Name: ACAPSHOP Printing Services</p>
              </div>
              <button @click="copyAccountNumber('1234-5678-90')" class="text-xs text-blue-600 hover:text-blue-700">Copy</button>
            </div>
            <div class="border-t border-blue-200 pt-2">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-medium">BDO</p>
                  <p class="text-xs text-gray-600">Account: 9876-5432-10</p>
                  <p class="text-xs text-gray-600">Name: ACAPSHOP Printing Services</p>
                </div>
                <button @click="copyAccountNumber('9876-5432-10')" class="text-xs text-blue-600 hover:text-blue-700">Copy</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Select Bank</label>
          <select v-model="modelValue.bankName" class="field">
            <option value="">Select bank...</option>
            <option value="BPI">BPI</option>
            <option value="BDO">BDO</option>
          </select>
        </div>

        <div class="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
          <strong>Note:</strong> Orders with bank transfer will be processed after payment confirmation. Our team will contact you within 24 hours.
        </div>
      </div>

      <!-- Summary for COD -->
      <div v-if="modelValue.method === 'cod'" class="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>Total Amount to Pay:</strong> ₱{{ totalAmount.toLocaleString() }}
      </div>

      <!-- 50% Downpayment QR (shown for every order, regardless of payment method) -->
      <div class="p-4 rounded-lg border-2 border-blue-200 bg-blue-50/60 space-y-4">
        <div>
          <p class="text-sm font-semibold text-gray-900">50% Downpayment Required</p>
          <p class="text-xs text-gray-500 mt-0.5">Scan the QR code to pay your downpayment. The remaining balance is due on {{ modelValue.method === 'cod' ? 'delivery' : 'production completion' }}.</p>
        </div>

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div class="flex flex-col items-center">
            <div class="shrink-0 bg-white p-2 rounded-lg border">
              <img :src="downpaymentQrSrc" alt="Downpayment QR code" class="w-36 h-36 object-contain" @error="handleQrError" />
            </div>
            <h2 class="text-lg font-bold text-blue-600 mt-2">JU*****T J* H.</h2>
            <p class="text-xs text-gray-500">0970 940 6573</p>
          </div>
          <div class="flex-1 w-full space-y-3">
            <div class="text-sm text-gray-700 bg-white rounded-lg border px-3 py-2 flex items-center justify-between">
              <span class="text-xs text-gray-500">Downpayment amount (50%)</span>
              <span class="font-bold text-blue-600">₱{{ downpaymentAmount.toLocaleString() }}</span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">Reference Number</label>
              <input v-model="modelValue.referenceNumber" type="text" placeholder="Enter GCash/bank reference number after paying" class="field" />
              <p class="text-xs text-gray-400 mt-1">Your Order will be confirmed once we confirm your payment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QRCodeImage from '@/assets/images/QR_CODE.png'
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      method: 'cod',
      bankName: '',
      referenceNumber: '',
      paymentStatus: 'pending'
    })
  },
  totalAmount: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])


const downpaymentQrSrc = computed(() => QRCodeImage)

const downpaymentAmount = computed(() => Math.round((props.totalAmount || 0) * 0.5))

function handleQrError(event) {
  event.target.src = 'https://via.placeholder.com/300x300?text=QR+Code'
}

function selectMethod(method) {
  emit('update:modelValue', {
    ...props.modelValue,
    method: method,
    bankName: method === 'cod' ? '' : props.modelValue.bankName
  })
}

function copyAccountNumber(accountNumber) {
  navigator.clipboard.writeText(accountNumber)
  alert('Account number copied to clipboard!')
}
</script>

<style scoped>
.field {
  @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500;
}
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>