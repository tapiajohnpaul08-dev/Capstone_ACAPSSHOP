<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="text-center">
      <div v-if="status === 'processing'" class="space-y-4">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-600 font-medium">Signing you in…</p>
      </div>

      <div v-else-if="status === 'success'" class="space-y-3">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" class="text-green-600">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <p class="text-gray-800 font-semibold">Welcome!</p>
        <p class="text-sm text-gray-500">Redirecting to your dashboard…</p>
      </div>

      <div v-else class="space-y-3">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" class="text-red-600">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="text-gray-800 font-semibold">Sign-in failed</p>
        <p class="text-sm text-gray-500">{{ errorMessage }}</p>
        <button @click="goToLogin"
          class="mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const status = ref('processing')
const errorMessage = ref('')

onMounted(() => {
  handleOAuthCallback()
})

async function handleOAuthCallback() {
  try {
    const token = route.query.token
    const userParam = route.query.user
    const errorParam = route.query.error

    if (errorParam) {
      status.value = 'error'
      errorMessage.value = `Authentication failed: ${errorParam}`
      return
    }

    if (!token || !userParam) {
      status.value = 'error'
      errorMessage.value = 'Missing authentication data. Please try again.'
      return
    }

    let userData
    try {
      userData = JSON.parse(decodeURIComponent(userParam))
    } catch (e) {
      console.error('Failed to parse user param:', e)
      status.value = 'error'
      errorMessage.value = 'Invalid user data received.'
      return
    }

    // Store in localStorage — same keys the rest of the app uses
    localStorage.setItem('customerToken', token)
    localStorage.setItem('token', token)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    localStorage.setItem(
      'userName',
      `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Customer'
    )
    localStorage.setItem('userEmail', userData.email || '')

    // Notify any open tabs / composables
    window.dispatchEvent(new Event('authChanged'))

    status.value = 'success'

    // Redirect after a moment
    setTimeout(() => {
      router.replace('/customer/dashboard')
    }, 1200)
  } catch (err) {
    console.error('OAuth callback error:', err)
    status.value = 'error'
    errorMessage.value = err.message || 'Something went wrong during sign-in.'
  }
}

function goToLogin() {
  router.replace('/customer/login')
}
</script>