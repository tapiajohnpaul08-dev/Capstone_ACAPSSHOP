<!-- Customer Side -->
<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style="height: calc(100vh - 140px)">

      <!-- Header -->
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
        </div>
      </div>

      <!-- Order picker + negotiation panel -->
      <div v-if="myPendingOrders.length > 0 || selectedOrder" class="shrink-0 px-4 pt-3 border-b bg-white">
        <div v-if="!selectedOrder" class="flex items-center gap-2 pb-3">
          <span class="text-xs font-semibold text-gray-500 whitespace-nowrap">Discuss an order:</span>
          <div class="flex-1 min-w-0">
            <select
              v-model="showOrderPicker"
              @change="handlePickOrder"
              class="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="false">Select a pending order…</option>
              <option v-for="o in myPendingOrders" :key="o.orderId" :value="o.orderId">
                {{ o.orderId }} — ₱{{ (o.amount || 0).toLocaleString() }}
              </option>
            </select>
          </div>
        </div>

        <div v-else class="pb-3">
          <NegotiationOrderPanel
            :order="selectedOrder"
            @clear="clearSelectedOrder"
          />
        </div>
      </div>

      <!-- Messages Container -->
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
                class="group"
              >

                <!-- ✅ SYSTEM MESSAGE — full-width centered pill -->
                <div
                  v-if="msg.contentType === 'system'"
                  class="w-full flex justify-center my-2"
                >
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="msg.isDeleted
                      ? 'bg-gray-100 text-gray-400 italic'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'"
                  >
                    {{ msg.content }}
                  </span>
                </div>

                                <!-- 💳 PAYMENT REQUEST CARD -->
                <div
                  v-else-if="msg.contentType === 'payment-request'"
                  class="w-full flex justify-start my-2"
                >
                  <div class="max-w-md w-full bg-white border-2 border-amber-200 rounded-2xl shadow-sm overflow-hidden">
                    <div class="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-600">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                      <span class="font-bold text-amber-800 text-sm">Payment Request</span>
                      <span
                        v-if="msg.paymentRequestData?.status"
                        class="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        :class="{
                          'bg-yellow-200 text-yellow-800': msg.paymentRequestData.status === 'pending',
                          'bg-blue-200 text-blue-800': msg.paymentRequestData.status === 'proof-submitted',
                          'bg-green-200 text-green-800': msg.paymentRequestData.status === 'verified',
                          'bg-red-200 text-red-800': msg.paymentRequestData.status === 'rejected',
                          'bg-gray-200 text-gray-700': msg.paymentRequestData.status === 'superseded',
                        }"
                      >
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
                      <p
                        v-if="msg.paymentRequestData?.notes"
                        class="text-xs text-gray-500 italic pt-2 border-t border-gray-100"
                      >
                        {{ msg.paymentRequestData.notes }}
                      </p>

                      <!-- CTA -->
                      <button
                        v-if="msg.paymentRequestData?.status === 'pending'"
                        @click="openPaymentProofModal(msg)"
                        class="w-full mt-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
                      >
                        I've Paid — Upload Proof
                      </button>
                      <div
                        v-else-if="msg.paymentRequestData?.status === 'proof-submitted'"
                        class="text-xs text-blue-600 text-center pt-2"
                      >
                        Proof submitted — awaiting admin review
                      </div>
                      <div
                        v-else-if="msg.paymentRequestData?.status === 'verified'"
                        class="text-xs text-green-600 text-center pt-2"
                      >
                        ✓ Payment verified — order confirmed
                      </div>
                      <div
                        v-else-if="msg.paymentRequestData?.status === 'rejected'"
                        class="text-xs text-red-600 text-center pt-2"
                      >
                        ✗ Payment rejected{{ msg.paymentRequestData.rejectionReason ? `: ${msg.paymentRequestData.rejectionReason}` : '' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 🧾 PAYMENT PROOF CARD (customer's own) -->
                <div
                  v-else-if="msg.contentType === 'payment-proof'"
                  class="w-full flex justify-end my-2"
                >
                  <div class="max-w-md w-full bg-blue-50 border border-blue-200 rounded-2xl shadow-sm overflow-hidden">
                    <div class="px-4 py-3 border-b border-blue-200 flex items-center justify-between">
                      <span class="font-bold text-blue-800 text-sm">Payment Proof Submitted</span>
                      <span
                        class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        :class="{
                          'bg-yellow-200 text-yellow-800': msg.paymentProofData?.status === 'pending-review',
                          'bg-green-200 text-green-800': msg.paymentProofData?.status === 'approved',
                          'bg-red-200 text-red-800': msg.paymentProofData?.status === 'rejected',
                        }"
                      >
                        {{ (msg.paymentProofData?.status || '').replace('-', ' ') }}
                      </span>
                    </div>
                    <div class="p-4 space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-500">Amount</span>
                        <span class="font-semibold">₱{{ (msg.paymentProofData?.amountPaid || 0).toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Reference</span>
                        <span class="font-mono text-xs">{{ msg.paymentProofData?.referenceNumber || '—' }}</span>
                      </div>
                      <img
                        v-if="msg.paymentProofData?.proofImageUrl"
                        :src="msg.paymentProofData.proofImageUrl"
                        alt="Proof"
                        class="w-full rounded-lg border border-blue-200 cursor-pointer"
                        @click="openImageViewer(msg.paymentProofData.proofImageUrl)"
                      />
                    </div>
                  </div>
                </div>

                <!-- QUOTE / REGULAR message row -->
                <div
                  v-else
                  class="flex items-start"
                  :class="msg.senderType === 'customer' ? 'justify-end' : 'justify-start'"
                >

                  <!-- Avatar for admin (left side) -->
                  <div v-if="msg.senderType === 'admin'" class="flex-shrink-0 mr-2 mt-1">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                      <span class="text-white text-xs font-bold">A</span>
                    </div>
                  </div>

                  <!-- Reply + unsend — CUSTOMER's own messages, LEFT of bubble -->
                  <div
                    v-if="msg.senderType === 'customer' && !msg.isDeleted"
                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center mr-2"
                  >
                    <button @click="setReplyTo(msg)" class="p-1.5 rounded-full hover:bg-gray-200 transition-colors" title="Reply">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 hover:text-blue-600">
                        <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z"/>
                        <path d="M21 15l-5-5 5-5"/>
                      </svg>
                    </button>
                    <button
                      v-if="canUnsendMessage(msg)"
                      @click="openUnsendModal(msg)"
                      class="p-1.5 rounded-full hover:bg-red-100 transition-colors"
                      title="Unsend"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 hover:text-red-600">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Regular bubble -->
                  <div
                    class="relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm"
                    :class="msg.senderType === 'customer'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'"
                  >
                    <!-- Reply indicator -->
                    <div
                      v-if="msg.replyTo"
                      class="text-xs mb-1.5 p-1.5 rounded"
                      :class="msg.senderType === 'customer' ? 'bg-blue-500 bg-opacity-20' : 'bg-gray-100'"
                    >
                      <span class="text-[10px] opacity-70">↩️ Replying to:</span>
                      <p class="text-xs truncate max-w-[200px]" :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-500'">
                        {{ msg.replyTo.content }}
                      </p>
                    </div>

                    <!-- Text content -->
                    <p v-if="msg.content && !msg.isDeleted" class="text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>

                    <!-- Unsend indicator -->
                    <p v-if="msg.isDeleted" class="text-sm italic" :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'">
                      This message was unsent
                    </p>

                    <!-- Attachments -->
                    <div v-if="msg.attachments?.length && !msg.isDeleted" class="mt-2 space-y-2">
                      <div v-for="(file, idx) in msg.attachments" :key="idx">
                        <img
                          v-if="isImageFile(file)"
                          :src="getFileUrl(file)"
                          :alt="file.name || 'Image'"
                          class="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          @click="openImageViewer(getFileUrl(file))"
                          @error="handleImageError"
                        />
                        <div v-else class="flex items-center gap-2 p-2 rounded-lg" :class="msg.senderType === 'customer' ? 'bg-blue-700' : 'bg-gray-100'">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="msg.senderType === 'customer' ? 'text-blue-300' : 'text-gray-500'">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <a :href="getFileUrl(file)" target="_blank" class="text-sm hover:underline truncate flex-1" :class="msg.senderType === 'customer' ? 'text-blue-100' : 'text-blue-600'">
                            {{ file.name || 'Download' }}
                          </a>
                        </div>
                      </div>
                    </div>

                    <!-- Timestamp -->
                    <div class="flex items-center gap-1 mt-1.5 justify-end">
                      <span class="text-[10px]" :class="msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'">
                        {{ formatTime(msg.createdAt || msg.timestamp) }}
                      </span>
                    </div>
                  </div>

                  <!-- Reply — ADMIN messages only, RIGHT of bubble -->
                  <div
                    v-if="msg.senderType === 'admin' && !msg.isDeleted"
                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2"
                  >
                    <button @click="setReplyTo(msg)" class="p-1.5 rounded-full hover:bg-gray-200 transition-colors" title="Reply">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 hover:text-blue-600">
                        <path d="M3 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z"/>
                        <path d="M21 15l-5-5 5-5"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Avatar for customer (right side) -->
                  <div v-if="msg.senderType === 'customer'" class="flex-shrink-0 ml-2 mt-1">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
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

      <!-- Input Area -->
      <div class="border-t bg-white p-4 shrink-0">
        <div v-if="pendingAttachments.length > 0" class="mb-3 flex flex-wrap gap-2">
          <div v-for="(file, idx) in pendingAttachments" :key="idx" class="relative bg-gray-50 rounded-lg p-2 flex items-center gap-2 border">
            <img v-if="file.previewUrl" :src="file.previewUrl" class="w-10 h-10 object-cover rounded" />
            <svg v-else-if="file.type?.startsWith('image/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500">
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

          <div class="flex-1 relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="newMessage += '\n'"
              rows="1"
              placeholder="Type your message..."
              class="w-full min-h-[42px] max-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              @input="handleTyping"
            ></textarea>
          </div>

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

    <!-- Image Viewer -->
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

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
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

    <div v-if="showProofModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" @click.self="showProofModal = false">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
    <h3 class="text-lg font-bold mb-4">Upload Payment Proof</h3>

    <div class="space-y-3">
      <div class="bg-amber-50 rounded-lg p-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Amount Due</span>
          <span class="font-bold text-amber-700">₱{{ selectedPaymentRequest.paymentRequestData.amountDue.toLocaleString() }}</span>
        </div>
        <p class="text-[10px] text-gray-500 mt-1">This amount is set by the seller and cannot be changed.</p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Reference Number</label>
        <input v-model="proofReference" type="text" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 1234567890" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Upload Receipt / Screenshot</label>
        <input ref="proofFileInput" type="file" accept="image/*" class="hidden" @change="handleProofFileSelect" />
        <button @click="proofFileInput?.click()" class="w-full py-2 border-2 border-dashed rounded-lg text-sm text-gray-500 hover:border-blue-400">
          {{ proofFile ? proofFile.name : 'Choose image…' }}
        </button>
        <img v-if="proofPreview" :src="proofPreview" class="mt-2 w-full max-h-40 object-contain rounded-lg border" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Note (optional)</label>
        <textarea v-model="proofNote" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm resize-none"></textarea>
      </div>
    </div>

    <div class="flex gap-3 mt-5">
      <button @click="showProofModal = false" class="flex-1 py-2 border rounded-lg text-sm font-semibold">Cancel</button>
      <button @click="submitPaymentProof" :disabled="!proofFile || isSubmittingProof" class="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
        {{ isSubmittingProof ? 'Submitting…' : 'Submit' }}
      </button>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useSocket } from '@/composables/useSocket'
import { chatApi, ordersApi } from '@/api'

import NegotiationOrderPanel from '@/components/chat/NegotiationOrderPanel.vue'

const { userInitial, customerId, token } = useAuth()
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

// ── Payment proof modal state ───────────────────────
const showProofModal = ref(false)
const selectedPaymentRequest = ref(null)
const proofReference = ref('')
const proofFile = ref(null)
const proofPreview = ref('')
const proofNote = ref('')
const isSubmittingProof = ref(false)
const proofFileInput = ref(null)

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

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  const MAX_SIZE = 10 * 1024 * 1024
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
  }
  event.target.value = ''
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

function canUnsendMessage(msg) {
  if (msg.isDeleted) return false
  if (msg.senderType !== 'customer') return false
  const ageInMinutes = (Date.now() - new Date(msg.createdAt).getTime()) / 60000
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

const handlePickOrder = async () => {
  const orderId = showOrderPicker.value
  if (!orderId) return
  const found = myPendingOrders.value.find((o) => o.orderId === orderId)
  if (!found) return

  selectedOrder.value = found
  saveSelectedOrderId(orderId)

  if (!conversationId.value) {
    showToast('error', 'Conversation not ready yet')
    selectedOrder.value = null
    saveSelectedOrderId(null)
    return
  }

  const resp = await chatApi.linkOrderToConversation(conversationId.value, orderId)
  if (!resp.success) {
    showToast('error', resp.message || 'Failed to link order')
    selectedOrder.value = null
    saveSelectedOrderId(null)
    return
  }

  showToast('success', 'Order shared with admin — waiting for their response')
}

const clearSelectedOrder = () => {
  selectedOrder.value = null
  saveSelectedOrderId(null)
  showOrderPicker.value = false
}

// ── Payment proof upload ────────────────────────────
function openPaymentProofModal(msg) {
  selectedPaymentRequest.value = msg
  proofReference.value = ''
  proofFile.value = null
  proofPreview.value = ''
  proofNote.value = ''
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
    const res = await chatApi.sendPaymentProof(conversationId.value, {
      paymentRequestMessageId: selectedPaymentRequest.value.messageId,
      referenceNumber: proofReference.value.trim(),
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

// ── Socket listeners ────────────────────────────────
function setupSocketListeners() {
  onNewMessage((message) => {
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

// ── Watchers ────────────────────────────────────────
watch(() => messages.value.length, () => scrollToBottom(), { flush: 'post' })
watch(groupedMessages, () => scrollToBottom(), { flush: 'post' })
watch(isSocketConnected, (connected) => {
  if (connected && conversationId.value) {
    joinConversation(conversationId.value)
    markAsRead(conversationId.value)
  }
})

// ── Lifecycle ───────────────────────────────────────
onMounted(async () => {
  if (token.value) {
    connectSocket(token.value, customerId.value, 'customer')
    setupSocketListeners()
  }

  await initConversation()
  await loadPendingOrders()

  // Restore previously picked order
  const savedId = getSavedOrderId()
  if (savedId) {
    const found = myPendingOrders.value.find((o) => o.orderId === savedId)
    if (found) {
      selectedOrder.value = found
      showOrderPicker.value = savedId
      if (conversationId.value) {
        await chatApi.linkOrderToConversation(conversationId.value, savedId)
      }
    } else {
      // Order no longer negotiable — clear it
      saveSelectedOrderId(null)
    }
  }

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

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>