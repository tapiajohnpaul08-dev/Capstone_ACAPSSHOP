<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 scale-90 translate-y-2"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="visible"
            class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
          >
            <!-- Top accent bar -->
            <div class="h-1 w-full" :class="accentBarClass"></div>

            <!-- Content -->
            <div class="flex flex-col items-center text-center px-8 pt-7 pb-6 gap-3">

              <!-- Icon -->
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                :class="iconBgClass"
              >
                <!-- Warning (default) -->
                <svg v-if="type === 'warning'" class="w-6 h-6" :class="iconColorClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <!-- Danger / Delete -->
                <svg v-else-if="type === 'danger'" class="w-6 h-6" :class="iconColorClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                <!-- Info -->
                <svg v-else-if="type === 'info'" class="w-6 h-6" :class="iconColorClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <!-- Success -->
                <svg v-else-if="type === 'success'" class="w-6 h-6" :class="iconColorClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <!-- Title -->
              <p class="text-base font-semibold text-gray-900 leading-snug m-0">{{ title }}</p>

              <!-- Message -->
              <p class="text-sm text-gray-500 leading-relaxed m-0">{{ message }}</p>

            </div>

            <!-- Divider -->
            <div class="h-px bg-gray-100 mx-0"></div>

            <!-- Action Buttons -->
            <div class="flex">
              <!-- Close / Cancel -->
              <button
                @click="handleClose"
                :disabled="isLoading"
                class="flex-1 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ closeLabel }}
              </button>

              <!-- Vertical divider -->
              <div class="w-px bg-gray-100"></div>

              <!-- Confirm -->
              <button
                @click="handleConfirm"
                :disabled="isLoading"
                class="flex-1 py-3.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :class="confirmBtnClass"
              >
                <span
                  v-if="isLoading"
                  class="inline-block w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                  :class="spinnerClass"
                ></span>
                {{ isLoading ? confirmLoadingLabel : confirmLabel }}
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'ConfirmationModal',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Are you sure?'
    },
    message: {
      type: String,
      default: 'This action cannot be undone.'
    },
    type: {
      type: String,
      default: 'warning', // 'warning' | 'danger' | 'info' | 'success'
      validator: val => ['warning', 'danger', 'info', 'success'].includes(val)
    },
    closeLabel: {
      type: String,
      default: 'Cancel'
    },
    confirmLabel: {
      type: String,
      default: 'Confirm'
    },
    confirmLoadingLabel: {
      type: String,
      default: 'Processing...'
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:visible', 'confirm', 'close'],

  computed: {
    accentBarClass() {
      return {
        warning: 'bg-yellow-400',
        danger:  'bg-red-500',
        info:    'bg-blue-500',
        success: 'bg-green-500'
      }[this.type]
    },
    iconBgClass() {
      return {
        warning: 'bg-yellow-100',
        danger:  'bg-red-100',
        info:    'bg-blue-100',
        success: 'bg-green-100'
      }[this.type]
    },
    iconColorClass() {
      return {
        warning: 'text-yellow-600',
        danger:  'text-red-600',
        info:    'text-blue-600',
        success: 'text-green-600'
      }[this.type]
    },
    confirmBtnClass() {
      return {
        warning: 'text-yellow-600 hover:bg-yellow-50',
        danger:  'text-red-600 hover:bg-red-50',
        info:    'text-blue-600 hover:bg-blue-50',
        success: 'text-green-600 hover:bg-green-50'
      }[this.type]
    },
    spinnerClass() {
      return {
        warning: 'border-yellow-600',
        danger:  'border-red-600',
        info:    'border-blue-600',
        success: 'border-green-600'
      }[this.type]
    }
  },

  methods: {
    handleClose() {
      if (this.isLoading) return
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.7s linear infinite;
}
</style>