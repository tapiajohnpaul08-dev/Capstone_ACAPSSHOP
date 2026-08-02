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

        <div class="grid grid-cols gap-4">
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
            Continue with Google
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
    this.handleOAuthCallback()
  },

  methods: {
    async handleLogin() {
      if (!this.form.email || !this.form.password) return
      
      this.isLoading = true
      
      try {
        const result = await authApi.login(this.form.email, this.form.password)
        
        if (result.success) {
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
      
      // ✅ Use environment variable for backend URL
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
      
      // ✅ Remove trailing /api/v1 if present to avoid double prefix
      const baseUrl = backendUrl.replace(/\/api\/v1$/, '')
      
      console.log(`Redirecting to ${provider} OAuth login at: ${baseUrl}/api/v1/auth/${provider}`)

      if (provider === 'google') {
        window.location.href = `${baseUrl}/api/v1/auth/google`
      } else if (provider === 'facebook') {
        window.location.href = `${baseUrl}/api/v1/auth/facebook`
      }
    },

    handleOAuthCallback()  {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const error = urlParams.get('error')
      const userDataParam = urlParams.get('user')
      
      console.log('OAuth Callback - Token:', token ? 'Present' : 'Not found')
      console.log('OAuth Callback - Error:', error)
      
      if (error) {
        console.error('OAuth Error:', error)
        alert('Login with Google failed. Please try again.')
        window.history.replaceState({}, document.title, window.location.pathname)
        this.socialLoading = null
        return
      }
      
      if (token) {
        try {
          console.log('OAuth Token found, processing login...')
          
          localStorage.setItem('customerToken', token)
          localStorage.setItem('token', token)
          
          if (userDataParam) {
            try {
              const userData = JSON.parse(decodeURIComponent(userDataParam))
              localStorage.setItem('currentUser', JSON.stringify(userData))
              localStorage.setItem('userName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email)
              localStorage.setItem('userEmail', userData.email)
              console.log('User data saved from URL')
              
              // If we have user data, redirect directly to dashboard
              window.history.replaceState({}, document.title, window.location.pathname)
              this.$router.push('/customer/dashboard')
              return
            } catch (e) {
              console.error('Error parsing user data:', e)
            }
          }
          
          // If no user data, fetch it
          window.history.replaceState({}, document.title, window.location.pathname)
          this.fetchUserData()
          
        } catch (error) {
          console.error('OAuth callback error:', error)
          alert('Login with Google failed. Please try again.')
          this.socialLoading = null
        }
      }
    },

    async fetchUserData() {
      try {
        const response = await authApi.getProfile()
        
        console.log('Profile response:', response)
        
        if (response.success && response.data) {
          const userData = response.data
          
          localStorage.setItem('currentUser', JSON.stringify(userData))
          localStorage.setItem('userName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email)
          localStorage.setItem('userEmail', userData.email)
          
          console.log('User data fetched successfully:', userData)
          this.$router.push('/customer/dashboard')
        } else {
          console.error('Failed to fetch user data:', response)
          this.$router.push('/customer/dashboard')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        this.$router.push('/customer/dashboard')
      } finally {
        this.socialLoading = null
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