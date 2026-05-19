<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button @click="goBack" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Account Information</h1>
      <p class="text-gray-600 mt-1">Manage your personal information</p>
    </div>

    <div class="bg-white rounded-xl border">
      <form @submit.prevent="saveAccount" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input v-model="form.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input v-model="form.company" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" :disabled="isSaving" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button type="button" @click="goBack" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>

    <FeedbackModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :status="feedbackStatus"
      :message="feedbackMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { profileApi } from '@/api.js'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const router = useRouter()
const isSaving = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

const form = ref({ name: '', email: '', phone: '', company: '' })

onMounted(async () => {
  const res = await profileApi.getProfile()
  if (res.success) {
    form.value.name = res.user.name || ''
    form.value.email = res.user.email || ''
    form.value.phone = res.user.phone || ''
    form.value.company = res.user.company || ''
  }
})

async function saveAccount() {
  isSaving.value = true
  const res = await profileApi.updateProfile(form.value)
  isSaving.value = false
  feedbackTitle.value = res.success ? 'Profile Updated' : 'Update Failed'
  feedbackMessage.value = res.success ? 'Your account information has been saved.' : 'Something went wrong. Please try again.'
  feedbackStatus.value = res.success ? 'success' : 'error'
  feedbackVisible.value = true
  if (res.success) setTimeout(() => router.push('/customer/profile'), 2200)
}

function goBack() { router.push('/customer/profile') }
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>