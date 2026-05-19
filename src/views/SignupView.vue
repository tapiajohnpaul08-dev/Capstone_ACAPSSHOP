<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">

      <!-- Card Header -->
      <div class="text-center px-6 pt-6">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ appName }}</div>
        <h4 class="text-lg font-semibold leading-none">Create your account</h4>
        <p class="text-sm text-gray-500 mt-1">Fill in the details below to get started</p>
      </div>

      <!-- Card Content -->
      <div class="px-6 pb-6 space-y-4">
        <form @submit.prevent="handleSignUp" class="space-y-4">

          <!-- Full Name + Phone (side by side) -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Full Name -->
            <div class="space-y-1">
              <label for="fullName" class="text-sm font-medium">Full name</label>
              <input
                id="fullName"
                v-model="form.fullName"
                type="text"
                placeholder="Juan dela Cruz"
                autocomplete="name"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.fullName ? 'border-red-500' : 'border-gray-300']"
              />
              <p v-if="errors.fullName" class="text-xs text-red-500">{{ errors.fullName }}</p>
            </div>

            <!-- Phone Number -->
            <div class="space-y-1">
              <label for="phone" class="text-sm font-medium">Phone number</label>
              <div class="flex items-center gap-2">
                  <p class="text-gray-500 border border-gray-300 p-1.5 h-9 rounded-md text-sm">+63</p>
                <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder=" 917 000 0000"
                autocomplete="tel"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.phone ? 'border-red-500' : 'border-gray-300']"
              />
              </div>
              <p v-if="errors.phone" class="text-xs text-red-500">{{ errors.phone }}</p>
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-1">
            <label for="email" class="text-sm font-medium">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              :class="['flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.email ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <!-- Company Name (optional) -->
          <div class="space-y-1">
            <label for="company" class="text-sm font-medium">
              Company name
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="company"
              v-model="form.company"
              type="text"
              placeholder="Your company"
              autocomplete="organization"
              class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            />
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <label for="password" class="text-sm font-medium">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="At least 8 characters"
                autocomplete="new-password"
                @input="checkPasswordStrength"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 pr-10 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.password ? 'border-red-500' : 'border-gray-300']"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <!-- Password strength bars -->
            <div v-if="form.password" class="flex gap-1 mt-1">
              <div
                v-for="i in 4"
                :key="i"
                :class="['h-1 flex-1 rounded-full transition-colors', getStrengthBarClass(i)]"
              ></div>
            </div>
            <p v-if="form.password" class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
            <p v-if="errors.password" class="text-xs text-red-500">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-1">
            <label for="confirmPassword" class="text-sm font-medium">Confirm password</label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Repeat your password"
                autocomplete="new-password"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 pr-10 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.confirmPassword ? 'border-red-500' : 'border-gray-300']"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {{ showConfirmPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-xs text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2 w-full"
          >
            <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isLoading ? 'Sending verification code...' : 'Continue' }}
          </button>
        </form>

        <!-- Sign In Link -->
        <div class="text-center text-sm">
          Already have an account?
          <button @click="goToLogin" class="text-blue-600 hover:underline font-medium">
            Sign in
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { appName } from '@/data/loginData.js'

export default {
  name: 'SignUpView',

  data() {
    return {
      appName,
      form: {
        fullName: '',
        phone: '',
        email: '',
        company: '',
        password: '',
        confirmPassword: ''
      },
      errors: {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      isLoading: false,
      showPassword: false,
      showConfirmPassword: false,
      passwordStrength: 0 // 0–4
    }
  },

  computed: {
    strengthLabel() {
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
      return labels[this.passwordStrength] || ''
    },
    strengthTextColor() {
      const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600']
      return colors[this.passwordStrength] || ''
    }
  },

  methods: {
    checkPasswordStrength() {
      const pw = this.form.password
      let score = 0
      if (pw.length >= 8) score++
      if (/[A-Z]/.test(pw)) score++
      if (/[0-9]/.test(pw)) score++
      if (/[^A-Za-z0-9]/.test(pw)) score++
      this.passwordStrength = score
    },

    getStrengthBarClass(index) {
      if (this.passwordStrength === 0) return 'bg-gray-200'
      const colorMap = {
        1: 'bg-red-400',
        2: 'bg-orange-400',
        3: 'bg-yellow-400',
        4: 'bg-green-500'
      }
      return index <= this.passwordStrength
        ? colorMap[this.passwordStrength]
        : 'bg-gray-200'
    },

    validateForm() {
      let valid = true
      this.errors = { fullName: '', phone: '', email: '', password: '', confirmPassword: '' }

      if (!this.form.fullName.trim()) {
        this.errors.fullName = 'Full name is required'
        valid = false
      }

      if (!this.form.phone.trim() || this.form.phone.trim().length < 7) {
        this.errors.phone = 'Enter a valid phone number'
        valid = false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Enter a valid email address'
        valid = false
      }

      if (this.form.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters'
        valid = false
      }

      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password'
        valid = false
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
        valid = false
      }

      return valid
    },

    async handleSignUp() {
      if (!this.validateForm()) return

      this.isLoading = true

      try {
        // Simulate sending OTP to email
        await new Promise(resolve => setTimeout(resolve, 1200))

        // Save pending registration to sessionStorage
        sessionStorage.setItem('pendingSignup', JSON.stringify({
          fullName: this.form.fullName,
          phone: this.form.phone,
          email: this.form.email,
          company: this.form.company,
          password: this.form.password
        }))

        // Navigate to OTP page, passing email as query param
        this.$router.push({
          name: 'OtpVerify',
          query: { email: this.form.email }
        })
      } catch (error) {
        console.error('Sign up error:', error)
        alert('Something went wrong. Please try again.')
      } finally {
        this.isLoading = false
      }
    },

    goToLogin() {
      this.$router.push('/customer/login')
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