<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">
      <!-- Card Header -->
      <div class="text-center px-6 pt-6">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ appName }}</div>
        <h4 class="text-lg font-semibold leading-none">{{ loginData.title }}</h4>
        <p class="text-sm text-gray-500 mt-1">{{ loginData.subtitle }}</p>
      </div>

      <!-- Card Content -->
      <div class="px-6 pb-6 space-y-4">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Field -->
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

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">{{ loginData.fields.password.label }}</label>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
              :placeholder="loginData.fields.password.placeholder"
              required
            />
            <div class="text-right">
              <!-- <button
                type="button"
                @click="togglePasswordVisibility"
                class="text-xs text-gray-500 hover:text-gray-700"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button> -->
            </div>
          </div>

          <!-- Forgot Password Link -->
          <div class="text-right">
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-sm text-blue-600 hover:underline"
            >
              {{ loginData.forgotPasswordText }}
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2 w-full"
          >
            <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            {{ isLoading ? loginData.buttonLoadingText : loginData.buttonText }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-2 text-gray-500">{{ loginData.dividerText }}</span>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="social in loginData.socialLogins"
            :key="social.provider"
            @click="handleSocialLogin(social.provider)"
            class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 h-9 px-4 py-2 w-full"
          >
            <component :is="social.icon" class="mr-2 h-4 w-4" />
            {{ social.label }}
          </button>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center text-sm">
          {{ loginData.signUpText.prefix }}
          <button
            @click="handleSignUp"
            class="text-blue-600 hover:underline font-medium"
          >
            {{ loginData.signUpText.link }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loginData, appName } from '@/data/loginData.js'

export default {
  name: 'LoginView',
  data() {
    return {
      appName: appName,
      loginData: loginData,
      form: {
        email: '',
        password: ''
      },
      isLoading: false,
      showPassword: false
    }
  },
  mounted() {
    // Initialize dummy users for customer portal
    const storedUsers = localStorage.getItem('customerUsers')
    if (!storedUsers) {
      const dummyUsers = [
        {
          id: 1,
          email: 'customer@acapshop.com',
          password: 'customer123',
          name: 'John Customer'
        },
        {
          id: 2,
          email: 'demo@acapshop.com',
          password: 'demo123',
          name: 'Demo User'
        }
      ]
      localStorage.setItem('customerUsers', JSON.stringify(dummyUsers))
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.email || !this.form.password) {
        this.showError('Please fill in all fields')
        return
      }

      this.isLoading = true

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get dummy users from localStorage
        const users = JSON.parse(localStorage.getItem('customerUsers') || '[]')
        
        const user = users.find(u => 
          u.email === this.form.email && 
          u.password === this.form.password
        )
        
        if (user) {
          // Store customer session
          localStorage.setItem('customerToken', 'demo-token-' + Date.now())
          localStorage.setItem('userName', user.name)
          localStorage.setItem('userEmail', user.email)
          localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            loggedInAt: new Date().toISOString()
          }))
          
          console.log('Login successful:', user)
          this.showSuccess('Login successful! Redirecting...')
          
          // Redirect to customer dashboard
          setTimeout(() => {
            this.$router.push('/customer/dashboard')
          }, 1000)
        } else {
          this.showError('Invalid email or password. Try: customer@acapshop.com / customer123')
        }
      } catch (error) {
        console.error('Login failed:', error)
        this.showError('Login failed. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    
    handleForgotPassword() {
      alert('Reset link would be sent to your email. (Demo feature)')
    },
    
    handleSocialLogin(provider) {
      alert(`Login with ${provider} (Demo feature)`)
    },
    
    handleSignUp() {
      alert('Sign up page coming soon!')
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    
    showError(message) {
      alert(message)
    },
    
    showSuccess(message) {
      // alert(message)
    }
  }
}
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>