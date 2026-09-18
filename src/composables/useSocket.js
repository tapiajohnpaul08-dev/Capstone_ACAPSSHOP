// Customer Side
import { ref, onUnmounted, computed } from 'vue'
import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let socketInstance = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5

// The room we want to be in. Module-scoped so the deferred join survives
// across every `useSocket()` caller (MainLayout, MessagesPage, etc.).
let pendingJoinRoom = null

// ── Shared reactive state (module-scoped so every caller shares the same refs) ──
const isConnected = ref(false)
const isConnecting = ref(false)
const socketId = ref(null)
const onlineUsers = ref([])

export function useSocket() {
  // `isConnected` / `isConnecting` / `socketId` / `onlineUsers` are defined
  // at module scope above so multiple callers (MessagesPage, MainLayout,
  // etc.) all share the same state. Previously they were created per-call,
  // which meant only the caller that actually invoked `connect()` saw
  // isConnected turn true — everyone else stayed false.

  // Computed: Check if any admin is online
  const isAdminOnline = computed(() => {
    return onlineUsers.value.some(user => user.userType === 'admin')
  })
  
  // Computed: Get admin user info
  const adminInfo = computed(() => {
    return onlineUsers.value.find(user => user.userType === 'admin') || null
  })

  
  const connect = (token, userId, userType) => {
    if (socketInstance?.connected) {
      console.log('Socket already connected')
      return
    }
    
    if (isConnecting.value) {
      console.log('Socket already connecting')
      return
    }
    
    isConnecting.value = true
    
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })
    
   socketInstance.on('connect', () => {
  console.log('🔌 Socket connected')
  isConnected.value = true
  isConnecting.value = false
  socketId.value = socketInstance.id
  reconnectAttempts = 0

  // If a room join was requested before we were connected, flush it now
  if (pendingJoinRoom) {
    socketInstance.emit('join-conversation', { conversationId: pendingJoinRoom })
    console.log(`✅ (deferred) Joined conversation: ${pendingJoinRoom}`)
    pendingJoinRoom = null
  }
})
    
    
    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
      isConnected.value = false
      socketId.value = null
    })
    
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      isConnecting.value = false
      reconnectAttempts++
      
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })
    
    // User online status
    socketInstance.on('users-online', (users) => {
      onlineUsers.value = users
      console.log('Online users updated:', users)
      console.log('Is admin online?', isAdminOnline.value)
    })
    
    socketInstance.on('user-joined', ({ userId, userType, timestamp }) => {
      console.log(`User ${userId} (${userType}) joined at ${timestamp}`)
    })
  }
  
  
  const disconnect = () => {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }
    isConnected.value = false
    socketId.value = null
    onlineUsers.value = []
  }
  
const joinConversation = (conversationId) => {
  if (!conversationId) return

  // If socket isn't ready yet, remember the room and join it on 'connect'
  if (!socketInstance?.connected) {
    pendingJoinRoom = conversationId
    console.log(`⏳ Deferring join for conversation: ${conversationId} until socket connects`)
    return
  }

  socketInstance.emit('join-conversation', { conversationId })
  console.log(`✅ Joined conversation: ${conversationId}`)
}
  const leaveConversation = (conversationId) => {
    if (socketInstance?.connected && conversationId) {
      socketInstance.emit('leave-conversation', { conversationId })
    }
  }
  
const sendMessage = (conversationId, content, attachments = [], replyToMessageId = null) => {
  console.log('🟢 Socket sendMessage with replyToMessageId:', replyToMessageId)
  if (socketInstance?.connected) {
    socketInstance.emit('send-message', {
      conversationId,
      content,
      attachments,
      replyToMessageId
    })
    return true
  }
  console.log('🟢 Socket not connected')
  return false
}
  
  const sendTyping = (conversationId, isTyping) => {
    if (socketInstance?.connected) {
      socketInstance.emit('typing', { conversationId, isTyping })
    }
  }
  
  // In useSocket.js (customer)
const markAsRead = (conversationId) => {
  if (socketInstance?.connected) {
    socketInstance.emit('mark-read', { conversationId })
    // Dispatch event for unread count update
    window.dispatchEvent(new CustomEvent('messageRead', { 
      detail: { conversationId }
    }))
  }
}
  
  const getOnlineStatus = (userIds) => {
    if (socketInstance?.connected && userIds.length > 0) {
      socketInstance.emit('get-online-status', { userIds })
    }
  }
  
  // Event listeners
  const onNewMessage = (callback) => {
    if (socketInstance) {
      socketInstance.off('new-message')
      socketInstance.on('new-message', callback)
    }
  }
  
  const onMessageSent = (callback) => {
    if (socketInstance) {
      socketInstance.on('message-sent', callback)
      socketInstance.off('message-sent') 
    }
  }

  const onMessageUnsent = (callback) => {
  if (socketInstance) {
    socketInstance.on('message-unsent', callback)
  }
}

const onPaymentRequestUpdated = (callback) => {
  if (socketInstance) {
    socketInstance.on('payment-request-updated', callback)
  }
}

const onPaymentProofUpdated = (callback) => {
  if (socketInstance) {
    socketInstance.on('payment-proof-updated', callback)
  }
}
  
  const onUserTyping = (callback) => {
    if (socketInstance) {
      socketInstance.off('user-typing')
      socketInstance.on('user-typing', callback)
    }
  }
  
   const onMessagesRead = (callback) => {
    if (socketInstance) {
      socketInstance.off('messages-read')
      socketInstance.on('messages-read', callback)
    }
  }
  
  const onError = (callback) => {
    if (socketInstance) {
      socketInstance.off('error')
      socketInstance.on('error', callback)
    }
  }
  
  const onOnlineStatuses = (callback) => {
    if (socketInstance) {
      socketInstance.on('online-statuses', callback)
      socketInstance.off('online-statuses')
    }
  }

    const onQuoteReceived = (callback) => {
    if (socketInstance) {
      socketInstance.off('quote-received')
      socketInstance.on('quote-received', callback)
    }
  }

  const onQuoteResponded = (callback) => {
    if (socketInstance) {
      socketInstance.off('quote-responded')
      socketInstance.on('quote-responded', callback)
    }
  }

   const onOrderNegotiationUpdated = (callback) => {
    if (socketInstance) {
      socketInstance.off('order-negotiation-updated')
      socketInstance.on('order-negotiation-updated', callback)
    }
  }

  const respondToQuote = (messageId, response, reason = '') => {
    if (socketInstance?.connected) {
      socketInstance.emit('respond-to-quote', { messageId, response, reason })
      return true
    }
    return false
  }
  
  const off = (event) => {
    if (socketInstance) {
      socketInstance.off(event)
    }
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    // State
    isConnected,
    isConnecting,
    socketId,
    onlineUsers,
    isAdminOnline,  // Add this - realtime admin online status
    adminInfo,  
    
    // Methods
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    getOnlineStatus,
    
    // Event listeners
    onNewMessage,
    onMessageSent,
    onMessageUnsent,
    onPaymentRequestUpdated,
    onPaymentProofUpdated,
    onUserTyping,
    onMessagesRead,
    onError,
    onOnlineStatuses,
    onQuoteReceived,
    onQuoteResponded,
    onOrderNegotiationUpdated,
    respondToQuote,
    off
  }
}