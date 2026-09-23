<!-- src/App.vue -->
<template>
  <router-view />
  <FeedbackModal
    v-model:visible="feedbackVisible"
    :title="feedbackTitle"
    :status="feedbackStatus"
    :message="feedbackMessage"
    :duration="feedbackDuration"
  />
</template>

<script>
import { onMounted, watch } from 'vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'
import { useFeedback } from '@/utils/useFeedback'
import { useSocket } from '@/composables/useSocket'

export default {
  components: { FeedbackModal },
  setup() {
    const socket = useSocket()

    // ── Connect the shared customer socket if a token exists ────────
    const tryConnect = () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('token')
      if (token) {
        console.log('🔌 [App.vue] connecting customer socket')
        socket.connect(token)
      }
    }

    // ── Bridge: turn order:changed socket events into window events ─
    // Any page can then do:
    //   window.addEventListener('realtime:order-changed', handler)
    onMounted(() => {
      tryConnect()

      socket.onOrderChanged((data) => {
        console.log('📡 [customer] realtime order:changed', data)
        window.dispatchEvent(
          new CustomEvent('realtime:order-changed', { detail: data }),
        )
      })
    })

    // ── Reconnect after login, disconnect awareness after logout ────
    // Login pages set `customerToken` in localStorage; logouts remove it.
    // Monkey-patching lets us react without touching every login/logout
    // site individually.
    if (typeof window !== 'undefined') {
      const originalSet = localStorage.setItem.bind(localStorage)
      const originalRemove = localStorage.removeItem.bind(localStorage)

      localStorage.setItem = (key, value) => {
        originalSet(key, value)
        if (key === 'customerToken' || key === 'token') tryConnect()
      }
      localStorage.removeItem = (key) => {
        originalRemove(key)
        if (key === 'customerToken' || key === 'token') {
          // Token removed → tear down the socket so a fresh login
          // gets a fresh connection with the new identity.
          socket.disconnect()
        }
      }
    }

    // Watch localStorage from another tab (dev only — harmless in prod)
    window.addEventListener('storage', (e) => {
      if (e.key === 'customerToken' || e.key === 'token') {
        if (e.newValue) tryConnect()
        else socket.disconnect()
      }
    })

    return { ...useFeedback() }
  }
}
</script>