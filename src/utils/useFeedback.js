// composables/useFeedback.js
// Drop this composable anywhere to trigger the FeedbackModal easily.

import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
const status = ref('success')
const duration = ref(2000)

export function useFeedback() {
  function showFeedback({ title: t, message: m, status: s = 'success', duration: d = 2000 }) {
    title.value = t
    message.value = m
    status.value = s
    duration.value = d
    visible.value = true
  }

  function showSuccess(t, m, d = 2000) {
    showFeedback({ title: t, message: m, status: 'success', duration: d })
  }

  function showError(t, m, d = 2000) {
    showFeedback({ title: t, message: m, status: 'error', duration: d })
  }

  function closeFeedback() {
    visible.value = false
  }

  return {
    feedbackVisible: visible,
    feedbackTitle: title,
    feedbackMessage: message,
    feedbackStatus: status,
    feedbackDuration: duration,
    showFeedback,
    showSuccess,
    showError,
    closeFeedback
  }
}