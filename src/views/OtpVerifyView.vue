<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">

      <!-- Card Header -->
      <div class="text-center px-6 pt-6">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ appName }}</div>
        <h4 class="text-lg font-semibold leading-none">Verify your email</h4>
        <p class="text-sm text-gray-500 mt-1">Enter the 6-digit code we sent you</p>
      </div>

      <!-- Card Content -->
      <div class="px-6 pb-6 space-y-5">

        <!-- Email icon + instructions -->
        <div class="flex flex-col items-center text-center space-y-2">
          <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <!-- Mail icon (inline SVG, no dependency) -->
            <svg class="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <p class="text-sm text-gray-600">
            We sent a 6-digit code to<br>
            <span class="font-semibold text-gray-800">{{ emailDisplay }}</span>
          </p>
        </div>

        <!-- OTP Input Boxes -->
        <div class="flex justify-center gap-2">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :ref="el => { if (el) otpRefs[index] = el }"
            v-model="otpDigits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :class="[
              'w-11 h-13 text-center text-xl font-bold rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              otpDigits[index] ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-800',
              otpError ? 'border-red-400' : ''
            ]"
            style="height: 52px;"
            @input="handleOtpInput(index, $event)"
            @keydown="handleOtpKeydown(index, $event)"
            @paste="handleOtpPaste($event)"
          />
        </div>

        <!-- Error message -->
        <p v-if="otpError" class="text-center text-xs text-red-500">{{ otpError }}</p>

        <!-- Timer / Resend -->
        <div class="text-center text-sm text-gray-500">
          <span v-if="timerActive">
            Code expires in
            <span class="font-medium text-blue-600">{{ formattedTimer }}</span>
          </span>
          <span v-else>
            Code expired.
            <button
              @click="resendOtp"
              class="text-blue-600 hover:underline font-medium"
            >
              Resend code
            </button>
          </span>
        </div>

        <!-- Info box -->
        <div class="flex gap-2 items-start bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-500">
          <svg class="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Didn't receive it? Check your spam folder, or make sure the email address you entered is correct.
        </div>

        <!-- Verify Button -->
        <button
          @click="handleVerify"
          :disabled="isLoading || otpCode.length < 6"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2 w-full"
        >
          <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isLoading ? 'Verifying...' : 'Verify & Create Account' }}
        </button>

        <!-- Back link -->
        <div class="text-center text-sm">
          <button @click="goBack" class="text-gray-500 hover:text-gray-700 hover:underline">
            ← Back to sign up
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { appName } from '@/data/loginData.js'
import { useFeedback } from '@/utils/useFeedback'
const { showSuccess, showError } = useFeedback()

export default {
  name: 'OtpVerifyView',

  data() {
    return {
      appName,
      otpDigits: ['', '', '', '', '', ''],
      otpRefs: [],
      otpError: '',
      isLoading: false,
      timerSeconds: 120,
      timerInterval: null,
      timerActive: true
    }
  },

  computed: {
    emailDisplay() {
      return this.$route.query.email || 'your email'
    },
    otpCode() {
      return this.otpDigits.join('')
    },
    formattedTimer() {
      const m = Math.floor(this.timerSeconds / 60)
      const s = this.timerSeconds % 60
      return `${m}:${s < 10 ? '0' : ''}${s}`
    }
  },

  mounted() {
    this.startTimer()
    this.$nextTick(() => {
      if (this.otpRefs[0]) this.otpRefs[0].focus()
    })
  },

  beforeUnmount() {
    clearInterval(this.timerInterval)
  },

  methods: {
    startTimer() {
      this.timerSeconds = 120
      this.timerActive = true
      clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() => {
        this.timerSeconds--
        if (this.timerSeconds <= 0) {
          clearInterval(this.timerInterval)
          this.timerActive = false
        }
      }, 1000)
    },

    resendOtp() {
      this.otpDigits = ['', '', '', '', '', '']
      this.otpError = ''
      this.startTimer()
      this.$nextTick(() => {
        if (this.otpRefs[0]) this.otpRefs[0].focus()
      })
    },

    handleOtpInput(index, event) {
      const val = event.target.value.replace(/[^0-9]/g, '')
      this.otpDigits[index] = val ? val.slice(-1) : ''
      this.otpError = ''

      if (val && index < 5) {
        this.$nextTick(() => {
          if (this.otpRefs[index + 1]) this.otpRefs[index + 1].focus()
        })
      }
    },

    handleOtpKeydown(index, event) {
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        this.$nextTick(() => {
          if (this.otpRefs[index - 1]) {
            this.otpRefs[index - 1].focus()
            this.otpDigits[index - 1] = ''
          }
        })
      }
    },

    handleOtpPaste(event) {
      event.preventDefault()
      const text = (event.clipboardData || window.clipboardData)
        .getData('text')
        .replace(/[^0-9]/g, '')
        .slice(0, 6)

      text.split('').forEach((char, i) => {
        if (i < 6) this.otpDigits[i] = char
      })

      const focusIndex = Math.min(text.length, 5)
      this.$nextTick(() => {
        if (this.otpRefs[focusIndex]) this.otpRefs[focusIndex].focus()
      })
    },

    async handleVerify() {
      if (this.otpCode.length < 6) {
        this.otpError = 'Please enter all 6 digits'
        return
      }

      this.isLoading = true
      this.otpError = ''

      try {
        // Simulate OTP verification
        await new Promise(resolve => setTimeout(resolve, 1500))

        // In a real app, verify the OTP with your backend here.
        // For demo: any 6-digit code is accepted.

        const pendingSignup = JSON.parse(sessionStorage.getItem('pendingSignup') || '{}')

        if (pendingSignup.email) {
          // Register user in localStorage (mirrors login page pattern)
          const existingUsers = JSON.parse(localStorage.getItem('customerUsers') || '[]')
          const newUser = {
            id: Date.now(),
            email: pendingSignup.email,
            password: pendingSignup.password,
            name: pendingSignup.fullName,
            phone: pendingSignup.phone,
            company: pendingSignup.company || ''
          }
          existingUsers.push(newUser)
          localStorage.setItem('customerUsers', JSON.stringify(existingUsers))

          // Auto-login the new user
          localStorage.setItem('customerToken', 'demo-token-' + Date.now())
          localStorage.setItem('userName', newUser.name)
          localStorage.setItem('userEmail', newUser.email)
          localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            loggedInAt: new Date().toISOString()
          }))

          sessionStorage.removeItem('pendingSignup')
        }


        showSuccess('Email verified! Your account has been created.')
        // Redirect to dashboard
        setTimeout(() => {
          this.$router.push('/customer/dashboard')
        }, 2000)

      } catch (error) {
        console.error('Verification error:', error)
        this.otpError = 'Verification failed. Please try again.'
        showError('Verification Failed', 'An error occurred. Please try again.')
      } finally {
        this.isLoading = false
      }
    },

    goBack() {
      clearInterval(this.timerInterval)
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