<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="bg-white rounded-xl border flex flex-col" style="height: calc(100vh - 200px)">

      <!-- Header -->
      <div class="px-6 py-4 border-b shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span class="text-white font-bold text-xs">A</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 leading-none">ACAPSHOP Support</h4>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span class="text-xs text-gray-500">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex"
          :class="msg.sender === 'customer' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[70%] rounded-2xl px-4 py-2.5"
            :class="msg.sender === 'customer'
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'"
          >
            <!-- Text message -->
            <p v-if="msg.text" class="text-sm leading-relaxed">{{ msg.text }}</p>
            
            <!-- Image attachment -->
            <div v-if="msg.image" class="mt-2">
              <img 
                :src="msg.image" 
                alt="Attached image" 
                class="max-w-full rounded-lg cursor-pointer"
                @click="openImageViewer(msg.image)"
              />
              <p class="text-xs mt-1" :class="msg.sender === 'customer' ? 'text-blue-200' : 'text-gray-500'">
                📎 Attached image
              </p>
            </div>
            
            <!-- File attachment -->
            <div v-if="msg.file" class="mt-2 flex items-center gap-2 p-2 rounded-lg"
              :class="msg.sender === 'customer' ? 'bg-blue-500' : 'bg-gray-200'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span class="text-sm truncate">{{ msg.file.name }}</span>
              <span class="text-xs opacity-75">{{ formatFileSize(msg.file.size) }}</span>
            </div>
            
            <p class="text-xs mt-1 text-right"
              :class="msg.sender === 'customer' ? 'text-blue-200' : 'text-gray-400'"
            >{{ msg.time }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
            <div class="flex gap-1 items-center">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="border-t p-4 shrink-0">
        <div class="flex gap-2">
          <!-- Attachment button -->
          <div class="relative">
            <input
              ref="fileInput"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              @click="openFileSelector"
              class="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              title="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
          </div>
          
          <!-- Message input -->
          <input
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 h-9 rounded-md border border-gray-300 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          
          <!-- Send button -->
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() && !pendingAttachment"
            class="h-9 w-9 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
              <path d="m21.854 2.147-10.94 10.939"/>
            </svg>
          </button>
        </div>
        
        <!-- Attachment preview -->
        <div v-if="pendingAttachment" class="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span class="text-sm text-gray-700 truncate flex-1">{{ pendingAttachment.name }}</span>
          <span class="text-xs text-gray-400">{{ formatFileSize(pendingAttachment.size) }}</span>
          <button @click="clearAttachment" class="text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <p class="text-xs text-gray-400 mt-2 text-center">Replies within 1–2 business hours</p>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showImageViewer"
          class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          @click.self="closeImageViewer"
        >
          <div class="relative max-w-full max-h-full">
            <img :src="viewerImage" class="max-w-full max-h-screen object-contain" />
            <button
              @click="closeImageViewer"
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const messagesContainer = ref(null)
const fileInput = ref(null)
const newMessage = ref('')
const isTyping = ref(false)
const pendingAttachment = ref(null)
const showImageViewer = ref(false)
const viewerImage = ref('')

const messages = ref([
  {
    id: 1,
    sender: 'seller',
    text: 'Hello! How can I help you today?',
    time: '02:47 PM'
  }
])

let nextId = 2

function getTimestamp() {
  return new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    pendingAttachment.value = file
  }
  // Clear input so same file can be selected again
  event.target.value = ''
}

function clearAttachment() {
  pendingAttachment.value = null
}

function openImageViewer(imageUrl) {
  viewerImage.value = imageUrl
  showImageViewer.value = true
}

function closeImageViewer() {
  showImageViewer.value = false
  viewerImage.value = ''
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function sendMessage() {
  const text = newMessage.value.trim()
  const attachment = pendingAttachment.value
  
  if (!text && !attachment) return

  const messageObj = {
    id: nextId++,
    sender: 'customer',
    time: getTimestamp()
  }
  
  if (text) messageObj.text = text
  
  if (attachment) {
    // For images, create a preview URL
    if (attachment.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(attachment)
      messageObj.image = imageUrl
      messageObj.imageName = attachment.name
    } else {
      messageObj.file = {
        name: attachment.name,
        size: attachment.size,
        type: attachment.type
      }
    }
  }
  
  messages.value.push(messageObj)
  newMessage.value = ''
  clearAttachment()
  await scrollToBottom()

  // Simulate seller reply
  isTyping.value = true
  await scrollToBottom()
  await new Promise(resolve => setTimeout(resolve, 1500))
  isTyping.value = false

  const replies = [
    'Thanks for reaching out! Let me check on that for you.',
    'Got it! Our team will review your request shortly.',
    'Sure, I can help with that. Could you provide more details?',
    'Thank you for your message. We\'ll get back to you within 1–2 business hours.',
    'I see your attachment. Let me review it and get back to you.',
    'Thanks for sharing the file. We\'ll look into it.'
  ]
  
  const replyText = attachment 
    ? `Thanks for sending the ${attachment.type.startsWith('image/') ? 'image' : 'file'}. ${replies[Math.floor(Math.random() * replies.length)]}`
    : replies[Math.floor(Math.random() * replies.length)]
  
  messages.value.push({
    id: nextId++,
    sender: 'seller',
    text: replyText,
    time: getTimestamp()
  })
  await scrollToBottom()
}

onMounted(scrollToBottom)
</script>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce { animation: bounce 0.8s ease-in-out infinite; }

/* Modal transition */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>