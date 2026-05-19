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
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
              :placeholder="loginData.fields.password.placeholder"
              required
            />
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
            v-for="social in loginData.socialLogins"
            :key="social.provider"
            @click="handleSocialLogin(social.provider)"
            class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 h-9 px-4 py-2 w-full"
          >
            <component :is="social.icon" class="mr-2 h-4 w-4" />
            {{ social.label }}
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
import { useAuth } from '@/composables/useAuth.js'

export default {
  name: 'LoginView',
  data() {
    return {
      appName,
      loginData,
      form: { email: '', password: '' },
      isLoading: false,
      showPassword: false
    }
  },
  mounted() {
    // Seed demo users if none exist
    if (!localStorage.getItem('customerUsers')) {
      localStorage.setItem('customerUsers', JSON.stringify([
        { id: 1, email: 'customer@acapshop.com', password: 'customer123', name: 'John Customer' },
        { id: 2, email: 'demo@acapshop.com', password: 'demo123', name: 'Demo User' }
      ]))
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.email || !this.form.password) return
      this.isLoading = true
      try {
        const { login } = useAuth()
        const res = await login(this.form.email, this.form.password)
        if (res.success) {
          setTimeout(() => this.$router.push('/customer/dashboard'), 800)
        } else {
          alert(res.message || 'Invalid email or password. Try: customer@acapshop.com / customer123')
        }
      } finally {
        this.isLoading = false
      }
    },
    handleForgotPassword() { alert('Reset link would be sent to your email. (Demo feature)') },
    handleSocialLogin(provider) { alert(`Login with ${provider} (Demo feature)`) },
    handleSignUp() { this.$router.push('/customer/signup') }
  }
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>