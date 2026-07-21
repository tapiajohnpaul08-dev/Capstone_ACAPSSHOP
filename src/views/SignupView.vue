<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white flex flex-col gap-4 rounded-xl border w-full max-w-2xl shadow-sm">

      <!-- Card Header -->
      <div class="text-center px-6 pt-6">
        <div class="text-3xl font-bold text-blue-600 mb-1">{{ appName }}</div>
        <h4 class="text-lg font-semibold leading-none">Create your account</h4>
        <p class="text-sm text-gray-500 mt-1">Fill in the details below to get started</p>
      </div>

      <!-- Card Content -->
      <div class="px-6 pb-6">
        <form @submit.prevent="handleSignUp" class="space-y-3">
          
          <!-- Name Row (First + Middle + Last) - 3 columns on larger screens -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- First Name -->
            <div class="space-y-1">
              <label for="firstName" class="text-sm font-medium">First name <span class="text-red-500">*</span></label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="Juan"
                autocomplete="given-name"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.firstName ? 'border-red-500' : 'border-gray-300']"
              />
              <p v-if="errors.firstName" class="text-xs text-red-500">{{ errors.firstName }}</p>
            </div>

            <!-- Middle Name (Optional) -->
            <div class="space-y-1">
              <label for="middleName" class="text-sm font-medium">
                Middle name
                <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="middleName"
                v-model="form.middleName"
                type="text"
                placeholder="Santos"
                autocomplete="additional-name"
                class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              />
            </div>

            <!-- Last Name -->
            <div class="space-y-1">
              <label for="lastName" class="text-sm font-medium">Last name <span class="text-red-500">*</span></label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                placeholder="dela Cruz"
                autocomplete="family-name"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.lastName ? 'border-red-500' : 'border-gray-300']"
              />
              <p v-if="errors.lastName" class="text-xs text-red-500">{{ errors.lastName }}</p>
            </div>
          </div>

          <!-- Contact Row (Phone + Email) - 2 columns -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Phone Number -->
            <div class="space-y-1">
              <label for="phone" class="text-sm font-medium">Phone number <span class="text-red-500">*</span></label>
              <div class="flex items-center gap-2">
                <p class="text-gray-500 border border-gray-300 p-1.5 h-9 rounded-md text-sm w-12 text-center">+63</p>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="917 000 0000"
                  autocomplete="tel"
                  :class="['flex-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.phone ? 'border-red-500' : 'border-gray-300']"
                />
              </div>
              <p v-if="errors.phone" class="text-xs text-red-500">{{ errors.phone }}</p>
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label for="email" class="text-sm font-medium">Email address <span class="text-red-500">*</span></label>
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
          </div>

          <!-- Username + Company Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Username -->
            <div class="space-y-1">
              <label for="username" class="text-sm font-medium">Username <span class="text-red-500">*</span></label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="juandelacruz"
                autocomplete="username"
                :class="['flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50', errors.username ? 'border-red-500' : 'border-gray-300']"
              />
              <p v-if="errors.username" class="text-xs text-red-500">{{ errors.username }}</p>
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
          </div>

          <!-- Password Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Password -->
            <div class="space-y-1">
              <label for="password" class="text-sm font-medium">Password <span class="text-red-500">*</span></label>
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
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <!-- Password strength bars -->
              <div v-if="form.password" class="flex gap-1 mt-1">
                <div
                  v-for="i in 3"
                  :key="i"
                  :class="['h-1 flex-1 rounded-full transition-colors', getStrengthBarClass(i)]"
                ></div>
              </div>
              <p v-if="form.password" class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
              <p v-if="errors.password" class="text-xs text-red-500">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1">
              <label for="confirmPassword" class="text-sm font-medium">Confirm password <span class="text-red-500">*</span></label>
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
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="text-xs text-red-500">{{ errors.confirmPassword }}</p>
            </div>
          </div>

          <!-- Password Requirements Checklist -->
          <div v-if="form.password" class="grid grid-cols-2 gap-1 mt-1">
            <div class="flex items-center gap-1 text-xs" :class="form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'">
              <span>{{ form.password.length >= 8 ? '✓' : '○' }}</span>
              <span>At least 8 characters</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :class="/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'">
              <span>{{ /[A-Z]/.test(form.password) ? '✓' : '○' }}</span>
              <span>Uppercase letter</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :class="/[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'">
              <span>{{ /[a-z]/.test(form.password) ? '✓' : '○' }}</span>
              <span>Lowercase letter</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :class="/[0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'">
              <span>{{ /[0-9]/.test(form.password) ? '✓' : '○' }}</span>
              <span>Number</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2 w-full mt-2"
          >
            <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isLoading ? 'Sending verification code...' : 'Continue' }}
          </button>
        </form>

        <!-- Sign In Link -->
        <div class="text-center text-sm mt-4">
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
import { otpApi } from '@/api'
import { Eye, EyeOff } from 'lucide-vue-next'

export default {
  name: 'SignUpView',

  components: {
    Eye,
    EyeOff
  },

  data() {
    return {
      appName,
      form: {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        company: '',
        password: '',
        confirmPassword: ''
      },
      errors: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      isLoading: false,
      showPassword: false,
      showConfirmPassword: false,
      passwordStrength: 0
    }
  },

  computed: {
    strengthLabel() {
      const score = this.passwordStrength
      if (score === 0) return ''
      if (score === 1) return 'Weak'
      if (score === 2) return 'Good'
      return 'Strong'
    },
    strengthTextColor() {
      const score = this.passwordStrength
      if (score === 0) return ''
      if (score === 1) return 'text-red-500'
      if (score === 2) return 'text-orange-500'
      return 'text-green-600'
    }
  },

  methods: {
    checkPasswordStrength() {
      const pw = this.form.password
      let score = 0
      
      // Check length (at least 8 characters)
      if (pw.length >= 8) score++
      
      // Check for uppercase letter
      if (/[A-Z]/.test(pw)) score++
      
      // Check for lowercase letter
      if (/[a-z]/.test(pw)) score++
      
      // Check for number
      if (/[0-9]/.test(pw)) score++
      
      // Special characters are NOT checked - they don't add to score
      
      this.passwordStrength = score
    },

    getStrengthBarClass(index) {
      const score = this.passwordStrength
      if (score === 0) return 'bg-gray-200'
      
      // Show color based on score
      if (index === 1) {
        return score >= 1 ? 'bg-red-400' : 'bg-gray-200'
      }
      if (index === 2) {
        return score >= 2 ? 'bg-orange-400' : 'bg-gray-200'
      }
      if (index === 3) {
        return score >= 3 ? 'bg-green-500' : 'bg-gray-200'
      }
      return 'bg-gray-200'
    },

    validateForm() {
      let valid = true
      this.errors = {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      }

      if (!this.form.firstName.trim()) {
        this.errors.firstName = 'First name is required'
        valid = false
      }

      if (!this.form.lastName.trim()) {
        this.errors.lastName = 'Last name is required'
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

      if (!this.form.username.trim()) {
        this.errors.username = 'Username is required'
        valid = false
      } else if (this.form.username.length < 3) {
        this.errors.username = 'Username must be at least 3 characters'
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
        // Step 1: Send OTP to email
        const otpResult = await otpApi.sendOtp(this.form.email)

        if (!otpResult.success) {
          alert(otpResult.message || 'Failed to send OTP. Please try again.')
          this.isLoading = false
          return
        }

        // Step 2: Save pending registration data
        const pendingData = {
          firstName: this.form.firstName,
          middleName: this.form.middleName,
          lastName: this.form.lastName,
          phone: this.form.phone,
          email: this.form.email,
          username: this.form.username,
          companyName: this.form.company || null,
          password: this.form.password
        }

        console.log('Saving pending data:', pendingData)
        sessionStorage.setItem('pendingSignup', JSON.stringify(pendingData))
        sessionStorage.setItem('pendingEmail', this.form.email)

        // Step 3: Navigate to OTP verification
        this.$router.push({
          name: 'OtpVerify',
          query: { 
            email: this.form.email,
            purpose: 'registration'
          }
        })
      } catch (error) {
        console.error('Sign up error:', error)
        alert(error.message || 'Something went wrong. Please try again.')
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