<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button @click="goBack" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Change Password</h1>
      <p class="text-gray-600 mt-1">Update your account password</p>
    </div>

    <div class="bg-white rounded-xl border">
      <form @submit.prevent="changePassword" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input v-model="form.currentPassword" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input v-model="form.newPassword" type="password" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input v-model="form.confirmPassword" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" :disabled="isSaving" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isSaving ? 'Updating...' : 'Update Password' }}
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { authApi } from '@/api.js'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const router = useRouter()
const isSaving = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

async function changePassword() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    feedbackTitle.value = 'Passwords Don\'t Match'
    feedbackMessage.value = 'New password and confirmation do not match.'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
    return
  }
  if (form.value.newPassword.length < 6) {
    feedbackTitle.value = 'Password Too Short'
    feedbackMessage.value = 'Password must be at least 6 characters.'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
    return
  }
  isSaving.value = true
  const res = await authApi.changePassword(form.value.currentPassword, form.value.newPassword)
  isSaving.value = false
  feedbackTitle.value = res.success ? 'Password Updated' : 'Update Failed'
  feedbackMessage.value = res.success ? 'Your password has been changed successfully.' : (res.message || 'Something went wrong.')
  feedbackStatus.value = res.success ? 'success' : 'error'
  feedbackVisible.value = true
  if (res.success) {
    form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    setTimeout(() => router.push('/customer/profile'), 2200)
  }
}

function goBack() { router.push('/customer/profile') }
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>