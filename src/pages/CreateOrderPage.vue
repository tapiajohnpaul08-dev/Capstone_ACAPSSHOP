<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <div class="mb-6">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back
      </button>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1 text-sm">
            <span v-if="orderType === 'own-cups'">You'll provide your own cups for printing.</span>
            <span v-else-if="isCartOrder"
              >You're ordering {{ cartItems.length }} product(s) from your cart.</span
            >
            <span v-else>Ordering from our product catalog — we supply & print.</span>
          </p>
        </div>
        <span
          class="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 mt-1"
          :class="
            orderType === 'own-cups' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          "
        >
          {{
            orderType === 'own-cups'
              ? '📦 Own Cups'
              : '🛒 ' + (isCartOrder ? 'Multi-Item Order' : 'Single Product')
          }}
        </span>
      </div>
    </div>

    <!-- Step Indicators -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      <div v-for="(step, i) in steps" :key="step.key" class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
            :class="
              currentStep > i
                ? 'bg-blue-600 text-white'
                : currentStep === i
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
            "
          >
            <svg
              v-if="currentStep > i"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium hidden sm:block"
            :class="
              currentStep === i
                ? 'text-blue-600'
                : currentStep > i
                  ? 'text-gray-500'
                  : 'text-gray-400'
            "
          >
            {{ step.label }}
          </span>
        </div>
        <div v-if="i < steps.length - 1" class="w-8 h-px bg-gray-200 shrink-0"></div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 space-y-5">
        <!-- STEP 0: Product Details -->
        <div v-if="currentStep === 0">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ isCartOrder ? `Cart Items (${cartItems.length})` : 'Product Details' }}
                </h2>
                <p class="text-xs text-gray-500">
                  {{
                    isCartOrder ? 'Review and customize each item' : 'Review your selected product'
                  }}
                </p>
              </div>
              <button
                v-if="isCartOrder && cartItems.length > 0"
                @click="clearCart"
                class="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            <!-- Product Card -->
            <div
              v-for="(item, index) in displayItems"
              :key="index"
              class="bg-white rounded-xl border overflow-hidden"
            >
              <div class="px-6 pt-6 pb-4 border-b bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img
                      :src="getImageUrl(item.image)"
                      :alt="item.name"
                      class="w-10 h-10 object-cover rounded-lg border"
                      @error="handleImageError"
                    />
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ item.name }}</h4>
                      <p class="text-xs text-gray-500">{{ item.category }}</p>
                    </div>
                  </div>
                  <button
                    v-if="isCartOrder"
                    @click="removeItem(index)"
                    class="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="px-6 py-5 space-y-4">
                <!-- For Own Cups: Show product type  -->
                <div v-if="orderType === 'own-cups'" class="space-y-4">
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Product Type <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="productDetails.productType"
                        type="text"
                        placeholder="e.g., Coffee Cups, Tumblers, Lighters"
                        class="field"
                        :class="{
                          'border-red-400 ring-1 ring-red-300': errors.product.productType,
                        }"
                      />
                      <p v-if="errors.product.productType" class="text-xs text-red-500">
                        {{ errors.product.productType }}
                      </p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Cup Size <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="productDetails.sizes"
                        type="text"
                        placeholder="e.g., 12oz, 16oz"
                        class="field"
                        :class="{ 'border-red-400 ring-1 ring-red-300': errors.product.sizes }"
                      />
                      <p v-if="errors.product.sizes" class="text-xs text-red-500">
                        {{ errors.product.sizes }}
                      </p>
                    </div>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Quantity <span class="text-red-500">*</span>
                      </label>
                      <div class="flex items-center gap-2">
                        <button
                          @click="adjustOwnCupsQuantity(-500)"
                          :disabled="productDetails.quantity <= 500"
                          class="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <input
                          v-model.number="productDetails.quantity"
                          type="number"
                          min="500"
                          step="500"
                          class="field text-center"
                        />
                        <button
                          @click="adjustOwnCupsQuantity(500)"
                          class="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                      <p class="text-xs text-gray-400">Min: 500 pcs</p>
                    </div>
                  </div>
                </div>

                <!-- For Company Products: Size and Quantity -->
                <div v-else class="grid md:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-gray-700">
                      Size <span class="text-red-500">*</span>
                    </label>
                    <select
                      :value="singleItemState.size"
                      @change="onSingleSizeChange($event.target.value, item.productId)"
                      class="field"
                      :class="{
                        'border-red-400 ring-1 ring-red-300':
                          errors.product.sizes || productErrors.size,
                      }"
                    >
                      <option value="" disabled>Select a size...</option>
                      <option
                        v-for="size in getProductSizes(item.productId)"
                        :key="size.name"
                        :value="size.name"
                      >
                        {{ size.name }} — ₱{{ size.price.toLocaleString() }}/pc
                        <span v-if="size.stock > 0">
                          ({{ size.stock.toLocaleString() }} in stock)</span
                        >
                        <span v-else class="text-red-500"> (Out of stock)</span>
                      </option>
                    </select>
                    <p
                      v-if="errors.product.sizes || productErrors.size"
                      class="text-xs text-red-500"
                    >
                      {{ errors.product.sizes || productErrors.size }}
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-gray-700">
                      Quantity <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        @click="adjustItemQuantity(index, -500)"
                        :disabled="singleItemState.quantity <= getMinOrder(item.productId)"
                        class="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <input
                        :value="singleItemState.quantity"
                        @input="onSingleQtyInput($event.target.value, item.productId)"
                        type="number"
                        :min="getMinOrder(item.productId)"
                        :max="getSizeStock(item.productId, singleItemState.size) || undefined"
                        step="500"
                        class="field text-center"
                        :class="{
                          'border-red-400 ring-1 ring-red-300':
                            errors.product.quantity || productErrors.quantity,
                        }"
                      />
                      <button
                        @click="adjustItemQuantity(index, 500)"
                        :disabled="
                          getSizeStock(item.productId, singleItemState.size) > 0 &&
                          singleItemState.quantity >=
                            getSizeStock(item.productId, singleItemState.size)
                        "
                        class="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>
                    <p
                      v-if="errors.product.quantity || productErrors.quantity"
                      class="text-xs text-red-500"
                    >
                      {{ errors.product.quantity || productErrors.quantity }}
                    </p>
                    <p v-else class="text-xs text-gray-400">
                      Min: {{ getMinOrder(item.productId).toLocaleString() }} pcs
                      <span v-if="getSizeStock(item.productId, singleItemState.size) > 0">
                        · Max:
                        {{
                          getSizeStock(item.productId, singleItemState.size).toLocaleString()
                        }}
                        pcs (in stock)
                      </span>
                      · Multiples of 500
                    </p>
                    <p
                      v-if="
                        getSizeStock(item.productId, singleItemState.size) === 0 &&
                        singleItemState.size
                      "
                      class="text-xs text-red-500"
                    >
                      ⚠️ This size is currently out of stock. Please select another size.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 1: Design Info (For each item with saved templates option) -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Design Information</h2>
              <p class="text-xs text-gray-500">
                Upload artwork, use saved templates, or specify design preferences for each item
              </p>
            </div>
          </div>

          <!-- Design card for each item -->
          <div
            v-for="(item, index) in designItems"
            :key="index"
            class="bg-white rounded-xl border overflow-hidden"
          >
            <div class="px-6 pt-6 pb-4 border-b bg-gray-50">
              <div class="flex items-center gap-3">
                <img
                  :src="getImageUrl(item.image)"
                  :alt="item.name"
                  class="w-8 h-8 object-cover rounded-lg border"
                  @error="handleImageError"
                />
                <div>
                  <h4 class="font-semibold text-gray-900">{{ item.name }}</h4>
                  <p class="text-xs text-gray-500">
                    {{ item.size }} · {{ item.quantity.toLocaleString() }} pcs
                  </p>
                </div>
              </div>
            </div>

            <div class="px-6 py-5 space-y-4">
              <!-- Design Source Toggle -->
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="setDesignSourceForItem(index, 'upload')"
                  class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
                  :class="
                    itemDesigns[index].designSource === 'upload'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  "
                >
                  Upload New
                </button>
                <button
                  @click="setDesignSourceForItem(index, 'saved')"
                  class="p-3 rounded-lg border-2 transition-all text-sm font-medium"
                  :class="
                    itemDesigns[index].designSource === 'saved'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  "
                >
                  Saved Template
                </button>
              </div>

              <!-- Upload Panel -->
              <div v-if="itemDesigns[index].designSource === 'upload'" class="space-y-4">
                <!-- File Upload -->
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-gray-700">Upload Design File</label>
                  <div
                    @dragover.prevent="dragOverIndex = index; dragging = true"
                    "
                    @dragleave="dragging = false"
                    @drop.prevent="handleDropOnItem(index, $event)"
                    class="border-2 border-dashed rounded-xl p-4 text-center transition-colors"
                    :class="
                      dragging && dragOverIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      class="mx-auto text-gray-400 mb-1"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <p class="text-xs text-gray-500">
                      Drag & drop or
                      <label class="text-blue-600 cursor-pointer hover:underline">
                        browse
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf,.ai,.psd"
                          class="hidden"
                          @change="handleFileSelectOnItem(index, $event)"
                        />
                      </label>
                    </p>
                    <p class="text-xs text-gray-400">PNG, JPG, PDF, AI, PSD · Max 20MB</p>
                  </div>

                  <!-- Uploaded files list -->
                  <div
                    v-if="itemDesigns[index].files && itemDesigns[index].files.length > 0"
                    class="space-y-1 mt-2"
                  >
                    <div
                      v-for="(file, fileIdx) in itemDesigns[index].files"
                      :key="fileIdx"
                      class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        class="text-blue-600"
                      >
                        <path
                          d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                        />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span class="flex-1 truncate">{{ file.name }}</span>
                      <button
                        @click="removeFileFromItem(index, fileIdx)"
                        class="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Print Size -->
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-gray-700">Print Size</label>
                  <input
                    v-model="itemDesigns[index].printSize"
                    type="text"
                    placeholder="e.g., 3x3 inches"
                    class="field"
                  />
                </div>

                <!-- Print Placement -->
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-gray-700">Print Placement</label>
                  <select v-model="itemDesigns[index].printPlacement" class="field">
                    <option value="">Select placement...</option>
                    <option value="full-wrap">Full Wrap</option>
                    <option value="front-only">Front Only</option>
                    <option value="back-only">Back Only</option>
                    <option value="front-back">Front & Back</option>
                  </select>
                </div>
              </div>

              <!-- Saved Templates Panel -->
              <div v-if="itemDesigns[index].designSource === 'saved'" class="space-y-4">
                <!-- Loading state -->
                <div v-if="isLoadingTemplates" class="text-center py-8">
                  <div
                    class="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
                  ></div>
                  <p class="text-sm text-gray-500 mt-2">Loading your templates...</p>
                </div>

                <!-- Templates grid -->
                <div v-else-if="savedTemplates.length > 0" class="space-y-3">
                  <div class="grid gap-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="template in savedTemplates"
                      :key="template.id"
                      @click="selectTemplateForItem(index, template)"
                      class="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                      :class="{
                        'border-blue-500 bg-blue-50':
                          itemDesigns[index].selectedTemplateId === template.id,
                      }"
                    >
                      <div class="flex items-center gap-3">
                        <img :src="template.thumbnail" class="w-12 h-12 object-cover rounded" />
                        <div class="flex-1">
                          <div class="text-sm font-medium">{{ template.name }}</div>
                          <div class="text-xs text-gray-500">
                            Print: {{ template.printSize || 'Standard' }} ·
                            {{ template.placement || 'Front' }}
                          </div>
                          <div class="text-xs text-gray-400">
                            Last used: {{ template.lastUsed }}
                          </div>
                        </div>
                        <svg
                          v-if="itemDesigns[index].selectedTemplateId === template.id"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="text-blue-600"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Template preview info -->
                  <div
                    v-if="itemDesigns[index].selectedTemplateId"
                    class="bg-blue-50 rounded-lg p-3"
                  >
                    <p class="text-xs text-blue-700">
                      ✓ Template selected. Print size and placement will be applied to this item.
                    </p>
                  </div>
                </div>

                <div v-else class="text-center py-8 bg-gray-50 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="mx-auto text-gray-400 mb-2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="m9 9 6 6m0-6-6 6" />
                  </svg>
                  <p class="text-sm text-gray-500">No saved templates yet.</p>
                  <p class="text-xs text-gray-400 mt-1">
                    Designs from past orders will appear here.
                  </p>
                </div>
              </div>

              <!-- Design Notes (common for both) -->
              <div class="space-y-1.5 pt-2">
                <label class="text-sm font-medium text-gray-700">Design Notes</label>
                <textarea
                  v-model="itemDesigns[index].designNotes"
                  rows="2"
                  placeholder="Special instructions, color preferences, font choices..."
                  class="field resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Customer Info -->
        <CustomerInfoCard
          v-if="currentStep === 2"
          v-model="customerInfo"
          :errors="errors.customer"
        />

        <!-- STEP 3: Fulfillment -->
        <FulfillmentCard
          v-if="currentStep === 3"
          v-model="fulfillment"
          :customer-address="customerInfo.address"
          :errors="errors.fulfillment"
        />

        <!-- Navigation Buttons -->
        <div class="flex justify-between pt-2">
          <button
            v-if="currentStep > 0"
            @click="currentStep--"
            class="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Previous
          </button>
          <div v-else></div>
          <button
            v-if="currentStep < steps.length - 1"
            @click="nextStep"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Continue
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:w-80">
        <OrderSummaryCard
          :order-type="orderType"
          :selected-product="selectedProduct"
          :product-type="productDetails.productType"
          :quantity="orderQuantity"
          :sizes="orderSizes"
          :design-source="'custom'"
          :files-count="totalFilesCount"
          :fulfillment="fulfillment.method"
          :cart-items="cartItems"
          :is-cart-order="isCartOrder"
          :can-submit="currentStep === steps.length - 1 && isFormValid"
          :is-submitting="isSubmitting"
          :validation-hints="validationHints"
          @submit="handleSubmit"
        />
      </div>
    </div>

    <!-- Success overlay -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="router.push('/customer/orders')"
    >
      <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-green-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Order Submitted!</h3>
        <p class="text-gray-500 text-sm mb-6">
          We've received your order and will be in touch within 1–2 business days for design
          approval.
        </p>
        <button
          @click="router.push('/customer/orders')"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View My Orders
        </button>
      </div>
    </div>

    <Teleport to="body">
      <transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-green-400"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomerInfoCard from '@/components/create-order/CustomerInfoCard.vue'
import FulfillmentCard from '@/components/create-order/FullfillmentCard.vue'
import OrderSummaryCard from '@/components/create-order/OrderSummaryCard.vue'
import { useOrders } from '@/composables/useOrders.js'
import { PHONE_REGEX, EMAIL_REGEX, FILE_CONSTANTS } from '@/constants/orderConstants'
import { designsApi, productsApi, ordersApi } from '@/api.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const route = useRoute()
const router = useRouter()
const { submitOrder } = useOrders()

// State
const isSubmitting = ref(false)
const showSuccess = ref(false)
const toast = ref({ show: false, message: '' })
const products = ref([])
const selectedProductData = ref(null)
const isLoadingProduct = ref(false)

// Mutable state for the single-product case (size + quantity picked by the user)
// This is the source of truth that displayItems, orderSizes, orderQuantity,
// and the summary card all read from — fixes the "values not updating" bug.
const singleItemState = ref({ size: '', quantity: 0 })

function getImageUrl(imagePath) {
  if (!imagePath) return `${API_BASE_URL}/uploads/products/default-product.jpg`
  if (imagePath.startsWith('http')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')
  if (cleanPath.startsWith('uploads/')) return `${API_BASE_URL}/${cleanPath}`
  if (cleanPath.startsWith('products/')) return `${API_BASE_URL}/uploads/${cleanPath}`
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
}

function handleImageError(event) {
  event.target.src = `${API_BASE_URL}/uploads/products/default-product.jpg`
}
// Toast function
function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const orderType = computed(() =>
  route.query.type === 'company-product' ? 'company-product' : 'own-cups',
)
const isCartOrder = computed(() => route.query.source === 'cart')

// Load product from backend instead of local catalog
const selectedProduct = computed(() => {
  if (orderType.value !== 'company-product' || isCartOrder.value) return null
  return selectedProductData.value
})

console.log('selected pr:', selectedProduct.value)

const cartItems = ref([])
const itemDesigns = ref([])
const dragging = ref(false)
const dragOverIndex = ref(null)
const savedTemplates = ref([])
const isLoadingTemplates = ref(false)

// Steps configuration
const steps = [
  { key: 'product', label: 'Product Details' },
  { key: 'design', label: 'Design' },
  { key: 'customer', label: 'Customer Info' },
  { key: 'fulfillment', label: 'Fulfillment' },
]

const currentStep = ref(0)

// Product Details for Own Cups
const productDetails = ref({
  productType: '',
  quantity: 500,
  sizes: '',
})

// Display items - either cart items or single product as array
const displayItems = computed(() => {
  if (isCartOrder.value) {
    return cartItems.value
  }
  // Own cups order
  if (orderType.value === 'own-cups') {
    return [
      {
        productId: null,
        name: productDetails.value.productType || 'Custom Product',
        image: '/placeholder-image.png',
        category: 'Customer Provided',
        size: productDetails.value.sizes || '',
        quantity: productDetails.value.quantity || 500,
        specifications: productDetails.value.specifications || '',
      },
    ]
  }
  // Single product order (company product) - use backend data
  if (selectedProduct.value && selectedProduct.value.id) {
    return [
      {
        productId: selectedProduct.value.id,
        name: selectedProduct.value.name,
        image: selectedProduct.value.image,
        category: selectedProduct.value.category,
        // Read from mutable singleItemState — NOT freshly derived each render
        size: singleItemState.value.size,
        quantity: singleItemState.value.quantity,
        sizes: selectedProduct.value.sizes || [],
      },
    ]
  }
  // Show loading state or empty
  return []
})

// Design items (same as display items for design step)
const designItems = computed(() => displayItems.value)

// Order quantity for summary
const orderQuantity = computed(() => {
  if (isCartOrder.value) {
    return cartItems.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  }
  if (orderType.value === 'own-cups') {
    return productDetails.value.quantity || 0
  }
  return singleItemState.value.quantity || displayItems.value[0]?.quantity || 0
})

// Order sizes for summary
const orderSizes = computed(() => {
  if (isCartOrder.value) {
    return cartItems.value.map((i) => i.size).join(', ')
  }
  if (orderType.value === 'own-cups') {
    return productDetails.value.sizes || ''
  }
  return singleItemState.value.size || displayItems.value[0]?.size || ''
})

// Helper functions
function getProductSizes(productId) {
  if (!productId) return []
  if (selectedProduct.value && selectedProduct.value.id === productId) {
    return selectedProduct.value.sizes || []
  }
  return []
}

function getMinOrder(productId) {
  if (!productId) return 500
  if (selectedProduct.value && selectedProduct.value.id === productId) {
    return selectedProduct.value.minOrder || 500
  }
  return 500
}

// Returns the stock of a given size name for a product (used as quantity min)
function getSizeStock(productId, sizeName) {
  if (!productId || !sizeName) return 0
  const prod = selectedProduct.value?.id === productId ? selectedProduct.value : null
  if (!prod) return 0
  const sizeObj = prod.sizes?.find((s) => s.name === sizeName)
  return sizeObj?.stock ?? 0
}

function adjustItemQuantity(index, delta) {
  if (isCartOrder.value) {
    const item = cartItems.value[index]
    const min = getMinOrder(item.productId)
    const newQty = item.quantity + delta
    if (newQty >= min) cartItems.value[index].quantity = newQty
  } else {
    // Single product mode — min = minOrder, max = stock of selected size
    const productId = displayItems.value[0]?.productId
    const sizeName = singleItemState.value.size
    const stock = getSizeStock(productId, sizeName)
    const minQty = getMinOrder(productId)
    const maxQty = stock
    const newQty = singleItemState.value.quantity + delta
    if (newQty >= minQty && (maxQty === 0 || newQty <= maxQty)) {
      singleItemState.value.quantity = newQty
    }
  }
}

// Handlers for single-product mode size/qty changes
function onSingleSizeChange(newSize, productId) {
  singleItemState.value.size = newSize
  // Always reset to minOrder when size changes (stock is a MAX, not a min)
  const minOrder = getMinOrder(productId)
  singleItemState.value.quantity = minOrder
}

function onSingleQtyInput(rawValue, productId) {
  const val = Number(rawValue)
  // Let the user type freely; validation on step advance catches out-of-range
  singleItemState.value.quantity = isNaN(val) ? getMinOrder(productId) : Math.max(val, 0)
}

function adjustOwnCupsQuantity(delta) {
  const newQty = productDetails.value.quantity + delta
  if (newQty >= 500) {
    productDetails.value.quantity = newQty
  }
}

function removeItem(index) {
  if (isCartOrder.value) {
    cartItems.value.splice(index, 1)
    itemDesigns.value.splice(index, 1)
  }
}

function clearCart() {
  if (confirm('Are you sure you want to clear all items?')) {
    cartItems.value = []
    itemDesigns.value = []
  }
}

// Initialize designs for each item
function initDesigns() {
  const items = displayItems.value
  itemDesigns.value = items.map(() => ({
    designSource: 'upload',
    printSize: '',
    printPlacement: '',
    designNotes: '',
    files: [],
    selectedTemplateId: null,
    selectedTemplate: null,
  }))
}

// Set design source for specific item
function setDesignSourceForItem(index, source) {
  itemDesigns.value[index].designSource = source
  if (source === 'saved' && savedTemplates.value.length === 0) {
    loadSavedTemplates()
  }
}

// Select template for specific item
function selectTemplateForItem(index, template) {
  itemDesigns.value[index].selectedTemplateId = template.id
  itemDesigns.value[index].selectedTemplate = template
  itemDesigns.value[index].printSize = template.printSize || ''
  itemDesigns.value[index].printPlacement = template.placement || ''
  itemDesigns.value[index].designNotes =
    itemDesigns.value[index].designNotes || template.notes || ''
}

// Load saved templates
async function loadSavedTemplates() {
  isLoadingTemplates.value = true
  try {
    const { designs, success } = await designsApi.getDesigns()
    if (success && designs) {
      savedTemplates.value = designs.map((d) => ({
        id: d.id,
        name: d.name,
        thumbnail: d.image,
        lastUsed: d.createdAt,
        printSize: d.printSize,
        placement: d.placement,
        notes: d.notes,
      }))
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  } finally {
    isLoadingTemplates.value = false
  }
}

// File handling for individual items
function validateFiles(files) {
  const errors = []
  for (const file of files) {
    if (!FILE_CONSTANTS.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type`)
    }
    if (file.size > FILE_CONSTANTS.MAX_SIZE_BYTES) {
      errors.push(`${file.name}: File too large. Max ${FILE_CONSTANTS.MAX_SIZE_MB}MB`)
    }
  }
  return errors
}

function handleDropOnItem(index, e) {
  dragging.value = false
  dragOverIndex.value = null
  const newFiles = [...(e.dataTransfer.files || [])]
  const validationErrors = validateFiles(newFiles)

  if (validationErrors.length > 0) {
    alert(validationErrors.join('\n'))
    return
  }

  const currentFiles = itemDesigns.value[index].files || []
  itemDesigns.value[index].files = [...currentFiles, ...newFiles]
}

function handleFileSelectOnItem(index, e) {
  const newFiles = [...(e.target.files || [])]
  const validationErrors = validateFiles(newFiles)

  if (validationErrors.length > 0) {
    alert(validationErrors.join('\n'))
    e.target.value = ''
    return
  }

  const currentFiles = itemDesigns.value[index].files || []
  itemDesigns.value[index].files = [...currentFiles, ...newFiles]
  e.target.value = ''
}

function removeFileFromItem(itemIndex, fileIndex) {
  itemDesigns.value[itemIndex].files.splice(fileIndex, 1)
}

const totalFilesCount = computed(() => {
  return itemDesigns.value.reduce((sum, design) => sum + (design.files?.length || 0), 0)
})

// Customer info
const customerInfo = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  saveAsDefault: false,
})

const fulfillment = ref({ method: 'delivery', deliveryAddress: '', sameAsCustomer: false })
const errors = ref({ product: {}, design: {}, customer: {}, fulfillment: {} })

// Validation
function validateCurrentStep() {
  errors.value = { product: {}, design: {}, customer: {}, fulfillment: {} }
  let valid = true

  // STEP 0: Product Details validation
  if (currentStep.value === 0) {
    if (orderType.value === 'own-cups') {
      if (!productDetails.value.productType.trim()) {
        errors.value.product.productType = 'Product type is required.'
        valid = false
      }
      if (!productDetails.value.sizes.trim()) {
        errors.value.product.sizes = 'Please enter cup size.'
        valid = false
      }
      if (!productDetails.value.quantity || productDetails.value.quantity < 500) {
        errors.value.product.quantity = 'Minimum quantity is 500 pcs.'
        valid = false
      }
    } else if (isCartOrder.value) {
      if (cartItems.value.length === 0) {
        alert('Your cart is empty.')
        router.push('/customer/dashboard')
        return false
      }
      for (const item of cartItems.value) {
        if (!item.size) {
          alert(`Please select a size for ${item.name}`)
          return false
        }
        const minQty = getMinOrder(item.productId)
        if (!item.quantity || item.quantity < minQty) {
          alert(`${item.name} quantity must be at least ${minQty} pcs`)
          return false
        }
      }
    } else if (selectedProduct.value) {
      const item = displayItems.value[0]
      if (!item.size) {
        errors.value.product.sizes = 'Please select a size.'
        valid = false
      }
      const minOrder = getMinOrder(item.productId)
      const stock = getSizeStock(item.productId, item.size)
      if (!item.quantity || item.quantity < minOrder) {
        errors.value.product.quantity = `Minimum order is ${minOrder.toLocaleString()} pcs.`
        valid = false
      } else if (stock > 0 && item.quantity > stock) {
        errors.value.product.quantity = `Quantity cannot exceed available stock of ${stock.toLocaleString()} pcs for this size.`
        valid = false
      }
    }
  }

  // STEP 2: Customer Info validation
  if (currentStep.value === 2) {
    if (!customerInfo.value.name.trim()) {
      errors.value.customer.name = 'Full name is required.'
      valid = false
    }
    if (!customerInfo.value.email.trim()) {
      errors.value.customer.email = 'Email is required.'
      valid = false
    } else if (!EMAIL_REGEX.test(customerInfo.value.email)) {
      errors.value.customer.email = 'Enter a valid email.'
      valid = false
    }
    if (!customerInfo.value.phone.trim()) {
      errors.value.customer.phone = 'Phone number is required.'
      valid = false
    } else if (!PHONE_REGEX.test(customerInfo.value.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.value.customer.phone =
        'Enter a valid Philippine phone number (e.g., +63XXXXXXXXXX or 09XXXXXXXXX)'
      valid = false
    }
    if (!customerInfo.value.address.trim()) {
      errors.value.customer.address = 'Address is required.'
      valid = false
    }
  }

  // STEP 3: Fulfillment validation
  if (
    currentStep.value === 3 &&
    fulfillment.value.method === 'delivery' &&
    !fulfillment.value.deliveryAddress.trim()
  ) {
    errors.value.fulfillment.deliveryAddress = 'Delivery address is required.'
    valid = false
  }

  return valid
}

function nextStep() {
  if (validateCurrentStep()) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const isFormValid = computed(() => {
  const isValid =
    (orderType.value === 'own-cups'
      ? !!productDetails.value.productType.trim() &&
        !!productDetails.value.sizes.trim() &&
        productDetails.value.quantity >= 500
      : displayItems.value.length > 0) &&
    !!customerInfo.value.name.trim() &&
    !!customerInfo.value.email.trim() &&
    !!customerInfo.value.phone.trim() &&
    !!customerInfo.value.address.trim() &&
    (fulfillment.value.method === 'pickup' || !!fulfillment.value.deliveryAddress.trim())
  return Boolean(isValid)
})

const validationHints = computed(() => {
  if (currentStep.value < steps.length - 1) return []
  const hints = []
  if (!customerInfo.value.name.trim()) hints.push('Customer name required')
  if (orderType.value === 'own-cups') {
    if (!productDetails.value.productType.trim()) hints.push('Product type required')
    if (!productDetails.value.sizes.trim()) hints.push('Cup size required')
    if (!productDetails.value.quantity || productDetails.value.quantity < 500)
      hints.push('Quantity must be at least 500 pcs')
  } else if (displayItems.value.length === 0) {
    hints.push('No items in order')
  }
  if (fulfillment.value.method === 'delivery' && !fulfillment.value.deliveryAddress.trim())
    hints.push('Delivery address required')
  return hints
})

// Product validation for single product
const productErrors = ref({
  size: '',
  quantity: '',
})

function validateProductDetails() {
  let isValid = true
  productErrors.value = { size: '', quantity: '' }

  if (orderType.value === 'company-product' && !isCartOrder.value && selectedProduct.value) {
    const item = displayItems.value[0]

    if (!item.size) {
      productErrors.value.size = 'Please select a size'
      isValid = false
    }

    const minOrder = getMinOrder(item.productId)
    const stock = getSizeStock(item.productId, item.size)

    if (!item.quantity || item.quantity < minOrder) {
      productErrors.value.quantity = `Minimum order quantity is ${minOrder.toLocaleString()} pcs`
      isValid = false
    } else if (stock > 0 && item.quantity > stock) {
      productErrors.value.quantity = `Maximum available stock is ${stock.toLocaleString()} pcs`
      isValid = false
    } else if (item.quantity % 500 !== 0) {
      productErrors.value.quantity = 'Quantity must be in multiples of 500'
      isValid = false
    }
  }

  return isValid
}

// Add these to the validateCurrentStep function
if (currentStep.value === 0) {
  if (orderType.value === 'company-product' && !isCartOrder.value && selectedProduct.value) {
    const item = displayItems.value[0]
    const minOrder = getMinOrder(item.productId)
    const stock = getSizeStock(item.productId, item.size)

    if (!item.size) {
      errors.value.product.sizes = 'Please select a size.'
      valid = false
    }
    if (!item.quantity || item.quantity < minOrder) {
      errors.value.product.quantity = `Minimum order is ${minOrder.toLocaleString()} pcs.`
      valid = false
    }
    if (stock > 0 && item.quantity > stock) {
      errors.value.product.quantity = `Quantity cannot exceed available stock of ${stock.toLocaleString()} pcs.`
      valid = false
    }
  }
}

// Submit order
async function handleSubmit() {
  if (!validateCurrentStep()) return
  isSubmitting.value = true

  // Prepare order items for the backend
  let orderItems = []

  if (orderType.value === 'own-cups') {
    orderItems = [
      {
        productId: null,
        name: productDetails.value.productType,
        category: 'Customer Provided',
        size: productDetails.value.sizes,
        quantity: productDetails.value.quantity,
        designSource: itemDesigns.value[0]?.designSource,
        printSize: itemDesigns.value[0]?.printSize || '',
        printPlacement: itemDesigns.value[0]?.printPlacement || '',
        designNotes: itemDesigns.value[0]?.designNotes || '',
        files: itemDesigns.value[0]?.files || [],
      },
    ]
  } else if (isCartOrder.value) {
    orderItems = cartItems.value.map((item, idx) => ({
      productId: item.productId,
      name: item.name,
      category: item.category,
      size: item.size,
      quantity: item.quantity,
      designSource: itemDesigns.value[idx]?.designSource,
      printSize: itemDesigns.value[idx]?.printSize || '',
      printPlacement: itemDesigns.value[idx]?.printPlacement || '',
      designNotes: itemDesigns.value[idx]?.designNotes || '',
      files: itemDesigns.value[idx]?.files || [],
    }))
  } else {
    orderItems = [
      {
        productId: selectedProduct.value?.id,
        name: selectedProduct.value?.name,
        category: selectedProduct.value?.category,
        size: displayItems.value[0]?.size,
        quantity: displayItems.value[0]?.quantity,
        designSource: itemDesigns.value[0]?.designSource,
        printSize: itemDesigns.value[0]?.printSize || '',
        printPlacement: itemDesigns.value[0]?.printPlacement || '',
        designNotes: itemDesigns.value[0]?.designNotes || '',
        files: itemDesigns.value[0]?.files || [],
      },
    ]
  }

  // Calculate total amount
  let totalAmount = 0
  if (orderType.value !== 'own-cups') {
    for (const item of orderItems) {
      if (item.productId && item.size && item.quantity) {
        try {
          const priceResult = await productsApi.calculatePrice(
            item.productId,
            item.size,
            item.quantity,
          )
          if (priceResult.success && priceResult.data) {
            totalAmount += priceResult.data.total
          }
        } catch (error) {
          console.error('Error calculating price:', error)
        }
      }
    }
  }

  // Prepare order data for backend
  const orderData = {
    productId: orderItems[0]?.productId,
    productName: orderItems[0]?.name,
    size: orderItems[0]?.size,
    quantity: orderQuantity.value,
    address: `${customerInfo.value.address}\n${customerInfo.value.company ? `Company: ${customerInfo.value.company}` : ''}`,
    amount: totalAmount,
    receivingMode: fulfillment.value.method === 'pickup' ? 'Pick-up' : 'Delivery',
    isProvided: orderType.value === 'own-cups',
    designDetails: orderItems.map((item) => ({
      designSource: item.designSource,
      printSize: item.printSize,
      printPlacement: item.printPlacement,
      designNotes: item.designNotes,
      files: item.files?.map((f) => ({ name: f.name, size: f.size, type: f.type })) || [],
    })),
    customerName: customerInfo.value.name,
    customerEmail: customerInfo.value.email,
    customerPhone: customerInfo.value.phone,
    notes: `Product Type: ${orderType.value === 'own-cups' ? productDetails.value.productType : selectedProduct.value?.name}\nSizes: ${orderSizes.value}`,
  }

  try {
    const response = await ordersApi.createOrder(orderData)

    if (response.success) {
      // Clear cart if it was a cart order
      if (isCartOrder.value) {
        localStorage.removeItem('customerCart')
        sessionStorage.removeItem('pendingCart')
      }

      // Show success
      showSuccess.value = true

      // Save customer info as default if checked
      if (customerInfo.value.saveAsDefault) {
        const userData = {
          name: customerInfo.value.name,
          email: customerInfo.value.email,
          phone: customerInfo.value.phone,
          address: customerInfo.value.address,
          company: customerInfo.value.company,
        }
        localStorage.setItem('defaultCustomerInfo', JSON.stringify(userData))
      }
    } else {
      showToast(response.message || 'Failed to submit order')
    }
  } catch (error) {
    console.error('Error submitting order:', error)
    showToast('An error occurred while submitting your order. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Load product from backend
async function loadProduct(productId) {
  isLoadingProduct.value = true
  try {
    const response = await productsApi.getProductById(productId)
    if (response.success && response.data) {
      selectedProductData.value = response.data
      console.log('Product loaded:', selectedProductData.value)
      // Default: first size, quantity = minOrder (not stock)
      const firstSize = response.data.sizes?.[0]?.name || ''
      singleItemState.value = {
        size: firstSize,
        quantity: response.data.minOrder || 500,
      }
    } else {
      console.error('Failed to load product:', response.message)
      showToast('Failed to load product details')
    }
  } catch (error) {
    console.error('Error loading product:', error)
    showToast('Error loading product details')
  } finally {
    isLoadingProduct.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('orderType:', orderType.value)

  // Load single product if not cart order and not own cups
  if (!isCartOrder.value && orderType.value === 'company-product') {
    const productId = route.query.productId
    if (productId) {
      await loadProduct(productId)
    }
  }

  const pendingCart = sessionStorage.getItem('pendingCart')
  console.log('pendingCart:', pendingCart)

  if (pendingCart && isCartOrder.value) {
    cartItems.value = JSON.parse(pendingCart)
    console.log('Loaded cart items:', cartItems.value)

    cartItems.value = cartItems.value.map((item) => ({
      ...item,
      printPlacement: item.printPlacement || '',
      printSize: item.printSize || '',
      designNotes: item.designNotes || '',
      files: item.files || [],
    }))
  }

  // Handle own cups reorder
  const pendingOwnCups = sessionStorage.getItem('pendingOwnCups')
  if (pendingOwnCups && orderType.value === 'own-cups') {
    const ownCupsData = JSON.parse(pendingOwnCups)
    console.log('Loaded own cups data:', ownCupsData)

    productDetails.value.productType = ownCupsData.productType || ''
    productDetails.value.quantity = ownCupsData.quantity || 500
    productDetails.value.sizes = ownCupsData.sizes || ''
    productDetails.value.specifications = ownCupsData.specifications || ''
    sessionStorage.removeItem('pendingOwnCups')
  }

  // Load customer saved info
  const savedCustomerInfo = localStorage.getItem('defaultCustomerInfo')
  if (savedCustomerInfo) {
    const saved = JSON.parse(savedCustomerInfo)
    customerInfo.value.name = saved.name || ''
    customerInfo.value.email = saved.email || ''
    customerInfo.value.phone = saved.phone || ''
    customerInfo.value.address = saved.address || ''
    customerInfo.value.company = saved.company || ''
  } else {
    customerInfo.value.name = localStorage.getItem('userName') || ''
    customerInfo.value.email = localStorage.getItem('userEmail') || ''
  }

  initDesigns()
  await loadSavedTemplates()
})
</script>

<style scoped>
.field {
  @apply flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
textarea.field {
  @apply h-auto py-2;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
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
</style>
