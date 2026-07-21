<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">
      <div class="text-center px-6 pt-6">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ appName }}</div>
        <h4 class="text-lg font-semibold leading-none">{{ loginData.title }}</h4>
        <p class="text-sm text-gray-500 mt-1">{{ loginData.subtitle }}</p>
      </div>

      <div class="px-6 pb-6 space-y-4">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">{{ loginData.fields.email.label }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
              :placeholder="loginData.fields.email.placeholder"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">{{ loginData.fields.password.label }}</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 pr-10 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
                :placeholder="loginData.fields.password.placeholder"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="text-right">
            <button type="button" @click="handleForgotPassword" class="text-sm text-blue-600 hover:underline">
              {{ loginData.forgotPasswordText }}
            </button>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2 w-full"
          >
            <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            {{ isLoading ? loginData.buttonLoadingText : loginData.buttonText }}
          </button>
        </form>

        <div class="relative">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-2 text-gray-500">{{ loginData.dividerText }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button
            @click="handleSocialLogin('google')"
            :disabled="socialLoading === 'google'"
            class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 h-9 px-4 py-2 w-full disabled:opacity-50"
          >
            <span v-if="socialLoading === 'google'" class="inline-block w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
            <svg v-else class="mr-2 h-4 w-4" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            @click="handleSocialLogin('facebook')"
            :disabled="socialLoading === 'facebook'"
            class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 h-9 px-4 py-2 w-full disabled:opacity-50"
          >
            <span v-if="socialLoading === 'facebook'" class="inline-block w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
            <svg v-else class="mr-2 h-4 w-4" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div class="text-center text-sm">
          {{ loginData.signUpText.prefix }}
          <button @click="handleSignUp" class="text-blue-600 hover:underline font-medium">
            {{ loginData.signUpText.link }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loginData, appName } from '@/data/loginData.js'
import { authApi } from '@/api'
import { Eye, EyeOff } from 'lucide-vue-next'

export default {
  name: 'LoginView',
  
  components: {
    Eye,
    EyeOff
  },
  
  data() {
    return {
      appName,
      loginData,
      form: { email: '', password: '' },
      isLoading: false,
      socialLoading: null,
      showPassword: false
    }
  },

  mounted() {
    // Check for OAuth callback when component mounts
    this.handleOAuthCallback()
  },

  methods: {
    async handleLogin() {
      if (!this.form.email || !this.form.password) return
      
      this.isLoading = true
      
      try {
        const result = await authApi.login(this.form.email, this.form.password)
        
        if (result.success) {
          // Save token and user data
          if (result.data?.token) {
            localStorage.setItem('customerToken', result.data.token)
            localStorage.setItem('token', result.data.token)
            localStorage.setItem('currentUser', JSON.stringify(result.data.customer))
            localStorage.setItem('userName', `${result.data.customer.firstName} ${result.data.customer.lastName}`)
            localStorage.setItem('userEmail', result.data.customer.email)
          }
          
          this.$router.push('/customer/dashboard')
        } else {
          alert(result.message || 'Invalid email or password')
        }
      } catch (error) {
        console.error('Login error:', error)
        alert('Login failed. Please try again.')
      } finally {
        this.isLoading = false
      }
    },

    handleSocialLogin(provider) {
      this.socialLoading = provider
      
      // Redirect to backend OAuth endpoint
      if (provider === 'google') {
        window.location.href = 'http://localhost:3001/api/v1/auth/google'
      } else if (provider === 'facebook') {
        window.location.href = 'http://localhost:3001/api/v1/auth/facebook'
      }
    },

    handleOAuthCallback() {
      // Get token and user from URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const userDataParam = urlParams.get('user')
      
      if (token && userDataParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataParam))
          
          console.log('OAuth Callback - User Data:', userData)
          console.log('OAuth Callback - Token:', token)
          
          // Save to localStorage
          localStorage.setItem('customerToken', token)
          localStorage.setItem('token', token)
          localStorage.setItem('currentUser', JSON.stringify(userData))
          localStorage.setItem('userName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email)
          localStorage.setItem('userEmail', userData.email)
          
          // Clear URL parameters without refreshing
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // Redirect to dashboard
          this.$router.push('/customer/dashboard')
        } catch (error) {
          console.error('OAuth callback error:', error)
          alert('Login with social media failed. Please try again.')
        }
      }
    },

    handleForgotPassword() {
      this.$router.push('/customer/forgot-password')
    },

    handleSignUp() {
      this.$router.push('/customer/signup')
    }
  }
}
</script>

<style scoped>
@keyframes spin { 
  to { transform: rotate(360deg); } 
}
.animate-spin { 
  animation: spin 1s linear infinite; 
}
</style>