<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl pb-32">
    <!-- Header -->
    <div class="mb-6">
      <button @click="router.back()"
        class="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center gap-1">
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1 text-sm">
            <span v-if="isOwnCups">You'll provide your own cups for printing.</span>
            <span v-else-if="onlyLids">
              You're ordering {{ lidItems.length }} lid{{ lidItems.length !== 1 ? 's' : '' }} — no design needed.
            </span>
            <span v-else-if="isCartOrder">You're ordering {{ orderProducts.length }} product(s).</span>
            <span v-else>Order from our catalog — we supply & print.</span>
          </p>
        </div>
        <span class="px-3 py-1.5 rounded-full flex gap-3 text-xs font-semibold" :class="orderBadgeClass">
          <ShoppingCart v-if="isCartOrder" class="w-3.5 h-3.5" />
          <Package v-else class="w-3.5 h-3.5" />
          {{ orderBadgeText }}
        </span>
      </div>
    </div>

    <!-- Steps Progress (4 steps) -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto">
      <div v-for="(step, i) in activeSteps" :key="step.key" class="flex items-center gap-2 whitespace-nowrap">
<button
  @click="goToStep(i)"
  class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
         disabled:cursor-not-allowed"
  :class="getStepClass(i)"
  :disabled="!step.enabled || isSubmitting"
>
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="getStepBadgeClass(i)">
            {{ getStepBadge(i) }}
          </span>
          {{ step.label }}
          <span v-if="i < currentStep" class="text-green-500">
            <CheckCircle class="w-3 h-3" />
          </span>
          <span v-else-if="i === currentStep && !isStepValid && step.key !== 'submit'" class="text-red-400">
            <AlertCircle class="w-3 h-3" />
          </span>
        </button>
        <span v-if="i < activeSteps.length - 1" class="text-gray-300">→</span>
      </div>
    </div>

    <!-- Step Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main content -->
      <div class="flex-1 space-y-5">
        <!-- ==================== STEP 0: PRODUCTS ==================== -->
        <div v-if="getStepKey(currentStep) === 'product'">
<ProductSelector
  v-model="orderProducts"
  :order-type="orderType"
  :is-cart-order="isCartOrder"
  :selected-product="selectedProductData"
  :is-own-cups="isOwnCups"
  :disabled="isSubmitting"
  @product-changed="onProductChanged"
/>

          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ step0Errors[0] || 'Please complete all required fields' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                All product details complete
              </span>
            </div>
            <button @click="nextStep" :disabled="!isStepValid || isSubmitting" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2
         hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :title="!isStepValid ? 'Complete all fields to continue' : 'Continue'">
              {{ onlyLids ? 'Continue' : designableItems.length > 1 ? 'Configure Designs' : 'Add Design' }}
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- ==================== STEP 1: DESIGN ==================== -->
        <div v-if="getStepKey(currentStep) === 'design'">

          <!-- ✅ Only-lids banner — no design UI shown at all -->
          <div v-if="onlyLids" class="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" class="text-amber-600">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-amber-900">No design needed</h4>
                <p class="text-sm text-amber-800 mt-1">
                  Your order contains only lids. Lids are produced plain, as-is —
                  there's nothing to print or configure here.
                </p>
                <p class="text-xs text-amber-700 mt-2">
                  {{ lidItems.length }} lid{{ lidItems.length !== 1 ? 's' : '' }}
                  · {{ totalQuantity.toLocaleString() }} pcs total
                </p>
              </div>
            </div>
          </div>

          <!-- Mixed order: cups + lids -->
          <template v-else>


            <DesignModeSelector
              v-model="designMode"
              :item-count="designableItems.length"
              :has-design-required="false"
              :is-own-cups="isOwnCups"
            />

            <div v-if="designMode !== 'no-design'" class="mt-4">
              <!-- Shared design -->
              <div v-if="designMode === 'shared'" class="space-y-4">
                <DesignManager
                  v-model="sharedDesign"
                  item-name="Shared Design"
                  :show-placement="designableItems.length === 1"
                  :is-no-design-mode="false"
                  @design-changed="onSharedDesignChanged"
                />

                <!-- Inline placement (shared + multi-designable only) -->
                <div v-if="designableItems.length > 1" class="bg-white rounded-xl border">
                  <div class="px-6 pt-6 pb-4 border-b">
                    <h4 class="font-semibold text-gray-900">Print Placement</h4>
                    <p class="text-xs text-gray-500 mt-0.5">
                      Set where the shared design appears on each item.
                    </p>
                  </div>
                  <div class="px-6 py-5 space-y-4">
                    <div
                      v-for="{ item, index } in designableItemsWithIndex"
                      :key="index"
                      class="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div class="flex items-center gap-3 mb-3">
                        <span class="text-sm font-medium text-gray-800">{{ item.name }}</span>
                        <span class="text-xs text-gray-400">{{ item.size }}</span>
                      </div>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div>
                          <label class="text-sm font-medium text-gray-700">Print Size</label>
                          <input v-model="placementSettings[index].printSize" type="text"
                            placeholder="e.g., 3x3 inches" class="field" />
                        </div>
                        <div>
                          <label class="text-sm font-medium text-gray-700">Placement</label>
                          <select v-model="placementSettings[index].printPlacement" class="field">
                            <option value="">Select placement...</option>
                            <option value="Full-Wrap">Full Wrap</option>
                            <option value="Front-Only">Front Only</option>
                            <option value="Back-Only">Back Only</option>
                            <option value="Front-Back">Front & Back</option>
                            <option value="Wrap-Around">Wrap Around</option>
                            <option value="Top-Bottom">Top & Bottom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Individual designs (only for designable items) -->
              <div v-else class="space-y-4">
                <div
                  v-for="{ item, index } in designableItemsWithIndex"
                  :key="index"
                  class="bg-white rounded-xl border overflow-hidden"
                >
                  <div v-if="item.image" class="px-6 py-4 border-b bg-gray-50">
                    <div class="flex items-center gap-3">
                      <img :src="getImageUrl(item.image)" class="w-10 h-10 object-cover rounded-lg"
                        @error="handleImageError" />
                      <div>
                        <h4 class="font-semibold">{{ item.name }}</h4>
                        <p class="text-xs text-gray-500">{{ item.size }} · {{ item.quantity }} pcs</p>
                      </div>
                    </div>
                  </div>
                  <div class="px-6 py-5">
                    <DesignManager
                      v-model="itemDesigns[index]"
                      :item-name="item.name"
                      :show-placement="designableItems.length === 1"
                      :is-no-design-mode="false"
                      @design-changed="(design) => updateItemDesign(index, design)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- No design — explicit user choice -->
            <div v-else class="bg-white rounded-xl border p-6">
              <div class="flex items-start gap-3">
                <FileText class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-semibold text-gray-900">No Design</h4>
                  <p class="text-sm text-gray-500">
                    All designable items will be produced plain, as is, with no print or design applied.
                  </p>
                </div>
              </div>
            </div>

          </template>

          <!-- Navigation footer -->
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ step1Errors[0] || 'Please complete design details' }}
              </span>
              <span v-else-if="onlyLids" class="text-xs text-amber-600 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                No design required for this order
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Design details complete
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="previousStep" :disabled="isSubmitting" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all
           hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                ← Back
              </button>
              <button @click="nextStep" :disabled="!isStepValid || isSubmitting" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2
           hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :title="!isStepValid ? 'Please complete design details' : 'Continue to customer info'">
                Enter Info
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== STEP 2: INFO ==================== -->
        <div v-if="getStepKey(currentStep) === 'info'" class="space-y-5">
<CustomerInfoCard
  v-model="customerInfo"
  :errors="errors.customer"
  :saved-profile="savedProfile"
  :disabled="isSubmitting"
  @use-saved="applySavedProfile"
/>
<FulfillmentCard
  v-model="fulfillment"
  :customer-address="customerInfo.address"
  :errors="errors.fulfillment"
  :is-own-cups="isOwnCups"
  :saved-address="savedAddress"
  :saved-addresses="savedAddresses"
  :disabled="isSubmitting"
  @use-saved-address="applySavedAddress"
/>
          <div class="mt-4 flex items-center justify-between">
            <div>
              <span v-if="!isStepValid" class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ stepInfoErrors[0] || 'Please complete all customer and delivery details' }}
              </span>
              <span v-else class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Customer and delivery details complete
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="previousStep" :disabled="isSubmitting" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all
           hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                ← Back
              </button>
              <button @click="nextStep" :disabled="!isStepValid || isSubmitting" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2
           hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :title="!isStepValid ? 'Please complete customer and delivery details' : 'Review your order'">
                Review Order
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== STEP 3: SUBMIT ==================== -->
        <div v-if="getStepKey(currentStep) === 'submit'" class="space-y-5">
          <!-- Two-column info card -->
          <div class="bg-white rounded-xl border">
            <div class="px-6 pt-6 pb-4 border-b">
              <h4 class="font-semibold text-gray-900">Review Your Order</h4>
              <p class="text-xs text-gray-500 mt-0.5">
                Confirm everything looks right before submitting.
              </p>
            </div>

            <div class="px-6 py-6 grid md:grid-cols-2 gap-x-8 gap-y-6">
              <!-- LEFT COLUMN -->
              <div class="space-y-5">
                <!-- Items -->
                <div>
                  <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items</h5>
                  <div class="space-y-2">
                    <div v-for="(item, idx) in orderProducts" :key="idx"
                      class="flex justify-between items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-semibold text-gray-800 truncate">
                          {{ item.name || item.productType || 'Item' }}
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">
                          {{ item.size || item.sizes || 'Custom' }} · {{ (item.quantity || 0).toLocaleString() }} pcs
                        </p>
                      </div>
                      <p class="text-sm font-semibold text-blue-600 shrink-0">
                        ₱{{ calculateItemTotal(item).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Design summary -->
                <div>
                  <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Design</h5>
                  <div class="space-y-1.5 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Mode</span>
                      <span class="font-medium text-gray-800 capitalize">
                        {{ designMode === 'no-design' ? 'No Design' : designMode }}
                      </span>
                    </div>
                    <div v-if="hasDesign" class="flex justify-between">
                      <span class="text-gray-500">Status</span>
                      <span class="font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle class="w-3 h-3" /> Configured
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Cost breakdown -->
                <div>
                  <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Cost Breakdown</h5>
                  <div class="space-y-1.5 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Products Total</span>
                      <span class="font-medium text-gray-800">₱{{ productSubtotal.toLocaleString() }}</span>
                    </div>
                    <div v-if="isOwnCups || hasDesign" class="flex justify-between">
                      <span class="text-gray-500">
                        {{ isOwnCups ? 'Printing Service' : 'Design Fee' }}
                      </span>
                      <span class="font-medium text-gray-800">₱{{ FEES.DESIGN_AND_PRINTING_SERVICE_FEE.toLocaleString()
                        }}</span>
                    </div>
                    <div v-if="fulfillment.method === 'delivery'" class="flex justify-between">
                      <span class="text-gray-500">Shipping Fee</span>
                      <span class="font-medium text-gray-800">₱{{ getShippingFee().toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between pt-2 mt-1 border-t border-gray-100">
                      <span class="font-bold text-gray-900">Estimated Total</span>
                      <span class="text-lg font-bold text-blue-600">₱{{ totalAmount.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- RIGHT COLUMN -->
              <div class="space-y-5">
                <!-- Customer -->
                <div>
                  <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Customer</h5>
                  <div class="space-y-1.5 text-sm">
                    <div class="flex justify-between gap-3">
                      <span class="text-gray-500 shrink-0">Name</span>
                      <span class="font-medium text-gray-800 text-right truncate">{{ customerInfo.name || '—' }}</span>
                    </div>
                    <div v-if="customerInfo.company" class="flex justify-between gap-3">
                      <span class="text-gray-500 shrink-0">Company</span>
                      <span class="font-medium text-gray-800 text-right truncate">{{ customerInfo.company }}</span>
                    </div>
                    <div class="flex justify-between gap-3">
                      <span class="text-gray-500 shrink-0">Email</span>
                      <span class="font-medium text-gray-800 text-right truncate">{{ customerInfo.email || '—' }}</span>
                    </div>
                    <div class="flex justify-between gap-3">
                      <span class="text-gray-500 shrink-0">Phone</span>
                      <span class="font-medium text-gray-800 text-right">{{ customerInfo.phone || '—' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Fulfillment -->
                <div>
                  <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Fulfillment</h5>
                  <div class="space-y-1.5 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Method</span>
                      <span class="font-medium text-gray-800">
                        {{ fulfillment.method === 'pickup' ? 'Pick-up' : 'Delivery' }}
                      </span>
                    </div>
                    <div v-if="isOwnCups && fulfillment.ownCupsDeliveryDate" class="flex justify-between gap-3">
                      <span class="text-gray-500 shrink-0">Drop-off</span>
                      <span class="font-medium text-gray-800 text-right">{{ formatDate(fulfillment.ownCupsDeliveryDate)
                        }}</span>
                    </div>
                    <div v-if="fulfillment.preferredDate" class="flex justify-between gap-3">
                      <span class="text-gray-500 shrink-0">
                        {{ isOwnCups ? 'Completion' : 'Delivery' }} Date
                      </span>
                      <span class="font-medium text-gray-800 text-right">{{ formatDate(fulfillment.preferredDate)
                        }}</span>
                    </div>
                    <div v-if="fulfillment.method === 'delivery' && fullDeliveryAddress" class="flex flex-col gap-1">
                      <span class="text-gray-500">Deliver To</span>
                      <span class="font-medium text-gray-800 text-xs leading-snug">{{ fullDeliveryAddress }}</span>
                    </div>
                    <div v-else-if="fulfillment.method === 'pickup'" class="flex flex-col gap-1">
                      <span class="text-gray-500">Pick-up At</span>
                      <span class="font-medium text-gray-800 text-xs leading-snug">
                        ACAPS Trading — Main Store<br>
                        5051 QUE Grande Ext. Valenzuela, 1440 Manila
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="designMode !== 'no-design'">
                  <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Design Notes</h5>
                  <p class="text-xs text-gray-500 italic leading-snug">
                    {{ designNotesSummary || 'No additional notes provided.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Finalize info card -->
          <PaymentMethodCard @open-messages="openMessagesPreview" />
        </div>
      </div>

      <!-- Right column — compact summary for steps 0–2 only -->
      <div v-if="getStepKey(currentStep) !== 'submit'" class="lg:w-80">
        <OrderSummaryCard variant="compact" :order-type="orderType" :item-count="orderProducts.length"
          :total-quantity="totalQuantity" :total-amount="totalAmount" :fulfillment="fulfillment" :has-design="hasDesign"
          :show-next-button="false" />
      </div>
    </div>

    <!-- Sticky bottom bar — shown only on Submit step -->
    <div v-if="getStepKey(currentStep) === 'submit'"
      class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
      <div class="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
<button
  @click="previousStep"
  :disabled="isSubmitting"
  class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all
         hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  ← Back
</button>

        <div class="hidden md:flex items-center gap-3 text-sm">
          <span class="text-gray-500">Estimated Total:</span>
          <span class="text-lg font-bold text-blue-600">₱{{ totalAmount.toLocaleString() }}</span>
        </div>

        <button @click="handleSubmit" :disabled="!isFormValid || isSubmitting" class="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm inline-flex items-center justify-center gap-2 min-w-[170px]
         hover:bg-blue-700 hover:shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-gray-200
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :title="!isFormValid ? 'Please fix validation errors before submitting' : 'Submit your order'">
          <template v-if="isSubmitting">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting…
          </template>
          <template v-else>
            <CheckCircle class="w-4 h-4" />
            Submit Order
          </template>
        </button>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="router.push('/customer/orders')">
      <div class="bg-white rounded-2xl p-8 max-w-sm text-center mx-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-xl font-bold mb-2">Order Submitted!</h3>
        <p class="text-gray-500 text-sm mb-6">
          We'll reach out in Messages to finalize the details and send payment instructions.
        </p>
        <button @click="router.push('/customer/orders')"
          class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          View My Orders
        </button>
        <button @click="router.push('/customer/messages')"
          class="w-full py-3 mt-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Go to Messages
        </button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show"
          class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <AlertCircle v-if="toast.type === 'error'" class="w-4 h-4 text-red-400" />
          <CheckCircle v-else class="w-4 h-4 text-green-400" />
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart.js'
import { useTemplates } from '@/composables/useTemplates.js'
import CustomerInfoCard from '@/components/create-order/CustomerInfoCard.vue'
import FulfillmentCard from '@/components/create-order/FullfillmentCard.vue'
import PaymentMethodCard from '@/components/create-order/PaymentMethodCard.vue'
import OrderSummaryCard from '@/components/create-order/OrderSummaryCard.vue'
import DesignManager from '@/components/create-order/DesignManager.vue'
import DesignModeSelector from '@/components/create-order/DesignModeSelector.vue'
import ProductSelector from '@/components/create-order/ProductSelector.vue'
import { productsApi, ordersApi, authApi } from '@/api.js'
import { PHONE_REGEX, EMAIL_REGEX } from '@/constants/orderConstants'

import {
  ShoppingCart,
  Package,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { loadCart } = useCart()
const { fetchTemplates } = useTemplates()

// ─── STATE ──────────────────────────────────────────────────────────────────
const isSubmitting = ref(false)
const showSuccess = ref(false)
const toast = ref({ show: false, message: '', type: 'error' })
const selectedProductData = ref(null)
const orderProducts = ref([])
const itemDesigns = ref([])
const sharedDesign = ref({
  designSource: 'upload',
  files: [],
  printSize: '',
  printPlacement: '',
  designNotes: '',
  selectedTemplateId: null,
  selectedTemplate: null,
})
const placementSettings = ref([])
const NO_DESIGN_FIXED_NOTE = 'No design - plain product, as is.'

const customerInfo = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  saveAsDefault: false,
})

const fulfillment = ref({
  method: 'delivery',
  deliveryAddress: '',
  sameAsCustomer: false,
  // ✅ NEW — whether the customer wants this address saved to their profile
  saveAddressAsDefault: false,
})

const errors = ref({ customer: {}, fulfillment: {} })

// Saved profile / address for "use saved" banners
const savedProfile = ref(null)
const savedAddress = ref(null)

// ✅ NEW — full list of the customer's saved addresses
const savedAddresses = ref([])

// ✅ Cache the customer's customerId for saving new addresses
const currentCustomerId = ref(null)

// ✅ Helper to load saved addresses on demand
async function refreshSavedAddresses() {
  if (!currentCustomerId.value) return
  try {
    const { addressesApi } = await import('@/api.js')
    const res = await addressesApi.getAll(currentCustomerId.value)
    if (res.success && Array.isArray(res.data)) {
      savedAddresses.value = res.data
    }
  } catch (e) {
    console.warn('Failed to refresh addresses:', e)
  }
}
// ─── PRICE CONSTANTS ────────────────────────────────────────────────────────
const FEES = {
  DESIGN_AND_PRINTING_SERVICE_FEE: 500,
  LUZON_FEE: 500,
  VISAYAS_FEE: 1000,
  MINDANAO_FEE: 1500,
}

// ─── DESIGN MODE ────────────────────────────────────────────────────────────
const designMode = ref('individual')

// ─── STEPS ──────────────────────────────────────────────────────────────────
const activeSteps = computed(() => {
  return [
    { key: 'product', label: 'Products', enabled: true },
    { key: 'design', label: 'Design', enabled: orderProducts.value.length > 0 },
    { key: 'info', label: 'Info', enabled: true },
    { key: 'submit', label: 'Submit', enabled: true },
  ]
})

const currentStep = ref(0)

function getStepKey(index) {
  const step = activeSteps.value[index]
  return step?.key || ''
}

function getLastStepIndex() {
  return activeSteps.value.length - 1
}

// ─── COMPUTED ──────────────────────────────────────────────────────────────
const orderType = computed(() => (route.query.type === 'company-product' ? 'company-product' : 'own-cups'))
const isCartOrder = computed(() => route.query.source === 'cart')
const isOwnCups = computed(() => orderType.value === 'own-cups')

// ═══════════════════════════════════════════════════════════════════
// ✅ NEW — Lid detection & design-scope helpers
//
// Lids are never designable. We surface that everywhere:
//   • Design step only shows cups & other designable items
//   • Lids always get `designSource: 'no-design'` in the payload
//   • Only-lids orders skip the design fee and auto-set no-design mode
// ═══════════════════════════════════════════════════════════════════

// A product is a lid when either:
//   • itemType === 'lid'  (set when adding via cart / Flow 3)
//   • category === 'Lids' (set at the product level)
function isLidItem(product) {
  if (!product) return false
  return (
    product.itemType === 'lid' ||
    product.category === 'Lids'
  )
}

// Designable items = everything except lids (cups, containers, etc.)
const designableItems = computed(() =>
  orderProducts.value.filter((p) => !isLidItem(p)),
)

// Lids in the order
const lidItems = computed(() =>
  orderProducts.value.filter((p) => isLidItem(p)),
)

const hasLids = computed(() => lidItems.value.length > 0)
const hasDesignableItems = computed(() => designableItems.value.length > 0)
const onlyLids = computed(() => hasLids.value && !hasDesignableItems.value)

// Designable items with their ORIGINAL index into orderProducts[].
// We keep the original index so itemDesigns[i] and placementSettings[i]
// stay aligned with the array they were initialised against.
const designableItemsWithIndex = computed(() =>
  orderProducts.value
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isLidItem(item)),
)

// Pluralised label for the "X lids will be produced as-is" banner
const lidSummaryText = computed(() => {
  const n = lidItems.value.length
  if (n === 0) return ''
  return `${n} lid${n > 1 ? 's' : ''} will be produced as-is (no design).`
})

const orderBadgeClass = computed(() =>
  isOwnCups.value
    ? 'bg-purple-100 text-purple-700'
    : onlyLids.value
      ? 'bg-amber-100 text-amber-700'
      : 'bg-blue-100 text-blue-700',
)
const orderBadgeText = computed(() => {
  if (isOwnCups.value) return 'Own Items'
  if (onlyLids.value) return 'Lids Only'
  if (hasLids.value) return 'Cups + Lids'
  return isCartOrder.value ? 'Multi-Item' : 'Single Product'
})

const totalQuantity = computed(() =>
  orderProducts.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
)

const hasDesign = computed(() => {
  // ✅ Lids-only orders never carry a design fee
  if (!hasDesignableItems.value) return false

  if (designMode.value === 'no-design') return false

  if (designMode.value === 'shared') {
    const design = sharedDesign.value
    return !!(design.designSource === 'upload' && design.files?.length > 0) ||
      !!(design.designSource === 'saved' && design.selectedTemplateId)
  }

  if (designMode.value === 'individual') {
    // ✅ Only count designs on designable items — a "design" on a lid
    //    (which we force to no-design anyway) must not trigger the fee.
    for (const { index } of designableItemsWithIndex.value) {
      const design = itemDesigns.value[index]
      if (!design) continue
      if (design.designSource === 'upload' && design.files?.length > 0) return true
      if (design.designSource === 'saved' && design.selectedTemplateId) return true
    }
  }
  return false
})

// ✅ Auto-flip the mode to 'no-design' whenever designable items drop to zero.
//    Fires on mount AND whenever the user removes the last cup from the order.
watch(
  hasDesignableItems,
  (hasDesignable) => {
    if (!hasDesignable && designMode.value !== 'no-design') {
      designMode.value = 'no-design'
    }
  },
  { immediate: true },
)

const designNotesSummary = computed(() => {
  if (designMode.value === 'shared') {
    return sharedDesign.value.designNotes || ''
  }
  if (designMode.value === 'individual') {
    const notes = itemDesigns.value
      .map(d => d.designNotes)
      .filter(n => n && n.trim())
    return notes.join(' · ')
  }
  return ''
})

const fullDeliveryAddress = computed(() => {
  if (fulfillment.value.method !== 'delivery') return ''
  const parts = [
    fulfillment.value.deliveryStreetAddress,
    fulfillment.value.deliveryBarangay,
    fulfillment.value.deliveryMunicipality,
    fulfillment.value.deliveryProvince,
    fulfillment.value.deliveryPostalCode,
    fulfillment.value.deliveryRegion,
    fulfillment.value.deliveryCountry || 'Philippines',
  ].filter(Boolean)
  return parts.join(', ')
})

// ─── PRICE CALCULATION ──────────────────────────────────────────────────────
function calculateBaseProductPrice(item) {
  if (isOwnCups.value) return 0

  if (item.estimatedTotal) return item.estimatedTotal
  if (item.unitPrice && item.quantity) return item.unitPrice * item.quantity

  if (item.sizes && item.size) {
    const size = item.sizes.find(s => s.name === item.size)
    if (size) {
      let unitPrice = size.price
      const qty = item.quantity || 0
      if (qty >= 5000 && size.bulkPrices?.[5000]) unitPrice = size.bulkPrices[5000] / 5000
      else if (qty >= 2000 && size.bulkPrices?.[2000]) unitPrice = size.bulkPrices[2000] / 2000
      else if (qty >= 1000 && size.bulkPrices?.[1000]) unitPrice = size.bulkPrices[1000] / 1000
      else if (qty >= 500 && size.bulkPrices?.[500]) unitPrice = size.bulkPrices[500] / 500
      return unitPrice * qty
    }
  }
  return 0
}

function calculateItemTotal(item) {
  return calculateBaseProductPrice(item)
}

const productSubtotal = computed(() => {
  let total = 0
  for (const p of orderProducts.value) total += calculateBaseProductPrice(p)
  return total
})

function getShippingFee() {
  if (fulfillment.value.method !== 'delivery') return 0
  const region = fulfillment.value.deliveryRegion || ''
  switch (region) {
    case 'Luzon': return FEES.LUZON_FEE
    case 'Visayas': return FEES.VISAYAS_FEE
    case 'Mindanao': return FEES.MINDANAO_FEE
    default: return 0
  }
}

const totalAmount = computed(() => {
  let total = productSubtotal.value
  if (isOwnCups.value || hasDesign.value) total += FEES.DESIGN_AND_PRINTING_SERVICE_FEE
  total += getShippingFee()
  return total
})

// ─── VALIDATION ────────────────────────────────────────────────────────────
const step0Errors = computed(() => {
  const errorsList = []
  if (isOwnCups.value) {
    if (!orderProducts.value[0]?.productType?.trim()) errorsList.push('Product type is required')
    if (!orderProducts.value[0]?.sizes?.trim()) errorsList.push('Cup size is required')
    if (!orderProducts.value[0]?.quantity || orderProducts.value[0]?.quantity < 500) {
      errorsList.push('Quantity must be at least 500 pcs')
    }
  } else if (orderProducts.value.length === 0) {
    errorsList.push('No products selected')
  } else {
    for (const p of orderProducts.value) {
      if (!p.size) errorsList.push(`Please select a size for "${p.name}"`)
      const minOrder = p.minOrder || 500
      if (!p.quantity || p.quantity < minOrder) {
        errorsList.push(`"${p.name}" quantity must be at least ${minOrder.toLocaleString()} pcs`)
      }

      // ✅ NEW — stock upper-bound check
      if (p.sizes && p.size) {
        const size = p.sizes.find(s => s.name === p.size)
        if (size && size.stock === 0) {
          errorsList.push(`"${p.name}" (${p.size}) is out of stock`)
        } else if (size && size.stock != null && size.stock > 0 && p.quantity > size.stock) {
          errorsList.push(
            `"${p.name}" (${p.size}) only has ${size.stock.toLocaleString()} pcs in stock`
          )
        }
      }
    }
  }
  return errorsList
})

const step1Errors = computed(() => {
  const errorsList = []

  // ✅ Lids never require design — if there's nothing designable, we're done.
  if (!hasDesignableItems.value) return errorsList

  if (designMode.value === 'no-design') return errorsList

  if (designMode.value === 'shared') {
    const design = sharedDesign.value
    if (design.designSource === 'upload') {
      if (!design.files || design.files.length === 0) {
        errorsList.push('Please upload a design image or select a template')
      }
    } else if (design.designSource === 'saved') {
      if (!design.selectedTemplateId) {
        errorsList.push('Please select a saved template')
      }
    }
    // Shared multi-item placement check — only for designable items
    if (designableItemsWithIndex.value.length > 1) {
      for (const { item, index } of designableItemsWithIndex.value) {
        const s = placementSettings.value[index]
        if (!s?.printPlacement) {
          errorsList.push(`Please select placement for "${item.name}"`)
        }
      }
    }
  } else {
    for (const { item, index } of designableItemsWithIndex.value) {
      const design = itemDesigns.value[index]
      const productName = item.name
      if (!design) {
        errorsList.push(`Design details required for "${productName}"`)
        continue
      }
      if (design.designSource === 'upload') {
        const hasFiles = design.files && design.files.length > 0
        const hasNotes = design.designNotes && design.designNotes.trim()
        if (!hasFiles && !hasNotes) {
          errorsList.push(`Please upload a design or add notes for "${productName}"`)
        }
      } else if (design.designSource === 'saved') {
        if (!design.selectedTemplateId) {
          errorsList.push(`Please select a saved template for "${productName}"`)
        }
      }
    }
  }
  return errorsList
})

const stepInfoErrors = computed(() => {
  const errorsList = []
  if (!customerInfo.value.name?.trim()) errorsList.push('Customer name required')
  if (!customerInfo.value.email?.trim() || !EMAIL_REGEX.test(customerInfo.value.email)) {
    errorsList.push('Valid email required')
  }
  const phoneClean = customerInfo.value.phone?.replace(/[\s\-\(\)]/g, '') || ''
  if (!phoneClean || !PHONE_REGEX.test(phoneClean)) {
    errorsList.push('Valid phone required')
  }

  if (fulfillment.value.method === 'delivery') {
    if (!fulfillment.value.deliveryStreetAddress?.trim()) errorsList.push('Street address is required')
    if (!fulfillment.value.deliveryBarangay?.trim()) errorsList.push('Barangay is required')
    if (!fulfillment.value.deliveryMunicipality?.trim()) errorsList.push('Municipality/City is required')
    if (!fulfillment.value.deliveryProvince?.trim()) errorsList.push('Province is required')
    if (!fulfillment.value.deliveryPostalCode?.trim()) errorsList.push('Postal code is required')
    if (!fulfillment.value.deliveryRegion?.trim()) errorsList.push('Region is required')
  }

  if (isOwnCups.value && !fulfillment.value.ownCupsDeliveryDate) {
    errorsList.push('Please select a date to bring your items')
  }
  if (!fulfillment.value.preferredDate) {
    errorsList.push('Please select a preferred date')
  }
  return errorsList
})

const isStepValid = computed(() => {
  const active = activeSteps.value[currentStep.value]
  if (!active) return false
  switch (active.key) {
    case 'product': return step0Errors.value.length === 0 && orderProducts.value.length > 0
    case 'design': return step1Errors.value.length === 0
    case 'info': return stepInfoErrors.value.length === 0
    case 'submit': return true
    default: return false
  }
})

const isFormValid = computed(() =>
  step0Errors.value.length === 0 &&
  step1Errors.value.length === 0 &&
  stepInfoErrors.value.length === 0
)

// ─── STEP NAVIGATION ──────────────────────────────────────────────────────
function getStepClass(index) {
  const isActive = currentStep.value === index
  const isCompleted = currentStep.value > index
  const step = activeSteps.value[index]
  if (!step?.enabled) return 'opacity-50 cursor-not-allowed'
  if (isActive) return 'bg-blue-50 text-blue-700 border border-blue-200'
  if (isCompleted) return 'text-gray-500'
  return 'text-gray-400 hover:text-gray-600'
}

function getStepBadge(index) {
  if (currentStep.value > index) return '✓'
  return index + 1
}

function getStepBadgeClass(index) {
  const isActive = currentStep.value === index
  const isCompleted = currentStep.value > index
  if (isCompleted) return 'bg-green-500 text-white'
  if (isActive) return 'bg-blue-600 text-white'
  return 'bg-gray-200 text-gray-500'
}

function goToStep(index) {
  const step = activeSteps.value[index]
  if (step?.enabled) {
    currentStep.value = index
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function nextStep() {
  if (isStepValid.value && currentStep.value < activeSteps.value.length - 1) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
    saveDraft()
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getImageUrl(path) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  if (!path) return `${base}/uploads/products/default-product.jpg`
  if (path.startsWith('http')) return path
  return `${base}/${path.replace(/^\/+/, '')}`
}

function handleImageError(e) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  e.target.src = `${base}/uploads/products/default-product.jpg`
}

function formatDate(dateValue, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateValue) return ''
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-PH', options)
}

function showToast(message, type = 'error') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function openMessagesPreview() {
  // Just a heads-up; the customer doesn't have a conv for this order yet
  showToast('You\'ll find this order in Messages after submitting.', 'success')
}

// ─── PRODUCT CHANGE ────────────────────────────────────────────────────────
function onProductChanged(products) {
  orderProducts.value = products
  itemDesigns.value = products.map(() => ({
    designSource: 'upload',
    printSize: '',
    printPlacement: '',
    designNotes: '',
    files: [],
    selectedTemplateId: null,
    selectedTemplate: null,
  }))
  placementSettings.value = products.map(() => ({
    printSize: '',
    printPlacement: '',
    designNotes: '',
  }))
}

function updateItemDesign(index, design) {
  itemDesigns.value[index] = design
}

function onSharedDesignChanged(design) {
  sharedDesign.value = design
}

// ─── SAVED PROFILE / ADDRESS ───────────────────────────────────────────────
function applySavedProfile() {
  if (!savedProfile.value) return
  customerInfo.value = {
    ...customerInfo.value,
    name: savedProfile.value.name || customerInfo.value.name,
    company: savedProfile.value.company || customerInfo.value.company,
    email: savedProfile.value.email || customerInfo.value.email,
    phone: savedProfile.value.phone || customerInfo.value.phone,
  }
  showToast('Saved info applied', 'success')
}

function applySavedAddress() {
  if (!savedAddress.value) return
  fulfillment.value = {
    ...fulfillment.value,
    deliveryStreetAddress: savedAddress.value.streetAddress || fulfillment.value.deliveryStreetAddress,
    deliveryBarangay: savedAddress.value.barangay || fulfillment.value.deliveryBarangay,
    deliveryMunicipality: savedAddress.value.municipality || fulfillment.value.deliveryMunicipality,
    deliveryProvince: savedAddress.value.province || fulfillment.value.deliveryProvince,
    deliveryPostalCode: savedAddress.value.postalCode || fulfillment.value.deliveryPostalCode,
    deliveryRegion: savedAddress.value.region || fulfillment.value.deliveryRegion,
    deliveryCountry: savedAddress.value.country || 'Philippines',
  }
  showToast('Saved address applied', 'success')
}

// ─── SESSION DRAFT PERSISTENCE ─────────────────────────────────────────────
const DRAFT_KEY = 'orderDraft'

function saveDraft() {
  try {
    const draft = {
      orderType: orderType.value,
      isCartOrder: isCartOrder.value,
      currentStep: currentStep.value,
      designMode: designMode.value,
      orderProducts: orderProducts.value,
      itemDesigns: itemDesigns.value,
      sharedDesign: sharedDesign.value,
      placementSettings: placementSettings.value,
      customerInfo: customerInfo.value,
      fulfillment: fulfillment.value,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch (e) {
    // Quota exceeded or serialization issue — ignore
  }
}

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    // Draft must match order type; if not, discard
    if (draft.orderType !== orderType.value || draft.isCartOrder !== isCartOrder.value) {
      sessionStorage.removeItem(DRAFT_KEY)
      return null
    }
    return draft
  } catch (e) {
    return null
  }
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY)
}

// Debounced save on any relevant reactive change
let saveTimer = null
watch(
  [orderProducts, itemDesigns, sharedDesign, placementSettings, customerInfo, fulfillment, designMode],
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(saveDraft, 500)
  },
  { deep: true }
)

// ─── SUBMIT ────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {

    // ✅ Persist address to DB (if customer opted in)
    if (
      fulfillment.value.saveAddressAsDefault &&
      fulfillment.value.method === 'delivery' &&
      currentCustomerId.value
    ) {
      try {
        const { addressesApi } = await import('@/api.js')
        const savedRes = await addressesApi.add(currentCustomerId.value, {
          label: 'From order',
          streetAddress: fulfillment.value.deliveryStreetAddress,
          barangay: fulfillment.value.deliveryBarangay,
          municipality: fulfillment.value.deliveryMunicipality,
          province: fulfillment.value.deliveryProvince,
          postalCode: fulfillment.value.deliveryPostalCode,
          region: fulfillment.value.deliveryRegion,
          country: 'Philippines',
          isDefault: false,
        })

        if (savedRes.success) {
          // ✅ Refresh the dropdown so the new address appears immediately
          await refreshSavedAddresses()
        } else {
          console.warn('Address save failed:', savedRes.message)
        }
      } catch (err) {
        console.warn('Failed to save address:', err)
      }
    }
    const itemsArray = []
    let productTotal = 0

    // ✅ Single helper that decides what design (if any) applies to a given
    //    product index. Lids ALWAYS return the no-design payload — the
    //    user's mode choice has zero effect on them.
    const NO_DESIGN_PAYLOAD = {
      designImage: '',
      designSource: 'no-design',
      selectedTemplateId: null,
      selectedTemplate: null,
      printSize: '',
      printPlacement: '',
      designNotes: NO_DESIGN_FIXED_NOTE,
      files: [],
    }

    function designPayloadForProduct(product, index) {
      // Lids → always no-design, period.
      if (isLidItem(product)) return NO_DESIGN_PAYLOAD

      // Everything else → respect the user's mode selection
      if (designMode.value === 'no-design') return NO_DESIGN_PAYLOAD

      if (designMode.value === 'shared') {
        const designImage = getDesignImage(sharedDesign.value)
        const settings = designableItems.value.length > 1
          ? placementSettings.value[index] || {}
          : sharedDesign.value
        return {
          designImage,
          designSource: sharedDesign.value.designSource,
          selectedTemplateId: sharedDesign.value.selectedTemplateId,
          selectedTemplate: sharedDesign.value.selectedTemplate,
          printSize: settings.printSize || sharedDesign.value.printSize || '',
          printPlacement: settings.printPlacement || sharedDesign.value.printPlacement || '',
          designNotes: settings.designNotes || sharedDesign.value.designNotes || '',
          files: sharedDesign.value.files || [],
        }
      }

      // individual
      const design = itemDesigns.value[index] || {}
      return {
        designImage: getDesignImage(design),
        designSource: design.designSource || 'upload',
        selectedTemplateId: design.selectedTemplateId || null,
        selectedTemplate: design.selectedTemplate || null,
        printSize: design.printSize || '',
        printPlacement: design.printPlacement || '',
        designNotes: design.designNotes || '',
        files: design.files || [],
      }
    }

    for (let i = 0; i < orderProducts.value.length; i++) {
      const product = orderProducts.value[i]
      const item = buildItemPayload(product, designPayloadForProduct(product, i))
      itemsArray.push(item)
      productTotal += calculateItemTotal(product)
    }

    // Refresh estimatedTotal from backend for accuracy
    for (const item of itemsArray) {
      if (item.productId) {
        try {
          const priceResult = await productsApi.calculatePrice(item.productId, item.size, item.quantity)
          if (priceResult.success && priceResult.data) {
            item.estimatedTotal = priceResult.data.total
          }
        } catch (error) {
          console.error('Error calculating price:', error)
        }
      }
    }

    // ✅ Re-validate stock against live server data (race guard)
    for (const item of itemsArray) {
      if (!item.productId || !item.size) continue
      try {
        const fresh = await productsApi.getProductById(item.productId)
        if (fresh.success && fresh.data?.sizes) {
          const size = fresh.data.sizes.find(s => s.name === item.size)
          if (!size || size.stock == null) continue
          if (size.stock === 0) {
            showToast(`"${item.name}" (${item.size}) just went out of stock`, 'error')
            isSubmitting.value = false
            return
          }
          if (item.quantity > size.stock) {
            showToast(
              `"${item.name}" (${item.size}) only has ${size.stock.toLocaleString()} pcs left. Please adjust your quantity.`,
              'error'
            )
            isSubmitting.value = false
            return
          }
        }
      } catch (err) {
        console.warn('Stock re-check failed for', item.name, err)
      }
    }

    let finalAmount = productTotal || itemsArray.reduce((sum, i) => sum + (i.estimatedTotal || 0), 0)
    if (isOwnCups.value || hasDesign.value) {
      finalAmount += FEES.DESIGN_AND_PRINTING_SERVICE_FEE
    }
    finalAmount += getShippingFee()

    const orderData = {
      items: itemsArray,
      quantity: itemsArray.reduce((sum, item) => sum + (item.quantity || 0), 0),
      address: fullDeliveryAddress.value,
      postalCode: fulfillment.value.deliveryPostalCode || '',
      receivingMode: fulfillment.value.method === 'pickup' ? 'Pick-up' : 'Delivery',
      shippingFee: getShippingFee(),
      isProvided: isOwnCups.value,
      amount: finalAmount,
      customerName: customerInfo.value.name,
      customerEmail: customerInfo.value.email,
      customerPhone: customerInfo.value.phone,
      notes: generateOrderNotes(),
      preferredDate: fulfillment.value.preferredDate || '',
      preferredTime: fulfillment.value.preferredTime || '',
      fromCustomerToCompanyDeliveryDate: fulfillment.value.ownCupsDeliveryDate || '',
      customer: {
        name: customerInfo.value.name,
        email: customerInfo.value.email,
        phone: customerInfo.value.phone,
        company: customerInfo.value.company,
      },
    }

    const response = await ordersApi.createOrder(orderData)

    if (response.success) {
      if (isCartOrder.value) {
        // ✅ Only remove the items the customer actually ordered.
        // Unchecked cart items stay for a later order.
        const { removeSelectedFromCart } = useCart()
        removeSelectedFromCart()
        sessionStorage.removeItem('pendingCart')
      }
      if (customerInfo.value.saveAsDefault) {
        localStorage.setItem('defaultCustomerInfo', JSON.stringify(customerInfo.value))
      }
      clearDraft()
      showSuccess.value = true
    } else {
      showToast(response.message || 'Failed to submit order')
    }
  } catch (error) {
    console.error('Submit error:', error)
    showToast(error.message || 'Error submitting order')
  } finally {
    isSubmitting.value = false
  }
}

function buildItemPayload(product, design) {
  let designImage = ''
  let designFiles = []

  if (design.designSource === 'upload') {
    if (design.files && design.files.length > 0) {
      const firstFile = design.files[0]
      designImage = firstFile.path || firstFile.url || ''
      designFiles = design.files.map(f => ({
        name: f.name || '',
        size: f.size || 0,
        type: f.type || '',
        path: f.path || f.url || '',
        url: f.url || f.path || '',
      }))
    }
  } else if (design.designSource === 'saved' && design.selectedTemplate) {
    designImage = design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || ''
  }

  if (isOwnCups.value) {
    return {
      productId: null,
      name: product.productType || 'Customer Provided Items',
      category: 'Customer Provided',
      size: product.sizes || 'Custom',
      quantity: product.quantity || 500,
      designSource: design.designSource || 'upload',
      designImage,
      printSize: design.printSize || '',
      printPlacement: design.printPlacement || '',
      designNotes: design.designNotes || '',
      files: designFiles,
      selectedTemplateId: design.selectedTemplateId || null,
      selectedTemplate: design.selectedTemplate || null,
      estimatedTotal: 0,
      // ✅ Own-cups have no product rim
      rimDiameter: null,
      itemType: 'cup',
    }
  }

  // ✅ NEW — resolve rim diameter from the product's size.
  // Priority: explicit value on the product → looked up from sizes[]
  let rimDiameter = product.rimDiameter ?? null
  if (!rimDiameter && product.sizes?.length && product.size) {
    const sizeObj = product.sizes.find((s) => s.name === product.size)
    if (sizeObj?.rimDiameter) rimDiameter = sizeObj.rimDiameter
  }

  // ✅ Belt-and-suspenders: even if the caller passes a design payload,
  //    force lids to no-design here. This is the last line of defense.
  const isLidProduct =
    product.itemType === 'lid' || product.category === 'Lids'

  const effectiveDesign = isLidProduct
    ? {
        designSource: 'no-design',
        designImage: '',
        printSize: '',
        printPlacement: '',
        designNotes: NO_DESIGN_FIXED_NOTE,
        files: [],
        selectedTemplateId: null,
        selectedTemplate: null,
      }
    : design

  let effectiveDesignImage = designImage
  let effectiveDesignFiles = designFiles
  if (isLidProduct) {
    effectiveDesignImage = ''
    effectiveDesignFiles = []
  }

  return {
    productId: product.productId,
    name: product.name,
    category: product.category,
    size: product.size,
    quantity: product.quantity,
    designSource: effectiveDesign.designSource || 'no-design',
    designImage: effectiveDesignImage,
    printSize: effectiveDesign.printSize || '',
    printPlacement: effectiveDesign.printPlacement || '',
    designNotes: effectiveDesign.designNotes || '',
    files: effectiveDesignFiles,
    selectedTemplateId: effectiveDesign.selectedTemplateId || null,
    selectedTemplate: effectiveDesign.selectedTemplate || null,
    // ✅ Rim-aware fields — prefer explicit value, fall back to category-based
    rimDiameter,
    itemType: isLidProduct ? 'lid' : 'cup',
  }
}

function getDesignImage(design) {
  if (!design) return ''
  if (design.designSource === 'upload' && design.files?.length > 0) {
    return design.files[0].path || ''
  }
  if (design.designSource === 'saved' && design.selectedTemplate) {
    return design.selectedTemplate.imagePath || design.selectedTemplate.thumbnail || ''
  }
  return ''
}

function generateOrderNotes() {
  const modeLabels = {
    'no-design': 'No Design - Plain product as is',
    'individual': 'Individual Designs',
    'shared': 'Shared Design',
  }
  const modeLabel = modeLabels[designMode.value] || 'Custom Design'
  const itemNames = orderProducts.value.map(i => i.name || i.productType).join(', ')
  return `${modeLabel} | Items: ${itemNames}`
}

// ─── WATCHERS ─────────────────────────────────────────────────────────────
watch(orderProducts, (newProducts) => {
  if (newProducts.length === 0) return
  if (newProducts.length === 1 && designMode.value === 'shared') {
    designMode.value = 'individual'
  }
}, { immediate: true })

function parseProductDataFromQuery() {
  const productId = route.query.productId
  const productName = route.query.productName
  const productImage = route.query.productImage
  const productCategory = route.query.productCategory
  const minOrder = parseInt(route.query.minOrder) || 500
  const size = route.query.size
  const quantity = parseInt(route.query.quantity) || minOrder
  // ✅ NEW — read itemType from the query (defaults to 'cup')
  const itemType = route.query.itemType || 'cup'

  let productData = null
  if (route.query.productData) {
    try {
      productData = JSON.parse(route.query.productData)
    } catch (e) {
      console.error('Error parsing product data:', e)
    }
  }
  return { productId, productName, productImage, productCategory, minOrder, size, quantity, productData, itemType }
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────
onMounted(async () => {
  const { productId, productName, productImage, productCategory, minOrder, size, quantity, productData } = parseProductDataFromQuery()

  // Try restoring a draft first
  const draft = loadDraft()

  if (draft) {
    designMode.value = draft.designMode || 'individual'
    orderProducts.value = draft.orderProducts || []
    itemDesigns.value = draft.itemDesigns || []
    sharedDesign.value = draft.sharedDesign || sharedDesign.value
    placementSettings.value = draft.placementSettings || []
    customerInfo.value = draft.customerInfo || customerInfo.value
    fulfillment.value = { ...fulfillment.value, ...(draft.fulfillment || {}) }
    currentStep.value = Math.min(draft.currentStep || 0, activeSteps.value.length - 1)
    showToast('Restored your previous draft', 'success')
  } else {
    // Fresh start — init based on order type
    const { itemType: queryItemType } = parseProductDataFromQuery()

    if (isCartOrder.value) {
      const pendingCart = sessionStorage.getItem('pendingCart')
      if (pendingCart) {
        orderProducts.value = JSON.parse(pendingCart)
      } else {
        loadCart()
        const savedCart = localStorage.getItem('customerCart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          orderProducts.value = parsedCart.map(item => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            category: item.category,
            size: item.size || '',
            quantity: item.quantity,
            printPlacement: item.printPlacement || '',
            printSize: item.printSize || '',
            designNotes: item.designNotes || '',
            estimatedTotal: item.estimatedTotal || 0,
            sizes: item.sizes || [],
            minOrder: item.minOrder || 500,
            unitPrice: item.unitPrice || 0,
                        // ✅ NEW — preserve rim-aware fields from the cart line
            rimDiameter: item.rimDiameter ?? null,
            itemType: item.itemType || 'cup',
          }))
        }
      }
      onProductChanged(orderProducts.value)
    }

    if (!isCartOrder.value && orderType.value === 'company-product') {
      if (productId && productData) {
        selectedProductData.value = productData
        let defaultSize = size
        if (!defaultSize || !productData.sizes?.find(s => s.name === defaultSize)) {
          defaultSize = productData.sizes?.[0]?.name || ''
        }
        const defaultQuantity = quantity || minOrder || productData.minOrder || 500
        const selectedSizeObj = productData.sizes?.find(s => s.name === defaultSize)

        orderProducts.value = [{
          productId,
          name: productName || productData.name,
          image: productImage || productData.image,
          category: productCategory || productData.category,
          // ✅ NEW — carry subcategory (helps identify lid type)
          subcategory: productData.subcategory || '',
          size: defaultSize,
          quantity: defaultQuantity,
          minOrder: minOrder || productData.minOrder || 500,
          sizes: productData.sizes || [],
          unitPrice: selectedSizeObj?.price || 0,
          // ✅ NEW — rim + item type from query
          rimDiameter: selectedSizeObj?.rimDiameter ?? null,
          itemType: queryItemType,
        }]
        designMode.value = 'individual'
        onProductChanged(orderProducts.value)
      } else if (productId) {
        const response = await productsApi.getProductById(productId)
        if (response.success && response.data) {
          selectedProductData.value = response.data
          let defaultSize = size
          if (!defaultSize || !response.data.sizes?.find(s => s.name === defaultSize)) {
            defaultSize = response.data.sizes?.[0]?.name || ''
          }
          const defaultQuantity = quantity || response.data.minOrder || 500
          const sizeObj = response.data.sizes?.find(s => s.name === defaultSize)
          orderProducts.value = [{
            productId: response.data.id,
            name: response.data.name,
            image: response.data.image,
            category: response.data.category,
            // ✅ NEW — carry subcategory + rim + item type
            subcategory: response.data.subcategory || '',
            size: defaultSize,
            quantity: defaultQuantity,
            minOrder: response.data.minOrder,
            sizes: response.data.sizes,
            unitPrice: sizeObj?.price || 0,
            rimDiameter: sizeObj?.rimDiameter ?? null,
            itemType: queryItemType,
          }]
          designMode.value = 'individual'
          onProductChanged(orderProducts.value)
        }
      }
    }

    if (isOwnCups.value) {
      orderProducts.value = [{ productType: '', sizes: '', quantity: 500 }]
      designMode.value = 'individual'
      onProductChanged(orderProducts.value)

      const pendingOwnCups = sessionStorage.getItem('pendingOwnCups')
      if (pendingOwnCups) {
        const data = JSON.parse(pendingOwnCups)
        if (data.ownCupsDeliveryDate) {
          fulfillment.value.ownCupsDeliveryDate = data.ownCupsDeliveryDate
        }
      }
    }
  }

  // Restore default customer info from localStorage (legacy fallback)
  const saved = localStorage.getItem('defaultCustomerInfo')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      customerInfo.value = { ...customerInfo.value, ...data }
    } catch (e) { /* ignore */ }
  }

  // Load saved profile + address from the server (for "Use saved info" banners)
  try {
    const profileRes = await authApi.getProfile()
    if (profileRes.success && profileRes.data) {
      const p = profileRes.data
      savedProfile.value = {
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        company: p.companyName || '',
        email: p.email || '',
        phone: p.phone || '',
      }

      // ✅ Cache customerId for later use (address saving)
      currentCustomerId.value = p.customerId || null

      // ✅ NEW — fetch saved addresses for the dropdown
      if (p.customerId) {
        try {
          const { addressesApi } = await import('@/api.js')
          const addrRes = await addressesApi.getAll(p.customerId)
          if (addrRes.success && Array.isArray(addrRes.data)) {
            savedAddresses.value = addrRes.data

            // If there's a default, expose it as the legacy savedAddress
            const def = addrRes.data.find((a) => a.isDefault) || addrRes.data[0]
            if (def) {
              savedAddress.value = {
                streetAddress: def.streetAddress || '',
                barangay: def.barangay || '',
                municipality: def.municipality || '',
                province: def.province || '',
                postalCode: def.postalCode || '',
                region: def.region || '',
                country: def.country || 'Philippines',
              }
            }
          }
        } catch (addrErr) {
          console.warn('Failed to load saved addresses:', addrErr)
        }
      }
    }
  } catch (e) {
    // Not fatal — user just won't see the saved banner
  }

  await fetchTemplates()
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  saveDraft()
})
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

textarea.field {
  @apply h-auto py-2;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>