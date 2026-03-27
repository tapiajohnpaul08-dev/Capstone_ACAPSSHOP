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
            <p class="text-sm leading-relaxed">{{ msg.text }}</p>
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
        <div class="flex gap-2 items-center">
          <input
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 h-9 rounded-md border border-gray-300 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim()"
            class="h-9 w-9 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
              <path d="m21.854 2.147-10.94 10.939"/>
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2 text-center">Replies within 1–2 business hours</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const messagesContainer = ref(null)
const newMessage = ref('')
const isTyping = ref(false)

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

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return

  messages.value.push({ id: nextId++, sender: 'customer', text, time: getTimestamp() })
  newMessage.value = ''
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
    'Thank you for your message. We\'ll get back to you within 1–2 business hours.'
  ]
  messages.value.push({
    id: nextId++,
    sender: 'seller',
    text: replies[Math.floor(Math.random() * replies.length)],
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
</style>