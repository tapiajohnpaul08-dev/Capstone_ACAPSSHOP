<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm p-6">
      <div class="text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ appName }}</div>
        <h4 class="text-lg font-semibold">Forgot Password</h4>
        <p class="text-sm text-gray-500 mt-1">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email Input -->
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
            placeholder="your@email.com"
            required
            :disabled="otpSent"
          />
        </div>

        <!-- OTP Input (shown after OTP sent) -->
        <div v-if="otpSent" class="space-y-2">
          <label for="otp" class="text-sm font-medium">Verification Code</label>
          <div class="flex gap-2">
            <input
              id="otp"
              v-model="otp"
              type="text"
              maxlength="6"
              class="flex-1 h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
              placeholder="Enter 6-digit code"
              required
              :disabled="otpVerified"
            />
            <button
              type="button"
              @click="resendOtp"
              :disabled="isResending || cooldown > 0 || otpVerified"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {{ cooldown > 0 ? `${cooldown}s` : 'Resend' }}
            </button>
          </div>
          <p class="text-xs text-gray-500">Enter the 6-digit code sent to your email</p>
        </div>

        <!-- New Password (shown after OTP verified) -->
        <div v-if="otpVerified" class="space-y-2">
          <label for="newPassword" class="text-sm font-medium">New Password</label>
          <div class="relative">
            <input
              id="newPassword"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              class="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 pr-10 text-base bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
              placeholder="Enter new password"
              required
              minlength="8"
              @input="checkPasswordStrength"
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
          
          <!-- Password Strength - Using same style as Signup -->
          <div v-if="newPassword" class="flex gap-1 mt-1">
            <div
              v-for="i in 3"
              :key="i"
              :class="['h-1 flex-1 rounded-full transition-colors', getStrengthBarClass(i)]"
            ></div>
          </div>
          <p v-if="newPassword" class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>

          <!-- Password Requirements Checklist -->
          <div class="grid grid-cols-2 gap-1 mt-2">
            <div class="flex items-center gap-1 text-xs" :class="newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'">
              <span>{{ newPassword.length >= 8 ? '✓' : '○' }}</span>
              <span>At least 8 characters</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :class="/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'">
              <span>{{ /[A-Z]/.test(newPassword) ? '✓' : '○' }}</span>
              <span>Uppercase letter</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :class="/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'">
              <span>{{ /[a-z]/.test(newPassword) ? '✓' : '○' }}</span>
              <span>Lowercase letter</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :class="/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'">
              <span>{{ /[0-9]/.test(newPassword) ? '✓' : '○' }}</span>
              <span>Number</span>
            </div>
          </div>
        </div>

        <!-- Error/Success Messages -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading || !canSubmit"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2 w-full"
        >
          <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          {{ getButtonText() }}
        </button>

        <!-- Back to Login -->
        <div class="text-center text-sm">
          <button @click="goToLogin" class="text-blue-600 hover:underline font-medium">
            ← Back to Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authApi, otpApi } from '@/api'
import { Eye, EyeOff } from 'lucide-vue-next'

export default {
  name: 'ForgotPasswordView',
  
  components: {
    Eye,
    EyeOff
  },
  
  data() {
    return {
      appName: 'ACAPHOP',
      email: '',
      otp: '',
      newPassword: '',
      isLoading: false,
      isResending: false,
      otpSent: false,
      otpVerified: false,
      errorMessage: '',
      successMessage: '',
      cooldown: 0,
      showPassword: false,
      passwordStrength: 0,
      cooldownInterval: null
    }
  },

  computed: {
    canSubmit() {
      if (!this.otpSent) {
        return this.email && this.email.includes('@')
      }
      if (this.otpSent && !this.otpVerified) {
        return this.otp && this.otp.length === 6
      }
      if (this.otpVerified) {
        return this.newPassword && this.newPassword.length >= 8 &&
               /[A-Z]/.test(this.newPassword) &&
               /[a-z]/.test(this.newPassword) &&
               /[0-9]/.test(this.newPassword)
      }
      return false
    },

    // Same as SignupView
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

  watch: {
    newPassword(val) {
      this.checkPasswordStrength(val)
    }
  },

  methods: {
    checkPasswordStrength(pw) {
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

    // Same as SignupView
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

    getButtonText() {
      if (this.isLoading) return 'Processing...'
      if (!this.otpSent) return 'Send Verification Code'
      if (this.otpSent && !this.otpVerified) return 'Verify Code'
      if (this.otpVerified) return 'Reset Password'
      return 'Submit'
    },

    async handleSubmit() {
      this.errorMessage = ''
      this.successMessage = ''

      if (!this.otpSent) {
        return this.sendOtp()
      }

      if (this.otpSent && !this.otpVerified) {
        return this.verifyOtp()
      }

      if (this.otpVerified) {
        return this.resetPassword()
      }
    },

    async sendOtp() {
      if (!this.email || !this.email.includes('@')) {
        this.errorMessage = 'Please enter a valid email address.'
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const result = await authApi.requestPasswordOtp(this.email)
        
        if (result.success) {
          this.otpSent = true
          this.successMessage = 'Verification code sent to your email!'
          this.startCooldown()
        } else {
          this.errorMessage = result.message || 'Failed to send OTP. Please try again.'
        }
      } catch (error) {
        this.errorMessage = 'An error occurred. Please try again.'
        console.error('Send OTP error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async verifyOtp() {
      if (!this.otp || this.otp.length !== 6) {
        this.errorMessage = 'Please enter a valid 6-digit code.'
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const result = await otpApi.verifyOtp(this.email, this.otp)
        
        if (result.success) {
          this.otpVerified = true
          this.successMessage = 'Code verified! Please enter your new password.'
          this.errorMessage = ''
        } else {
          this.errorMessage = result.message || 'Invalid verification code.'
          this.otp = ''
        }
      } catch (error) {
        this.errorMessage = 'An error occurred. Please try again.'
        console.error('Verify OTP error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async resetPassword() {
      if (!this.newPassword || this.newPassword.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters.'
        return
      }

      if (!/[A-Z]/.test(this.newPassword)) {
        this.errorMessage = 'Password must contain at least one uppercase letter.'
        return
      }

      if (!/[a-z]/.test(this.newPassword)) {
        this.errorMessage = 'Password must contain at least one lowercase letter.'
        return
      }

      if (!/[0-9]/.test(this.newPassword)) {
        this.errorMessage = 'Password must contain at least one number.'
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const result = await authApi.updatePasswordWithOtp(
          this.email,
          this.otp,
          this.newPassword
        )
        
        if (result.success) {
          this.successMessage = 'Password reset successfully! Redirecting to login...'
          this.errorMessage = ''
          
          setTimeout(() => {
            this.$router.push('/customer/login')
          }, 2000)
        } else {
          this.errorMessage = result.message || 'Failed to reset password.'
        }
      } catch (error) {
        this.errorMessage = 'An error occurred. Please try again.'
        console.error('Reset password error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async resendOtp() {
      if (this.cooldown > 0 || this.otpVerified) return
      
      this.isResending = true
      this.errorMessage = ''
      this.otp = ''
      
      try {
        const result = await authApi.requestPasswordOtp(this.email)
        
        if (result.success) {
          this.successMessage = 'New verification code sent to your email!'
          this.startCooldown()
        } else {
          this.errorMessage = result.message || 'Failed to resend OTP.'
        }
      } catch (error) {
        this.errorMessage = 'An error occurred. Please try again.'
        console.error('Resend OTP error:', error)
      } finally {
        this.isResending = false
      }
    },

    startCooldown() {
      this.cooldown = 60
      if (this.cooldownInterval) clearInterval(this.cooldownInterval)
      this.cooldownInterval = setInterval(() => {
        this.cooldown--
        if (this.cooldown <= 0) {
          clearInterval(this.cooldownInterval)
          this.cooldownInterval = null
        }
      }, 1000)
    },

    goToLogin() {
      this.$router.push('/customer/login')
    }
  },

  beforeUnmount() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval)
      this.cooldownInterval = null
    }
  }
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>