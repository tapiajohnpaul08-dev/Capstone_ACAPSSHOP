<template>
  <div class="container mx-auto px-4 py-4 max-w-6xl">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="order">
      <!-- Back Button -->
      <button @click="goBack" class="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-3 transition-colors text-xs">
        <ArrowLeft class="w-3.5 h-3.5" />
        Back
      </button>

      <!-- Order Header - Compact -->
      <div class="bg-white rounded-xl border overflow-hidden mb-3">
        <div class="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-white flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-sm font-bold">{{order.orderId}}</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="statusBadgeClass">
              {{ displayStatus }}
            </span>
            <span class="text-[10px] text-gray-400">{{ formatDate(order.createdAt || order.date) }}</span>

            <span v-if="order.isProvided" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600">
              Please bring your Item at {{ formatDateShort(order.fromCustomerToCompanyDeliveryDate) }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-[10px] text-gray-400">Total</div>
              <div class="text-base font-bold text-blue-600">{{ formatPrice(order.totalAmount || order.amount) }}</div>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="paymentBadgeClass">
              {{ order.paymentStatus || 'Unpaid' }}
            </span>
          </div>
        </div>

        <!-- Quick Stats Row - Compact -->
        <div class="grid grid-cols-3 md:grid-cols-5 gap-1 px-4 py-1.5 bg-gray-50 text-[10px]">
          <div class="flex items-center gap-1">
            <Package class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ order.items?.length || 1 }} items</span>
          </div>
          <div class="flex items-center gap-1">
            <Layers class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ getTotalQuantity().toLocaleString() }} pcs</span>
          </div>
          <div class="flex items-center gap-1">
            <Truck class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ order.receivingMode || order.deliveryMethod || 'Pick-up' }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Calendar class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600">{{ order.expectedDelivery ? formatDateShort(order.expectedDelivery) : 'TBD' }}</span>
          </div>
          <div v-if="order.driverDetails && isDelivery" class="flex items-center gap-1">
            <User class="w-3 h-3 text-gray-400" />
            <span class="text-gray-600 truncate">{{ order.driverDetails.driverName }}</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout - Compact -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <!-- Left Column: Order Timeline -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl border overflow-hidden">
            <!-- Timeline Header - Compact -->
            <div class="px-4 py-2 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-1">
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-blue-600" />
                <h3 class="font-semibold text-xs">Timeline</h3>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span v-if="order.productionSchedule" class="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Calendar class="w-2.5 h-2.5" />
                  {{ formatProductionDate(order.productionSchedule) }}
                </span>
                <span v-if="order.driverDetails && isDelivery" class="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Truck class="w-2.5 h-2.5" />
                  {{ order.driverDetails.driverName }}
                </span>
                <span class="text-[10px] text-gray-400">{{ order.statusHistory?.length || 0 }} updates</span>
              </div>
            </div>

            <!-- ✅ NEW — Horizontal Progress Stepper -->
            <div
              v-if="order.status !== 'Cancelled'"
              class="px-3 py-3 border-b bg-white overflow-x-auto"
            >
              <div class="flex items-center min-w-max">
                <template v-for="(step, idx) in STATUS_STEPPER" :key="step.key">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <!-- Step dot -->
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                      :class="[
                        isStepReached(idx)
                          ? (isStepCurrent(idx)
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110'
                            : 'bg-blue-500 text-white')
                          : 'bg-gray-200 text-gray-400',
                      ]"
                    >
                      <span v-if="isStepReached(idx) && !isStepCurrent(idx)" class="text-white">✓</span>
                      <span v-else>{{ idx + 1 }}</span>
                    </div>
                    <!-- Step label -->
                    <span
                      class="text-[9px] font-semibold mt-1 whitespace-nowrap"
                      :class="[
                        isStepCurrent(idx)
                          ? 'text-blue-700'
                          : isStepReached(idx)
                            ? 'text-blue-600'
                            : 'text-gray-400',
                      ]"
                    >
                      {{ getStepperLabel(step) }}
                    </span>
                  </div>
                  <!-- Connector line -->
                  <div
                    v-if="idx < STATUS_STEPPER.length - 1"
                    class="flex-1 h-0.5 mx-1 min-w-[20px]"
                    :class="isStepReached(idx + 1) ? 'bg-blue-500' : 'bg-gray-200'"
                  ></div>
                </template>
              </div>
            </div>

            <!-- Timeline Content — newest first -->
            <div class="p-3 max-h-[340px] overflow-y-auto">
              <div v-if="filteredStatusHistory && filteredStatusHistory.length > 0" class="relative">
                <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                <div
                  v-for="(event, index) in filteredStatusHistory"
                  :key="index"
                  class="relative pl-7 pb-4 last:pb-0"
                >
                  <!-- Marker -->
                  <div
                    class="absolute left-0 top-0 rounded-full flex items-center justify-center z-10 border-2 border-white transition-all"
                    :class="[
                      event.isCurrent ? 'w-5 h-5 -left-0.5 ring-2 ring-offset-1' : 'w-4 h-4',
                      getTimelineIconColor(event.displayStatus || event.status, index, event.isCurrent),
                    ]"
                  >
                    <component
                      :is="getTimelineIcon(event.displayStatus || event.status)"
                      :class="event.isCurrent ? 'w-2.5 h-2.5' : 'w-2 h-2'"
                    />
                  </div>

                  <div class="flex flex-wrap items-start justify-between gap-1">
                    <div class="flex-1 min-w-0">
                      <!-- Title row -->
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span
                          class="font-semibold text-xs"
                          :class="event.isCurrent ? 'text-blue-700' : 'text-gray-900'"
                        >
                          {{ formatStatusForDisplay(event.displayStatus || event.status) }}
                        </span>
                        <span v-if="event.isCurrent" class="text-[9px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          Current
                        </span>
                        <span class="text-[10px] text-gray-400">{{ formatDateShort(event.timestamp) }}</span>
                      </div>

                      <!-- Description -->
                      <p class="text-[11px] text-gray-500 mt-0.5">
                        {{ getStatusDescription(event.displayStatus || event.status) }}
                      </p>

                      <!-- Notes -->
                      <p
                        v-if="event.notes && event.notes !== 'null' && event.notes !== 'Order created'"
                        class="text-[11px] text-gray-400 mt-0.5 italic"
                      >
                        "{{ event.notes }}"
                      </p>

                      <!-- Production schedule inline -->
                      <div
                        v-if="event.status === 'Scheduled' && event.productionSchedule"
                        class="mt-1 flex items-center gap-1"
                      >
                        <Calendar class="w-2.5 h-2.5 text-blue-500" />
                        <span class="text-[10px] text-blue-600">
                          Scheduled: {{ formatProductionDate(event.productionSchedule) }}
                        </span>
                      </div>

                      <!-- ✅ NEW — Duration hint -->
                      <div
                        v-if="event.durationHint && event.displayStatus !== 'Cancelled'"
                        class="mt-1 flex items-center gap-1 text-[10px] text-gray-400"
                      >
                        <Clock class="w-2.5 h-2.5" />
                        <span>{{ event.durationHint }}</span>
                      </div>

                      <!-- ✅ NEW — Next-step hint (only on the current event) -->
                      <div
                        v-if="event.isCurrent && nextStatusHint"
                        class="mt-1.5 inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"
                      >
                        <span class="font-semibold">Next:</span>
                        <span>{{ nextStatusHint.label }}</span>
                        <span v-if="nextStatusHint.durationHint" class="text-amber-500">
                          · {{ nextStatusHint.durationHint }}
                        </span>
                      </div>

                      <!-- ✅ NEW — Proof of delivery thumbnail -->
                      <div v-if="event.podImage" class="mt-2">
                        <p class="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                          <Image class="w-2.5 h-2.5" />
                          Proof of Delivery
                        </p>
                        <img
                          :src="getImageUrl(event.podImage)"
                          alt="Proof of delivery"
                          class="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                          @click="openPodLightbox(getImageUrl(event.podImage))"
                          @error="handleImageError"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-400 py-3 text-xs">
                No timeline updates yet
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Details - Compact -->
        <div class="space-y-2">
          <!-- Items Summary - Compact -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <div class="px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <ShoppingBag class="w-3.5 h-3.5 text-blue-600" />
                <h4 class="font-semibold text-xs">Items</h4>
              </div>
              <span class="text-[10px] text-gray-400">{{ order.items?.length || 1 }}</span>
            </div>
            <div class="max-h-32 overflow-y-auto divide-y">
              <div v-for="(item, idx) in (order.items || [])" :key="idx" class="px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                  <img 
                    v-if="!order.isProvided"
                    :src="getImageUrl(item.image || order.image)" 
                    :alt="item.name"
                    class="w-7 h-7 object-cover rounded border"
                    @error="handleImageError"
                  />
                  <div v-else class="w-7 h-7 bg-purple-100 rounded border flex items-center justify-center">
                    <Package class="w-3 h-3 text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium truncate">{{ item.name }}</div>
                    <div class="text-[10px] text-gray-400 flex items-center gap-1 flex-wrap">
                      <span>{{ item.size || 'N/A' }}</span>
                      <span class="text-gray-300">•</span>
                      <span>{{ formatNumber(item.quantity) }} pcs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="order.items.length >1" class="px-3 py-1 border-t bg-gray-50 flex justify-between font-semibold text-xs">
              <span>Subtotal</span>
              <span class="text-blue-600">{{ formatPrice(productsTotal) }}</span>
            </div>
          </div>

          <!-- ✅ ENHANCED PAYMENT BREAKDOWN - Full Breakdown -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <div class="px-3 py-1.5 border-b bg-gray-50 flex items-center gap-1.5">
              <DollarSign class="w-3.5 h-3.5 text-blue-600" />
              <h4 class="font-semibold text-xs">Payment Breakdown</h4>
              <span class="ml-auto text-[10px] font-medium" :class="paymentBadgeClass">
                {{ order.paymentStatus || 'Unpaid' }}
              </span>
            </div>
            <div class="p-2.5 space-y-1 text-xs">
              <!-- 1. Products Total -->
              <div v-if="!order.isProvided" class="flex justify-between">
                <span class="text-gray-500">Products Total</span>
                <span class="font-medium">{{ formatPrice(productsTotal) }}</span>
              </div>

              <!-- 3. Design Fee -->
              <div v-if="order.hasDesign" class="flex justify-between">
                <span class="text-gray-500">Design Fee</span>
                <span class="font-medium">{{ formatPrice(designFee) }}</span>
              </div>

<div v-if="shippingFee > 0" class="flex justify-between">
  <span class="text-gray-500">Shipping Fee</span>
  <span class="font-medium">{{ formatPrice(shippingFee) }}</span>
</div>

              <!-- Subtotal Divider -->
              <div v-if="order.isProvided || hasDesignDetails" class="border-t border-gray-100 my-1"></div>

              <!-- 4. Subtotal -->
              <!-- <div class="flex justify-between font-semibold">
                <span class="text-gray-700">Subtotal</span>
                <span class="text-gray-900">{{ formatPrice(calculatedSubtotal) }}</span>
              </div> -->

              <!-- 5. Total -->
              <div class="flex justify-between pt-1 border-t border-gray-200 font-bold text-xs">
                <span>Total</span>
                <span class="text-blue-600">{{ formatPrice(calculatedTotal) }}</span>
              </div>

              <!-- 6. Partial Payments -->
              <div v-if="order.partialPayments && order.partialPayments.length > 0" class="pt-1 border-t border-gray-100">
                <div class="flex justify-between text-[10px]">
                  <span class="text-gray-400">Paid</span>
                  <span class="font-medium text-green-600">{{ formatPrice(getTotalPaid) }}</span>
                </div>
                <div v-if="order.paymentStatus === 'Partial'" class="flex justify-between text-[10px]">
                  <span class="text-gray-400">Balance</span>
                  <span class="font-medium text-red-500">{{ formatPrice(getRemainingBalance) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Info - Compact (Collapsible) -->
          <div class="bg-white rounded-xl border overflow-hidden">
            <button 
              @click="showDetails = !showDetails"
              class="w-full px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <Info class="w-3.5 h-3.5 text-blue-600" />
                <span class="font-semibold text-xs">Details</span>
              </div>
              <ChevronDown :class="['w-3.5 h-3.5 transition-transform', showDetails ? 'rotate-180' : '']" />
            </button>
            <div v-show="showDetails" class="p-2.5 space-y-1 text-xs">
              <div class="grid grid-cols-2 gap-1">
                <div>
                  <div class="text-[10px] text-gray-400">Customer</div>
                  <div class="font-medium truncate">{{ order.customerName || order.customer?.name || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">Email</div>
                  <div class="font-medium truncate text-blue-600">{{ order.customerEmail || order.customer?.email || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">Phone</div>
                  <div class="font-medium">{{ order.customerPhone || order.customer?.phone || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-gray-400">Type</div>
                  <div class="font-medium">{{ order.isProvided ? 'Own Cups' : 'Company Cups' }}</div>
                </div>
              </div>

              <div v-if="order.deliveryMethod === 'Delivery'"  class="text-[10px] text-gray-400">Address</div>
              <div v-if="order.deliveryMethod === 'Delivery'" class="font-medium text-xs">{{ order.address || order.customer?.address || order.deliveryAddress || 'N/A' }}</div>
              <div v-if="order.driverDetails && isDelivery" class="mt-1 p-1.5 bg-green-50 rounded border border-green-200 text-[10px]">
                <span class="font-medium text-green-700">Driver:</span> {{ order.driverDetails.driverName }}
                <span class="ml-2 text-gray-500">•</span>
                <span class="text-gray-500">{{ order.driverDetails.driverPhone || 'N/A' }}</span>
              </div>
              <div v-if="order.notes" class="mt-1 p-1.5 bg-yellow-50 rounded border border-yellow-200 text-[10px] text-yellow-700">
                {{ order.notes }}
              </div>
            </div>
          </div>

          <!-- Design Summary - Compact (Collapsible) -->
          <div v-if="hasDesignDetails" class="bg-white rounded-xl border overflow-hidden">
            <button 
              @click="showDesign = !showDesign"
              class="w-full px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <Palette class="w-3.5 h-3.5 text-blue-600" />
                <span class="font-semibold text-xs">Design</span>
              </div>
              <ChevronDown :class="['w-3.5 h-3.5 transition-transform', showDesign ? 'rotate-180' : '']" />
            </button>
            <div v-show="showDesign" class="p-2 space-y-1 text-xs max-h-24 overflow-y-auto">
              <div v-for="(item, idx) in order.items" :key="idx" class="border-b last:border-0 pb-1 last:pb-0">
                <div class="text-[10px] text-gray-400">{{ item.name }}</div>
                <div class="flex flex-wrap gap-1 text-[10px]">
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded">{{ getDesignSourceLabel(item.designSource || item.design?.source) }}</span>
                  <span v-if="item.printPlacement" class="px-1.5 py-0.5 bg-gray-100 rounded">{{ formatPlacement(item.printPlacement) }}</span>
                  <span v-if="item.printSize" class="px-1.5 py-0.5 bg-gray-100 rounded">{{ item.printSize }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Compact -->
      <div class="flex flex-wrap gap-1.5 mt-3">
        <button @click="contactSupport" class="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-[10px] font-medium inline-flex items-center gap-1">
          <Phone class="w-3 h-3" />
          Support
        </button>
        
        <button 
  v-if="['pending', 'confirmed', 'scheduled'].includes(order.status?.toLowerCase())" 
  @click="showCancelConfirm = true" 
  class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
>
  <XCircle class="w-3 h-3" />
  Cancel
</button>

        <button 
          v-if="isOutForDelivery && !order.isReceived" 
          @click="handleToggleReceived"
          class="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <CheckCircle class="w-3 h-3" />
          {{ order.receivingMode === 'Pick-up' ? 'Picked Up' : 'Received' }}
        </button>

        <button 
          v-if="isOutForDelivery && order.isReceived" 
          disabled
          class="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-[10px] font-medium inline-flex items-center gap-1"
        >
          <CheckCircle class="w-3 h-3" />
          {{ order.receivingMode === 'Pick-up' ? 'Picked Up ✓' : 'Received ✓' }}
        </button>

        <button 
          v-if="order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'cancelled'" 
          @click="orderAgain" 
          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <RefreshCw class="w-3 h-3" />
          Reorder
        </button>

        <button 
          @click="printOrder" 
          class="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-[10px] font-medium inline-flex items-center gap-1"
        >
          <Printer class="w-3 h-3" />
          Print
        </button>

      </div>

      <!-- Status Messages - Compact -->
      <div v-if="isOutForDelivery && !order.isReceived && order.receivingMode === 'Pick-up'" class="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-2">
          <Truck class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-blue-800 text-xs">Ready for Pickup!</h4>
            <p class="text-xs text-blue-700">
              Your order is ready for pickup at our store. Please visit us to collect your items.
            </p>
          </div>
        </div>
      </div>

      <div v-if="isOutForDelivery && !order.isReceived && order.receivingMode === 'Delivery'" class="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-2">
          <Truck class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-blue-800 text-xs">Out for Delivery!</h4>
            <p class="text-xs text-blue-700">
              <span v-if="order.driverDetails">
                Driver <strong>{{ order.driverDetails.driverName }}</strong> is delivering your items.
              </span>
              <span v-else>
                Your order is on its way!
              </span>
            </p>
          </div>
        </div>
      </div>

      <div v-if="isOutForDelivery && order.isReceived" class="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-green-800 text-xs">{{ order.receivingMode === 'Pick-up' ? 'Picked Up!' : 'Order Received!' }}</h4>
            <p class="text-xs text-green-700">{{ order.receivingMode === 'Pick-up' ? 'Thank you for picking up your order.' : 'Thank you for confirming receipt.' }}</p>
          </div>
        </div>
      </div>

      <div v-if="order.status?.toLowerCase() === 'completed'" class="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-green-800 text-xs">Order Completed</h4>
            <p class="text-xs text-green-700">{{ order.receivingMode === 'Pick-up' ? 'Pickup completed.' : 'Delivered successfully.' }}</p>
          </div>
        </div>
      </div>

      <!-- ✅ FEEDBACK SECTION - Displayed at the bottom -->
      <div v-if="order.status?.toLowerCase() === 'completed'" class="mt-4">
        <div class="bg-white rounded-xl border overflow-hidden">
          <div class="px-4 py-2.5 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MessageSquare class="w-4 h-4 text-blue-600" />
              <h3 class="font-semibold text-sm">Your Feedback</h3>
            </div>
            <span v-if="!hasFeedback" class="text-xs text-gray-400">Not submitted yet</span>
            <span v-else class="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle class="w-3 h-3" /> Submitted
            </span>
          </div>

          <!-- If no feedback yet -->
          <div v-if="!hasFeedback" class="p-4 text-center">
            <p class="text-sm text-gray-500 mb-2">We value your opinion!</p>
            <button 
              @click="openFeedbackModal"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <MessageSquare class="w-4 h-4" />
              Submit Feedback
            </button>
          </div>

          <!-- If feedback exists -->
          <div v-else-if="existingFeedback" class="p-4 space-y-3">
            <!-- Rating -->
            <div class="flex items-center gap-3">
              <div class="flex gap-0.5">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="w-4 h-4"
                  :class="star <= existingFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                />
              </div>
              <span class="text-sm font-medium text-gray-700">{{ existingFeedback.rating }}/5</span>
              
              <!-- Status Badge -->
              <span v-if="existingFeedback.status === 'approved'" class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                <CheckCircle class="w-3 h-3" /> Approved
              </span>
              <span v-else-if="existingFeedback.status === 'pending'" class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
                <Clock class="w-3 h-3" /> Pending Review
              </span>
              <span v-else-if="existingFeedback.status === 'featured'" class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
                <Star class="w-3 h-3" /> Featured
              </span>
            </div>

            <!-- Title -->
            <div v-if="existingFeedback.title" class="text-sm font-semibold text-gray-800">
              {{ existingFeedback.title }}
            </div>

            <!-- Comment -->
            <div class="text-sm text-gray-600">
              {{ existingFeedback.comment }}
            </div>

            <!-- Pros -->
            <div v-if="existingFeedback.pros && existingFeedback.pros.length > 0">
              <p class="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <ThumbsUp class="w-3 h-3 text-green-600" /> What you liked:
              </p>
              <div class="flex flex-wrap gap-1">
                <span v-for="(pro, idx) in existingFeedback.pros" :key="idx" class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                  {{ pro }}
                </span>
              </div>
            </div>

            <!-- Cons -->
            <div v-if="existingFeedback.cons && existingFeedback.cons.length > 0">
              <p class="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <ThumbsDown class="w-3 h-3 text-red-600" /> What could be improved:
              </p>
              <div class="flex flex-wrap gap-1">
                <span v-for="(con, idx) in existingFeedback.cons" :key="idx" class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {{ con }}
                </span>
              </div>
            </div>

            <!-- Would Recommend -->
            <div v-if="existingFeedback.wouldRecommend !== null && existingFeedback.wouldRecommend !== undefined" class="text-sm flex items-center gap-2">
              <span class="text-gray-500">Would recommend:</span>
              <span class="font-medium flex items-center gap-1" :class="existingFeedback.wouldRecommend ? 'text-green-600' : 'text-red-600'">
                <ThumbsUp v-if="existingFeedback.wouldRecommend" class="w-4 h-4" />
                <ThumbsDown v-else class="w-4 h-4" />
                {{ existingFeedback.wouldRecommend ? 'Yes' : 'No' }}
              </span>
            </div>

            <!-- Admin Response -->
            <div v-if="existingFeedback.adminResponse?.message" class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                <MessageSquare class="w-3 h-3" /> Admin Response:
              </p>
              <p class="text-sm text-blue-800">{{ existingFeedback.adminResponse.message }}</p>
              <p v-if="existingFeedback.adminResponse.respondedAt" class="text-xs text-blue-400 mt-1">
                <Calendar class="w-3 h-3 inline mr-1" />
                {{ formatDate(existingFeedback.adminResponse.respondedAt) }}
              </p>
            </div>

            <!-- Submitted date -->
            <div class="text-xs text-gray-400 border-t pt-2 mt-2 flex items-center gap-1">
              <Calendar class="w-3 h-3" />
              Submitted: {{ formatDate(existingFeedback.submittedAt || existingFeedback.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Order Not Found -->
    <div v-else class="text-center py-12">
      <Package class="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500">Order not found</p>
      <button @click="goBack" class="mt-2 text-blue-600 hover:underline text-sm">Back to Orders</button>
    </div>

    <!-- Modals -->
    <ConfirmationModal
      v-model:visible="showCancelConfirm"
      title="Cancel Order"
      :message="`Cancel ${order?.orderNumber || order?.orderId}?`"
      type="danger"
      close-label="Keep"
      confirm-label="Cancel"
      confirm-loading-label="Cancelling..."
      :is-loading="isCancelling"
      @confirm="handleCancel"
      @close="showCancelConfirm = false"
    />

    <!-- ✅ Notification Modal (Toast) -->
    <FeedbackModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :status="feedbackStatus"
      :message="feedbackMessage"
    />

    <!-- ✅ Feedback Form Modal -->
    <FeedbackFormModal
      v-model:visible="showFeedbackModal"
      :order-id="order?.orderId"
      :order="order"
      @submitted="onFeedbackSubmitted"
    />

    <!-- ✅ NEW — Proof of Delivery Lightbox -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showPodLightbox"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          @click.self="closePodLightbox"
        >
          <div class="relative max-w-4xl max-h-[90vh]">
            <img
              :src="podLightboxImage"
              alt="Proof of Delivery"
              class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              @click="closePodLightbox"
              class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center shadow-lg transition-colors"
              title="Close"
            >
              <XCircle class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders.js'
import { ordersApi, feedBackApi } from '@/api'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'
import FeedbackFormModal from '@/modals/FeedbackFormModal.vue'
import { 
  ArrowLeft, 
  Package, 
  Layers, 
  Truck, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Info, 
  ChevronDown, 
  Palette, 
  Phone, 
  XCircle, 
  RefreshCw, 
  Printer,
  CheckCircle,
  AlertCircle,
  User,
  DollarSign,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Image,   // ✅ NEW — for POD thumbnail label
} from 'lucide-vue-next'

// ✅ Local toast helper that drives the FeedbackModal
function showToast(message, status = 'success', title = null) {
  feedbackTitle.value = title || (status === 'success' ? 'Success' : status === 'error' ? 'Error' : 'Notice')
  feedbackMessage.value = message
  feedbackStatus.value = status
  feedbackVisible.value = true
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const STATIC_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '')



// ✅ NEW — Status flow used for the horizontal stepper
const STATUS_STEPPER = [
  { key: 'Pending', label: 'Placed' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Scheduled', label: 'Scheduled' },
  { key: 'In Production', label: 'In Production' },
  { key: 'Out for Delivery', label: 'Delivery' },
  { key: 'Completed', label: 'Completed' },
]

// ─── TIMELINE ICONS ──────────────────────────────────────────────────────
const ClockIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) }
const CalendarIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })]) }
const PackageIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }), h('path', { d: 'M12 22V12' }), h('polyline', { points: '3.29 7 12 12 20.71 7' })]) }
const TruckIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }), h('path', { d: 'M15 18H9' }), h('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }), h('circle', { cx: '17', cy: '18', r: '2' }), h('circle', { cx: '7', cy: '18', r: '2' })]) }
const CheckCircleIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), h('polyline', { points: '22 4 12 14.01 9 11.01' })]) }
const XIcon = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })]) }

const route = useRoute()
const router = useRouter()
// ✅ `orders` ref is used in handleCancel / handleToggleReceived;
//    `loading` was never defined and threw ReferenceError on click.
const { fetchOrder, cancelOrder, orders, loading } = useOrders()

// ─── STATE ──────────────────────────────────────────────────────────────
const order = ref(null)
const isLoading = ref(true)
const showCancelConfirm = ref(false)
const isCancelling = ref(false)

// Notification modal state
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

// Feedback form state
const showFeedbackModal = ref(false)
const hasFeedback = ref(false)
const existingFeedback = ref(null)

const showDetails = ref(false)
const showDesign = ref(false)


// ✅ NEW — Estimated durations per status (business days)
// Used in the timeline to tell the customer what to expect.
const STATUS_DURATIONS = {
  'Pending': 'Awaiting admin review',
  'Confirmed': 'Usually ready to schedule within 1 business day',
  'Scheduled': 'Production usually starts on the scheduled date',
  'In Production': 'Usually takes a few hours depends on order quantity',
  'Out for Delivery': order.value?.deliveryMethod === 'Pick-up' ? 'Ready to Pick-up' : 'Usually arrives same day',
  'Ready to Pick-up': 'Ready for pickup — no delivery wait',
  'Completed': 'Order delivered successfully',
  'Cancelled': 'No further action needed',
}

// ─── COMPUTED ──────────────────────────────────────────────────────────
const isDelivery = computed(() => {
  const method = order.value?.receivingMode || order.value?.deliveryMethod || ''
  return method.toLowerCase() === 'delivery'
})

const isOutForDelivery = computed(() => {
  if (!order.value) return false
  const status = order.value.status?.toLowerCase() || ''
  return status === 'out for delivery'
})

const displayStatus = computed(() => {
  if (!order.value) return 'Pending'
  const status = order.value.status || 'Pending'
  if (status === 'Out for Delivery' && order.value.deliveryMethod === 'Pick-up') {
    return 'Ready to Pick-up'
  }
  return status
})

// ✅ UPDATED — Reverse order (newest first), enrich each event with
// duration hint and POD info, and mark the "isCurrent" event.
const filteredStatusHistory = computed(() => {
  if (!order.value?.statusHistory) return []

  const isPickup = order.value.receivingMode === 'Pick-up'

  // 1. Map each event to its display shape
  const mapped = order.value.statusHistory.map(event => {
    const isPickupAlias = isPickup && event.status === 'Out for Delivery'
    const displayStatus = isPickupAlias ? 'Ready to Pick-up' : event.status

    return {
      ...event,
      displayStatus,
      durationHint: STATUS_DURATIONS[displayStatus] || '',
      // POD image only applies to the Completed event for delivery orders
      podImage: (event.status === 'Completed' && order.value.proofOfDelivery)
        ? order.value.proofOfDelivery
        : null,
    }
  })

  // 2. Reverse so newest is first
  const reversed = [...mapped].reverse()

  // 3. Mark the first (latest) event as current
  if (reversed.length > 0) {
    reversed[0] = { ...reversed[0], isCurrent: true }
  }

  return reversed
})

// ✅ NEW — Figure out the next status after the current one
const nextStatusHint = computed(() => {
  if (!order.value) return null
  const currentStatus = order.value.status
  if (currentStatus === 'Completed' || currentStatus === 'Cancelled') return null

  const currentIdx = STATUS_STEPPER.findIndex(s => s.key === currentStatus)
  if (currentIdx === -1 || currentIdx >= STATUS_STEPPER.length - 1) return null

  const next = STATUS_STEPPER[currentIdx + 1]
  const isPickup = order.value.receivingMode === 'Pick-up'
  const label = isPickup && next.key === 'Out for Delivery' ? 'Ready to Pick-up' : next.label

  return {
    label,
    durationHint: STATUS_DURATIONS[next.key] || '',
  }
})

// ✅ NEW — Compute the index of the current status for the stepper
const currentStepperIndex = computed(() => {
  if (!order.value) return 0
  const idx = STATUS_STEPPER.findIndex(s => s.key === order.value.status)
  return idx === -1 ? 0 : idx
})

// ✅ NEW — Lightbox state for POD preview
const showPodLightbox = ref(false)
const podLightboxImage = ref('')

function openPodLightbox(imageUrl) {
  if (!imageUrl) return
  podLightboxImage.value = imageUrl
  showPodLightbox.value = true
}

function closePodLightbox() {
  showPodLightbox.value = false
  podLightboxImage.value = ''
}

// ✅ NEW — Helper for the stepper: was a step already reached?
function isStepReached(index) {
  return index <= currentStepperIndex.value
}

function isStepCurrent(index) {
  return index === currentStepperIndex.value
}

// ✅ NEW — Compute the display label for a stepper step
// (e.g., "Delivery" for pickup becomes "Pickup")
function getStepperLabel(step) {
  if (!order.value) return step.label
  const isPickup = order.value.receivingMode === 'Pick-up'
  if (isPickup && step.key === 'Out for Delivery') return 'Pickup'
  return step.label
}

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

// ─── PAYMENT BREAKDOWN COMPUTED ──────────────────────────────────────
// All values are read directly from the order document. The backend is
// the single source of truth — it already bakes designFee + shippingFee
// into order.amount during negotiation, so we must not re-derive them
// from a constant here (that would go stale the moment an admin edits
// the fees in chat).

const productsTotal = computed(() => {
  if (order.value?.isProvided) return 0
  if (!order.value?.items) return 0
  return order.value.items.reduce(
    (sum, item) => sum + (Number(item.estimatedTotal) || Number(item.totalPrice) || 0),
    0,
  )
})

// Read the design fee the admin actually set on the order.
// Falls back to 0 for orders with no design.
const designFee = computed(() => {
  const fee = Number(order.value?.designFee)
  return Number.isFinite(fee) ? fee : 0
})

const shippingFee = computed(() => {
  const fee = Number(order.value?.shippingFee)
  return Number.isFinite(fee) ? fee : 0
})

// Subtotal = products + designFee + shippingFee.
// This should ALWAYS equal order.amount once the backend is up to date;
// we keep the computation as a safety net for edge cases where amount
// is missing (e.g. legacy documents).
const calculatedSubtotal = computed(() => {
  return productsTotal.value + designFee.value + shippingFee.value
})

// Total — prefer the authoritative value from the backend. Fall back
// to the computed subtotal only if amount/totalAmount is missing.
const calculatedTotal = computed(() => {
  const stored = Number(order.value?.amount ?? order.value?.totalAmount)
  if (Number.isFinite(stored) && stored > 0) return stored
  return calculatedSubtotal.value
})

const getTotalPaid = computed(() => {
  if (!order.value?.partialPayments?.length) return 0
  return order.value.partialPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  )
})

const getRemainingBalance = computed(() => {
  return Math.max(0, calculatedTotal.value - getTotalPaid.value)
})

// ─── HELPERS ──────────────────────────────────────────────────────────
function getTotalQuantity() {
  if (!order.value?.items) return order.value?.quantity || 0
  return order.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

function getDesignSourceLabel(source) {
  const labels = {
    'upload': 'Uploaded',
    'saved': 'Template',
    'no-design': 'Description'
  }
  return labels[source] || source || 'N/A'
}

function getTimelineIcon(status) {
  const statusLower = status?.toLowerCase() || ''
  const icons = {
    'pending': ClockIcon,
    'confirmed': CheckCircleIcon,      // ← ADD THIS
    'scheduled': CalendarIcon,
    'in production': PackageIcon,
    'out for delivery': TruckIcon,
    'ready to pick-up': TruckIcon,
    'completed': CheckCircleIcon,
    'cancelled': XIcon
  }
  return icons[statusLower] || ClockIcon
}

function getTimelineIconColor(status, index, isCurrent = false) {
  const statusLower = status?.toLowerCase() || ''

  // ✅ Current step gets a bolder, ring-highlighted treatment
  if (isCurrent) {
    const currentColors = {
      'pending': 'bg-yellow-400 text-white ring-yellow-200',
      'confirmed': 'bg-teal-500 text-white ring-teal-200',
      'scheduled': 'bg-blue-500 text-white ring-blue-200',
      'in production': 'bg-purple-500 text-white ring-purple-200',
      'out for delivery': 'bg-green-500 text-white ring-green-200',
      'ready to pick-up': 'bg-green-500 text-white ring-green-200',
      'completed': 'bg-green-600 text-white ring-green-200',
      'cancelled': 'bg-red-500 text-white ring-red-200',
    }
    return currentColors[statusLower] || 'bg-blue-500 text-white ring-blue-200'
  }

  // Past events: muted background
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-600',
    'confirmed': 'bg-teal-100 text-teal-600',
    'scheduled': 'bg-blue-100 text-blue-600',
    'in production': 'bg-purple-100 text-purple-600',
    'out for delivery': 'bg-green-100 text-green-600',
    'ready to pick-up': 'bg-green-100 text-green-600',
    'completed': 'bg-green-500 text-white',
    'cancelled': 'bg-red-100 text-red-600',
  }
  return colors[statusLower] || 'bg-gray-100 text-gray-600'
}
// ─── FORMATTING FUNCTIONS ────────────────────────────────────────────
function getImageUrl(imagePath) {
  if (!imagePath) return `${STATIC_BASE_URL}/uploads/products/default-product.jpg`
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) {
    return `${STATIC_BASE_URL}/${cleanPath}`
  }
  return `${STATIC_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = `${STATIC_BASE_URL}/uploads/products/default-product.jpg`
}

function formatStatus(status) {
  console.log(status)
  const statusMap = {
    'pending': 'Pending Review',
    'confirmed': 'Confirmed', 
    'scheduled': 'Scheduled',
    'in production': 'In Production',
    'out for delivery': order.value?.deliveryMethod === 'Pick-up' ? 'Ready to Pick-up' : 'Out for Delivery',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status?.toLowerCase()] || status || 'Pending'
}

function formatStatusForDisplay(status) {

  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in production': 'In Production',
    'out for delivery': order.value?.deliveryMethod === 'Pick-up' ? 'Ready to Pick-up' : 'Out for Delivery',
    'ready to pick-up': 'Ready to Pick-up',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status?.toLowerCase()] || status || 'Pending'
}

function formatPlacement(placement) {
  if (!placement) return ''
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
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

function formatDateShort(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

function formatProductionDate(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

function getStatusDescription(status) {
 const isPickupReady =
    order.value?.receivingMode === 'Pick-up' &&
    (status === 'Out for Delivery' || status === 'Ready to Pick-up')

  if (isPickupReady) {
    return 'Your order is ready for pickup at our store. Please visit us to collect your items.'
  }
  
  const descriptions = {
    'pending': 'Your order has been placed and is waiting for review by our team.',
    'confirmed': 'Your order has been confirmed! We are preparing it for scheduling.',
    'scheduled': 'Your order has been reviewed and scheduled for production.',
    'in production': 'Your order is now in production. Our team is working on it.',
    'out for delivery': order.value?.deliveryMethod === 'Pick-up' 
      ? 'Your order is ready for pickup at our store.' 
      : 'Your order is on its way! A driver has been assigned for delivery.',
    'ready to pick-up': 'Your order is ready for pickup at our store. Please visit us to collect your items.',
    'completed': 'Your order has been successfully completed.',
    'cancelled': 'This order has been cancelled.'
  }
  return descriptions[status?.toLowerCase()] || 'Status update'
}

// ─── BADGE CLASSES ────────────────────────────────────────────────────
const statusBadgeClass = computed(() => {
  const status = displayStatus.value?.toLowerCase() || ''
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-teal-100 text-teal-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'in production': 'bg-purple-100 text-purple-800',
    'out for delivery': 'bg-green-100 text-green-800',
    'ready to pick-up': 'bg-green-100 text-green-800',
    'completed': 'bg-green-100 text-green-800',
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

// ─── FEEDBACK FUNCTIONS ──────────────────────────────────────────────
async function checkFeedbackExists() {
  if (!order.value?.orderId) return
  
  try {
    const result = await feedBackApi.checkFeedbackExists(order.value.orderId)
    hasFeedback.value = result.exists || false
    
    if (result.exists) {
      const feedbackResult = await feedBackApi.getFeedbackByOrder(order.value.orderId)
      if (feedbackResult.success && feedbackResult.data) {
        existingFeedback.value = feedbackResult.data
      }
    }
  } catch (error) {
    console.error('Error checking feedback:', error)
  }
}

function openFeedbackModal() {
  showFeedbackModal.value = true
}

function onFeedbackSubmitted(feedback) {
  hasFeedback.value = true
  existingFeedback.value = feedback
  showFeedbackModal.value = false
  feedbackTitle.value = 'Thank You! 🎉'
  feedbackMessage.value = 'Your feedback has been submitted successfully. We appreciate your input!'
  feedbackStatus.value = 'success'
  feedbackVisible.value = true
}

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
  // Navigate to create order page with the order data
  if (order.value && order.value.items && order.value.items.length > 0) {
    // If it's a company product order
    if (!order.value.isProvided) {
      // Get the first item or all items
      const items = order.value.items.map(item => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        size: item.size,
        quantity: item.quantity,
        image: item.image,
        // Include design info if available
        design: item.design || {
          source: item.designSource || 'upload',
          printSize: item.printSize || '',
          printPlacement: item.printPlacement || '',
          designNotes: item.designNotes || '',
          files: item.files || []
        }
      }))
      
      // Store in session for the create order page
      sessionStorage.setItem('pendingCart', JSON.stringify(items))
      
      // Navigate to create order page
      router.push('/customer/orders/create?source=cart&type=company-product')
    } else {
      // Own cups order
      const ownCupsData = {
        productType: order.value.product || 'Customer Provided Items',
        sizes: order.value.sizes || 'Custom',
        quantity: order.value.quantity || 500
      }
      
      sessionStorage.setItem('pendingOwnCups', JSON.stringify(ownCupsData))
      router.push('/customer/orders/create?type=own-cups&from=order-detail')
    }
  } else {
    showToast('No items to reorder')
  }
}

async function handleToggleReceived() {
  if (!order.value) return

  // ✅ Match both possible casings since statusValue is lowercase
  const currentStatus = (order.value.status)
  console.log('sdasdasda',currentStatus)
  if (currentStatus !== 'Out for Delivery') {
    showToast('Only orders out for delivery can be marked as received', 'error')
    return
  }

  const confirmMessage = order.value.deliveryMethod === 'Pick-up'
    ? 'Have you picked up this order from the store?'
    : 'Have you received this delivery?'

  if (!confirm(confirmMessage)) return

  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')

    const response = await ordersApi.toggleReceivedStatus(
      order.value.id,
      true,
      user,
    )

    if (response.success) {
      order.value.status = 'Completed'
      order.value.statusValue = 'completed'
      order.value.received = true

      const index = orders.value.findIndex(
        (o) => o.id === order.value.id || o.orderId === order.value.orderId,
      )
      if (index !== -1) {
        orders.value[index].status = 'Completed'
        orders.value[index].statusValue = 'completed'
        orders.value[index].received = true
      }

      showToast('Order marked as received! Thank you', 'success')

      const refreshed = await fetchOrder(order.value.id)
      if (refreshed.success && refreshed.order) {
        order.value = refreshed.order
      }
    } else {
      showToast(response.message || 'Failed to mark order as received')
    }
  } catch (error) {
    console.error('Error marking order as received:', error)
    showToast(error.message || 'An error occurred')
  }
}

async function handleCancel() {
  if (!order.value) return

  isCancelling.value = true

  try {
    const response = await ordersApi.cancelMyOrder(order.value.id)

    if (response.success) {
      // ✅ Update local state instantly (before refetch)
      order.value.status = 'Cancelled'
      order.value.statusValue = 'cancelled'
      order.value.paymentStatus = order.value.paymentStatus // unchanged

      const index = orders.value.findIndex(
        (o) => o.id === order.value.id || o.orderId === order.value.orderId,
      )
      if (index !== -1) {
        orders.value[index].status = 'Cancelled'
        orders.value[index].statusValue = 'cancelled'
      }

      showToast(
        `Order ${order.value.orderId || order.value.id} cancelled`, 'success',
      )

      // ✅ Refetch to get the canonical state (including statusHistory
      //    with the "Cancelled by customer" entry).
      const refreshed = await fetchOrder(order.value.id)
      if (refreshed.success && refreshed.order) {
        order.value = refreshed.order
      }
    } else {
      showToast(response.message || 'Failed to cancel order')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    showToast(error.message || 'An error occurred')
  } finally {
    isCancelling.value = false
    showCancelConfirm.value = false
  }
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────
onMounted(async () => {
  const res = await fetchOrder(route.params.id)
  if (res.success) {
    order.value = res.order
    console.log('Order loaded:', order.value)
    console.log('Products total:', productsTotal.value)
    console.log('Design fee:', designFee.value)
    console.log('Subtotal:', calculatedSubtotal.value)
    console.log('Calculated total:', calculatedTotal.value)
    
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
    
    // ✅ Check if feedback exists for this order
    await checkFeedbackExists()
  }
  isLoading.value = false
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }

.overflow-y-auto::-webkit-scrollbar {
  width: 3px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

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
  button, .action-buttons {
    display: none !important;
  }
}

/* ✅ NEW — Lightbox transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>