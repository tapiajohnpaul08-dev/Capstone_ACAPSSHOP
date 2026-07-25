<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="order">
      <!-- Back Button -->
      <button @click="goBack" class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Back to Orders
      </button>

      <!-- Order Header -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-5 bg-gradient-to-r from-blue-50 to-white border-b">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold">{{ order.orderNumber || order.orderId || 'Order #' + order.id }}</h1>
                <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusBadgeClass">
                  {{ formatStatus(order.status) }}
                </span>
                <span v-if="order.delayBadge" class="px-3 py-1 rounded-full text-sm font-medium border border-orange-600 text-orange-600 bg-orange-50 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Delayed
                </span>
              </div>
              <p class="text-gray-600 mt-1">{{ formatDate(order.createdAt || order.date) }}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Total Amount</div>
              <div class="text-2xl font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium" :class="paymentBadgeClass">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
          <div>
            <div class="text-xs text-gray-500">Items</div>
            <div class="font-semibold">{{ order.items?.length || 1 }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Total Quantity</div>
            <div class="font-semibold">{{ getTotalQuantity().toLocaleString() }} pcs</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Supply Type</div>
            <div class="font-semibold flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                <path d="M12 22V12"/>
                <polyline points="3.29 7 12 12 20.71 7"/>
              </svg>
              {{ order.isProvided ? 'Own Cups' : 'Company Cups' }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Receiving Method</div>
            <div class="font-semibold flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Design Details Section -->
      <div v-if="hasDesignDetails" class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <h3 class="font-semibold">Design Details</h3>
          </div>
        </div>
        <div class="p-6">
          <div v-for="(item, idx) in order.items" :key="idx" class="border-b last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
            <div v-if="item.design || item.printSize || item.printPlacement || item.designNotes || item.files?.length" class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">{{ item.name }}</span>
                <span class="text-xs text-gray-400">({{ item.size }})</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                <!-- Design Source -->
                <div>
                  <div class="text-xs text-gray-500">Design Source</div>
                  <div class="font-medium text-sm capitalize flex items-center gap-1">
                    {{ getDesignSourceLabel(item.designSource || item.design?.source) }}
                  </div>
                </div>

                <!-- Print Size -->
                <div v-if="item.printSize || item.design?.printSize">
                  <div class="text-xs text-gray-500">Print Size</div>
                  <div class="font-medium text-sm">{{ item.printSize || item.design?.printSize }}</div>
                </div>

                <!-- Print Placement -->
                <div v-if="item.printPlacement || item.design?.printPlacement">
                  <div class="text-xs text-gray-500">Print Placement</div>
                  <div class="font-medium text-sm">{{ formatPlacement(item.printPlacement || item.design?.printPlacement) }}</div>
                </div>

                <!-- Design Notes -->
                <div v-if="item.designNotes || item.design?.designNotes" class="md:col-span-2">
                  <div class="text-xs text-gray-500">Design Notes</div>
                  <div class="font-medium text-sm">{{ item.designNotes || item.design?.designNotes }}</div>
                </div>

                <!-- Uploaded Files -->
                <div v-if="(item.files && item.files.length > 0) || (item.design?.files && item.design.files.length > 0)" class="md:col-span-2">
                  <div class="text-xs text-gray-500">Uploaded Files</div>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <a
                      v-for="(file, fIdx) in (item.files || item.design?.files || [])"
                      :key="fIdx"
                      :href="getFileUrl(file.path || file.url)"
                      target="_blank"
                      class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs hover:bg-blue-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {{ file.name || `File ${fIdx + 1}` }}
                    </a>
                  </div>
                </div>

                <!-- Selected Template -->
                <div v-if="item.selectedTemplateId || item.design?.selectedTemplateId" class="md:col-span-2">
                  <div class="text-xs text-gray-500">Selected Template</div>
                  <div class="font-medium text-sm">{{ item.selectedTemplate?.name || item.design?.selectedTemplate?.name || 'Template #' + (item.selectedTemplateId || item.design?.selectedTemplateId) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">No design details available for this item</div>
          </div>
        </div>
      </div>

      <!-- Order Items Section -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <h3 class="font-semibold">Order Items ({{ order.items?.length || 1 }})</h3>
          </div>
        </div>
        
        <div v-if="order.items && order.items.length > 0" class="divide-y">
          <div v-for="(item, idx) in order.items" :key="idx" class="p-5 hover:bg-gray-50 transition-colors">
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <img 
                  v-if="!order.isProvided"
                  :src="getImageUrl(item.image || order.image)" 
                  :alt="item.name || 'Product'" 
                  class="w-20 h-20 object-cover rounded-lg border"
                  @error="handleImageError"
                />
                <div v-else class="w-20 h-20 bg-purple-100 rounded-lg border flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-purple-600">
                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                    <path d="M12 22V12"/>
                    <polyline points="3.29 7 12 12 20.71 7"/>
                  </svg>
                </div>
              </div>

              <!-- Item Details -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap justify-between gap-2">
                  <div>
                    <div class="font-semibold text-gray-900">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">{{ item.category || 'Custom' }} • {{ item.size || 'N/A' }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-blue-600">{{ formatPrice(item.estimatedTotal || item.totalPrice) }}</div>
                    <div class="text-sm text-gray-500">Qty: {{ formatNumber(item.quantity) }} pcs</div>
                  </div>
                </div>

                <!-- Quick Design Info -->
                <div class="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  <span v-if="item.printPlacement || item.design?.printPlacement" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                    {{ formatPlacement(item.printPlacement || item.design?.printPlacement) }}
                  </span>
                  <span v-if="item.printSize || item.design?.printSize" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {{ item.printSize || item.design?.printSize }}
                  </span>
                  <span v-if="item.designSource || item.design?.source" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                    {{ getDesignSourceLabel(item.designSource || item.design?.source) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Single product legacy format -->
        <div v-else-if="order.product" class="p-5">
          <div class="flex flex-col md:flex-row gap-4">
            <img 
              :src="getImageUrl(order.image)" 
              :alt="order.product" 
              class="w-20 h-20 object-cover rounded-lg border"
              @error="handleImageError"
            />
            <div class="flex-1">
              <div class="font-semibold text-gray-900">{{ order.product }}</div>
              <div class="text-sm text-gray-500">Quantity: {{ formatNumber(order.quantity) }} pcs • Size: {{ order.sizes || 'N/A' }}</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <span class="font-semibold">Order Total</span>
          <div class="text-right">
            <div class="text-2xl font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
            <div class="text-xs text-gray-500">Including all items</div>
          </div>
        </div>
      </div>

      <!-- Customer Information Section -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <h3 class="font-semibold">Customer Information</h3>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Full Name</div>
            <div class="font-medium">{{ order.customerName || order.customer?.name || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Company</div>
            <div class="font-medium">{{ order.company || order.customer?.company || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Email</div>
            <div class="font-medium text-blue-600">{{ order.customerEmail || order.customer?.email || 'N/A' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Phone</div>
            <div class="font-medium">{{ order.customerPhone || order.customer?.phone || 'N/A' }}</div>
          </div>
          <div class="md:col-span-2">
            <div class="text-xs text-gray-500">Address</div>
            <div class="font-medium">{{ order.address || order.customer?.address || order.deliveryAddress || 'N/A' }}</div>
          </div>
          <div v-if="order.postalCode">
            <div class="text-xs text-gray-500">Postal Code</div>
            <div class="font-medium">{{ order.postalCode }}</div>
          </div>
        </div>
      </div>

      <!-- Fulfillment Information -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <h3 class="font-semibold">Fulfillment Details</h3>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Method</div>
            <div class="font-medium capitalize flex items-center gap-2">
              
              {{ order.receivingMode || order.deliveryMethod || order.fulfillment?.method || 'N/A' }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Expected Delivery</div>
            <div class="font-medium">{{ order.expectedDelivery || 'N/A' }}</div>
          </div>
          <div v-if="order.preferredDate">
            <div class="text-xs text-gray-500">Preferred Date</div>
            <div class="font-medium">{{ formatDate(order.preferredDate) }}</div>
          </div>
          <div v-if="order.preferredTime">
            <div class="text-xs text-gray-500">Preferred Time</div>
            <div class="font-medium">{{ order.preferredTime }}</div>
          </div>
          <div v-if="order.receivingMode === 'Delivery' || order.deliveryMethod === 'Delivery'" class="md:col-span-2">
            <div class="text-xs text-gray-500">Delivery Address</div>
            <div class="font-medium">{{ order.address || order.deliveryAddress || order.fulfillment?.deliveryAddress || 'N/A' }}</div>
          </div>
          <div v-if="order.receivingMode === 'Pick-up' || order.deliveryMethod === 'Pick-up'" class="md:col-span-2">
            <div class="text-xs text-gray-500">Pickup Location</div>
            <div class="font-medium">{{ order.fulfillment?.pickupLocation || 'ACAPSHOP — Main Store, 123 Printing Ave., Manila' }}</div>
          </div>
        </div>
      </div>

      <!-- Order Timeline -->
      <div class="bg-white rounded-xl border overflow-hidden mb-6">
        <div class="px-6 py-4 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3 class="font-semibold">Order Timeline</h3>
          </div>
        </div>
        <div class="p-6">
          <div v-if="order.statusHistory && order.statusHistory.length" class="space-y-0 relative">
            <!-- Vertical Line -->
            <div class="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div v-for="(event, index) in order.statusHistory" :key="index" class="relative pl-10 pb-6 last:pb-0">
              <!-- Timeline Dot -->
              <div class="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center" :class="getTimelineIconColor(event.status)">
                <component :is="getTimelineIcon(event.status)" class="w-3.5 h-3.5" />
              </div>
              
              <div class="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <span class="font-medium text-gray-900">{{ formatStatus(event.status) }}</span>
                  <p v-if="event.notes" class="text-sm text-gray-600 mt-0.5">{{ event.notes }}</p>
                  <p v-if="event.updatedBy && event.updatedBy !== 'null'" class="text-xs text-gray-400 mt-0.5">Updated by: {{ event.updatedBy }}</p>
                </div>
                <span class="text-xs text-gray-500 whitespace-nowrap">{{ formatDate(event.timestamp) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-4">
            No timeline available
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3">
        <button @click="contactSupport" class="flex-1 min-w-[120px] px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Contact Support
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'completed'" 
          @click="submitFeedback" 
          class="flex-1 min-w-[120px] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Submit Feedback
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'scheduled'" 
          @click="showCancelConfirm = true" 
          class="flex-1 min-w-[120px] px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Cancel Order
        </button>
        
        <button 
          v-if="order.status?.toLowerCase() === 'cancelled'" 
          @click="orderAgain" 
          class="flex-1 min-w-[120px] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          Order Again
        </button>

        <button 
          @click="printOrder" 
          class="flex-1 min-w-[120px] px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M18 9H6"/>
            <path d="M6 15H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="15" width="12" height="6" rx="1"/>
          </svg>
          Print Order
        </button>
      </div>

      <!-- Order Notes -->
      <div v-if="order.notes" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-yellow-600 mt-0.5">
            <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <div>
            <div class="text-xs font-medium text-yellow-800">Order Notes</div>
            <div class="text-sm text-yellow-700">{{ order.notes }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Order Not Found -->
    <div v-else class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-4">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="text-gray-500 text-lg">Order not found</p>
      <p class="text-gray-400 text-sm mt-1">The order you're looking for doesn't exist or has been removed.</p>
      <button @click="goBack" class="mt-4 text-blue-600 hover:underline">Back to Orders</button>
    </div>

    <!-- Cancel Confirmation Modal -->
    <ConfirmationModal
      v-model:visible="showCancelConfirm"
      title="Cancel Order"
      :message="`Are you sure you want to cancel ${order?.orderNumber || order?.orderId}? This cannot be undone.`"
      type="danger"
      close-label="Keep Order"
      confirm-label="Cancel Order"
      confirm-loading-label="Cancelling..."
      :is-loading="isCancelling"
      @confirm="handleCancel"
      @close="showCancelConfirm = false"
    />

    <!-- Feedback Modal -->
    <FeedbackModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :status="feedbackStatus"
      :message="feedbackMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders.js'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── TIMELINE ICONS ──────────────────────────────────────────────────────
const ClockIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) }
const CalendarIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })]) }
const PackageIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }), h('path', { d: 'M12 22V12' }), h('polyline', { points: '3.29 7 12 12 20.71 7' })]) }
const TruckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }), h('path', { d: 'M15 18H9' }), h('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }), h('circle', { cx: '17', cy: '18', r: '2' }), h('circle', { cx: '7', cy: '18', r: '2' })]) }
const CheckCircleIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), h('polyline', { points: '22 4 12 14.01 9 11.01' })]) }
const XIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })]) }

const route = useRoute()
const router = useRouter()
const { fetchOrder, cancelOrder } = useOrders()

// ─── STATE ──────────────────────────────────────────────────────────────
const order = ref(null)
const isLoading = ref(true)
const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

// ─── COMPUTED ──────────────────────────────────────────────────────────
const hasDesignDetails = computed(() => {
  if (!order.value?.items) return false
  return order.value.items.some(item => 
    item.design || 
    item.printSize || 
    item.printPlacement || 
    item.designNotes || 
    item.files?.length ||
    item.selectedTemplateId
  )
})

// ─── HELPERS ──────────────────────────────────────────────────────────
function getTotalQuantity() {
  if (!order.value?.items) return order.value?.quantity || 0
  return order.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

function getDesignSourceLabel(source) {
  const labels = {
    'upload': 'Uploaded File',
    'saved': 'Saved Template',
    'no-design': 'Design by Description'
  }
  return labels[source] || source || 'N/A'
}

function getTimelineIcon(status) {
  const statusLower = status?.toLowerCase() || ''
  const icons = {
    'pending': ClockIcon,
    'scheduled': CalendarIcon,
    'in production': PackageIcon,
    'out for delivery': TruckIcon,
    'completed': CheckCircleIcon,
    'cancelled': XIcon
  }
  return icons[statusLower] || ClockIcon
}

function getTimelineIconColor(status) {
  const statusLower = status?.toLowerCase() || ''
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-600',
    'scheduled': 'bg-blue-100 text-blue-600',
    'in production': 'bg-purple-100 text-purple-600',
    'out for delivery': 'bg-green-100 text-green-600',
    'completed': 'bg-green-100 text-green-600',
    'cancelled': 'bg-red-100 text-red-600'
  }
  return colors[statusLower] || 'bg-gray-100 text-gray-600'
}

function getFileUrl(path) {
  if (!path) return '#'
  if (path.startsWith('http')) return path
  const cleanPath = path.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  return `${API_BASE_URL}/uploads/${cleanPath}`
}

// ─── FORMATTING FUNCTIONS ────────────────────────────────────────────
function getImageUrl(imagePath) {
  if (!imagePath) return '/placeholder-image.png'
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = '/placeholder-image.png'
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending Review',
    'scheduled': 'Scheduled for Production',
    'in production': 'In Production',
    'out for delivery': 'Out for Delivery',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status?.toLowerCase()] || status || 'Pending'
}

function formatPlacement(placement) {
  if (!placement) return 'Standard'
  const map = {
    'back-only': 'Back Only',
    'front-only': 'Front Only',
    'both': 'Front & Back',
    'full-wrap': 'Full Wrap',
    'wrap-around': 'Wrap Around',
    'top-bottom': 'Top & Bottom'
  }
  return map[placement?.toLowerCase()] || placement
}

function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) return '₱0'
  return `₱${Number(price).toLocaleString()}`
}

function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0'
  return Number(value).toLocaleString()
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

// ─── BADGE CLASSES ────────────────────────────────────────────────────
const statusBadgeClass = computed(() => {
  const status = order.value?.status?.toLowerCase() || ''
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'in production': 'bg-purple-100 text-purple-800',
    'out for delivery': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

const paymentBadgeClass = computed(() => {
  const status = order.value?.paymentStatus
  const classes = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial': 'bg-orange-100 text-orange-800',
    'Unpaid': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

// ─── ACTIONS ──────────────────────────────────────────────────────────
function goBack() { 
  router.push('/customer/orders') 
}

function contactSupport() { 
  window.location.href = 'mailto:support@acapshop.com?subject=Order Support'
}

function printOrder() {
  window.print()
}

function orderAgain() {
  if (order.value.items && order.value.items.length > 1) {
    const itemsToReorder = order.value.items.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      category: item.category,
      size: item.size,
      quantity: item.quantity,
      printPlacement: item.printPlacement || '',
      printSize: item.printSize || '',
      designNotes: item.designNotes || '',
      inStock: true
    }))
    sessionStorage.setItem('pendingCart', JSON.stringify(itemsToReorder))
    router.push('/customer/orders/create?type=company-product&source=cart')
  } else if (order.value.items && order.value.items.length === 1) {
    const item = order.value.items[0]
    if (item.productId) {
      router.push(`/customer/orders/create?type=company-product&productId=${item.productId}`)
    } else if (order.value.isProvided) {
      const ownCupsData = {
        productType: item.name,
        quantity: item.quantity,
        sizes: item.size,
        specifications: item.designNotes || ''
      }
      sessionStorage.setItem('pendingOwnCups', JSON.stringify(ownCupsData))
      router.push('/customer/orders/create?type=own-cups')
    }
  } else if (order.value.productId) {
    router.push(`/customer/orders/create?type=company-product&productId=${order.value.productId}`)
  } else if (order.value.isProvided) {
    const ownCupsData = {
      productType: order.value.product,
      quantity: order.value.quantity,
      sizes: order.value.sizes,
      specifications: ''
    }
    sessionStorage.setItem('pendingOwnCups', JSON.stringify(ownCupsData))
    router.push('/customer/orders/create?type=own-cups')
  } else {
    router.push('/customer/dashboard')
  }
}

function submitFeedback() {
  alert('Feedback feature coming soon!')
}

async function handleCancel() {
  isCancelling.value = true
  const res = await cancelOrder(order.value.id)
  isCancelling.value = false
  showCancelConfirm.value = false
  if (res.success) {
    order.value.status = 'cancelled'
    feedbackTitle.value = 'Order Cancelled'
    feedbackMessage.value = 'Your cancellation request has been processed.'
    feedbackStatus.value = 'success'
  } else {
    feedbackTitle.value = 'Cancellation Failed'
    feedbackMessage.value = res.message || 'Something went wrong.'
    feedbackStatus.value = 'error'
  }
  feedbackVisible.value = true
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────
onMounted(async () => {
  const res = await fetchOrder(route.params.id)
  if (res.success) {
    order.value = res.order
    // Ensure items array exists for backwards compatibility
    if (!order.value.items && order.value.product) {
      order.value.items = [{
        name: order.value.product,
        image: order.value.image,
        size: order.value.sizes,
        quantity: order.value.quantity,
        totalPrice: order.value.totalAmount,
        design: order.value.designDetails?.[0] || null
      }]
    }
  }
  isLoading.value = false
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }

/* Print Styles */
@media print {
  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }
  .bg-white {
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
  }
  .bg-gray-50 {
    background-color: #f9fafb !important;
  }
  .bg-gradient-to-r {
    background: #f9fafb !important;
  }
  button, .action-buttons {
    display: none !important;
  }
  .border-b {
    border-bottom: 1px solid #e5e7eb !important;
  }
  .p-6, .px-6, .py-6 {
    padding: 1rem !important;
  }
}
</style>