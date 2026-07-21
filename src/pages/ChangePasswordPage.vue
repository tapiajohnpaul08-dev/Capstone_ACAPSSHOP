<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button @click="goBack" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Change Password</h1>
      <p class="text-gray-600 mt-1">{{ getPageSubtitle() }}</p>
    </div>

    <div class="bg-white rounded-xl border p-6">
      <!-- OTP Sending Step - For ALL users -->
      <div v-if="!otpSent" class="space-y-4">
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <p class="text-sm text-blue-700">
            {{ getOtpMessage() }}
          </p>
        </div>
        
        <button 
          @click="sendOtpForPassword"
          :disabled="isSendingOtp"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="isSendingOtp" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSendingOtp ? 'Sending OTP...' : 'Send Verification Code' }}
        </button>
        
        <p v-if="otpError" class="text-red-500 text-sm text-center">{{ otpError }}</p>
        <p v-if="otpSuccess" class="text-green-500 text-sm text-center">{{ otpSuccess }}</p>
      </div>

      <!-- Password Change Form -->
      <form v-else @submit.prevent="handlePasswordChange" class="space-y-4">
        <!-- OTP Input -->
        <div class="space-y-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <div class="flex gap-2">
              <input 
                v-model="form.otp" 
                type="text" 
                required 
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="button"
                @click="sendOtpForPassword"
                :disabled="isSendingOtp || cooldown > 0"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {{ cooldown > 0 ? `${cooldown}s` : 'Resend' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
          </div>
          
          <button 
            type="button"
            @click="verifyOtpOnly"
            :disabled="isVerifyingOtp || !form.otp || form.otp.length !== 6"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="isVerifyingOtp" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isVerifyingOtp ? 'Verifying...' : 'Verify Code' }}
          </button>
          
          <p v-if="otpVerified" class="text-green-500 text-sm text-center">✓ Code verified successfully</p>
          <p v-if="otpError" class="text-red-500 text-sm text-center">{{ otpError }}</p>
        </div>

        <!-- Current Password (ONLY for local accounts) -->
        <div v-if="!isOAuthProvider" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div class="relative">
            <input 
              v-model="form.currentPassword" 
              :type="showCurrentPassword ? 'text' : 'password'" 
              required 
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="!showCurrentPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <button 
            type="button" 
            @click="goToForgotPassword" 
            class="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        
        <!-- OAuth users info -->
        <div v-else class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <p class="text-sm text-yellow-700">
            <strong>Note:</strong> Your account uses {{ providerName }} for login. 
            You're setting a password for the first time. No current password is needed.
          </p>
        </div>

        <!-- New Password with Strength Indicator -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div class="relative">
            <input 
              v-model="form.newPassword" 
              @input="checkPasswordStrength"
              :type="showNewPassword ? 'text' : 'password'"
              required 
              minlength="6"
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="!showNewPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Password Strength Bar -->
          <div class="mt-2 space-y-1">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-300 rounded-full"
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrengthPercent + '%' }"
                ></div>
              </div>
              <span class="text-xs font-medium min-w-[50px] text-right" :class="passwordStrengthTextClass">
                {{ passwordStrengthLabel }}
              </span>
            </div>
            
            <!-- Password Requirements Checklist -->
            <div class="grid grid-cols-2 gap-1 mt-2">
              <div class="flex items-center gap-1 text-xs" :class="form.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'">
                <span>{{ form.newPassword.length >= 8 ? '✓' : '○' }}</span>
                <span>At least 8 characters</span>
              </div>
              <div class="flex items-center gap-1 text-xs" :class="/[A-Z]/.test(form.newPassword) ? 'text-green-600' : 'text-gray-400'">
                <span>{{ /[A-Z]/.test(form.newPassword) ? '✓' : '○' }}</span>
                <span>Uppercase letter</span>
              </div>
              <div class="flex items-center gap-1 text-xs" :class="/[a-z]/.test(form.newPassword) ? 'text-green-600' : 'text-gray-400'">
                <span>{{ /[a-z]/.test(form.newPassword) ? '✓' : '○' }}</span>
                <span>Lowercase letter</span>
              </div>
              <div class="flex items-center gap-1 text-xs" :class="/[0-9]/.test(form.newPassword) ? 'text-green-600' : 'text-gray-400'">
                <span>{{ /[0-9]/.test(form.newPassword) ? '✓' : '○' }}</span>
                <span>Number</span>
              </div>
            </div>
          </div>
          
          <p class="text-xs text-gray-500 mt-2">Password must be at least 6 characters</p>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div class="relative">
            <input 
              v-model="form.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': form.confirmPassword && form.newPassword !== form.confirmPassword }"
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
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-red-500 text-xs mt-1">
            Passwords do not match
          </p>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-3 pt-4">
          <button 
            type="submit" 
            :disabled="isSaving || !canSubmit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isSaving ? 'Updating...' : getSubmitButtonText() }}
          </button>
          <button 
            type="button" 
            @click="goBack" 
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <FeedbackModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :status="feedbackStatus"
      :message="feedbackMessage"
      @close="handleFeedbackClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff } from 'lucide-vue-next'
import { authApi, otpApi } from '@/api.js'
import { useAuth } from '@/composables/useAuth.js'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const router = useRouter()
const { currentUser, userEmail, userProvider } = useAuth()

// State
const isSaving = ref(false)
const isSendingOtp = ref(false)
const isVerifyingOtp = ref(false)
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

const otpSent = ref(false)
const otpVerified = ref(false)
const otpError = ref('')
const otpSuccess = ref('')
const cooldown = ref(0)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
let cooldownInterval = null

// Password strength
const passwordStrength = ref(0)

const form = ref({
  otp: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const isOAuthProvider = computed(() => {
  return userProvider.value && userProvider.value !== 'local'
})

const providerName = computed(() => {
  const provider = userProvider.value
  if (provider === 'google') return 'Google'
  if (provider === 'facebook') return 'Facebook'
  return provider || 'OAuth'
})

const canSubmit = computed(() => {
  // Must have OTP verified
  if (!otpVerified.value) return false
  
  // For OAuth: need passwords match and valid
  if (isOAuthProvider.value) {
    return form.value.newPassword && 
           form.value.confirmPassword &&
           form.value.newPassword === form.value.confirmPassword &&
           form.value.newPassword.length >= 6
  }
  
  // For local: need current password, new password match, and length
  return form.value.currentPassword &&
         form.value.newPassword &&
         form.value.confirmPassword &&
         form.value.newPassword === form.value.confirmPassword &&
         form.value.newPassword.length >= 6
})

// Password strength computed properties
const passwordStrengthPercent = computed(() => {
  return (passwordStrength.value / 3) * 100
})

const passwordStrengthClass = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'bg-gray-200'
  if (score === 1) return 'bg-red-500'
  if (score === 2) return 'bg-orange-500'
  return 'bg-green-500'
})

const passwordStrengthTextClass = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'text-gray-400'
  if (score === 1) return 'text-red-500'
  if (score === 2) return 'text-orange-500'
  return 'text-green-600'
})

const passwordStrengthLabel = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'None'
  if (score === 1) return 'Weak'
  if (score === 2) return 'Good'
  return 'Strong'
})

// Methods
function getPageSubtitle() {
  if (isOAuthProvider.value) {
    return `Set a password for your ${providerName.value} account`
  }
  return 'Update your account password'
}

function getOtpMessage() {
  if (isOAuthProvider.value) {
    return `Your account uses ${providerName.value} for login. To set a password, we'll send a verification code to your email. After verification, you can create a new password.`
  }
  return `To change your password, we'll send a verification code to your email. After verification, you'll need to enter your current password and set a new one.`
}

function getSubmitButtonText() {
  return isOAuthProvider.value ? 'Set Password' : 'Update Password'
}

function checkPasswordStrength() {
  const pw = form.value.newPassword
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
  
  passwordStrength.value = score
}

async function sendOtpForPassword() {
  if (cooldown.value > 0) return
  
  isSendingOtp.value = true
  otpError.value = ''
  otpSuccess.value = ''
  
  try {
    const email = userEmail.value || currentUser.value?.email
    if (!email) {
      otpError.value = 'Email not found. Please try again.'
      return
    }
    
    const result = await authApi.requestPasswordOtp(email)
    
    if (result.success) {
      otpSent.value = true
      otpSuccess.value = `Verification code sent to ${email}!`
      startCooldown()
    } else {
      otpError.value = result.message || 'Failed to send OTP'
    }
  } catch (error) {
    otpError.value = 'An error occurred. Please try again.'
    console.error('Error sending OTP:', error)
  } finally {
    isSendingOtp.value = false
  }
}

function startCooldown() {
  cooldown.value = 60
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

async function verifyOtpOnly() {
  if (!form.value.otp || form.value.otp.length !== 6) {
    otpError.value = 'Please enter a valid 6-digit code'
    return
  }
  
  isVerifyingOtp.value = true
  otpError.value = ''
  
  try {
    const email = userEmail.value || currentUser.value?.email
    const result = await otpApi.verifyOtp(email, form.value.otp)
    
    if (result.success) {
      otpVerified.value = true
      otpError.value = ''
      feedbackTitle.value = 'Code Verified'
      feedbackMessage.value = 'Your verification code is correct. You can now set your new password.'
      feedbackStatus.value = 'success'
      feedbackVisible.value = true
    } else {
      otpError.value = result.message || 'Invalid verification code'
      otpVerified.value = false
    }
  } catch (error) {
    otpError.value = 'An error occurred. Please try again.'
    console.error('Error verifying OTP:', error)
  } finally {
    isVerifyingOtp.value = false
  }
}

async function handlePasswordChange() {
  // Validate
  if (form.value.newPassword !== form.value.confirmPassword) {
    feedbackTitle.value = "Passwords Don't Match"
    feedbackMessage.value = 'New password and confirmation do not match.'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
    return
  }
  
  if (form.value.newPassword.length < 6) {
    feedbackTitle.value = 'Password Too Short'
    feedbackMessage.value = 'Password must be at least 6 characters.'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
    return
  }
  
  if (!otpVerified.value) {
    feedbackTitle.value = 'Verification Required'
    feedbackMessage.value = 'Please verify your OTP code first.'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
    return
  }
  
  isSaving.value = true
  
  try {
    let result
    const email = userEmail.value || currentUser.value?.email
    const customerId = currentUser.value?.customerId || currentUser.value?._id
    
    if (isOAuthProvider.value) {
      // OAuth users: update with OTP only (no current password)
      result = await authApi.updatePasswordWithOtp(
        email,
        form.value.otp,
        form.value.newPassword
      )
    } else {
      // Local users: verify current password
      if (!form.value.currentPassword) {
        feedbackTitle.value = 'Current Password Required'
        feedbackMessage.value = 'Please enter your current password.'
        feedbackStatus.value = 'error'
        feedbackVisible.value = true
        isSaving.value = false
        return
      }
      
      result = await authApi.updatePasswordWithCurrent(
        customerId,
        form.value.currentPassword,
        form.value.newPassword
      )
    }
    
    feedbackTitle.value = result.success ? 'Password Updated' : 'Update Failed'
    feedbackMessage.value = result.message || (result.success ? 'Your password has been changed successfully.' : 'Something went wrong.')
    feedbackStatus.value = result.success ? 'success' : 'error'
    feedbackVisible.value = true
    
    if (result.success) {
      form.value = { otp: '', currentPassword: '', newPassword: '', confirmPassword: '' }
      passwordStrength.value = 0
      otpVerified.value = false
      otpSent.value = false
      setTimeout(() => router.push('/customer/profile'), 2200)
    }
  } catch (error) {
    feedbackTitle.value = 'Error'
    feedbackMessage.value = error.message || 'An unexpected error occurred'
    feedbackStatus.value = 'error'
    feedbackVisible.value = true
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  router.push('/customer/profile')
}

function goToForgotPassword() {
  router.push('/customer/forgot-password')
}

function handleFeedbackClose() {
  // Optional: handle feedback close
}

// Lifecycle
onMounted(() => {
  // Auto-send OTP for ALL users when page loads
  if (!otpSent.value) {
    sendOtpForPassword()
  }
})

// Watch for OTP changes to reset verification status
watch(() => form.value.otp, () => {
  if (otpVerified.value) {
    otpVerified.value = false
  }
})

// Watch for new password changes to update strength
watch(() => form.value.newPassword, () => {
  checkPasswordStrength()
})

// Cleanup
onBeforeUnmount(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>