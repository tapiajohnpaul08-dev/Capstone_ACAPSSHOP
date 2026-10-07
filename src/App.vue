<template>
  <router-view />
  <MessageToast />
  <FeedbackModal
    v-model:visible="feedbackVisible"
    :title="feedbackTitle"
    :status="feedbackStatus"
    :message="feedbackMessage"
    :duration="feedbackDuration"
  />
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'
import { useFeedback } from '@/utils/useFeedback'
import { useSocket } from '@/composables/useSocket'
import MessageToast from '@/components/notifications/MessageToast.vue'
import { useMessageNotifications } from '@/composables/useMessageNotifications'

export default {
  components: { FeedbackModal, MessageToast },

  setup() {
    const socket = useSocket()
    const { notify, resetTabCounter } = useMessageNotifications()

    // ── Toast handlers ────────────────────────────────────────────
    function handleVisibilityChange() {
      if (!document.hidden) resetTabCounter()
    }

    // ── Global new-message handler ────────────────────────────────
    // Runs from App.vue so the notification fires on EVERY page,
    // not just when MessagesPage is mounted.
    function handleGlobalNewMessage(message) {
      if (!message) return
      if (message.senderType !== 'admin') return

      // Suppress the toast if the customer is currently looking at
      // that exact conversation. MessagesPage mirrors its active
      // conversation id onto window.__activeConversationId.
      if (window.__activeConversationId === message.conversationId) return

      notify({
        conversationId: message.conversationId,
        senderName: 'ACAPSHOP Support',
        content: message.content || '',
        attachments: Array.isArray(message.attachments) ? message.attachments.length : 0,
        createdAt: message.createdAt || new Date().toISOString(),
      })
    }


    // Guard so App.vue attaches its global handler exactly ONCE per
    // app lifetime. Never call socket.off() here — that would remove
    // other components' (e.g. MessagesPage's) listeners too.
    let messageListenerAttached = false
    const attachMessageListener = () => {
      if (messageListenerAttached) return
      socket.onNewMessage(handleGlobalNewMessage)
      messageListenerAttached = true
      console.log('🔔 [App.vue] new-message listener attached')
    }

    // ✅ NEW — Attach order + product realtime listeners on every
    // connect. Previously these lived inside onMounted, which meant
    // that logging in WITHOUT a page refresh left them unattached.
    let catalogListenersAttached = false
    const attachCatalogListeners = () => {
      if (catalogListenersAttached) return
      catalogListenersAttached = true

      socket.onOrderChanged((data) => {
        console.log('📡 [customer] realtime order:changed', data)
        window.dispatchEvent(
          new CustomEvent('realtime:order-changed', { detail: data }),
        )
      })

      socket.onProductChanged((data) => {
        console.log('📦 [customer] realtime product:changed', data)
        window.dispatchEvent(
          new CustomEvent('realtime:product-changed', { detail: data }),
        )
      })

      console.log('📦 [App.vue] order + product listeners attached')
    }

    // ── Connect the shared customer socket if a token exists ─────
    const tryConnect = () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('token')
      if (!token) return

      let userId = null
      try {
        const stored = JSON.parse(localStorage.getItem('currentUser') || '{}')
        userId = stored.customerId || stored._id || stored.id || null
      } catch {}

      console.log('🔌 [App.vue] connecting customer socket', {
        hasToken: !!token,
        userId,
      })

      socket.connect(token, userId, 'customer')

      // ✅ CRITICAL — attach listeners AFTER connect(), so they bind
      // to the freshly-created socket instance. Attaching before connect
      // (when socketInstance was null) silently no-ops.
      attachMessageListener()
      attachCatalogListeners()   // ← ADD THIS LINE
    }

    // ── Lifecycle ────────────────────────────────────────────────
    onMounted(() => {
      tryConnect()   // ← now also attaches the order + product listeners

      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    // ── Reconnect on login / disconnect on logout ────────────────
    // Monkey-patch localStorage so a fresh login (which writes the
    // token AFTER App.vue has already mounted) still triggers a
    // connect + listener-attach.
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