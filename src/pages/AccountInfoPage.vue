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
      <h1 class="text-2xl font-bold">Account Information</h1>
      <p class="text-gray-600 mt-1">Manage your personal information</p>
    </div>

    <div class="bg-white rounded-xl border">
      <form @submit.prevent="saveAccount" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              v-model="form.company"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  phone: '',
  company: ''
})

onMounted(() => {
  // Load user data from localStorage
  const user = localStorage.getItem('currentUser')
  if (user) {
    const userData = JSON.parse(user)
    form.value.name = userData.name || ''
    form.value.email = userData.email || ''
  }
  // Load phone and company from localStorage or defaults
  form.value.phone = localStorage.getItem('userPhone') || '+63 912 345 6789'
  form.value.company = localStorage.getItem('userCompany') || 'ACAPSHOP Customer'
})

function saveAccount() {
  // Save to localStorage
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
  user.name = form.value.name
  user.email = form.value.email
  localStorage.setItem('currentUser', JSON.stringify(user))
  localStorage.setItem('userName', form.value.name)
  localStorage.setItem('userEmail', form.value.email)
  localStorage.setItem('userPhone', form.value.phone)
  localStorage.setItem('userCompany', form.value.company)
  
  alert('Account information updated successfully!')
  router.push('/customer/profile')
}

function goBack() {
  router.push('/customer/profile')
}
</script>