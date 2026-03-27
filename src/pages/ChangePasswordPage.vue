<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button 
        @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4"
      >
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
          <input
            v-model="form.currentPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            v-model="form.newPassword"
            type="password"
            required
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Password
          </button>
          <button
            type="button"
            @click="goBack"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function changePassword() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('New passwords do not match!')
    return
  }
  
  if (form.value.newPassword.length < 6) {
    alert('Password must be at least 6 characters!')
    return
  }
  
  // Demo validation - in real app, verify current password with backend
  if (form.value.currentPassword === 'customer123') {
    // Save new password (in demo, just store in localStorage)
    localStorage.setItem('customerPassword', form.value.newPassword)
    alert('Password changed successfully!')
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    router.push('/customer/profile')
  } else {
    alert('Current password is incorrect!')
  }
}

function goBack() {
  router.push('/customer/profile')
}
</script>