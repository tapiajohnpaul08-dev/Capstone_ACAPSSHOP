<!-- src/modals/SimpleModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="closeOnBackdrop ? close() : null"
      ></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-modal">
        <!-- Icon -->
        <div v-if="icon" class="flex justify-center mb-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="iconBgClass">
            <component :is="iconComponent" class="w-6 h-6" />
          </div>
        </div>

        <!-- Title -->
        <h3 v-if="title" class="text-lg font-semibold text-gray-900 text-center mb-2">
          {{ title }}
        </h3>

        <!-- Message -->
        <p v-if="message" class="text-sm text-gray-600 text-center mb-6">
          {{ message }}
        </p>

        <!-- Input (optional) -->
        <div v-if="showInput" class="mb-4">
          <input
            ref="inputRef"
            :value="inputValue"
            @input="$emit('update:inputValue', $event.target.value)"
            :placeholder="inputPlaceholder"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keydown.enter="confirm"
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            v-if="showCancel"
            @click="close"
            class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {{ cancelLabel }}
          </button>
          <button
            @click="confirm"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="confirmButtonClass"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <Loader2 class="w-4 h-4 animate-spin" />
              {{ loadingLabel || confirmLabel }}
            </span>
            <span v-else>{{ confirmLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, watch, nextTick, ref } from 'vue'
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  Bell,
  PenSquare,
  Trash2,
  Save,
  X
} from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconType: {
    type: String,
    default: 'info',
    validator: (val) => ['info', 'success', 'warning', 'error'].includes(val)
  },
  confirmLabel: {
    type: String,
    default: 'OK'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  loadingLabel: {
    type: String,
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  showInput: {
    type: Boolean,
    default: false
  },
  inputPlaceholder: {
    type: String,
    default: 'Enter value...'
  },
  inputValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'update:inputValue', 'confirm', 'close'])

const inputRef = ref(null)

const iconComponent = computed(() => {
  const icons = {
    'info': Info,
    'success': CheckCircle,
    'warning': AlertTriangle,
    'error': XCircle
  }
  return icons[props.iconType] || Info
})

const iconBgClass = computed(() => {
  const classes = {
    'info': 'bg-blue-100 text-blue-600',
    'success': 'bg-green-100 text-green-600',
    'warning': 'bg-yellow-100 text-yellow-600',
    'error': 'bg-red-100 text-red-600'
  }
  return classes[props.iconType] || classes['info']
})

const confirmButtonClass = computed(() => {
  const classes = {
    'info': 'bg-blue-600 hover:bg-blue-700',
    'success': 'bg-green-600 hover:bg-green-700',
    'warning': 'bg-yellow-600 hover:bg-yellow-700',
    'error': 'bg-red-600 hover:bg-red-700'
  }
  return classes[props.iconType] || classes['info']
})

function close() {
  emit('update:visible', false)
  emit('close')
}

function confirm() {
  emit('confirm')
}

// Focus input when shown
watch(() => props.visible, (newVal) => {
  if (newVal && props.showInput) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal {
  animation: modalIn 0.2s ease-out;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.7s linear infinite;
}
</style>