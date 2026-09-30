<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <TransitionGroup name="msg-toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
          @click="openConversation(t)"
        >
          <div class="flex items-start gap-3 p-3">
            <!-- Avatar -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              :style="{ background: getAvatarColor(t.senderName) }"
            >
              {{ (t.senderName || '?')[0].toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-bold text-gray-900 truncate">{{ t.senderName }}</p>
                <span class="text-[10px] text-gray-400 flex-shrink-0">
                  {{ formatRelative(t.createdAt) }}
                </span>
              </div>
              <p class="text-xs text-gray-600 mt-0.5 preview-clamp leading-snug">
                {{ t.preview || 'New message' }}
              </p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-[10px] font-semibold text-blue-600">Open conversation →</span>
                <button
                  @click.stop="dismiss(t.id)"
                  class="text-[10px] text-gray-400 hover:text-gray-600 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              @click.stop="dismiss(t.id)"
              class="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <!-- Auto-dismiss progress bar -->
          <div class="h-0.5 bg-blue-500/30">
            <div class="h-full bg-blue-500 animate-toast-progress"></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useMessageNotifications } from '@/composables/useMessageNotifications'

const router = useRouter()
const { toasts, dismiss } = useMessageNotifications()

const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#d97706',
  '#059669', '#0891b2', '#4f46e5', '#c026d3', '#65a30d',
]
function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatRelative(dateValue) {
  if (!dateValue) return ''
  const diff = Date.now() - new Date(dateValue).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return 'today'
}

function openConversation(t) {
  dismiss(t.id)
  router.push({
    path: '/customer/messages',
    query: { conv: t.conversationId },
  })
}
</script>

<style scoped>
.msg-toast-enter-active,
.msg-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.msg-toast-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
.msg-toast-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

@keyframes toast-progress {
  from { width: 100%; }
  to   { width: 0%; }
}
.animate-toast-progress {
  animation: toast-progress 6s linear forwards;
}

/* Two-line preview clamp — plugin-free fallback */
.preview-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>