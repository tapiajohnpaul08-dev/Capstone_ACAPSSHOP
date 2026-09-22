<!-- src/views/customer/ProductDetailPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Back Button -->
      <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft class="w-5 h-5" />
        Back to Products
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-gray-500 mt-2">Loading product details...</p>
      </div>

      <!-- Product Detail -->
      <div v-else-if="product" class="flex flex-col lg:flex-row gap-8">
        <!-- Product Image -->
        <div class="lg:w-1/2">
          <div class="bg-white rounded-2xl border p-3 sm:p-6 lg:sticky lg:top-24">
            <div class="aspect-square w-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
              <img 
                :src="productImageUrl" 
                :alt="product.name"
                class="w-full h-full object-contain"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="lg:w-1/2">
          <div class="bg-white rounded-2xl border p-6">
            <div class="mb-4">
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{ product.category }}</span>
              <h1 class="text-2xl font-bold text-gray-900 mt-2">{{ product.name }}</h1>
              <p class="text-gray-500 text-sm mt-1">Minimum Order: {{ product.minOrder?.toLocaleString() }} pcs</p>
            </div>

            <!-- Lid type badge (lids only) -->
            <div v-if="isLid && lidTypeLabel" class="mb-4">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h8"/>
                </svg>
                {{ lidTypeLabel }}
              </span>
            </div>

            <!-- Size Selection -->
            <div class="mb-6">
              <label class="text-sm font-medium text-gray-700 block mb-2">
                {{ isLid ? 'Select Rim Size' : 'Select Size' }}
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  v-for="size in product.sizes"
                  :key="size.name"
                  @click="selectedSize = size"
                  :disabled="size.stock < product.minOrder"
                  class="p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  :class="selectedSize?.name === size.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'"
                >
                  <div class="font-semibold">{{ size.name }}</div>
                  <div class="text-sm text-gray-600">₱{{ size.price.toLocaleString() }}/pc</div>
                  <div class="text-xs" :class="size.stock > product.minOrder ? 'text-green-600' : 'text-red-500'">
                    {{ size.stock >= product.minOrder ? `` : 'Sold out' }}
                  </div>
                </button>
              </div>
            </div>

            <!-- ✅ Flow 3 (inline) — compatible lid picker -->
            <div
              v-if="showCompatibleLids"
              class="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white overflow-hidden"
            >
              <!-- Header -->
              <div class="px-4 py-3 border-b border-blue-100 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 12h8"/>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 leading-tight">
                      Add compatible lids?
                    </p>
                    <p class="text-[11px] text-gray-500 leading-tight">
                      Optional — fits your {{ selectedSize.name }} {{ product.name }}
                    </p>
                  </div>
                </div>
                <button
                  v-if="anyLidSelected"
                  type="button"
                  @click="clearLidSelections"
                  class="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  Clear
                </button>
              </div>

              <!-- Lid rows -->
              <div class="divide-y divide-blue-50">
                <div
                  v-for="lid in compatibleLids"
                  :key="lid.id"
                  class="px-4 py-3 transition-colors"
                  :class="lidSelections[lid.id]?.selected ? 'bg-blue-50/40' : ''"
                >
                  <label class="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      :checked="lidSelections[lid.id]?.selected"
                      @change="toggleLidSelection(lid)"
                      class="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0 flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-800 leading-tight">
                          {{ lid.name }}
                        </p>
                        <p class="text-[11px] text-gray-500 mt-0.5">
                          {{ lid.matchingSizes[0].name }}
                          · ₱{{ Number(lid.matchingSizes[0].price).toFixed(2) }}/pc
                        </p>
                      </div>
                    </div>
                  </label>

                  <!-- Quantity controls when selected -->
                  <div
                    v-if="lidSelections[lid.id]?.selected"
                    class="mt-2.5 flex items-center gap-2 pl-7"
                  >
                    <button
                      type="button"
                      @click="adjustLidQuantity(lid, -100)"
                      :disabled="lidSelections[lid.id].quantity <= (lid.minOrder || 500)"
                      class="w-7 h-7 border border-gray-300 rounded-lg text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-sm leading-none"
                    >−</button>
                    <input
                      v-model.number="lidSelections[lid.id].quantity"
                      type="number"
                      :min="lid.minOrder || 500"
                      :step="100"
                      class="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      @click="adjustLidQuantity(lid, 100)"
                      class="w-7 h-7 border border-gray-300 rounded-lg text-gray-500 hover:bg-white shrink-0 text-sm leading-none"
                    >+</button>
                    <span class="text-xs font-bold text-blue-700 ml-auto">
                      ₱{{ (lidSelections[lid.id].quantity * lid.matchingSizes[0].price).toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Subtotal row -->
              <div
                v-if="anyLidSelected"
                class="px-4 py-3 bg-blue-50/60 border-t border-blue-100 flex items-center justify-between"
              >
                <span class="text-xs font-medium text-gray-600">
                  + {{ selectedLidCount }} lid{{ selectedLidCount !== 1 ? 's' : '' }} selected
                </span>
                <span class="text-sm font-bold text-blue-700">
                  + ₱{{ lidSubtotal.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- ✅ NEW — Fits these cups (lids only) -->
            <div
              v-if="isLid && selectedSize?.rimDiameter"
              class="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/50"
            >
              <!-- Loading state -->
              <div v-if="loadingCups" class="flex items-center gap-2 text-xs text-blue-700">
                <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Checking compatible cups…
              </div>

              <!-- Compatible list -->
              <template v-else-if="compatibleCups.length > 0">
                <p class="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Fits these {{ compatibleCups.length }} cup{{ compatibleCups.length !== 1 ? 's' : '' }}:
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="cup in compatibleCups"
                    :key="cup.id"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
                    :title="`Cup sizes: ${cup.matchingSizes.join(', ')}`"
                  >
                    {{ cup.name }}
                    <span class="text-blue-400 text-[10px]">· {{ cup.matchingSizes.length }} size{{ cup.matchingSizes.length !== 1 ? 's' : '' }}</span>
                  </span>
                </div>
              </template>

              <!-- No compatible cups -->
              <template v-else>
                <p class="text-xs text-blue-700 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  No catalog cups match a <strong>{{ selectedSize.rimDiameter }}mm</strong> rim — but this lid still works for any {{ selectedSize.rimDiameter }}mm cup you already own.
                </p>
              </template>
            </div>

            <!-- Quantity Selection -->
            <div class="mb-6">
              <label class="text-sm font-medium text-gray-700 block mb-2">Quantity</label>
              <div class="flex items-center gap-2 sm:gap-3">
                <button
                  @click="updateQuantity(-500)"
                  :disabled="quantity <= (product.minOrder || 500)"
                  class="w-11 h-11 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 shrink-0"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  @change="validateQuantity"
                  :min="product.minOrder || 500"
                  :max="selectedSize?.stock || 0"
                  step="500"
                  class="flex-1 min-w-0 text-center py-2.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                />
                <button
                  @click="updateQuantity(500)"
                  :disabled="selectedSize && quantity >= selectedSize.stock"
                  class="w-11 h-11 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 shrink-0"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">
                Min: {{ product.minOrder?.toLocaleString() }} pcs · Multiples of 500
                <span v-if="selectedSize?.stock > 0"> · Max: {{ selectedSize.stock?.toLocaleString() }} pcs</span>
              </p>
            </div>

            <!-- Price Summary -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Unit Price</span>
                <span class="font-medium">₱{{ getUnitPrice().toLocaleString() }}/pc</span>
              </div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Quantity</span>
                <span class="font-medium">{{ quantity.toLocaleString() }} pcs</span>
              </div>
              <div class="border-t pt-2 mt-2">
                <div class="flex justify-between">
                  <span class="font-semibold text-gray-900">Total Price</span>
                  <span class="text-xl font-bold text-blue-600">₱{{ getTotalPrice().toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="checkToken()" class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                @click="addToCart"
                :disabled="!selectedSize || selectedSize.stock < product.minOrder"
                class="flex-1 py-3 rounded-xl font-semibold transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <ShoppingCart class="w-4 h-4 inline mr-2" />
                Add to Cart
              </button>
              <button
                @click="orderNow"
                :disabled="!selectedSize || selectedSize.stock < product.minOrder"
                class="flex-1 py-3 rounded-xl font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Order Now
              </button>
            </div>
            <div v-else class="flex flex-col gap-3">
              <!-- Add to Cart Button -->
            <button 
              @click="addToCart"
              class="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!selectedSize || selectedSize.stock < product.minOrder"
            >
              Add to Cart
            </button>

            <!-- Login prompt -->
            <p class="text-xs text-gray-400 text-center mt-2">
              Need an account? <router-link to="/customer/signup" class="text-blue-600 hover:underline">Sign up</router-link> or 
              <router-link to="/customer/login" class="text-blue-600 hover:underline">log in</router-link>
            </p>
            </div>

            <!-- Product Description -->
            <div class="mt-6 pt-6 border-t">
              <h3 class="font-semibold text-gray-900 mb-2">Product Description</h3>
              <p class="text-sm text-gray-600">{{ product.description || 'No description available.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ FEEDBACK SECTION - Displayed below product -->
      <div v-if="product && !loading" class="mt-8">
        <div class="bg-white rounded-2xl border overflow-hidden">
          <!-- Feedback Header -->
          <div class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MessageSquare class="w-5 h-5 text-blue-600" />
              <h3 class="font-semibold text-gray-900">Customer Reviews</h3>
              <span v-if="feedbackStats.totalReviews > 0" class="text-sm text-gray-500">
                ({{ feedbackStats.totalReviews }} reviews)
              </span>
            </div>
            <div v-if="feedbackStats.totalReviews > 0" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="w-4 h-4"
                  :class="star <= Math.round(feedbackStats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                />
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ feedbackStats.averageRating.toFixed(1) }}</span>
            </div>
          </div>

          <!-- Loading Feedbacks -->
          <div v-if="feedbackLoading" class="p-6 text-center">
            <Loader2 class="w-6 h-6 mx-auto text-blue-600 animate-spin" />
            <p class="text-gray-500 mt-2 text-sm">Loading reviews...</p>
          </div>

          <!-- No Feedbacks -->
          <div v-else-if="feedbacks.length === 0" class="p-6 text-center">
            <MessageSquare class="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p class="text-gray-500 text-sm">No reviews yet for this product.</p>
            <p class="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
          </div>

          <!-- Feedbacks List -->
          <div v-else class="divide-y">
            <div 
              v-for="feedback in feedbacks" 
              :key="feedback.feedbackId || feedback._id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <!-- Feedback Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {{ (feedback.customerName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-sm text-gray-900">{{ feedback.customerName || 'Anonymous' }}</p>
                      <div class="flex items-center gap-2">
                        <div class="flex gap-0.5">
                          <Star 
                            v-for="star in 5" 
                            :key="star" 
                            class="w-3.5 h-3.5"
                            :class="star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                          />
                        </div>
                        <span class="text-xs text-gray-400">{{ formatDate(feedback.submittedAt || feedback.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span v-if="feedback.isVerified" class="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle class="w-3 h-3" /> Verified Purchase
                </span>
              </div>

              <!-- Feedback Content -->
              <div class="ml-10 mt-2">
                <p v-if="feedback.title" class="text-sm font-medium text-gray-800">{{ feedback.title }}</p>
                <p class="text-sm text-gray-600 mt-0.5">{{ feedback.comment }}</p>

                <!-- Pros -->
                <div v-if="feedback.pros && feedback.pros.length > 0" class="mt-2">
                  <p class="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ThumbsUp class="w-3 h-3 text-green-600" /> What they liked:
                  </p>
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span v-for="(pro, idx) in feedback.pros" :key="idx" class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      {{ pro }}
                    </span>
                  </div>
                </div>

                <!-- Cons -->
                <div v-if="feedback.cons && feedback.cons.length > 0" class="mt-2">
                  <p class="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ThumbsDown class="w-3 h-3 text-red-600" /> What could be improved:
                  </p>
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span v-for="(con, idx) in feedback.cons" :key="idx" class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                      {{ con }}
                    </span>
                  </div>
                </div>

                <!-- Helpful Button -->
                <button 
                  @click="markHelpful(feedback.feedbackId || feedback._id)"
                  class="mt-2 text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <ThumbsUp class="w-3 h-3" />
                  Helpful ({{ feedback.helpfulCount || 0 }})
                </button>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="feedbacks.length > 0 && feedbackPagination.hasMore" class="px-6 py-3 border-t bg-gray-50 text-center">
            <button 
              @click="loadMoreFeedbacks"
              :disabled="feedbackLoadingMore"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              <span v-if="feedbackLoadingMore" class="inline-flex items-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin" /> Loading more...
              </span>
              <span v-else>Load More Reviews</span>
            </button>
          </div>

          <!-- Rating Summary -->
          <div v-if="feedbackStats.totalReviews > 0" class="px-6 py-3 border-t bg-gray-50 flex flex-wrap items-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500">Average Rating:</span>
              <span class="font-semibold text-gray-900">{{ feedbackStats.averageRating.toFixed(1) }}</span>
              <div class="flex gap-0.5">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="w-3.5 h-3.5"
                  :class="star <= Math.round(feedbackStats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                />
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-500">Distribution:</span>
              <div v-for="rating in [5,4,3,2,1]" :key="rating" class="flex items-center gap-1">
                <span class="text-xs text-gray-500">{{ rating }}★</span>
                <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-yellow-400 rounded-full"
                    :style="{ width: getPercentage(rating) + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-400">{{ feedbackStats.distribution?.[rating] || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-16">
        <Package class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500">Product not found</p>
        <button @click="router.push('/customer/dashboard')" class="mt-4 text-blue-600 hover:underline">Return to Shop</button>
      </div>
    </div>
    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2">
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4 text-green-400" />
          <AlertCircle v-else class="w-4 h-4 text-red-400" />
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi, feedBackApi } from '@/api'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Package
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Product State ──────────────────────────────────────────────────────
const product = ref(null)
const selectedSize = ref(null)
const quantity = ref(500)
const loading = ref(true)
const toast = ref({ show: false, message: '', type: 'success' })

// ═══════════════════════════════════════════════════════════════
// ✅ NEW — Flow 2: lid compatibility
//
// When the current product is a lid, we fetch the full cup catalog
// once and compute which cup products fit the selected rim size.
// Matching is by rimDiameter — pure data, no stored relationships.
// ═══════════════════════════════════════════════════════════════

const isLid = computed(() => product.value?.category === 'Lids')

// Human-friendly lid type labels
const LID_TYPE_LABELS = {
  'flat-straw-slot': { label: 'Flat Lid with Straw Slot', short: 'Flat Lid' },
  'dome-hole':       { label: 'Dome Lid with Hole',       short: 'Dome Lid' },
  'sip-raised':      { label: 'Sip Lid (Raised Sip-Through)', short: 'Sip Lid' },
  'conjoined-hard':  { label: 'Conjoined Hard Lid',       short: 'Conjoined Lid' },
  'pp-injection':    { label: 'PP Injection Lid',         short: 'Injection Lid' },
  'traveler':        { label: 'Traveler Sip-Through Lid', short: 'Traveler Lid' },
}

const lidTypeLabel = computed(() => {
  const key = product.value?.subcategory
  if (!key) return ''
  return LID_TYPE_LABELS[key]?.label || key
})

const lidTypeShort = computed(() => {
  const key = product.value?.subcategory
  if (!key) return ''
  return LID_TYPE_LABELS[key]?.short || key
})

// ═══════════════════════════════════════════════════════════════
// Flow 2 + Flow 3 compatibility
//
// We fetch the FULL catalog once, then derive:
//   • compatibleCups   (when viewing a LID  → show which cups fit)
//   • compatibleLids   (when viewing a CUP  → show which lids fit)
// Matching is by rimDiameter — pure data, no stored relationships.
// ═══════════════════════════════════════════════════════════════

const allProducts = ref([])
const loadingCatalog = ref(false)

async function loadCatalogForCompatibility() {
  if (allProducts.value.length > 0) return
  if (loadingCatalog.value) return

  loadingCatalog.value = true
  try {
    const res = await productsApi.getAllProducts()
    if (res.success && res.data) {
      allProducts.value = res.data
    }
  } catch (err) {
    console.error('Failed to load product catalog:', err)
  } finally {
    loadingCatalog.value = false
  }
}

// ── When viewing a LID: which cups fit? ──
const compatibleCups = computed(() => {
  if (!isLid.value) return []
  const rim = selectedSize.value?.rimDiameter
  if (!rim) return []

  return allProducts.value
    .filter((p) => ['Plastic Cups', 'Paper Cups'].includes(p.category))
    .map((cup) => {
      const matchingSizes = (cup.sizes || [])
        .filter((s) => s.rimDiameter === rim)
        .map((s) => s.name)
      return matchingSizes.length ? { ...cup, matchingSizes } : null
    })
    .filter(Boolean)
})

// ── When viewing a CUP: which lids fit? ──
// Each returned lid includes a `matchingSizes` array with only the
// specific sizes whose rimDiameter equals the cup's rim.
const compatibleLids = computed(() => {
  if (!product.value || isLid.value) return []
  const rim = selectedSize.value?.rimDiameter
  if (!rim) return []

  return allProducts.value
    .filter((p) => p.category === 'Lids')
    .map((lid) => {
      const matchingSizes = (lid.sizes || [])
        .filter((s) => s.rimDiameter === rim)
      return matchingSizes.length ? { ...lid, matchingSizes } : null
    })
    .filter(Boolean)
})

// Trigger the catalog load once the product is known
watch(
  () => product.value,
  (val) => {
    if (val) loadCatalogForCompatibility()
  },
  { immediate: true },
)

// ═══════════════════════════════════════════════════════════════
// ✅ Flow 3 (inline) — compatible lid picker state
//
// Instead of a modal interrupt, the customer picks lids inline below
// the size buttons. Selections live in `lidSelections`, keyed by lid id.
// They reset whenever the rim (and therefore the compatible set) changes.
// ═══════════════════════════════════════════════════════════════

// { [lidId]: { selected: boolean, quantity: number } }
const lidSelections = ref({})

// When is the inline picker shown at all?
const showCompatibleLids = computed(() => {
  return (
    !isLid.value &&
    !!selectedSize.value?.rimDiameter &&
    compatibleLids.value.length > 0
  )
})

// Initialise / re-initialise selections whenever the compatible set changes
function rebuildLidSelections() {
  const next = {}
  const defaultQty = Math.max(
    product.value?.minOrder || 500,
    quantity.value || 500,
  )
  for (const lid of compatibleLids.value) {
    next[lid.id] = {
      selected: false,
      quantity: Math.max(lid.minOrder || 500, defaultQty),
    }
  }
  lidSelections.value = next
}

// Reset when the customer changes size (rim → different lids)
watch(
  () => selectedSize.value?.name,
  () => { rebuildLidSelections() },
)

// Initialize once the compatible lids list is ready
watch(
  compatibleLids,
  () => { rebuildLidSelections() },
  { immediate: true },
)

// Keep default lid quantities in sync with the cup quantity — only for
// UNTOUCHED selections (ones that still match the old default). This way
// if the customer bumps cup qty to 2000, unselected lids jump to 2000 too,
// but any lid the customer already configured keeps its own value.
watch(quantity, (newQty) => {
  for (const lid of compatibleLids.value) {
    const s = lidSelections.value[lid.id]
    if (!s || s.selected) continue
    const lidMin = lid.minOrder || 500
    s.quantity = Math.max(lidMin, newQty || lidMin)
  }
})

const anyLidSelected = computed(() =>
  Object.values(lidSelections.value).some((s) => s.selected),
)

const selectedLidCount = computed(() =>
  Object.values(lidSelections.value).filter((s) => s.selected).length,
)

const lidSubtotal = computed(() => {
  let total = 0
  for (const lid of compatibleLids.value) {
    const s = lidSelections.value[lid.id]
    if (s?.selected) {
      total += (s.quantity || 0) * (lid.matchingSizes[0]?.price || 0)
    }
  }
  return total
})

// Toggle a lid's checkbox
function toggleLidSelection(lid) {
  const s = lidSelections.value[lid.id]
  if (!s) return
  s.selected = !s.selected
}

// Adjust a lid's quantity
function adjustLidQuantity(lid, delta) {
  const s = lidSelections.value[lid.id]
  if (!s) return
  const min = lid.minOrder || 500
  s.quantity = Math.max(min, (s.quantity || 0) + delta)
}

// Uncheck everything
function clearLidSelections() {
  for (const id of Object.keys(lidSelections.value)) {
    lidSelections.value[id].selected = false
  }
}

// Format a single lid selection into a cart line
function collectSelectedLids() {
  const result = []
  for (const lid of compatibleLids.value) {
    const s = lidSelections.value[lid.id]
    if (!s?.selected) continue
    const sizeObj = lid.matchingSizes[0]
    if (!sizeObj) continue
    const qty = Math.max(lid.minOrder || 500, s.quantity || 0)
    result.push({
      productId: lid.id,
      productName: lid.name,
      productImage: lid.image,
      category: lid.category,
      sizeName: sizeObj.name,
      rimDiameter: sizeObj.rimDiameter,
      quantity: qty,
      unitPrice: sizeObj.price,
      lineTotal: qty * sizeObj.price,
      itemType: 'lid',
    })
  }
  return result
}

// ─── Feedback State ──────────────────────────────────────────────────────
const feedbacks = ref([])
const feedbackStats = ref({
  totalReviews: 0,
  averageRating: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
})
const feedbackLoading = ref(false)
const feedbackLoadingMore = ref(false)
const feedbackPagination = ref({
  page: 1,
  limit: 5,
  hasMore: true,
  total: 0
})




// Computed image URL
const productImageUrl = computed(() => {
  if (!product.value?.image) return `${API_BASE_URL}/uploads/products/default-product.jpg`
  
  const imagePath = product.value.image
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  let cleanPath = imagePath.replace(/^\/+/, '')
  
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanPath}`
  }
  if (cleanPath.startsWith('products/')) {
    return `${API_BASE_URL}/uploads/${cleanPath}`
  }
  
  return `${API_BASE_URL}/uploads/products/${cleanPath}`
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function checkToken() {
  const token = localStorage.getItem('customerToken')
  if (!token) {
    // showToast('Please login to continue', 'error')
    // setTimeout(() => router.push('/customer/login'), 1500)
    return false
  }
  return true
}

function handleImageError(e) {
  console.error('Image failed to load:', e.target.src)
  e.target.src = `${API_BASE_URL}/uploads/products/default-product.jpg`
  e.target.onerror = () => {
    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
  }
}

function getUnitPrice() {
  if (!selectedSize.value || !quantity.value) return 0
  
  let unitPrice = selectedSize.value.price
  const qty = quantity.value
  
  if (qty >= 5000 && selectedSize.value.bulkPrices?.[5000]) {
    unitPrice = selectedSize.value.bulkPrices[5000] / 5000
  } else if (qty >= 2000 && selectedSize.value.bulkPrices?.[2000]) {
    unitPrice = selectedSize.value.bulkPrices[2000] / 2000
  } else if (qty >= 1000 && selectedSize.value.bulkPrices?.[1000]) {
    unitPrice = selectedSize.value.bulkPrices[1000] / 1000
  } else if (qty >= 500 && selectedSize.value.bulkPrices?.[500]) {
    unitPrice = selectedSize.value.bulkPrices[500] / 500
  }
  
  return unitPrice
}

function getTotalPrice() {
  return getUnitPrice() * quantity.value
}

function updateQuantity(delta) {
  const newQty = quantity.value + delta
  const min = product.value?.minOrder || 500
  const max = selectedSize.value?.stock || 0
  
  if (newQty >= min && (max === 0 || newQty <= max)) {
    quantity.value = newQty
  }
}

function validateQuantity() {
  const min = product.value?.minOrder || 500
  const max = selectedSize.value?.stock || 0
  
  if (quantity.value < min) quantity.value = min
  if (max > 0 && quantity.value > max) quantity.value = max
  if (quantity.value % 500 !== 0) {
    quantity.value = Math.round(quantity.value / 500) * 500
  }
}

function addToCart() {
  if (!selectedSize.value) {
    showToast('Please select a size', 'error')
    return
  }

  if (selectedSize.value.stock === 0) {
    showToast('This size is out of stock', 'error')
    return
  }

  // ── Build the cup line ──
  const cart = JSON.parse(localStorage.getItem('customerCart') || '[]')

  let unitPrice = selectedSize.value.price
  const qty = quantity.value

  if (qty >= 5000 && selectedSize.value.bulkPrices?.[5000]) {
    unitPrice = selectedSize.value.bulkPrices[5000] / 5000
  } else if (qty >= 2000 && selectedSize.value.bulkPrices?.[2000]) {
    unitPrice = selectedSize.value.bulkPrices[2000] / 2000
  } else if (qty >= 1000 && selectedSize.value.bulkPrices?.[1000]) {
    unitPrice = selectedSize.value.bulkPrices[1000] / 1000
  } else if (qty >= 500 && selectedSize.value.bulkPrices?.[500]) {
    unitPrice = selectedSize.value.bulkPrices[500] / 500
  }

  const estimatedTotal = unitPrice * quantity.value

  const existingItemIndex = cart.findIndex(
    (item) =>
      item.productId === product.value.id &&
      item.size === selectedSize.value.name,
  )

  const cartItem = {
    productId: product.value.id,
    name: product.value.name,
    image: product.value.image,
    category: product.value.category,
    size: selectedSize.value.name,
    quantity: quantity.value,
    printPlacement: '',
    printSize: '',
    designNotes: '',
    estimatedTotal,
    sizes: product.value.sizes,
    minOrder: product.value.minOrder,
    unitPrice,
    rimDiameter: selectedSize.value.rimDiameter ?? null,
    itemType: isLid.value ? 'lid' : 'cup',
  }

  if (existingItemIndex !== -1) {
    cart[existingItemIndex] = cartItem
  } else {
    cart.push(cartItem)
  }

  // ── ✅ Flow 3 (inline): append any checked lids directly ──
  const selectedLids = collectSelectedLids()
  for (const lid of selectedLids) {
    cart.push({
      productId: lid.productId,
      name: lid.productName,
      image: lid.productImage,
      category: lid.category,
      size: lid.sizeName,
      quantity: lid.quantity,
      printPlacement: '',
      printSize: '',
      designNotes: '',
      designSource: 'upload',
      files: [],
      estimatedTotal: lid.lineTotal,
      sizes: [],
      minOrder: 500,
      unitPrice: lid.unitPrice,
      rimDiameter: lid.rimDiameter,
      itemType: 'lid',
      pairedWith: product.value.name,
      createdAt: new Date().toISOString(),
    })
  }

  localStorage.setItem('customerCart', JSON.stringify(cart))

  // Reset lid checkboxes so the same lids don't get re-added by accident
  clearLidSelections()

  // Confirmation toast
  const n = selectedLids.length
  if (n > 0) {
    showToast(
      `${product.value.name} + ${n} lid${n !== 1 ? 's' : ''} added to cart!`,
      'success',
    )
  } else {
    showToast(
      `${product.value.name} (${selectedSize.value.name}) added to cart!`,
      'success',
    )
  }
}

function orderNow() {
  const token = localStorage.getItem('customerToken')
  if (!token) {
    showToast('Please login to place an order', 'error')
    setTimeout(() => router.push('/customer/login'), 1500)
    return
  }

  if (!selectedSize.value) {
    showToast('Please select a size', 'error')
    return
  }

  // ✅ Flow 3 (inline): forward any checked lids to the wizard
  const selectedLids = collectSelectedLids()
  navigateToWizardDirect(selectedLids)
}

// ─────────────────────────────────────────────────────────────
// Flow 3 — route to the wizard with the cup + optional extra lids.
//
//   • extraItems is EMPTY   → identical to the original orderNow path
//                             (product-detail query params).
//   • extraItems has lids   → switch to cart mode so the wizard reads
//                             everything from sessionStorage's
//                             pendingCart (which already supports
//                             multiple lines).
// ─────────────────────────────────────────────────────────────
function navigateToWizardDirect(extraItems = []) {
  // ── Mode A: cup only (original single-product flow) ──
  if (extraItems.length === 0) {
    router.push({
      path: '/customer/orders/create',
      query: {
        type: 'company-product',
        source: 'product-detail',
        productId: product.value.id,
        productName: product.value.name,
        productImage: product.value.image || '',
        productCategory: product.value.category || '',
        minOrder: product.value.minOrder || 500,
        size: selectedSize.value.name || selectedSize.value,
        sizePrice: selectedSize.value.price || '',
        sizeStock: selectedSize.value.stock || '',
        quantity: quantity.value,
        itemType: isLid.value ? 'lid' : 'cup',
        productData: JSON.stringify({
          id: product.value.id,
          name: product.value.name,
          image: product.value.image,
          category: product.value.category,
          subcategory: product.value.subcategory || '',
          minOrder: product.value.minOrder,
          sizes: product.value.sizes,
          description: product.value.description || '',
        }),
      },
    })
    return
  }

  // ── Mode B: cup + selected lids → multi-item via sessionStorage ──
  const cupItem = {
    productId: product.value.id,
    name: product.value.name,
    image: product.value.image,
    category: product.value.category,
    size: selectedSize.value.name,
    quantity: quantity.value,
    estimatedTotal: getTotalPrice(),
    sizes: product.value.sizes,
    minOrder: product.value.minOrder,
    unitPrice: getUnitPrice(),
    rimDiameter: selectedSize.value.rimDiameter ?? null,
    itemType: isLid.value ? 'lid' : 'cup',
  }

  const lidItems = extraItems.map((l) => ({
    productId: l.productId,
    name: l.productName,
    image: l.productImage,
    category: l.category,
    size: l.sizeName,
    quantity: l.quantity,
    estimatedTotal: l.lineTotal,
    sizes: [],
    minOrder: 500,
    unitPrice: l.unitPrice,
    rimDiameter: l.rimDiameter,
    itemType: 'lid',
    pairedWith: product.value.name,
  }))

  sessionStorage.setItem('pendingCart', JSON.stringify([cupItem, ...lidItems]))

  router.push({
    path: '/customer/orders/create',
    query: { type: 'company-product', source: 'cart' },
  })
}


// ─── FEEDBACK FUNCTIONS ──────────────────────────────────────────────

async function loadProductFeedbacks(productId, page = 1, limit = 5) {
  if (!productId) return
  
  try {
    const response = await feedBackApi.getProductFeedback(productId, limit, page)
    
    if (response.success && response.data) {
      if (page === 1) {
        feedbacks.value = response.data
      } else {
        feedbacks.value = [...feedbacks.value, ...response.data]
      }
      
      feedbackPagination.value = {
        page: page,
        limit: limit,
        hasMore: response.pagination ? page < response.pagination.pages : false,
        total: response.pagination?.total || 0
      }
    }
  } catch (error) {
    console.error('Error loading product feedbacks:', error)
  }
}

async function loadFeedbackStats(productId) {
  if (!productId) return
  
  try {
    const response = await feedBackApi.getProductFeedbackStats(productId)
    
    if (response.success && response.data) {
      feedbackStats.value = {
        totalReviews: response.data.totalReviews || 0,
        averageRating: response.data.averageRating || 0,
        distribution: response.data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }
  } catch (error) {
    console.error('Error loading feedback stats:', error)
  }
}

async function loadMoreFeedbacks() {
  if (feedbackLoadingMore.value || !feedbackPagination.value.hasMore) return
  
  feedbackLoadingMore.value = true
  const nextPage = feedbackPagination.value.page + 1
  
  await loadProductFeedbacks(product.value.id, nextPage, feedbackPagination.value.limit)
  feedbackLoadingMore.value = false
}

async function markHelpful(feedbackId) {
  try {
    const response = await feedBackApi.markHelpful(feedbackId)
    
    if (response.success) {
      // Update local feedback count
      const feedback = feedbacks.value.find(f => (f.feedbackId || f._id) === feedbackId)
      if (feedback) {
        feedback.helpfulCount = (feedback.helpfulCount || 0) + 1
      }
      showToast('Thanks for your feedback!', 'success')
    }
  } catch (error) {
    console.error('Error marking helpful:', error)
  }
}

function getPercentage(rating) {
  const total = feedbackStats.value.totalReviews || 0
  if (total === 0) return 0
  const count = feedbackStats.value.distribution?.[rating] || 0
  return Math.round((count / total) * 100)
}

function formatDate(dateValue) {
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

// ─── LIFECYCLE ─────────────────────────────────────────────────────────

onMounted(async () => {
  const productId = route.params.id
  console.log('Product ID from route:', productId)
  
  if (productId) {
    try {
      const response = await productsApi.getProductById(productId)
      console.log('API Response:', response)
      
      if (response.success && response.data) {
        product.value = response.data
        console.log('Product loaded:', product.value)
        console.log('Product image path:', product.value.image)
        console.log('Computed image URL:', productImageUrl.value)
        
        // Select first size with stock, or first size overall
        selectedSize.value = product.value.sizes?.find(s => s.stock > 0) || product.value.sizes?.[0]
        quantity.value = product.value.minOrder || 500
        
        // ✅ Load feedbacks
        feedbackLoading.value = true
        await Promise.all([
          loadProductFeedbacks(product.value.id, 1, 5),
          loadFeedbackStats(product.value.id)
        ])
        feedbackLoading.value = false
      } else {
        console.error('Failed to load product:', response.message)
        showToast('Failed to load product details', 'error')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      showToast('Error loading product details', 'error')
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>