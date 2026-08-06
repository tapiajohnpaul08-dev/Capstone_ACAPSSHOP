<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Full Background Image with Blur -->
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
         :style="{ backgroundImage: `url(${backgroundImage})` }">
    </div>
    
    <!-- Blur Overlay -->
    <div class="absolute inset-0 backdrop-blur-[6px] bg-black/40"></div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-6xl mx-auto">
      


      <!-- Main Content: Login Form + Branding -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4">
        
        <!-- Left Column: Branding / Welcome Message -->
        <div class="hidden lg:block text-white space-y-6">
          
          <div class="flex items-center gap-4 mb-6">             
            <img :src="Logo" alt="ACAPS TRADING" class="h-20 w-auto object-contain" />


          <div class="space-y-2">
            <h1 class="text-4xl font-bold leading-tight">
              Welcome to<br />
              <span class="text-blue-400">ACAPS TRADING</span>
            </h1>
            <p class="text-white/80 text-lg">Your trusted partner for quality packaging solutions.</p>
          </div>
          </div>

          <!-- Statistics / Trust Indicators
          <div class="grid grid-cols-3 gap-4 pt-4">
            <div class="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p class="text-2xl font-bold text-white">10K+</p>
              <p class="text-xs text-white/70">Happy Customers</p>
            </div>
            <div class="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p class="text-2xl font-bold text-white">500+</p>
              <p class="text-xs text-white/70">Products</p>
            </div>
            <div class="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p class="text-2xl font-bold text-white">98%</p>
              <p class="text-xs text-white/70">Satisfaction</p>
            </div>
          </div> -->

          <!-- Trust Badges -->
          <div class="space-y-3 mt-2">
            <div class="flex items-start gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-white text-sm">Trusted Quality</h4>
                <p class="text-xs text-white/70">Premium products you can rely on.</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-white text-sm">Affordable Prices</h4>
                <p class="text-xs text-white/70">Best value for your business needs.</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-white text-sm">Fast Delivery</h4>
                <p class="text-xs text-white/70">On-time delivery, every time.</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0a9 9 0 01-12.728 0m12.728 0A9 9 0 015.636 5.636m12.728 0A9 9 0 015.636 18.364"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-white text-sm">Customer Support</h4>
                <p class="text-xs text-white/70">We're here to help you succeed.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Login Form -->
        <div class="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
            
            <!-- Form Header -->
            <div class="text-center mb-6">
              <!-- <div class="flex items-center justify-center gap-2 mb-2">
                <img :src="Logo" alt="ACAPS TRADING" class="h-8 w-auto object-contain" />
              </div> -->
              <h2 class="text-2xl font-bold text-gray-800">ACAPSHOP</h2>
              <p class="text-sm text-gray-500 mt-1">Customer Login</p>
              <p class="text-xs text-gray-400 mt-0.5">Welcome back! Please login to your account</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
              <div class="space-y-1.5">
                <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm pr-12"
                    placeholder="********"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye v-if="!showPassword" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div class="text-right">
                <button type="button" @click="handleForgotPassword" class="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </button>
            </form>

            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white/90 px-3 text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            <button
              @click="handleSocialLogin('google')"
              :disabled="socialLoading === 'google'"
              class="w-full py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              <span v-if="socialLoading === 'google'" class="inline-block w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
              <svg v-else class="h-4 w-4" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div class="text-center text-sm mt-4">
              <span class="text-gray-500">Don't have an account?</span>
              <button @click="handleSignUp" class="text-blue-600 hover:text-blue-700 hover:underline font-medium ml-1 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
          
          <!-- Footer Text -->
          <div class="text-center mt-4 text-xs text-white/60">
            ACAPS TRADING · All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loginData, appName } from '@/data/loginData.js'
import { authApi } from '@/api'
import { Eye, EyeOff } from 'lucide-vue-next'
import backgroundImage from '@/assets/images/LoginFormBG.png'
import Logo from '@/assets/images/ACAPSLogo.png'

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
      showPassword: false,
      backgroundImage,
      Logo
    }
  },

  mounted() {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      alert('Login failed. Please try again.')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
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
      
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
      const baseUrl = backendUrl.replace(/\/api\/v1$/, '')
      
      if (provider === 'google') {
        window.location.href = `${baseUrl}/api/v1/auth/google`
      } else if (provider === 'facebook') {
        window.location.href = `${baseUrl}/api/v1/auth/facebook`
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

/* Background */
.min-h-screen {
  background-color: #0f0f1a;
}

/* Glassmorphism card */
.bg-white\/95 {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.92);
}

/* Card animation */
.bg-white\/95 {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Input focus glow */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* Trust badges hover effect */
.bg-white\/10 {
  transition: all 0.3s ease;
}

.bg-white\/10:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateX(4px);
}

/* Statistics cards hover */
.grid-cols-3 .p-4 {
  transition: all 0.3s ease;
}

.grid-cols-3 .p-4:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}

/* Icon labels hover */
.flex.flex-col.items-center {
  transition: all 0.2s ease;
  cursor: default;
}

.flex.flex-col.items-center:hover {
  transform: translateY(-2px);
}

.flex.flex-col.items-center:hover svg {
  stroke-width: 2;
}

/* Button hover */
button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-1px);
}

button[type="submit"]:active:not(:disabled) {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-cols-1 {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .bg-white\/95 {
    padding: 1.5rem;
  }
  
  .min-h-screen {
    padding: 1rem;
  }
}
</style>