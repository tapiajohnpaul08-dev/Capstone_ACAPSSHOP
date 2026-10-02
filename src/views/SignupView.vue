<template>
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Full Background Image with Blur -->
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
         :style="{ backgroundImage: `url(${backgroundImage})` }">
    </div>
    
    <!-- Blur Overlay -->
    <div class="absolute inset-0 backdrop-blur-[6px] bg-black/40"></div>

  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class=" relative z-10 w-full max-w-6xl mx-auto bg-white flex flex-col gap-4 rounded-xl border w-full max-w-2xl shadow-sm">

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
                <p class="text-gray-500 border border-gray-300 p-1.5 h-9 rounded-md text-sm w-12 text-center shrink-0 select-none">+63</p>
                <input
                  id="phone"
                  ref="phoneInput"
                  :value="form.phone"
                  @input="handlePhoneInput"
                  @blur="validatePhoneField"
                  @keypress="handlePhoneKeypress"
                  type="tel"
                  inputmode="numeric"
                  placeholder="917 123 4567"
                  autocomplete="tel"
                  maxlength="12"
                  :class="[
                    'flex-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
                    errors.phone
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : isPhoneValid
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : 'border-gray-300 focus-visible:ring-blue-500'
                  ]"
                />
              </div>

              <!-- Inline feedback -->
              <p
                v-if="errors.phone"
                class="text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle class="w-3 h-3 shrink-0" />
                {{ errors.phone }}
              </p>
              <p
                v-else-if="isPhoneValid"
                class="text-xs text-green-600 flex items-center gap-1"
              >
                <CheckCircle2 class="w-3 h-3 shrink-0" />
                Valid Philippine mobile number
              </p>
              <p
                v-else-if="form.phone"
                class="text-xs text-gray-400"
              >
                Enter 10 digits — e.g., 917 123 4567
              </p>
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
          <!-- Terms and Policy Agreement -->
<div class="flex items-start gap-2 pt-2">
  <input
    id="agreeTerms"
    v-model="form.agreeTerms"
    type="checkbox"
    class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
  />
  <label for="agreeTerms" class="text-xs text-gray-600 leading-relaxed cursor-pointer">
    I agree to the
    <router-link
      to="/customer/policies"
      target="_blank"
      class="text-blue-600 hover:underline font-medium"
    >
      Terms of Service and Privacy Policy
    </router-link>
  </label>
</div>
<p v-if="errors.agreeTerms" class="text-xs text-red-500 -mt-2">{{ errors.agreeTerms }}</p>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !form.agreeTerms"
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

</div>
</template>

<script>
import { appName } from '@/data/loginData.js'
import { otpApi, authApi } from '@/api'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import backgroundImage from '@/assets/images/LoginFormBG.png'

export default {
  name: 'SignUpView',

  components: {
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2
  },

  data() {
    return {
      appName,
      backgroundImage,
      form: {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        company: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false  // ← ADD THIS

      },
      errors: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
          agreeTerms: ''  // ← ADD THIS

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
    },

    // ✅ NEW — live validity flag driving the green border + checkmark.
    // Only true once the number is a complete, well-formed PH mobile.
    isPhoneValid() {
      const digits = String(this.form.phone || '').replace(/\D/g, '')
      return /^9\d{9}$/.test(digits)
    },
  },

  methods: {
    // ─────────────────────────────────────────────────────────────
    // Phone number — formatting + validation
    // ─────────────────────────────────────────────────────────────

    /**
     * Format a raw phone string into the display shape "XXX XXX XXXX".
     *
     * Normalizes the most common ways people paste a PH number:
     *   +639171234567   →  917 123 4567
     *   639171234567    →  917 123 4567
     *   09171234567     →  917 123 4567
     *   917-123-4567    →  917 123 4567
     *   9171234567      →  917 123 4567
     */
    formatPhone(value) {
      let digits = String(value || '').replace(/\D/g, '')

      // Strip a leading +63 / 63 when it's part of a full international number
      if (digits.startsWith('63') && digits.length > 10) {
        digits = digits.slice(2)
      }
      // Strip a leading 0 (trunk prefix — redundant because +63 is shown)
      if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }

      // Cap at 10 digits — 9 followed by 9 more
      digits = digits.slice(0, 10)

      // Insert spaces for readability
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    },

    /**
     * Fires on every keystroke / paste. Rewrites the field with the
     * formatted value and clears any stale error message.
     */
    handlePhoneInput(event) {
      const formatted = this.formatPhone(event.target.value)
      this.form.phone = formatted
      // Force the DOM input to match — Vue's :value binding would
      // otherwise let the user's raw input sit on screen for one frame.
      event.target.value = formatted

      // Clear error the moment the user starts fixing it
      if (this.errors.phone) this.errors.phone = ''
    },

    /**
     * Block non-numeric keystrokes so the field can't even hold "abc".
     * Multi-char keys (Backspace, Tab, Arrow keys…) and Ctrl/Cmd
     * shortcuts are always allowed.
     */
    handlePhoneKeypress(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key.length > 1) return // control keys
      if (!/\d/.test(event.key)) event.preventDefault()
    },

    /**
     * On blur, run the strict validator so an incomplete number
     * surfaces its error even if the user hasn't hit Submit yet.
     */
    validatePhoneField() {
      const digits = String(this.form.phone || '').replace(/\D/g, '')
      if (!digits) {
        this.errors.phone = 'Phone number is required'
        return false
      }
      if (!/^9\d{9}$/.test(digits)) {
        this.errors.phone = 'Enter a valid PH mobile number (10 digits starting with 9)'
        return false
      }
      this.errors.phone = ''
      return true
    },

    /**
     * Ask the backend whether this email is already registered.
     * Returns a normalized { success, exists, message } shape.
     *
     * Routes through authApi so the axios instance, base URL, and
     * error handling all come from the same place the rest of the
     * auth flow uses.
     */
    async checkEmailExists(email) {
      const result = await authApi.checkEmailExists(email)
      // handleResponse always returns { success, ... } — normalize
      // `exists` to a strict boolean so template truthiness is safe.
      return {
        success: !!result.success,
        exists: !!result.exists,
        message: result.message || '',
      }
    },

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
        confirmPassword: '',
          agreeTerms: ''  // ← ADD THIS

      }

      if (!this.form.firstName.trim()) {
        this.errors.firstName = 'First name is required'
        valid = false
      }

      if (!this.form.lastName.trim()) {
        this.errors.lastName = 'Last name is required'
        valid = false
      }
      // ✅ Stricter — must be exactly 10 digits starting with 9,
      // after stripping spaces / dashes / any +63 prefix the user pasted.
      const phoneDigits = String(this.form.phone || '').replace(/\D/g, '')
      if (!phoneDigits) {
        this.errors.phone = 'Phone number is required'
        valid = false
      } else if (!/^9\d{9}$/.test(phoneDigits)) {
        this.errors.phone = 'Enter a valid PH mobile number (10 digits starting with 9)'
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

      // ← ADD THIS CHECK
     if (!this.form.agreeTerms) {
    this.errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy'
    valid = false
  }

      return valid
    },

    async handleSignUp() {
      if (!this.validateForm()) return

      this.isLoading = true

      try {
        // Step 0: ✅ Pre-flight — don't waste an OTP on a registered email.
        const emailCheck = await this.checkEmailExists(this.form.email)
        if (!emailCheck.success) {
          this.errors.email = emailCheck.message || 'Could not verify email'
          this.isLoading = false
          return
        }
        if (emailCheck.exists) {
          this.errors.email = 'This email is already registered. Try signing in instead.'
          this.isLoading = false
          return
        }

        // Step 1: Send OTP to email
        const otpResult = await otpApi.sendOtp(this.form.email)

        if (!otpResult.success) {
          alert(otpResult.message || 'Failed to send OTP. Please try again.')
          this.isLoading = false
          return
        }

        // Step 2: Save pending registration data
        // ✅ Send the phone in E.164 format (+639171234567) so the
        // backend always receives a canonical value regardless of how
        // the user typed it (spaces, leading 0, pasted +63, etc.).
        const phoneDigits = String(this.form.phone || '').replace(/\D/g, '')

        const pendingData = {
          firstName: this.form.firstName,
          middleName: this.form.middleName,
          lastName: this.form.lastName,
          phone: `+63${phoneDigits}`,
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