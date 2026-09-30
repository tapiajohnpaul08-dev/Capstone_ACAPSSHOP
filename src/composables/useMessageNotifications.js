// src/composables/useMessageNotifications.js  (CUSTOMER)
import { ref, computed } from 'vue'

// ── Module-level singleton state ────────────────────────────────────
const toasts           = ref([])
const enabled          = ref(true)   // sound toggle
const unreadSinceFocus = ref(0)      // count of new messages while tab is hidden

let toastIdCounter    = 0
let lastToastAt       = 0
const MIN_TOAST_INTERVAL = 3000      // max 1 toast per 3 seconds
const MAX_TOASTS         = 3         // cap the stack
const TOAST_DURATION     = 6000      // auto-dismiss in 6s

let flashInterval = null
let flashState    = false
let originalTitle = 'ACAPSHOP'

// ── Load persisted sound preference once ───────────────────────────
try {
  const saved = localStorage.getItem('messageSoundEnabled')
  if (saved === 'false') enabled.value = false
} catch {}

// ── Sound — Web Audio API (no asset file needed) ────────────────────
// Browsers block AudioContext until the user has interacted with the
// page. We create it once at module load and resume it on the first
// user gesture. After that, beeps play freely.
let audioCtx = null

function playBeep() {
  if (!enabled.value) return

  // Only play if we already have a running context. The context is
  // created by createOnGesture() below on the user's first real
  // click/tap/keypress — which is the ONLY way Chrome lets us start
  // playback without a warning.
  if (!audioCtx || audioCtx.state !== 'running') return

  try {
    const ctx = audioCtx
    const now = ctx.currentTime
    const tones = [
      { freq: 880,  start: 0,    dur: 0.08 },
      { freq: 1320, start: 0.09, dur: 0.10 },
    ]
    tones.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.12, now + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    })
  } catch (e) {
    console.warn('Sound playback failed:', e)
  }
}

// Create the AudioContext on the FIRST user gesture. Chrome only
// permits a *running* AudioContext to be started inside a real gesture
// handler, so we wait for one before calling `new AudioContext()`.
// Deferring creation avoids the "AudioContext was not allowed to start"
// warning entirely (previous attempt created it eagerly, which Chrome
// flags as suspicious).
if (typeof window !== 'undefined') {
  const createOnGesture = () => {
    // Already created and running — detach listeners and bail.
    if (audioCtx && audioCtx.state === 'running') {
      window.removeEventListener('click', createOnGesture)
      window.removeEventListener('keydown', createOnGesture)
      window.removeEventListener('touchstart', createOnGesture)
      return
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      audioCtx = new AudioCtx()
      // Some browsers still hand us a suspended context even on a
      // gesture — resume it once.
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {})
      }
      console.log('🔊 [useMessageNotifications] AudioContext ready')
    } catch (e) {
      console.warn('AudioContext init failed:', e)
      audioCtx = null
    }
  }

  window.addEventListener('click',      createOnGesture, { passive: true })
  window.addEventListener('keydown',    createOnGesture, { passive: true })
  window.addEventListener('touchstart', createOnGesture, { passive: true })
}
// ── Tab title flash ─────────────────────────────────────────────────
function startTitleFlash() {
  if (flashInterval) return
  originalTitle = document.title.replace(/^\(\d+\)\s*/, '') || 'ACAPSHOP'
  flashInterval = setInterval(() => {
    const n = unreadSinceFocus.value
    if (n === 0) { stopTitleFlash(); return }
    flashState = !flashState
    document.title = flashState
      ? `(${n}) New message — ACAPSHOP`
      : `New message — ACAPSHOP`
  }, 1500)
  document.title = `(${unreadSinceFocus.value}) New message — ACAPSHOP`
}

function stopTitleFlash() {
  if (flashInterval) { clearInterval(flashInterval); flashInterval = null }
  flashState = false
  unreadSinceFocus.value = 0
  document.title = originalTitle || 'ACAPSHOP'
}

// ── Composable ──────────────────────────────────────────────────────
export function useMessageNotifications() {
  const soundEnabled = computed({
    get: () => enabled.value,
    set: (v) => {
      enabled.value = !!v
      try {
        localStorage.setItem('messageSoundEnabled', enabled.value ? 'true' : 'false')
      } catch {}
    },
  })

  /**
   * Push a new message notification.
   * Returns the toast id, or null if suppressed by the rate limiter.
   */
  function notify({ conversationId, senderName, content, attachments = 0, createdAt }) {
    // Always bump the unread counter (drives tab title)
    unreadSinceFocus.value++
    if (typeof document !== 'undefined' && document.hidden) startTitleFlash()

    // Rate-limit toasts — at most 1 per 3s. Extra messages still
    // increment the tab title & sidebar badge, just no toast.
    const now = Date.now()
    if (now - lastToastAt < MIN_TOAST_INTERVAL) return null
    lastToastAt = now

    // Build preview
    let preview = (content || '').trim()
    if (!preview && attachments > 0) {
      preview = `📎 ${attachments} attachment${attachments > 1 ? 's' : ''}`
    }
    if (preview.length > 90) preview = preview.slice(0, 87) + '…'

    const toast = {
      id: ++toastIdCounter,
      conversationId,
      senderName: senderName || 'ACAPSHOP Support',
      preview,
      createdAt: createdAt || new Date().toISOString(),
    }

    if (toasts.value.length >= MAX_TOASTS) toasts.value.shift()
    toasts.value.push(toast)

    setTimeout(() => dismiss(toast.id), TOAST_DURATION)
    playBeep()
    return toast.id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function dismissAll() {
    toasts.value = []
  }

  function clearUnreadForConversation(conversationId) {
    toasts.value = toasts.value.filter((t) => t.conversationId !== conversationId)
  }

  function resetTabCounter() {
    stopTitleFlash()
  }

  return {
    toasts,
    soundEnabled,
    notify,
    dismiss,
    dismissAll,
    clearUnreadForConversation,
    resetTabCounter,
  }
}