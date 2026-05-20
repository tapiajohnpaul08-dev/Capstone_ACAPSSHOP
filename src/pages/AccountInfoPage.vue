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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- First Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input 
              v-model="form.firstName" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <!-- Middle Name (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
              <span class="text-gray-400 text-xs">(optional)</span>
            </label>
            <input 
              v-model="form.middleName" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <!-- Last Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input 
              v-model="form.lastName" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email (read-only - cannot change) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              v-model="form.email" 
              type="email" 
              readonly 
              disabled
              class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
            />
            <p class="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              v-model="form.username" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Phone Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 border border-gray-300 px-3 py-2 rounded-lg bg-gray-50">+63</span>
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="917 000 0000"
                class="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          
          <!-- Company Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Company Name
              <span class="text-gray-400 text-xs">(optional)</span>
            </label>
            <input 
              v-model="form.companyName" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
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
import { profileApi, authApi } from '@/api.js'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const router = useRouter()
const isSaving = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

const form = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  username: '',
  phone: '',
  companyName: ''
})

// Store customerId for update API
const customerId = ref('')

onMounted(async () => {
  await loadProfile()
})

async function loadProfile() {
  const result = await profileApi.getProfile()
  
  if (result.success && result.data) {
    const user = result.data
    customerId.value = user.customerId || user._id
    
    form.value = {
      firstName: user.firstName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      companyName: user.companyName || ''
    }
  } else {
    feedbackTitle.value = 'Error'
    feedbackMessage.value = result.message || 'Failed to load profile'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
  }
}

async function saveAccount() {
  if (!form.value.firstName || !form.value.lastName || !form.value.username) {
    feedbackTitle.value = 'Validation Error'
    feedbackMessage.value = 'First name, last name, and username are required'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
    return
  }

  isSaving.value = true
  
  const updateData = {
    firstName: form.value.firstName,
    middleName: form.value.middleName,
    lastName: form.value.lastName,
    username: form.value.username,
    phone: form.value.phone,
    companyName: form.value.companyName || null
  }
  
  const result = await authApi.updateCustomer(customerId.value, updateData)
  
  isSaving.value = false
  
  if (result.success) {
    // Update localStorage with new user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const updatedUser = {
      ...currentUser,
      firstName: form.value.firstName,
      middleName: form.value.middleName,
      lastName: form.value.lastName,
      username: form.value.username,
      phone: form.value.phone,
      companyName: form.value.companyName
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    localStorage.setItem('userName', `${form.value.firstName} ${form.value.lastName}`)
    
    feedbackTitle.value = 'Profile Updated'
    feedbackMessage.value = 'Your account information has been saved successfully.'
    feedbackStatus.value = 'success'
    feedbackVisible.value = true
    
    setTimeout(() => router.push('/customer/profile'), 2000)
  } else {
    feedbackTitle.value = 'Update Failed'
    feedbackMessage.value = result.message || 'Something went wrong. Please try again.'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
  }
}

function goBack() {
  router.push('/customer/profile')
}
</script>

<style scoped>
@keyframes spin { 
  to { transform: rotate(360deg); } 
}
.animate-spin { 
  animation: spin 0.7s linear infinite; 
}
</style>