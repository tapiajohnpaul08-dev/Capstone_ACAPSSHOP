<template>
  <div class="container mx-auto px-4 py-6 max-w-[1400px]">
    <!-- Mobile view switcher: 'list' shows sidebar, 'chat' shows the conversation -->
    <div class="lg:grid lg:gap-4 lg:grid-cols-[320px_1fr] lg:h-[calc(100vh-140px)]"
      :class="selectedOrder ? 'xl:grid-cols-[320px_1fr_380px]' : ''">

      <!-- ────── LEFT: Conversations sidebar ────── -->
      <!-- On mobile: shown when mobileView === 'list'; hidden when mobileView === 'chat' -->
      <div class="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-0"
        :class="mobileView === 'list' ? 'flex' : 'hidden lg:flex'" style="height: calc(100dvh - 140px);">
        <!-- Sidebar header -->
        <div class="shrink-0 px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MessageSquare class="w-4 h-4 text-blue-600" />
              <h4 class="font-semibold text-sm text-gray-900">Conversations</h4>
              <span v-if="conversations.length > 0"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {{ conversations.length }}
              </span>
            </div>
            <button @click="loadConversationList" :disabled="isLoadingConversations"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh">
              <RefreshCw :class="['w-3.5 h-3.5', isLoadingConversations ? 'animate-spin' : '']" />
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingConversations && conversations.length === 0"
          class="flex-1 flex items-center justify-center">
          <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="conversations.length === 0"
          class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <MessageSquare class="w-6 h-6 text-blue-400" />
          </div>
          <p class="text-sm font-semibold text-gray-600">No conversations yet</p>
          <p class="text-xs text-gray-400 mt-0.5">
            Start by creating an order — your chat with admin will appear here.
          </p>
        </div>

        <!-- Conversation list -->
        <div v-else class="flex-1 overflow-y-auto divide-y divide-gray-100">
          <button v-for="conv in conversations" :key="conv.conversationId" @click="selectConversationFromList(conv)"
            class="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors"
            :class="activeConversationId === conv.conversationId ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'">
            <div class="flex items-start gap-2.5">
              <div class="flex-1 min-w-0">
                <!-- Row 1: orderId + time -->
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-bold text-gray-900 font-mono truncate">
                    {{ conv.orderId || 'General' }}
                  </span>
                  <span class="text-[10px] text-gray-400 flex-shrink-0">
                    {{ formatConversationTime(conv.lastMessageAt) }}
                  </span>
                </div>
                <!-- Row 2: subject/preview -->
                <p class="text-[11px] text-gray-500 truncate mt-0.5">
                  {{ conv.lastMessage || conv.subject || 'No messages yet' }}
                </p>
                <!-- Row 3: badges -->
                <div class="flex items-center gap-1 mt-1 flex-wrap">
                  <span v-if="conv.unreadCount > 0"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                    {{ conv.unreadCount }} new
                  </span>
                  <span v-if="conv.status === 'resolved'"
                    class="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    Resolved
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- ────── MIDDLE: Chat panel ────── -->
      <!-- On mobile: shown when mobileView === 'chat' -->
      <div class="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-0 relative"
        :class="mobileView === 'chat' ? 'flex' : 'hidden lg:flex'" style="height: calc(100dvh - 140px);">
        <!-- Mobile back button -->
        <button @click="mobileView = 'list'"
          class="lg:hidden absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Back to conversations">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <!-- Header -->
        <div class="px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-white shrink-0 pl-14 lg:pl-6">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white-600 flex items-center justify-center shadow-md shrink-0">
                <img :src="Logo" alt="ACAPS TRADING" class="w-10 h-10" />
              </div>
              <div class="min-w-0">
                <h4 class="font-semibold text-gray-900 text-sm sm:text-base">ACAPSHOP</h4>
              </div>
            </div>

            <!-- ✅ Reopen negotiation panel button -->
            <button v-if="!selectedOrder && myPendingOrders.length > 0" @click="reopenNegotiationPanel"
              class="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              title="View order details & negotiate">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span class="hidden xs:inline">Order</span>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          <div v-if="isLoadingMessages" class="flex justify-center py-12">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-sm text-gray-400">Loading messages...</p>
            </div>
          </div>

          <template v-else>
            <template v-for="(group, dateIndex) in groupedMessages" :key="dateIndex">
              <div class="flex justify-center my-4">
                <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ formatDateHeader(group.date)
                  }}</span>
              </div>

              <div class="space-y-3">
                <div v-for="msg in group.messages" :key="msg.messageId" class="group">

                  <!-- ✅ SYSTEM MESSAGE — full-width centered pill -->
                  <div v-if="msg.contentType === 'system'" class="w-full flex justify-center my-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" :class="msg.isDeleted
                      ? 'bg-gray-100 text-gray-400 italic'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'">
                      {{ msg.content }}
                    </span>
                  </div>

                  <!-- 💳 PAYMENT REQUEST CARD -->
                  <div v-else-if="msg.contentType === 'payment-request'" class="w-full flex justify-start my-2">
                    <div
                      class="max-w-md w-full bg-white border-2 border-amber-200 rounded-2xl shadow-sm overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" class="text-amber-600">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        <span class="font-bold text-amber-800 text-sm">Payment Request</span>
                        <span v-if="msg.paymentRequestData?.status"
                          class="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" :class="{
                            'bg-yellow-200 text-yellow-800': msg.paymentRequestData.status === 'pending',
                            'bg-blue-200 text-blue-800': msg.paymentRequestData.status === 'proof-submitted',
                            'bg-green-200 text-green-800': msg.paymentRequestData.status === 'verified',
                            'bg-red-200 text-red-800': msg.paymentRequestData.status === 'rejected',
                            'bg-gray-200 text-gray-700': msg.paymentRequestData.status === 'superseded',
                          }">
                          {{ msg.paymentRequestData.status }}
                        </span>
                      </div>

                      <div class="p-4 space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Method</span>
                          <span class="font-semibold">
                            {{ msg.paymentRequestData?.method === 'gcash' ? 'GCash' : 'Bank Transfer' }}
                          </span>
                        </div>
                        <div v-if="msg.paymentRequestData?.bankName" class="flex justify-between">
                          <span class="text-gray-500">Bank</span>
                          <span class="font-semibold">{{ msg.paymentRequestData.bankName }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Account Name</span>
                          <span class="font-semibold">{{ msg.paymentRequestData?.accountName }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Account Number</span>
                          <span class="font-mono font-semibold">{{ msg.paymentRequestData?.accountNumber }}</span>
                        </div>
                        <div class="flex justify-between pt-2 border-t border-gray-100">
                          <span class="text-gray-500">Amount Due</span>
                          <span class="font-bold text-amber-700">
                            ₱{{ (msg.paymentRequestData?.amountDue || 0).toLocaleString() }}
                          </span>
                        </div>
                        <p v-if="msg.paymentRequestData?.notes"
                          class="text-xs text-gray-500 italic pt-2 border-t border-gray-100">
                          {{ msg.paymentRequestData.notes }}
                        </p>

                        <button v-if="msg.paymentRequestData?.status === 'pending'" @click="openPaymentProofModal(msg)"
                          class="w-full mt-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
                          I've Paid — Upload Proof
                        </button>
                        <div v-else-if="msg.paymentRequestData?.status === 'proof-submitted'"
                          class="text-xs text-blue-600 text-center pt-2">
                          Proof submitted — awaiting admin review
                        </div>
                        <div v-else-if="msg.paymentRequestData?.status === 'verified'"
                          class="text-xs text-green-600 text-center pt-2">
                          ✓ Payment verified — order confirmed
                        </div>
                        <div v-else-if="msg.paymentRequestData?.status === 'rejected'"
                          class="text-xs text-red-600 text-center pt-2">
                          ✗ Payment rejected{{ msg.paymentRequestData.rejectionReason ? `:
                          ${msg.paymentRequestData.rejectionReason}` : '' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 🧾 PAYMENT PROOF CARD (customer's own) -->
                  <div v-else-if="msg.contentType === 'payment-proof'" class="w-full flex justify-end my-2">
                    <div
                      class="max-w-md w-full bg-blue-50 border border-blue-200 rounded-2xl shadow-sm overflow-hidden">
                      <div class="px-4 py-3 border-b border-blue-200 flex items-center justify-between">
                        <span class="font-bold text-blue-800 text-sm">Payment Proof Submitted</span>
                        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" :class="{
                          'bg-yellow-200 text-yellow-800': msg.paymentProofData?.status === 'pending-review',
                          'bg-green-200 text-green-800': msg.paymentProofData?.status === 'approved',
                          'bg-red-200 text-red-800': msg.paymentProofData?.status === 'rejected',
                        }">
                          {{ (msg.paymentProofData?.status || '').replace('-', ' ') }}
                        </span>
                      </div>
                      <div class="p-4 space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Amount</span>
                          <span class="font-semibold">₱{{ (msg.paymentProofData?.amountPaid || 0).toLocaleString()
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Reference</span>
                          <span class="font-mono text-xs">{{ msg.paymentProofData?.referenceNumber || '—' }}</span>
                        </div>
                        <img v-if="msg.paymentProofData?.proofImageUrl" :src="msg.paymentProofData.proofImageUrl"
                          alt="Proof" class="w-full rounded-lg border border-blue-200 cursor-pointer"
                          @click="openImageViewer(msg.paymentProofData.proofImageUrl)" />
                      </div>
                    </div>
                  </div>

                  <!-- QUOTE / REGULAR message row -->
                  <div v-else class="flex items-start"
                    :class="msg.senderType === 'customer' ? 'justify-end' : 'justify-start'">
                    <div v-if="msg.senderType === 'admin'" class="flex-shrink-0 mr-2 mt-1">
                      <div
                        class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                        <span class="text-white text-xs font-bold">A</span>
                      </div>
                    </div>

                    <div v-if="msg.senderType === 'customer' && !msg.isDeleted"
                      class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center mr-2">
                      <button @click="setReplyTo(msg)" class="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                        title="Reply">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          class="text-gray-400 hover:text-blue-600">
                          <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z" />
                          <path d="M21 15l-5-5 5-5" />
                        </svg>
                      </button>
                      <button v-if="canUnsendMessage(msg)" @click="openUnsendModal(msg)"
                        class="p-1.5 rounded-full hover:bg-red-100 transition-colors" title="Unsend">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          class="text-gray-400 hover:text-red-600">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>

                    <div class="relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm" :class="msg.senderType === 'customer'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'">
                      <div v-if="msg.replyTo" class="text-xs mb-1.5 p-1.5 rounded"
                        :class="msg.senderType === 'customer' ? 'bg-blue-500 bg-opacity-20' : 'bg-gray-100'">
                        <span class="text-[10px] opacity-70">↩️ Replying to:</span>
                        <p class="text-xs truncate max-w-[200px]"
                          :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-500'">
                          {{ msg.replyTo.content }}
                        </p>
                      </div>

                      <p v-if="msg.content && !msg.isDeleted" class="text-sm whitespace-pre-wrap break-words">{{
                        msg.content }}</p>

                      <p v-if="msg.isDeleted" class="text-sm italic"
                        :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'">
                        This message was unsent
                      </p>

                      <div v-if="msg.attachments?.length && !msg.isDeleted" class="mt-2 space-y-2">
                        <div v-for="(file, idx) in msg.attachments" :key="idx">
                          <img v-if="isImageFile(file)" :src="getFileUrl(file)" :alt="file.name || 'Image'"
                            class="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            @click="openImageViewer(getFileUrl(file))" @error="handleImageError" />
                          <div v-else class="flex items-center gap-2 p-2 rounded-lg"
                            :class="msg.senderType === 'customer' ? 'bg-blue-700' : 'bg-gray-100'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" stroke-width="2"
                              :class="msg.senderType === 'customer' ? 'text-blue-300' : 'text-gray-500'">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <a :href="getFileUrl(file)" target="_blank" class="text-sm hover:underline truncate flex-1"
                              :class="msg.senderType === 'customer' ? 'text-blue-100' : 'text-blue-600'">
                              {{ file.name || 'Download' }}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-1 mt-1.5 justify-end">
                        <span class="text-[10px]"
                          :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'">
                          {{ formatTime(msg.createdAt || msg.timestamp) }}
                        </span>
                      </div>
                    </div>

                    <div v-if="msg.senderType === 'admin' && !msg.isDeleted"
                      class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2">
                      <button @click="setReplyTo(msg)" class="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                        title="Reply">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          class="text-gray-400 hover:text-blue-600">
                          <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z" />
                          <path d="M21 15l-5-5 5-5" />
                        </svg>
                      </button>
                    </div>

                    <div v-if="msg.senderType === 'customer'" class="flex-shrink-0 ml-2 mt-1">
                      <div
                        class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                        <span class="text-white text-xs font-bold">{{ userInitial }}</span>
                      </div>
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
        <div v-if="replyToMessage"
          class="border-t px-4 py-2 bg-blue-50 border-blue-100 flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" class="text-blue-600 flex-shrink-0">
              <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z" />
              <path d="M21 15l-5-5 5-5" />
            </svg>
            <div class="min-w-0">
              <span class="text-xs text-blue-600 font-medium">Replying to:</span>
              <p class="text-sm text-gray-600 truncate">{{ replyToMessage.content || '📎 Attachment' }}</p>
            </div>
          </div>
          <button @click="clearReply" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Input Area -->
        <div class="border-t bg-white p-4 shrink-0">
          <div v-if="pendingAttachments.length > 0" class="mb-3 flex flex-wrap gap-2">
            <div v-for="(file, idx) in pendingAttachments" :key="idx"
              class="relative bg-gray-50 rounded-lg p-2 flex items-center gap-2 border">
              <img v-if="file.previewUrl" :src="file.previewUrl" class="w-10 h-10 object-cover rounded" />
              <svg v-else-if="file.type?.startsWith('image/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500">
                <rect x="2" y="2" width="20" height="20" rx="2.18" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5-6 6-3-3-4 4" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" class="text-gray-500">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div class="max-w-[150px]">
                <p class="text-xs font-medium text-gray-700 truncate">{{ file.name }}</p>
                <p class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</p>
              </div>
              <button @click="removeAttachment(idx)" class="text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex gap-2 items-center">
            <div class="relative">
              <input ref="fileInput" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                class="hidden" @change="handleFileSelect" />
              <button @click="openFileSelector" :disabled="isSending"
                class="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                title="Attach files">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path
                    d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>

            <div class="flex-1 relative">
              <textarea v-model="newMessage" @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="newMessage += '\n'" rows="1" placeholder="Type your message..."
                class="w-full min-h-[42px] max-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                @input="handleTyping"></textarea>
            </div>

            <button @click="sendMessage"
              :disabled="(pendingAttachments.length === 0 && !newMessage.trim()) || isSending"
              class="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
              <svg v-if="!isSending" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                <path d="m21.854 2.147-10.94 10.939" />
              </svg>
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>

          <p class="text-xs text-gray-400 mt-3 text-center">Attach image/file or type a message</p>
        </div>
      </div>
      <!-- ────── /MIDDLE: Chat panel ────── -->

      <!-- ────── RIGHT: Negotiation panel (bottom sheet on mobile) ────── -->
      <Teleport to="body">
        <!-- Mobile: bottom sheet -->
        <div v-if="selectedOrder"
          class="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white rounded-t-2xl border-t shadow-2xl max-h-[70vh] flex flex-col">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 shrink-0"></div>
          <div class="flex-1 min-h-0 overflow-hidden">
            <NegotiationOrderPanel :order="selectedOrder" @clear="clearSelectedOrder" />
          </div>
        </div>
      </Teleport>

      <!-- ────── RIGHT: Negotiation panel ────── -->
      <!-- Desktop / tablet landscape: inline third column -->
      <div v-if="selectedOrder"
        class="hidden xl:flex bg-white rounded-xl border shadow-sm overflow-hidden flex-col min-h-0 xl:col-span-1">
        <NegotiationOrderPanel :order="selectedOrder" @clear="clearSelectedOrder" />
      </div>

      <!-- Tablet portrait & mobile: bottom sheet -->
      <Teleport to="body">
        <Transition name="sheet">
          <div v-if="selectedOrder" class="xl:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-black/40 -z-10" @click="clearSelectedOrder"></div>

            <!-- Sheet -->
            <div class="bg-white rounded-t-2xl border-t shadow-2xl flex flex-col max-h-[80vh]"
              style="padding-bottom: env(safe-area-inset-bottom);">
              <!-- Drag handle -->
              <div class="shrink-0 pt-2 pb-1 flex justify-center">
                <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>

              <div class="flex-1 min-h-0 overflow-hidden">
                <NegotiationOrderPanel :order="selectedOrder" @clear="clearSelectedOrder" />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

    </div>
  </div>

  <!-- ────── Full-page drop overlay (only while dragging a file) ────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isDraggingFile"
        class="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
        style="background: rgba(37, 99, 235, 0.08); backdrop-filter: blur(2px);"
      >
        <div class="border-4 border-dashed border-blue-500 rounded-3xl px-10 py-8 bg-white/95 shadow-2xl">
          <div class="flex flex-col items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="text-lg font-bold text-blue-700">Drop to attach</p>
            <p class="text-xs text-gray-500">Files will be added to your reply</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ────── Payment Proof Upload Modal ────── -->
  <Teleport to="body">
    <div v-if="showProofModal"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showProofModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4">Upload Payment Proof</h3>

        <div class="space-y-3">
          <!-- Amount due (view-only) -->
          <div class="bg-amber-50 rounded-lg p-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Amount Due</span>
              <span class="font-bold text-amber-700">
                ₱{{ (selectedPaymentRequest?.paymentRequestData?.amountDue || 0).toLocaleString() }}
              </span>
            </div>
            <p class="text-[10px] text-gray-500 mt-1">
              This amount is set by the seller and cannot be changed.
            </p>
          </div>

          <!-- Reference number — validated per payment method -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">
              Reference Number <span class="text-red-500">*</span>
            </label>
            <input
              :value="proofReference"
              type="text"
              :inputmode="referenceInputMode"
              :maxlength="referenceMaxLength"
              :placeholder="referencePlaceholder"
              autocomplete="off"
              spellcheck="false"
              class="w-full px-3 py-2 border rounded-lg text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              :class="{
                'border-red-400 ring-1 ring-red-300': referenceTouched && !isReferenceValid,
                'border-green-400 ring-1 ring-green-300': referenceTouched && isReferenceValid,
                'border-gray-300': !referenceTouched,
              }"
              @input="handleReferenceInput"
              @blur="referenceTouched = true"
            />
            <p
              v-if="!referenceTouched || !proofReference"
              class="text-[10px] text-gray-500 mt-1"
            >
              {{ referenceHint }}
            </p>
            <p
              v-else-if="isReferenceValid"
              class="text-[10px] text-green-600 mt-1 flex items-center gap-1"
            >
              ✓ Valid reference number
            </p>
            <p
              v-else
              class="text-[10px] text-red-500 mt-1 flex items-center gap-1"
            >
              {{ referenceError }}
            </p>
          </div>

          <!-- Image picker -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">
              Upload Receipt / Screenshot
            </label>
            <input ref="proofFileInput" type="file" accept="image/*" class="hidden" @change="handleProofFileSelect" />
            <button type="button" @click="proofFileInput?.click()"
              class="w-full py-2 border-2 border-dashed rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
              {{ proofFile ? proofFile.name : 'Choose image…' }}
            </button>
            <img v-if="proofPreview" :src="proofPreview"
              class="mt-2 w-full max-h-40 object-contain rounded-lg border" />
          </div>

          <!-- Note -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Note (optional)</label>
            <textarea v-model="proofNote" rows="2"
              class="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Anything the admin should know…"></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-5">
          <button type="button" @click="showProofModal = false" :disabled="isSubmittingProof"
            class="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" @click="submitPaymentProof" :disabled="!proofFile || isSubmittingProof || !isReferenceValid"
            class="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <svg v-if="isSubmittingProof" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
              fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ isSubmittingProof ? 'Submitting…' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSocket } from '@/composables/useSocket'
import { chatApi, ordersApi } from '@/api'
import { MessageSquare, RefreshCw } from 'lucide-vue-next'
import NegotiationOrderPanel from '@/components/chat/NegotiationOrderPanel.vue'
import Logo from '@/assets/images/ACAPS_LOGO_ONLY.png'

const { userInitial, customerId, token } = useAuth()
const route = useRoute()
const {
  isConnected: isSocketConnected,
  connect: connectSocket,
  joinConversation,
  sendMessage: sendSocketMessage,
  sendTyping,
  markAsRead,
  onNewMessage,
  onMessageUnsent,
  onPaymentRequestUpdated,
  onPaymentProofUpdated,
  onUserTyping,
  onError,
  isAdminOnline,
  onOrderNegotiationUpdated,
} = useSocket()

// ── State ──────────────────────────────────────────
const messagesContainer = ref(null)
const fileInput = ref(null)
const newMessage = ref('')

// Whole-page drag-to-attach state. The window listeners are registered
// in onMounted and torn down in onUnmounted, so this only activates
// while the user is actually on the Messages page.
const isDraggingFile = ref(false)
let pageDragDepth = 0

// Drag-to-attach state — scoped to the composer only.
// No window listeners: dragging anywhere else on the page is a no-op.
const isComposerDragOver = ref(false)
// Track nested dragenter/dragleave so child elements don't flicker
// the overlay on/off as the cursor crosses them.
let composerDragDepth = 0

// ✅ Mobile view switcher: 'list' | 'chat'
// Desktop ignores this and shows both side by side
const mobileView = ref('list')
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

const myPendingOrders = ref([])
const selectedOrder = ref(null)
const showOrderPicker = ref(false)

// ✅ NEW — Conversation list (sidebar)
const conversations = ref([])
const activeConversationId = ref(null)
const isLoadingConversations = ref(false)

// ── Payment proof modal state ───────────────────────
const showProofModal = ref(false)
const selectedPaymentRequest = ref(null)
const proofReference = ref('')
const proofFile = ref(null)
const proofPreview = ref('')
const proofNote = ref('')
const isSubmittingProof = ref(false)
const proofFileInput = ref(null)

// ✅ Reference-number validation state
const referenceTouched = ref(false)

// ── Persistence across navigation ───────────────────
const ORDER_STORAGE_KEY = 'selectedNegotiationOrderId'

function saveSelectedOrderId(orderId) {
  if (orderId) sessionStorage.setItem(ORDER_STORAGE_KEY, orderId)
  else sessionStorage.removeItem(ORDER_STORAGE_KEY)
}

function getSavedOrderId() {
  return sessionStorage.getItem(ORDER_STORAGE_KEY)
}

// ── Auto-scroll ─────────────────────────────────────
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// ── Grouped messages ────────────────────────────────
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

// ── Helpers ─────────────────────────────────────────
function formatTime(dateValue) {
  if (!dateValue) return ''
  try {
    return new Date(dateValue).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
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
  if (!file) return ''
  if (file.url && file.url.startsWith('http')) return file.url
  if (file.path && file.path.startsWith('http')) return file.path
  if (file.path && (file.path.startsWith('beverage/') || file.path.includes('beverage/chat/'))) {
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vwrxijez'
    const cleanPath = file.path.replace(/^\/+/, '')
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${cleanPath}`
  }
  if (file.path && file.path.startsWith('uploads/')) {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    return `${baseURL}/${file.path.replace(/^\/+/, '')}`
  }
  return file.path || file.url || ''
}

function handleImageError(e) {
  e.target.onerror = null
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

// ── Shared file collector ──────────────────────────
// Both the file picker and the whole-page drop handler funnel through
// here so they enforce the same size limit and produce the same shape.
function addFiles(fileList) {
  const MAX_SIZE = 10 * 1024 * 1024
  const files = Array.from(fileList || [])
  let added = 0

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      showToast('error', `${file.name} exceeds 10MB limit`)
      continue
    }
    const fileData = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    }
    if (file.type?.startsWith('image/')) {
      fileData.previewUrl = URL.createObjectURL(file)
    }
    pendingAttachments.value.push(fileData)
    added++
  }

  return added
}

function handleFileSelect(event) {
  addFiles(event.target.files)
  event.target.value = ''
}

// ── Whole-page drag-to-attach ─────────────────────
// Only respond when the drag carries actual files. This prevents
// hijacking text drag-and-drop (selecting text and dragging it around
// stays native).

function _dragHasFiles(e) {
  const types = e.dataTransfer?.types
  if (!types) return false
  // DataTransfer.types is a DOMStringList in older browsers and an
  // array in modern ones. `.includes` works on both, `.indexOf` too.
  return typeof types.includes === 'function'
    ? types.includes('Files')
    : Array.from(types).includes('Files')
}

// Guard: don't hijack drags when a modal is open (the payment proof
// upload modal has its own image picker; a page-wide drop would be
// confusing there).
function _shouldHandleDrop() {
  if (showProofModal.value) return false
  // Only relevant when there's an active conversation to attach to
  if (!conversationId.value) return false
  return true
}

function onPageDragEnter(e) {
  if (!_dragHasFiles(e)) return
  if (!_shouldHandleDrop()) return
  e.preventDefault()
  pageDragDepth++
  if (pageDragDepth === 1) isDraggingFile.value = true
}

function onPageDragOver(e) {
  if (!_dragHasFiles(e)) return
  if (!_shouldHandleDrop()) return
  e.preventDefault()
  // Tell the OS we're accepting the drop
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onPageDragLeave(e) {
  if (!_dragHasFiles(e)) return
  if (!_shouldHandleDrop()) return
  e.preventDefault()
  // Dragging over a child element fires dragleave for the parent, so
  // count up/down instead of toggling the flag directly.
  pageDragDepth = Math.max(0, pageDragDepth - 1)
  if (pageDragDepth === 0) {
    isDraggingFile.value = false
  }
}

function onPageDrop(e) {
  if (!_dragHasFiles(e)) return
  if (!_shouldHandleDrop()) return
  e.preventDefault()
  pageDragDepth = 0
  isDraggingFile.value = false

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const added = addFiles(files)
  if (added > 0) {
    showToast(
      'success',
      added === 1 ? 'File attached' : `${added} files attached`,
    )
    // Bring the composer into view in case the user is scrolled up
    nextTick(() => {
      const composer = fileInput.value?.closest('.border-t')
      if (composer) composer.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }
}
function removeAttachment(index) {
  if (pendingAttachments.value[index]?.previewUrl) {
    URL.revokeObjectURL(pendingAttachments.value[index].previewUrl)
  }
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

function setReplyTo(msg) {
  replyToMessage.value = msg
  if (fileInput.value) fileInput.value?.focus()
}

function clearReply() {
  replyToMessage.value = null
}

const canUnsendMessage = (msg) => {
  if (msg.isDeleted) return false
  const isMine = (msg.senderType || msg.sender) === 'customer'
  if (!isMine) return false

  const msgTime = new Date(msg.createdAt || msg.timestamp).getTime()
  const ageInMinutes = (Date.now() - msgTime) / 60000
  return ageInMinutes <= 5
}

function openUnsendModal(msg) {
  unsendModal.value = { show: true, message: msg }
}

function closeUnsendModal() {
  unsendModal.value = { show: false, message: null }
}

// ── Pending orders ──────────────────────────────────
const loadPendingOrders = async () => {
  try {
    const resp = await ordersApi.getMyOrders()
    if (resp.success && resp.data) {
      myPendingOrders.value = resp.data.filter(
        (o) => o.status === 'Pending' && o.paymentStatus === 'Unpaid'
      )
    }
  } catch (e) {
    console.error('Error loading pending orders:', e)
  }
}

// ✅ NEW — Auto-select the most recent Pending order (convenience).
// If the customer only has ONE pending order (the common case), we skip
// the manual picker entirely and jump straight into the negotiation panel.
// If they have multiple, the picker stays visible so they can choose.
const autoSelectPendingOrder = async () => {
  // Don't override a user's saved choice
  if (selectedOrder.value) return

  // Nothing to select
  if (!myPendingOrders.value.length) return

  // Don't auto-select if we already have one saved in sessionStorage
  const savedId = getSavedOrderId()
  if (savedId && myPendingOrders.value.some((o) => o.orderId === savedId)) {
    return
  }

  // Pick the most recent Pending order (backend returns newest first)
  const latest = myPendingOrders.value[0]
  if (!latest) return

  // Wait for conversation to be ready
  if (!conversationId.value) {
    console.log('⏳ autoSelectPendingOrder: conversation not ready yet')
    return
  }

  // Reuse the existing picker flow, but skip the auto-greeting so the
  // customer isn't spammed with "Hi! I'd like to discuss..." on every
  // page navigation.
  showOrderPicker.value = latest.orderId
  await handlePickOrder(true)   // ← skipGreeting = true
}

const handlePickOrder = async (skipGreeting = false) => {
  const orderId = showOrderPicker.value
  if (!orderId) return
  const found = myPendingOrders.value.find((o) => o.orderId === orderId)
  if (!found) return

  // If we already have this order selected, skip the re-link + greeting
  const alreadySelected = selectedOrder.value?.orderId === orderId

  selectedOrder.value = found
  saveSelectedOrderId(orderId)

  if (!conversationId.value) {
    showToast('error', 'Conversation not ready yet')
    selectedOrder.value = null
    saveSelectedOrderId(null)
    return
  }

  // ✅ Link the order to the conversation, then reload the list so the
  // sidebar reflects the new order.
  const resp = await chatApi.linkOrderToConversation(conversationId.value, orderId)
  await loadConversationList()
  if (!resp.success) {
    showToast('error', resp.message || 'Failed to link order')
    selectedOrder.value = null
    saveSelectedOrderId(null)
    return
  }

  // ✅ Skip the auto-greeting if this was an automatic selection OR
  // the order was already selected (prevents duplicate greetings on
  // every page load / navigation).
  if (alreadySelected || skipGreeting) {
    return
  }

  // Send an automated greeting so the admin knows the customer wants to negotiate
  try {
    const messageContent =
      `Hi! I'd like to discuss the details of my order ${orderId}. ` +
      `Can we go over the pricing and any adjustments before proceeding? Thank you.`

    const sentMessage = await chatApi.sendMessage(
      conversationId.value,
      messageContent,
      null,
      null
    )

    if (sentMessage?.success && sentMessage.data) {
      const exists = messages.value.some(m => m.messageId === sentMessage.data.messageId)
      if (!exists) {
        messages.value.push(sentMessage.data)
        scrollToBottom()
      }
    }
  } catch (e) {
    console.error('Failed to send auto-message:', e)
  }

  showToast('success', 'Order shared with admin — waiting for their response')
}

const clearSelectedOrder = () => {
  selectedOrder.value = null
  saveSelectedOrderId(null)
  showOrderPicker.value = false
}

// ✅ Reopen the negotiation panel by restoring the last selected order
// (or the most recent pending order if there's no saved selection).
const reopenNegotiationPanel = () => {
  if (!myPendingOrders.value.length) {
    showToast('info', 'No pending orders to negotiate')
    return
  }

  // Try the last saved order first
  const savedId = getSavedOrderId()
  let order = savedId
    ? myPendingOrders.value.find((o) => o.orderId === savedId)
    : null

  // Fall back to the newest pending order
  if (!order) order = myPendingOrders.value[0]

  selectedOrder.value = order
  saveSelectedOrderId(order.orderId)
}

// ── Reference-number validation (method-aware) ──────
// The admin sets the method (gcash | bank_transfer) on the payment
// request message. We read it from the currently-selected request and
// apply the matching rule:
//   • gcash         → exactly 13 digits
//   • bank_transfer → exactly 18 alphanumeric characters
const paymentMethod = computed(() => {
  return selectedPaymentRequest.value?.paymentRequestData?.method || 'gcash'
})

const isBankTransfer = computed(() => paymentMethod.value === 'bank_transfer')

// Hard cap on raw input length. GCash is exactly 13 digits. Bank
// references can contain up to ~6 separators on top of the 18-char
// core, so 26 gives plenty of headroom — the sanitizer does the real
// truncation against the 18-char core.
const referenceMaxLength = computed(() => (isBankTransfer.value ? 26 : 13))
const referenceInputMode = computed(() =>
  isBankTransfer.value ? 'text' : 'numeric',
)

const referencePlaceholder = computed(() =>
  isBankTransfer.value
    ? 'e.g. 1234-5678-9012-3456-78'
    : 'e.g. 1234567890123',
)

const referenceHint = computed(() =>
  isBankTransfer.value
    ? 'Exactly 18 alphanumeric characters — hyphens and spaces are allowed'
    : 'Exactly 13 digits',
)

// Strip separators (hyphen, space, dot) and uppercase before validation.
// Bank references are commonly written as "1234-5678-9012-3456-78" or
// "1234 5678 9012 3456 78" — we want to accept both, so the length
// check runs against the sanitized 18-character core.
function normalizeReference(raw) {
  return String(raw || '').replace(/[\s\-\.]/g, '').toUpperCase()
}

// Full-string validator. Anchored so nothing sneaks in at the edges.
const isReferenceValid = computed(() => {
  const val = proofReference.value || ''
  if (isBankTransfer.value) {
    return /^[A-Za-z0-9]{18}$/.test(normalizeReference(val))
  }
  return /^\d{13}$/.test(val)
})

// Human-readable error that explains what's still missing.
const referenceError = computed(() => {
  const val = proofReference.value || ''

  if (!val) return 'Reference number is required'

  if (isBankTransfer.value) {
    const core = normalizeReference(val)
    if (core.length < 18) {
      const remaining = 18 - core.length
      return `Needs ${remaining} more character${remaining === 1 ? '' : 's'} (${core.length}/18)`
    }
    if (core.length > 18) {
      return 'Must be exactly 18 alphanumeric characters (separators not counted)'
    }
    if (!/^[A-Za-z0-9]+$/.test(core)) {
      return 'Letters and numbers only — hyphens and spaces are allowed'
    }
    return ''
  }

  // GCash
  if (val.length < 13) {
    const remaining = 13 - val.length
    return `Needs ${remaining} more digit${remaining === 1 ? '' : 's'} (${val.length}/13)`
  }
  if (val.length > 13) {
    return 'Must be exactly 13 digits'
  }
  if (!/^\d+$/.test(val)) {
    return 'Numbers only — no letters or symbols'
  }
  return ''
})

// Sanitize on every keystroke so the customer can't type an invalid
// character, but ALLOW hyphens / spaces / dots for bank references
// since real BDO receipts include them.
//   • GCash         → strip anything that isn't a digit (13 max)
//   • Bank transfer → allow letters, digits, and the three separators.
//                     Length is measured AFTER stripping separators,
//                     so "1234-5678-9012-3456-78" (18 digits + 4
//                     hyphens) is accepted exactly like the plain
//                     18-character form.
function handleReferenceInput(e) {
  let val = e.target.value || ''

  if (isBankTransfer.value) {
    // 1. Keep only letters, digits, and our three allowed separators
    val = val.replace(/[^A-Za-z0-9\s\-\.]/g, '').toUpperCase()
    // 2. Collapse runs of the same separator to a single char so
    //    "12--34" doesn't look sloppy
    val = val.replace(/([\s\-\.])\1+/g, '$1')
    // 3. Truncate: max 18 core characters, plus up to ~6 separators
    //    for readability (18 + 4 = 22 is realistic; 24 gives slack)
    const coreChars = val.replace(/[\s\-\.]/g, '')
    if (coreChars.length > 18) {
      // Trim from the end until the core is back at 18
      while (val.replace(/[\s\-\.]/g, '').length > 18) {
        val = val.slice(0, -1)
      }
    }
    if (val.length > 26) val = val.slice(0, 26)
  } else {
    val = val.replace(/\D/g, '').slice(0, 13)
  }

  proofReference.value = val
  // Sync the DOM element too in case the sanitizer removed characters
  // (e.g. user pasted "1234/5678" → we want the field to show the
  // sanitized value, not the original).
  if (e.target.value !== val) {
    e.target.value = val
  }
}

// ── Payment proof upload ────────────────────────────
function openPaymentProofModal(msg) {
  selectedPaymentRequest.value = msg
  proofReference.value = ''
  proofFile.value = null
  proofPreview.value = ''
  proofNote.value = ''
  referenceTouched.value = false
  showProofModal.value = true
}

function handleProofFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    showToast('error', 'Image exceeds 10MB limit')
    return
  }
  proofFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { proofPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

async function submitPaymentProof() {
  if (!proofFile.value || !selectedPaymentRequest.value) return
  if (!conversationId.value) {
    showToast('error', 'Conversation not ready')
    return
  }

  // ✅ Mark the reference field as touched so any pending error renders
  //    even if the customer never blurred the input.
  referenceTouched.value = true

  // ✅ Reject submission if the reference doesn't match the method's rule.
  //    The submit button is already disabled in that case, but this
  //    guard also covers Enter-key submits and programmatic calls.
  if (!isReferenceValid.value) {
    showToast('error', referenceError.value || 'Invalid reference number')
    return
  }

  isSubmittingProof.value = true
  try {
    // 1. Upload image to Cloudinary via existing chat upload endpoint
    const uploadResult = await chatApi.uploadFiles([proofFile.value])
    if (!uploadResult.success || !uploadResult.files?.length) {
      showToast('error', uploadResult.message || 'Failed to upload image')
      return
    }
    const proofImageUrl = uploadResult.files[0].path || uploadResult.files[0].url

    // 2. Send payment proof
    // Bank references often carry separators for readability. We
    // normalize to the raw 18-character core before sending so the
    // backend, admin panel, and receipts always see a consistent value.
    const normalizedReference = isBankTransfer.value
      ? normalizeReference(proofReference.value)
      : (proofReference.value || '').trim()

    const res = await chatApi.sendPaymentProof(conversationId.value, {
      paymentRequestMessageId: selectedPaymentRequest.value.messageId,
      referenceNumber: normalizedReference,
      proofImageUrl,
      note: proofNote.value.trim(),
    })

    if (res.success) {
      showToast('success', 'Payment proof submitted — awaiting review')
      showProofModal.value = false
      // The socket event will append the proof message; but if socket is down,
      // optimistically push it so it renders immediately
      if (res.data) {
        const exists = messages.value.some(m => m.messageId === res.data.messageId)
        if (!exists) messages.value.push(res.data)
      }
      // Flip the request status locally
      const idx = messages.value.findIndex(m => m.messageId === selectedPaymentRequest.value.messageId)
      if (idx !== -1) {
        messages.value[idx] = {
          ...messages.value[idx],
          paymentRequestData: {
            ...messages.value[idx].paymentRequestData,
            status: 'proof-submitted',
          },
        }
      }
      scrollToBottom()
    } else {
      showToast('error', res.message || 'Failed to submit proof')
    }
  } catch (e) {
    console.error('submitPaymentProof error:', e)
    showToast('error', 'Failed to submit proof')
  } finally {
    isSubmittingProof.value = false
  }
}


// ── Unsend ──────────────────────────────────────────
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
          content: 'This message was unsent',
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

// ── Messages ────────────────────────────────────────
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
        window.dispatchEvent(new CustomEvent('messageRead', {
          detail: { conversationId: conversationId.value },
        }))
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
      const filesToUpload = pendingAttachments.value
        .map(f => f.file || f)
        .filter(f => f instanceof File || f.name)
      if (filesToUpload.length === 0) {
        showToast('error', 'Invalid files selected')
        isSending.value = false
        return
      }
      const uploadResult = await chatApi.uploadFiles(filesToUpload)
      if (uploadResult.success && uploadResult.files) {
        uploadedFiles = uploadResult.files
      } else {
        showToast('error', uploadResult.message || 'Failed to upload files')
        isSending.value = false
        return
      }
    }

    const tempId = 'temp_' + Date.now()
    pendingTempId = tempId
    const replyToMsg = replyToMessage.value
    const replyToMessageId = replyToMsg?.messageId || null
    const tempAttachments = uploadedFiles.length > 0 ? uploadedFiles : []

    const tempMessage = {
      messageId: tempId,
      conversationId: conversationId.value,
      senderType: 'customer',
      senderId: customerId.value,
      content: content || (uploadedFiles.length > 0 ? '📎 Sent an attachment' : ''),
      attachments: tempAttachments,
      createdAt: new Date().toISOString(),
      isPending: true,
      isRead: false,
      replyTo: replyToMsg
        ? { messageId: replyToMsg.messageId, content: replyToMsg.content || '📎 Attachment' }
        : null,
    }
    messages.value.push(tempMessage)
    newMessage.value = ''
    clearReply()
    pendingAttachments.value = []
    await scrollToBottom()

    const messageContent = content || (uploadedFiles.length > 0 ? '📎 Attachment' : '')

    if (isSocketConnected.value && conversationId.value) {
      const sent = sendSocketMessage(conversationId.value, messageContent, uploadedFiles, replyToMessageId)
      if (!sent) {
        const response = await chatApi.sendMessage(conversationId.value, messageContent, uploadedFiles, replyToMessageId)
        if (response.success && response.data) {
          const index = messages.value.findIndex(m => m.messageId === tempId)
          if (index !== -1) messages.value[index] = { ...response.data, isPending: false }
          pendingTempId = null
        }
      }
    } else {
      const response = await chatApi.sendMessage(conversationId.value, messageContent, uploadedFiles, replyToMessageId)
      if (response.success && response.data) {
        const index = messages.value.findIndex(m => m.messageId === tempId)
        if (index !== -1) messages.value[index] = { ...response.data, isPending: false }
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

// ✅ UPDATED — Now accepts an optional `orderId` so we can open a
// specific per-order conversation directly.
async function initConversation(orderId = null) {
  try {
    const response = await chatApi.getOrCreateConversation('Customer Support', orderId)
    if (response.success && response.data) {
      conversationId.value = response.data.conversationId
      activeConversationId.value = response.data.conversationId
      console.log('🔍 [customer] conversationId set:', conversationId.value)

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

// ✅ NEW — Open (or create) the per-order conversation for a given orderId.
// Used by:
//   1. onMounted, when `?tab=<orderId>` is present in the URL
//   2. the route watcher, when the customer clicks another "Messages" link
//      from a different order without leaving the page
async function openConversationForOrder(orderId) {
  if (!orderId) return

  // Try to reuse an existing conversation for this order (any status —
  // ChatServices.getOrCreateConversation matches on customerId + orderId)
  const existing = conversations.value.find((c) => c.orderId === orderId)

  if (existing) {
    conversationId.value = existing.conversationId
    activeConversationId.value = existing.conversationId
    if (isSocketConnected.value) {
      joinConversation(existing.conversationId)
    }
    await loadMessages()

    // Restore the negotiation panel if the order is still Pending+Unpaid
    const pendingMatch = myPendingOrders.value.find((o) => o.orderId === orderId)
    if (pendingMatch) {
      selectedOrder.value = pendingMatch
      showOrderPicker.value = orderId
      saveSelectedOrderId(orderId)
    }
    return
  }

  // No cached conversation yet — let the backend find or create it.
  // getOrCreateConversation is per-order: if the order already has a
  // thread, it returns it; otherwise it creates a fresh one.
  try {
    const response = await chatApi.getOrCreateConversation('Customer Support', orderId)
    if (response.success && response.data) {
      conversationId.value = response.data.conversationId
      activeConversationId.value = response.data.conversationId

      if (isSocketConnected.value) {
        joinConversation(conversationId.value)
      }
      await loadMessages()

      // Refresh the sidebar so the new thread appears
      await loadConversationList()

      // Open the negotiation panel if applicable
      const pendingMatch = myPendingOrders.value.find((o) => o.orderId === orderId)
      if (pendingMatch) {
        selectedOrder.value = pendingMatch
        showOrderPicker.value = orderId
        saveSelectedOrderId(orderId)
      }
    }
  } catch (err) {
    console.error('openConversationForOrder failed:', err)
    showToast('error', 'Failed to open conversation')
  }
}

// ✅ NEW — Load all conversations for the customer (sidebar data)
async function loadConversationList() {
  isLoadingConversations.value = true
  try {
    const response = await chatApi.getMyConversations()
    if (response.success && Array.isArray(response.data)) {
      conversations.value = response.data.map((c) => ({
        conversationId: c.conversationId,
        orderId: c.orderId || null,
        subject: c.subject || 'General Inquiry',
        lastMessage: c.lastMessage || '',
        lastMessageAt: c.lastMessageAt || c.updatedAt,
        unreadCount: c.unreadCount || c.customerUnreadCount || 0,
        status: c.status,
      }))
    } else {
      conversations.value = []
    }
  } catch (error) {
    console.error('Error loading conversation list:', error)
    conversations.value = []
  } finally {
    isLoadingConversations.value = false
  }
}

// ✅ NEW — Switch to a specific conversation from the sidebar
async function selectConversationFromList(conv) {
  if (!conv?.conversationId) return

  // ✅ On mobile, switch to the chat view
  if (window.matchMedia('(max-width: 1023px)').matches) {
    mobileView.value = 'chat'
  }

  if (activeConversationId.value === conv.conversationId) return

  // Leave the current room
  conversationId.value = conv.conversationId
  activeConversationId.value = conv.conversationId

  // Clear local chat state
  messages.value = []
  replyToMessage.value = null
  pendingAttachments.value = []
  selectedOrder.value = null

  // Join + load
  if (isSocketConnected.value) {
    joinConversation(conv.conversationId)
  }
  await loadMessages()
  if (isSocketConnected.value) {
    markAsRead(conv.conversationId)
  }

  // If the conversation has a linked order, load it
  if (conv.orderId) {
    const found = myPendingOrders.value.find((o) => o.orderId === conv.orderId)
    if (found) {
      selectedOrder.value = found
      showOrderPicker.value = conv.orderId
      saveSelectedOrderId(conv.orderId)
    }
  }

  await scrollToBottom()
}

// ✅ NEW — Format relative time for the sidebar
function formatConversationTime(dateValue) {
  if (!dateValue) return ''
  const diff = Date.now() - new Date(dateValue).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateValue).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

// ── Socket listeners ────────────────────────────────
function setupSocketListeners() {

  onNewMessage((message) => {

    console.log('📩 [customer] onNewMessage received:', {
      messageId: message.messageId,
      contentType: message.contentType,
      conversationId: message.conversationId,
      senderType: message.senderType,
    })

    // ✅ Update sidebar preview in real time
    const sidebarConv = conversations.value.find(c => c.conversationId === message.conversationId)
    if (sidebarConv) {
      sidebarConv.lastMessage = message.content
      sidebarConv.lastMessageAt = message.createdAt || new Date().toISOString()
      if (message.senderType === 'admin' && activeConversationId.value !== message.conversationId) {
        sidebarConv.unreadCount = (sidebarConv.unreadCount || 0) + 1
      }
    }

    if (pendingTempId) {
      const index = messages.value.findIndex(m => m.messageId === pendingTempId)
      if (index !== -1) {
        messages.value[index] = {
          ...message,
          isPending: false,
          replyTo: message.replyTo || messages.value[index].replyTo,
        }
        pendingTempId = null
        scrollToBottom()
        return
      }
    }
    const exists = messages.value.some(m => m.messageId === message.messageId)
    if (!exists) {
      messages.value.push(message)
      scrollToBottom()
      if (conversationId.value && message.conversationId === conversationId.value) {
        markAsRead(conversationId.value)
      }
    }
    window.dispatchEvent(new CustomEvent('newMessageReceived', {
      detail: { conversationId: message.conversationId },
    }))
  })
  onMessageUnsent(({ messageId }) => {
    const index = messages.value.findIndex(m => m.messageId === messageId)
    if (index !== -1) {
      messages.value[index] = {
        ...messages.value[index],
        isDeleted: true,
        content: 'This message was unsent',
      }
    }
  })

  onPaymentRequestUpdated((updatedReq) => {
    if (!updatedReq) return
    const idx = messages.value.findIndex(m => m.messageId === updatedReq.messageId)
    if (idx !== -1) {
      messages.value[idx] = { ...messages.value[idx], paymentRequestData: updatedReq.paymentRequestData }
    }
  })

  onPaymentProofUpdated((updatedProof) => {
    if (!updatedProof) return
    const idx = messages.value.findIndex(m => m.messageId === updatedProof.messageId)
    if (idx !== -1) {
      messages.value[idx] = { ...messages.value[idx], paymentProofData: updatedProof.paymentProofData }
    }
  })

  onOrderNegotiationUpdated((updatedOrder) => {
    if (!updatedOrder) return
    if (selectedOrder.value?.orderId === updatedOrder.orderId) {
      if (updatedOrder.status === 'Pending' && updatedOrder.paymentStatus === 'Unpaid') {
        selectedOrder.value = updatedOrder
      } else {
        clearSelectedOrder()
      }
    }
  })

  onUserTyping(({ userType, isTyping: typing }) => {
    if (userType === 'admin') isTyping.value = typing
  })

  onError((error) => {
    console.error('Socket error:', error)
    showToast('error', error.message || 'Connection error')
  })
}

// ✅ NEW — React to `?tab=<orderId>` changes while the page is mounted.
// Scenario: the customer is already on Messages, then clicks a "Messages"
// link from another order's detail page. Vue Router reuses the component
// and only the query changes, so we need to re-open the target thread.
watch(
  () => (typeof route.query.tab === 'string' ? route.query.tab.trim() : ''),
  async (newOrderId, oldOrderId) => {
    if (!newOrderId || newOrderId === oldOrderId) return
    if (!isSocketConnected.value && !conversationId.value) return
    await openConversationForOrder(newOrderId)
    await scrollToBottom()
  }
)

// ── Watchers ────────────────────────────────────────
watch(() => messages.value.length, () => scrollToBottom(), { flush: 'post' })
watch(groupedMessages, () => scrollToBottom(), { flush: 'post' })
watch(isSocketConnected, (connected) => {
  console.log('🔍 [customer] isSocketConnected changed:', connected)
  if (connected && conversationId.value) {
    joinConversation(conversationId.value)
    markAsRead(conversationId.value)
  }
})
// ── Lifecycle ───────────────────────────────────────
onMounted(async () => {
  // Whole-page drag-to-attach — active only while Messages page is mounted
  window.addEventListener('dragenter', onPageDragEnter)
  window.addEventListener('dragover',  onPageDragOver)
  window.addEventListener('dragleave', onPageDragLeave)
  window.addEventListener('drop',      onPageDrop)

  if (token.value) {
    connectSocket(token.value, customerId.value, 'customer')
    setupSocketListeners()

    // DIAGNOSTIC: log socket state 1s after mount
    setTimeout(() => {
      console.log('🔍 [customer] socket state after 1s:', {
        isConnected: isSocketConnected.value,
        conversationId: conversationId.value,
      })
    }, 1000)
  }

  // ✅ Load the conversation list first (sidebar data)
  await loadConversationList()
  await loadPendingOrders()

  // ✅ Decide which conversation to open, in priority order:
  //
  //   1. `?tab=<orderId>` in the URL  — explicit "open this order's chat"
  //      (used by the "before any payment" note and any per-order Messages
  //      link in the customer flow).
  //   2. sessionStorage's last-selected order — restores the customer's
  //      previous context when they navigate away and back.
  //   3. The newest conversation in the sidebar.
  //   4. A fresh general conversation if the customer has none.
  const queryOrderId =
    typeof route.query.tab === 'string' ? route.query.tab.trim() : ''

  if (queryOrderId) {
    await openConversationForOrder(queryOrderId)
  } else {
    const savedOrderId = getSavedOrderId()
    const targetConv = savedOrderId
      ? conversations.value.find((c) => c.orderId === savedOrderId)
      : conversations.value[0]

    if (targetConv) {
      conversationId.value = targetConv.conversationId
      activeConversationId.value = targetConv.conversationId
      if (isSocketConnected.value) {
        joinConversation(targetConv.conversationId)
      }
      await loadMessages()

      if (targetConv.orderId) {
        const found = myPendingOrders.value.find((o) => o.orderId === targetConv.orderId)
        if (found) {
          selectedOrder.value = found
          showOrderPicker.value = targetConv.orderId
        }
      }
    } else {
      // No conversations at all — create a general one so the page isn't blank
      await initConversation()
      await loadConversationList()
    }
  }

  await nextTick()
  scrollToBottom()
})

onUnmounted(() => {
  if (typingTimeoutId) clearTimeout(typingTimeoutId)

  // Tear down the whole-page drop listeners so no other page inherits them
  window.removeEventListener('dragenter', onPageDragEnter)
  window.removeEventListener('dragover',  onPageDragOver)
  window.removeEventListener('dragleave', onPageDragLeave)
  window.removeEventListener('drop',      onPageDrop)
  pageDragDepth = 0
  isDraggingFile.value = false
})
</script>

<style scoped>
@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 0.8s ease-in-out infinite;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ────── Bottom sheet animation ────── */
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Fixed viewport heights so mobile browser chrome doesn't fight the layout */
@media (max-width: 1023px) {
  .min-h-0 {
    min-height: 0;
  }
}
</style>