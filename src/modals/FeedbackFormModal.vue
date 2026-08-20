<!-- components/FeedbackFormModal.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="close">
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header - Compact -->
      <div class="px-6 py-3 border-b flex items-center justify-between sticky top-0 bg-white z-10 flex-shrink-0">
        <h3 class="text-lg font-bold text-gray-900">Share Your Feedback</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body - Scrollable with less padding -->
      <div class="p-4 space-y-3 overflow-y-auto flex-1">
        <!-- Product Info - Compact -->
        <div v-if="order" class="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
          <img 
            v-if="order.items?.[0]?.image" 
            :src="getImageUrl(order.items[0].image)" 
            class="w-10 h-10 object-cover rounded-lg border flex-shrink-0"
            @error="handleImageError"
          />
          <div>
            <p class="font-medium text-sm">{{ order.items?.[0]?.name || 'Product' }}</p>
            <p class="text-xs text-gray-500">Order #{{ order.orderNumber || order.orderId }}</p>
          </div>
        </div>

        <!-- Two Column Layout for Rating + Quick Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Rating -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">
              Overall Rating <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-1.5">
              <button
                v-for="star in 5"
                :key="star"
                @click="form.rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                class="text-2xl transition-colors"
                :class="getStarClass(star)"
              >
                <Star :class="star <= (hoverRating || form.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" class="w-6 h-6" />
              </button>
            </div>
            <p v-if="errors.rating" class="text-xs text-red-500 mt-0.5">{{ errors.rating }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ getRatingLabel(form.rating) }}</p>
          </div>

          <!-- Would Recommend -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">
              Would you recommend this?
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" v-model="form.wouldRecommend" :value="true" />
                <ThumbsUp class="w-4 h-4 text-green-600" />
                Yes
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" v-model="form.wouldRecommend" :value="false" />
                <ThumbsDown class="w-4 h-4 text-red-600" />
                No
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" v-model="form.wouldRecommend" :value="null" />
                <Minus class="w-4 h-4 text-gray-400" />
                Not sure
              </label>
            </div>
          </div>
        </div>

        <!-- Detailed Ratings - Horizontal Compact -->
        <div class="p-2.5 bg-gray-50 rounded-lg">
          <p class="text-xs font-medium text-gray-600 mb-1.5">Detailed Ratings (Optional)</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <div v-for="(label, key) in detailedRatingLabels" :key="key" class="text-center">
              <label class="text-[10px] text-gray-500 block">{{ label }}</label>
              <div class="flex gap-0.5 justify-center mt-0.5">
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="form.detailedRatings[key] = star"
                  class="text-xs transition-colors"
                >
                  <Star 
                    :class="star <= (form.detailedRatings[key] || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" 
                    class="w-3 h-3" 
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Title & Comment - Two Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- <div class="md:col-span-1">
            <label class="text-sm font-medium text-gray-700 block mb-1">
              Title <span class="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Summarize your experience..."
              class="field"
              maxlength="100"
            />
          </div> -->
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-700 block mb-1">
              Comment <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.comment"
              rows="2"
              placeholder="Share your experience..."
              class="field resize-none"
              maxlength="2000"
            ></textarea>
            <div class="flex justify-between mt-0.5">
              <p v-if="errors.comment" class="text-xs text-red-500">{{ errors.comment }}</p>
              <p class="text-xs text-gray-400 ml-auto">{{ form.comment.length }}/2000</p>
            </div>
          </div>
        </div>

        <!-- Pros & Cons - Two Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">
              <ThumbsUp class="w-4 h-4 inline text-green-600 mr-1" />
              What did you like?
            </label>
            <div class="flex gap-1.5">
              <input
                v-model="proInput"
                type="text"
                placeholder="e.g., Quality, Design..."
                class="field flex-1"
                @keyup.enter="addPro"
              />
              <button @click="addPro" class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex-shrink-0">
                <Plus class="w-4 h-4" />
              </button>
            </div>
            <div class="flex flex-wrap gap-1 mt-1 min-h-[28px]">
              <span
                v-for="(pro, idx) in form.pros"
                :key="idx"
                class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
              >
                {{ pro }}
                <button @click="form.pros.splice(idx, 1)" class="hover:text-red-500">
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">
              <ThumbsDown class="w-4 h-4 inline text-red-600 mr-1" />
              What could be improved?
            </label>
            <div class="flex gap-1.5">
              <input
                v-model="conInput"
                type="text"
                placeholder="e.g., Packaging, Delivery..."
                class="field flex-1"
                @keyup.enter="addCon"
              />
              <button @click="addCon" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex-shrink-0">
                <Plus class="w-4 h-4" />
              </button>
            </div>
            <div class="flex flex-wrap gap-1 mt-1 min-h-[28px]">
              <span
                v-for="(con, idx) in form.cons"
                :key="idx"
                class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
              >
                {{ con }}
                <button @click="form.cons.splice(idx, 1)" class="hover:text-red-500">
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Public - Compact -->
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.isPublic" class="w-4 h-4" />
          <span class="text-sm text-gray-600">Make my feedback public</span>
        </label>

        <!-- Errors -->
        <div v-if="submitError" class="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
          {{ submitError }}
        </div>
      </div>

      <!-- Footer - Compact -->
      <div class="px-6 py-3 border-t flex gap-3 flex-shrink-0">
        <button @click="close" class="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button
          @click="submit"
          :disabled="isSubmitting"
          class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <span v-if="isSubmitting" class="inline-flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Submitting...
          </span>
          <span v-else>Submit Feedback</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { 
  X, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Plus, 
  Loader2 
} from 'lucide-vue-next';
import { feedBackApi } from '@/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const props = defineProps({
  visible: Boolean,
  orderId: String,
  order: Object
});

const emit = defineEmits(['update:visible', 'submitted']);

// ─── State ──────────────────────────────────────────────────────────────
const isSubmitting = ref(false);
const submitError = ref('');
const hoverRating = ref(0);
const proInput = ref('');
const conInput = ref('');

const form = reactive({
  rating: 0,
  detailedRatings: {
    quality: 0,
    design: 0,
    packaging: 0,
    delivery: 0,
    valueForMoney: 0,
    customerService: 0
  },
  title: '',
  comment: '',
  pros: [],
  cons: [],
  wouldRecommend: null,
  isPublic: true
});

const errors = reactive({
  rating: '',
  comment: ''
});

const detailedRatingLabels = {
  quality: 'Quality',
  design: 'Design',
  packaging: 'Packaging',
  delivery: 'Delivery',
  valueForMoney: 'Value',
  customerService: 'Service'
};

// ─── Methods ──────────────────────────────────────────────────────────
function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanPath}`;
}

function handleImageError(event) {
  event.target.src = '';
}

function getStarClass(star) {
  if (hoverRating.value >= star || form.rating >= star) {
    return 'text-yellow-400 scale-110';
  }
  return 'text-gray-300 hover:text-yellow-200 hover:scale-110';
}

function getRatingLabel(rating) {
  const labels = {
    0: 'Select a rating',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Excellent'
  };
  return labels[rating] || 'Select a rating';
}

function addPro() {
  if (proInput.value.trim()) {
    form.pros.push(proInput.value.trim());
    proInput.value = '';
  }
}

function addCon() {
  if (conInput.value.trim()) {
    form.cons.push(conInput.value.trim());
    conInput.value = '';
  }
}

function validate() {
  let valid = true;
  errors.rating = '';
  errors.comment = '';

  if (form.rating === 0) {
    errors.rating = 'Please select a rating';
    valid = false;
  }
  
  if (!form.comment.trim() || form.comment.trim().length < 10) {
    errors.comment = 'Please enter at least 10 characters';
    valid = false;
  }

  return valid;
}

async function submit() {
  if (!validate()) return;
  
  isSubmitting.value = true;
  submitError.value = '';

  try {
    const payload = {
      orderId: props.orderId,
      rating: form.rating,
      detailedRatings: form.detailedRatings,
      title: form.title || null,
      comment: form.comment.trim(),
      pros: form.pros,
      cons: form.cons,
      wouldRecommend: form.wouldRecommend,
      isPublic: form.isPublic
    };

    const response = await feedBackApi.submitFeedback(payload);
    
    if (response.success) {
      emit('submitted', response.data);
      emit('update:visible', false);
      resetForm();
    } else {
      submitError.value = response.message || 'Failed to submit feedback';
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    submitError.value = 'An error occurred. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  form.rating = 0;
  form.detailedRatings = {
    quality: 0,
    design: 0,
    packaging: 0,
    delivery: 0,
    valueForMoney: 0,
    customerService: 0
  };
  form.title = '';
  form.comment = '';
  form.pros = [];
  form.cons = [];
  form.wouldRecommend = null;
  form.isPublic = true;
  proInput.value = '';
  conInput.value = '';
  errors.rating = '';
  errors.comment = '';
  submitError.value = '';
  hoverRating.value = 0;
}

function close() {
  emit('update:visible', false);
}

// Watch for modal close to reset form
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

// Handle escape key
function handleEscape(e) {
  if (e.key === 'Escape') {
    close();
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('keydown', handleEscape);
  }
});
</script>

<style scoped>
.field {
  @apply w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
textarea.field {
  @apply resize-none;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>