<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style="height: calc(100vh - 140px)">
      
      <!-- Header - Fixed at top -->
      <div class="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <span class="text-white font-bold text-sm">AC</span>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">ACAPSHOP</h4>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span class="text-xs text-gray-500">
                  {{ isAdminOnline ? 'Online • Usually replies in minutes' : 'Offline • Will reply when available' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- <div class="flex items-center gap-2">
            <div class="bg-gray-50 px-3 py-1.5 rounded-full">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="isSocketConnected ? 'bg-green-500' : 'bg-red-500'"></div>
                <span class="text-xs text-gray-600">
                  {{ isSocketConnected ? 'Connected' : 'Connecting...' }}
                </span>
              </div>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Messages Container - Scrollable middle section -->
      <div 
        ref="messagesContainer" 
        class="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white"
      >
        <div v-if="isLoadingMessages" class="flex justify-center py-12">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-gray-400">Loading messages...</p>
          </div>
        </div>

        <template v-else>
          <template v-for="(group, dateIndex) in groupedMessages" :key="dateIndex">
            <div class="flex justify-center my-4">
              <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ formatDateHeader(group.date) }}</span>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="msg in group.messages" 
                :key="msg.messageId"
                class="flex items-start group"
                :class="msg.senderType === 'customer' ? 'justify-end' : 'justify-start'"
              >
                <!-- Avatar for admin (left side) -->
                <div v-if="msg.senderType === 'admin'" class="flex-shrink-0 mr-2 mt-1">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                    <span class="text-white text-xs font-bold">A</span>
                  </div>
                </div>
                
                <!-- Message Bubble with actions -->
                <div class="flex items-center gap-1.5 max-w-[75%]">
                  <!-- Action buttons - LEFT SIDE (for customer messages only) -->
                  <div 
                    v-if="msg.senderType === 'customer'"
                    class="flex flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <!-- Reply button -->
                    <button
                      v-if="!msg.isDeleted"
                      @click="setReplyTo(msg)"
                      class="p-1.5 rounded-full hover:bg-blue-200 transition-colors"
                      title="Reply to this message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-300 hover:text-blue-600">
                        <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z"/>
                        <path d="M21 15l-5-5 5-5"/>
                      </svg>
                    </button>
                    
                    <!-- Unsend button (only for customer's own messages) -->
                    <button
                      v-if="canUnsendMessage(msg)"
                      @click="openUnsendModal(msg)"
                      class="p-1.5 rounded-full hover:bg-red-200 transition-colors"
                      title="Unsend message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 hover:text-red-500">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Bubble -->
                  <div
                    class="rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:shadow-md"
                    :class="[
                      msg.senderType === 'customer'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200',
                      msg.isDeleted ? 'opacity-60' : ''
                    ]"
                  >
                    <div v-if="msg.senderType === 'admin'" class="text-xs font-semibold mb-1 text-purple-600">
                      ACAPSHOP Support
                    </div>
                    
                    <!-- Reply indicator -->
                    <div v-if="msg.replyTo" class="text-xs mb-1.5 p-1.5 rounded bg-opacity-20" :class="msg.senderType === 'customer' ? 'bg-blue-500 bg-opacity-20' : 'bg-gray-100'">
                      <span class="text-[10px] opacity-70">Replying to:</span>
                      <p class="text-xs truncate max-w-[200px]" :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-500'">
                        {{ msg.replyTo.content }}
                      </p>
                    </div>
                    
                    <p v-if="msg.content && !msg.isDeleted" class="text-sm leading-relaxed whitespace-pre-wrap break-words">{{ msg.content }}</p>
                    
                    <!-- Unsend indicator -->
                    <p v-if="msg.isDeleted" class="text-sm leading-relaxed whitespace-pre-wrap break-words italic" :class="msg.senderType === 'customer' ? 'text-blue-300' : 'text-gray-400'">
                      This message was unsent
                    </p>
                    
                    <!-- Attachments -->
                    <div v-if="msg.attachments && msg.attachments.length > 0 && !msg.isDeleted">
                      <div v-for="(file, idx) in msg.attachments" :key="idx">
                        <div v-if="isImageFile(file)" class="mt-2">
                          <img 
                            :src="getFileUrl(file)" 
                            :alt="file.name"
                            class="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            @click="openImageViewer(getFileUrl(file))"
                            @error="handleImageError"
                          />
                          <p class="text-xs mt-1" :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-500'">
                            📷 {{ file.name }}
                          </p>
                        </div>
                        <div v-else class="mt-2 flex items-center gap-2 p-2 rounded-lg bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-500">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <a :href="getFileUrl(file)" target="_blank" class="text-sm text-blue-600 hover:underline truncate">
                            {{ file.name }}
                          </a>
                          <span class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Time and Status -->
                    <div class="flex items-center gap-1 mt-1" :class="msg.senderType === 'customer' ? 'justify-end' : 'justify-start'">
                      <span class="text-[10px]" :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'">
                        {{ formatTime(msg.createdAt) }}
                      </span>
                      <span v-if="msg.senderType === 'customer' && !msg.isPending && !msg.failed" class="text-blue-200">
                        <svg v-if="msg.isRead" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M2 12l4 4 8-8"/>
                          <path d="M22 7l-8 8-3-3"/>
                        </svg>
                      </span>
                      <div v-if="msg.isPending" class="w-3 h-3 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                      <span v-if="msg.failed" class="text-[10px] text-red-400">Failed</span>
                    </div>
                  </div>

                  <!-- Action buttons - RIGHT SIDE (for admin messages only) -->
                  <div 
                    v-if="msg.senderType === 'admin'"
                    class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <!-- Reply button only -->
                    <button
                      v-if="!msg.isDeleted"
                      @click="setReplyTo(msg)"
                      class="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                      title="Reply to this message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 hover:text-gray-700">
                        <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z"/>
                        <path d="M21 15l-5-5 5-5"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Avatar for customer (right side) -->
                <div v-if="msg.senderType === 'customer'" class="flex-shrink-0 ml-2 mt-1">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                    <span class="text-white text-xs font-bold">{{ userInitial }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex justify-start mt-2">
            <div class="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div class="flex gap-1 items-center">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                <span class="text-xs text-gray-500 ml-1">Support is typing...</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Reply indicator -->
      <div v-if="replyToMessage" class="border-t px-4 py-2 bg-blue-50 border-blue-100 flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 flex-shrink-0">
            <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z"/>
            <path d="M21 15l-5-5 5-5"/>
          </svg>
          <div class="min-w-0">
            <span class="text-xs text-blue-600 font-medium">Replying to:</span>
            <p class="text-sm text-gray-600 truncate">{{ replyToMessage.content || '📎 Attachment' }}</p>
          </div>
        </div>
        <button @click="clearReply" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <!-- Input Area - Fixed at bottom -->
      <div class="border-t bg-white p-4 shrink-0">
        <!-- Attachment Preview -->
        <div v-if="pendingAttachments.length > 0" class="mb-3 flex flex-wrap gap-2">
          <div v-for="(file, idx) in pendingAttachments" :key="idx" class="relative bg-gray-50 rounded-lg p-2 flex items-center gap-2 border">
            <svg v-if="file.type?.startsWith('image/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500">
              <rect x="2" y="2" width="20" height="20" rx="2.18"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5-6 6-3-3-4 4"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-500">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <div class="max-w-[150px]">
              <p class="text-xs font-medium text-gray-700 truncate">{{ file.name }}</p>
              <p class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</p>
            </div>
            <button @click="removeAttachment(idx)" class="text-gray-400 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex gap-2 items-center">
          <!-- Attachment Button -->
          <div class="relative">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              @click="openFileSelector"
              :disabled="isSending"
              class="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
              title="Attach files"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
          </div>
          
          <!-- Message Input -->
          <div class="flex-1  relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="newMessage += '\n'"
              rows="1"
              placeholder="Type your message (optional)..."
              class="w-full min-h-[42px] max-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              :style="{ height: 'auto' }"
              @input="handleTyping"
            ></textarea>
          </div>
          
          <!-- Send Button -->
          <button
            @click="sendMessage"
            :disabled="(pendingAttachments.length === 0 && !newMessage.trim()) || isSending"
            class="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg v-if="!isSending" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
              <path d="m21.854 2.147-10.94 10.939"/>
            </svg>
            <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>
        
        <p class="text-xs text-gray-400 mt-3 text-center">Attach image/file or type a message</p>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showImageViewer" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click.self="closeImageViewer">
          <div class="relative max-w-full max-h-full">
            <img :src="viewerImage" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button @click="closeImageViewer" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
            <button @click="downloadImage" class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Unsend Confirmation Modal -->
    <Teleport to="body">
      <div 
        v-if="unsendModal.show" 
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        @click.self="closeUnsendModal"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"></div>
        
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
          <div class="text-center">
            <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
              </svg>
            </div>
            
            <h3 class="text-lg font-bold text-gray-900 mb-2">Unsend Message?</h3>
            <p class="text-sm text-gray-600 mb-6">
              This message will be removed for everyone in the conversation.
              <br>
              <span class="text-xs text-gray-400">This action cannot be undone.</span>
            </p>
            
            <div class="flex gap-3">
              <button
                @click="closeUnsendModal"
                class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                @click="confirmUnsend"
                :disabled="isUnsendLoading"
                class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg v-if="isUnsendLoading" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ isUnsendLoading ? 'Unsend...' : 'Yes, Unsend' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium" :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useSocket } from '@/composables/useSocket'
import { chatApi } from '@/api'

const { userInitial, customerId, token } = useAuth()
const { 
  isConnected: isSocketConnected, 
  connect: connectSocket, 
  joinConversation, 
  sendMessage: sendSocketMessage, 
  sendTyping,
  markAsRead,
  onNewMessage,
  onUserTyping,
  onError,
  isAdminOnline,
  onlineUsers 
} = useSocket()

// State
const messagesContainer = ref(null)
const fileInput = ref(null)
const newMessage = ref('')
const isTyping = ref(false)
const isSending = ref(false)
const isLoadingMessages = ref(true)
const pendingAttachments = ref([])
const showImageViewer = ref(false)
const viewerImage = ref('')
const conversationId = ref(null)
const messages = ref([])
const toast = ref({ show: false, type: 'success', message: '' })
const replyToMessage = ref(null)
const unsendModal = ref({ show: false, message: null })
const isUnsendLoading = ref(false)
let typingTimeoutId = null
let pendingTempId = null

// ── Auto-scroll helpers ──────────────────────────────
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// ── Computed ──────────────────────────────────────────
const groupedMessages = computed(() => {
  const groups = {}
  messages.value.forEach(msg => {
    const date = new Date(msg.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = { date, messages: [] }
    }
    groups[date].messages.push(msg)
  })
  return Object.values(groups)
})

// ── Helper Functions ──────────────────────────────────
function formatTime(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDateHeader(dateValue) {
  const date = new Date(dateValue)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function isImageFile(file) {
  return file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
}

function getFileUrl(file) {
  if (file.url) return file.url
  if (file.path) {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const cleanPath = file.path.replace(/^\/+/, '')
    if (cleanPath.startsWith('uploads/')) return `${baseURL}/${cleanPath}`
    return `${baseURL}/uploads/chat/${cleanPath}`
  }
  return ''
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3C/svg%3E'
}

function openImageViewer(imageUrl) {
  viewerImage.value = imageUrl
  showImageViewer.value = true
}

function closeImageViewer() {
  showImageViewer.value = false
  viewerImage.value = ''
}

function downloadImage() {
  const link = document.createElement('a')
  link.href = viewerImage.value
  link.download = 'image.jpg'
  link.click()
}

function showToast(type, message) {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  const MAX_SIZE = 10 * 1024 * 1024
  
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      showToast('error', `${file.name} exceeds 10MB limit`)
      continue
    }
    pendingAttachments.value.push(file)
  }
  event.target.value = ''
}

function removeAttachment(index) {
  pendingAttachments.value.splice(index, 1)
}

function handleTyping() {
  if (conversationId.value && isSocketConnected.value) {
    sendTyping(conversationId.value, true)
    
    if (typingTimeoutId) clearTimeout(typingTimeoutId)
    typingTimeoutId = setTimeout(() => {
      sendTyping(conversationId.value, false)
    }, 2000)
  }
}

// ── Reply feature ──
function setReplyTo(msg) {
  replyToMessage.value = msg
  if (fileInput.value) {
    fileInput.value?.focus()
  }
}

function clearReply() {
  replyToMessage.value = null
}

// ── Unsend feature ──
function canUnsendMessage(msg) {
  if (msg.isDeleted) return false
  const msgTime = new Date(msg.createdAt).getTime()
  const now = Date.now()
  const ageInMinutes = (now - msgTime) / 60000
  return ageInMinutes <= 5
}

function openUnsendModal(msg) {
  unsendModal.value = { show: true, message: msg }
}

function closeUnsendModal() {
  unsendModal.value = { show: false, message: null }
}

async function confirmUnsend() {
  const msg = unsendModal.value.message
  if (!msg) return
  
  isUnsendLoading.value = true
  
  try {
    const result = await chatApi.unsendMessage(msg.messageId)
    
    if (result.success) {
      const index = messages.value.findIndex(m => m.messageId === msg.messageId)
      if (index !== -1) {
        messages.value[index] = {
          ...messages.value[index],
          isDeleted: true,
          content: 'This message was unsent'
        }
      }
      showToast('success', 'Message unsent successfully')
      closeUnsendModal()
    } else {
      showToast('error', result.message || 'Failed to unsend message')
    }
  } catch (error) {
    console.error('Failed to unsend message:', error)
    showToast('error', 'Failed to unsend message')
  } finally {
    isUnsendLoading.value = false
  }
}

async function loadMessages() {
  if (!conversationId.value) return
  
  isLoadingMessages.value = true
  try {
    const response = await chatApi.getMessages(conversationId.value, 100)
    if (response.success && response.data) {
      messages.value = response.data
      await scrollToBottom()
      
      if (isSocketConnected.value) {
        markAsRead(conversationId.value)
      }
    }
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

async function sendMessage() {
  const content = newMessage.value.trim()
  if (pendingAttachments.value.length === 0 && !content) return
  
  isSending.value = true
  
  try {
    let uploadedFiles = []
    
    if (pendingAttachments.value.length > 0) {
      try {
        const uploadResult = await chatApi.uploadFiles(pendingAttachments.value)
        if (uploadResult.success && uploadResult.files) {
          uploadedFiles = uploadResult.files
        } else {
          showToast('error', 'Failed to upload files')
          isSending.value = false
          return
        }
      } catch (error) {
        console.error('File upload error:', error)
        showToast('error', 'Failed to upload files')
        isSending.value = false
        return
      }
    }
    
    const tempId = 'temp_' + Date.now()
    pendingTempId = tempId
    
    const replyToMsg = replyToMessage.value
    const replyToMessageId = replyToMsg?.messageId || null
    
    console.log('🔵 SENDING REPLY - replyToMessageId:', replyToMessageId)
    
    const tempMessage = {
      messageId: tempId,
      conversationId: conversationId.value,
      senderType: 'customer',
      senderId: customerId.value,
      content: content || (uploadedFiles.length > 0 ? '📎 Sent an attachment' : ''),
      attachments: uploadedFiles,
      createdAt: new Date().toISOString(),
      isPending: true,
      isRead: false,
      replyTo: replyToMsg ? {
        messageId: replyToMsg.messageId,
        content: replyToMsg.content || '📎 Attachment'
      } : null
    }
    
    messages.value.push(tempMessage)
    newMessage.value = ''
    clearReply()
    pendingAttachments.value = []
    await scrollToBottom()
    
    const messageContent = content || (uploadedFiles.length > 0 ? '📎 Attachment' : '')
    
    // ✅ ONLY send via socket (not both)
    if (isSocketConnected.value && conversationId.value) {
      console.log('🔵 Sending via socket only')
      const sent = sendSocketMessage(
        conversationId.value,
        messageContent,
        uploadedFiles,
        replyToMessageId
      )
      
      // If socket fails, fallback to REST
      if (!sent) {
        console.log('🔵 Socket failed, using REST fallback')
        const response = await chatApi.sendMessage(
          conversationId.value,
          messageContent,
          uploadedFiles,
          replyToMessageId
        )
        if (response.success && response.data) {
          const index = messages.value.findIndex(m => m.messageId === tempId)
          if (index !== -1) {
            messages.value[index] = { ...response.data, isPending: false }
          }
          pendingTempId = null
        }
      }
    } else {
      // REST fallback when socket is not connected
      console.log('🔵 Socket not connected, using REST')
      const response = await chatApi.sendMessage(
        conversationId.value,
        messageContent,
        uploadedFiles,
        replyToMessageId
      )
      if (response.success && response.data) {
        const index = messages.value.findIndex(m => m.messageId === tempId)
        if (index !== -1) {
          messages.value[index] = { ...response.data, isPending: false }
        }
        pendingTempId = null
      }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    showToast('error', 'Failed to send message')
    const index = messages.value.findIndex(m => m.messageId === pendingTempId)
    if (index !== -1) {
      messages.value[index].failed = true
      messages.value[index].isPending = false
    }
  } finally {
    isSending.value = false
  }
}

async function initConversation() {
  try {
    const response = await chatApi.getOrCreateConversation('Customer Support')
    if (response.success && response.data) {
      conversationId.value = response.data.conversationId
      await loadMessages()
      
      if (isSocketConnected.value) {
        joinConversation(conversationId.value)
        markAsRead(conversationId.value)
      }
    }
  } catch (error) {
    console.error('Error initializing conversation:', error)
    showToast('error', 'Failed to load conversation')
  }
}

function setupSocketListeners() {
  onNewMessage((message) => {
    console.log('📩 New message received via socket:', message.messageId)
    console.log('📩 Pending temp ID:', pendingTempId)
    
    // If this is our own pending message, replace it
    if (pendingTempId) {
      const index = messages.value.findIndex(m => m.messageId === pendingTempId)
      if (index !== -1) {
        console.log('📩 Replacing temp message with real message')
        messages.value[index] = { 
          ...message, 
          isPending: false,
          replyTo: message.replyTo || messages.value[index].replyTo
        }
        pendingTempId = null
        // ✅ Auto-scroll to bottom after replacing
        scrollToBottom()
        return
      }
    }
    
    // Check if message already exists (prevent duplicates)
    const exists = messages.value.some(m => m.messageId === message.messageId)
    if (!exists) {
      console.log('📩 Adding new message to list')
      messages.value.push(message)
      
      // ✅ Auto-scroll to bottom for new messages
      scrollToBottom()
      
      if (conversationId.value && message.conversationId === conversationId.value) {
        markAsRead(conversationId.value)
      }
    } else {
      console.log('📩 Message already exists, skipping duplicate')
    }
  })
  
  onUserTyping(({ userType, isTyping: typing }) => {
    if (userType === 'admin') {
      isTyping.value = typing
    }
  })
  
  onError((error) => {
    console.error('Socket error:', error)
    showToast('error', error.message || 'Connection error')
  })
}

// ── Watchers for auto-scroll ─────────────────────────
// Watch for messages length changes (new messages)
watch(() => messages.value.length, () => {
  scrollToBottom()
}, { flush: 'post' })

// Watch for grouped messages changes (when new messages arrive)
watch(groupedMessages, () => {
  scrollToBottom()
}, { flush: 'post' })

// Watch for socket connection and conversation changes
watch(isSocketConnected, (connected) => {
  if (connected && conversationId.value) {
    joinConversation(conversationId.value)
    markAsRead(conversationId.value)
  }
})

// ── Lifecycle ─────────────────────────────────────────
onMounted(async () => {
  if (token.value) {
    connectSocket(token.value, customerId.value, 'customer')
    setupSocketListeners()
  }
  
  await initConversation()
  
  // ✅ Initial scroll to bottom after mount
  await nextTick()
  scrollToBottom()
})

onUnmounted(() => {
  if (typingTimeoutId) clearTimeout(typingTimeoutId)
})
</script>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce { animation: bounce 0.8s ease-in-out infinite; }

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
.fade-in {
  animation-name: fadeIn;
}
.zoom-in {
  animation-name: zoomIn;
}
</style>