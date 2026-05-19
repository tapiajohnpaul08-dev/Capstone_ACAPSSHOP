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
        @click.self="close"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 scale-90 translate-y-2"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="visible"
            class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden flex flex-col items-center text-center px-8 pt-8 pb-7 gap-3"
            :class="status === 'success' ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'"
          >

            <!-- Auto-close progress bar -->
            <div class="absolute bottom-0 left-0 w-full h-[3px] bg-gray-100">
              <div
                class="h-full origin-left"
                :class="status === 'success' ? 'bg-green-500' : 'bg-red-500'"
                :style="{ animation: `shrink ${duration}ms linear forwards` }"
              ></div>
            </div>

            <!-- Close button -->
            <button
              @click="close"
              class="absolute top-3 right-3 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Icon -->
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              :class="status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            >
              <svg v-if="status === 'success'" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <!-- Status badge -->
            <span
              class="text-xs font-semibold px-3 py-0.5 rounded-full"
              :class="status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ status === 'success' ? 'Successful' : 'Unsuccessful' }}
            </span>

            <!-- Title -->
            <p class="text-base font-semibold text-gray-900 leading-snug m-0">{{ title }}</p>

            <!-- Message -->
            <p class="text-sm text-gray-500 leading-relaxed m-0">{{ message }}</p>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'FeedbackModal',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Notification'
    },
    status: {
      type: String,
      default: 'success',
      validator: val => ['success', 'error'].includes(val)
    },
    message: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 2000
    }
  },

  emits: ['update:visible', 'closed'],

  data() {
    return {
      autoCloseTimer: null
    }
  },

  watch: {
    visible(val) {
      if (val) this.startAutoClose()
      else this.clearTimer()
    }
  },

  methods: {
    startAutoClose() {
      this.clearTimer()
      this.autoCloseTimer = setTimeout(() => this.close(), this.duration)
    },
    clearTimer() {
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer)
        this.autoCloseTimer = null
      }
    },
    close() {
      this.clearTimer()
      this.$emit('update:visible', false)
      this.$emit('closed')
    }
  },

  beforeUnmount() {
    this.clearTimer()
  }
}
</script>

<style scoped>
@keyframes shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
</style>