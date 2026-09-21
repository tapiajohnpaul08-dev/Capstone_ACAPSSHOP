<!-- components/NavigationBar.vue -->
<template>
  <nav
    class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
    style="padding-top: env(safe-area-inset-top);"
  >
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-20 gap-4">

        <!-- ═══════════════════════════════════════════════════════════
             LEFT — Logo + Brand
             ═══════════════════════════════════════════════════════════ -->
        <router-link
          :to="isAuthenticated ? '/customer/dashboard' : '/'"
          class="flex items-center gap-2.5 shrink-0 group"
        >
          <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-blue-50 shrink-0">
            <img
              src="../assets/images/ACAPS_LOGO_ONLY.png"
              alt="ACAPSHOP"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="min-w-0">
            <h1 class="text-[20px] font-black text-gray-900 tracking-tight leading-none">ACAPSHOP</h1>
            <p class="text-[15px] text-gray-400 -mt-0.5 truncate">We Are Committed to You</p>
          </div>
        </router-link>

        <!-- ═══════════════════════════════════════════════════════════
             RIGHT — Nav buttons + User menu + Mobile hamburger
             ═══════════════════════════════════════════════════════════ -->
        <div class="flex items-center gap-2 ml-auto">

          <!-- ── Desktop nav links ── (only when logged in) -->
          <div v-if="isAuthenticated" class="hidden md:flex items-center gap-1">
            <router-link
              to="/customer/dashboard"
              class="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all"
              :class="
                isActive('/customer/dashboard')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <span class="text-sm font-medium">Home</span>
            </router-link>

            <router-link
              to="/customer/orders"
              class="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all"
              :class="
                isActive('/customer/orders')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span class="text-sm font-medium">My Orders</span>
            </router-link>

            <router-link
              to="/customer/messages"
              class="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all relative"
              :class="
                isActive('/customer/messages')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span class="text-sm font-medium">Messages</span>
              <span
                v-if="unreadCount > 0"
                class="ml-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-semibold rounded-full bg-red-500 text-white"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </router-link>

            <router-link
              to="/customer/profile"
              class="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all"
              :class="
                isActive('/customer/profile')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="text-sm font-medium">Profile</span>
            </router-link>
          </div>

          <!-- ── User menu (authenticated) ── -->
          <div v-if="isAuthenticated" class="relative shrink-0" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {{ userInitial }}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                class="text-gray-400 transition-transform hidden sm:block"
                :class="{ 'rotate-180': showUserMenu }"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20"
            >
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ userName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
              </div>
              <router-link
                to="/customer/profile"
                class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="showUserMenu = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                My Profile
              </router-link>
              <router-link
                to="/customer/orders"
                class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="showUserMenu = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                My Orders
              </router-link>
              <button
                @click="logout"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>

          <!-- ── Guest buttons (not logged in) ── -->
          <template v-else>
            <router-link
              to="/customer/login"
              class="hidden sm:inline-block px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
            >
              Log In
            </router-link>
            <router-link
              to="/customer/signup"
              class="hidden sm:inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm"
            >
              Sign Up
            </router-link>
          </template>

          <!-- ── Mobile hamburger ── -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         Mobile drawer (unchanged)
         ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="drawer-backdrop">
        <div
          v-if="mobileMenuOpen"
          class="md:hidden fixed inset-0 z-[60]"
          @click.self="mobileMenuOpen = false"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>

          <Transition name="drawer-panel" appear>
            <aside
              class="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
              style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);"
            >
              <!-- Header -->
              <div class="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-50">
                    <img src="../assets/images/ACAPS_LOGO_ONLY.png" alt="ACAPSHOP" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 class="text-sm font-black text-gray-900 leading-tight">ACAPSHOP</h2>
                    <p class="text-[10px] text-gray-400 -mt-0.5">We Are Committed to You</p>
                  </div>
                </div>
                <button
                  @click="mobileMenuOpen = false"
                  class="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- Greeting -->
              <div v-if="isAuthenticated" class="shrink-0 px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {{ (userName || 'C').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ userName || 'Customer' }}</p>
                    <p class="text-[11px] text-gray-500 truncate">{{ userEmail || '' }}</p>
                  </div>
                </div>
              </div>

              <!-- Nav -->
              <nav class="flex-1 min-h-0 overflow-y-auto py-2">
                <template v-if="isAuthenticated">
                  <p class="px-5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</p>

                  <router-link
                    to="/customer/dashboard"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    :class="route.path === '/customer/dashboard' ? 'text-blue-600 bg-blue-50/60 font-semibold' : ''"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    <span class="text-sm">Home</span>
                  </router-link>

                  <router-link
                    to="/customer/orders"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    :class="route.path.startsWith('/customer/orders') ? 'text-blue-600 bg-blue-50/60 font-semibold' : ''"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                      <path d="M3 6h18"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <span class="text-sm">My Orders</span>
                  </router-link>

                  <router-link
                    to="/customer/messages"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    :class="route.path.startsWith('/customer/messages') ? 'text-blue-600 bg-blue-50/60 font-semibold' : ''"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span class="text-sm">Messages</span>
                    <span
                      v-if="unreadCount > 0"
                      class="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-red-500 text-white"
                    >
                      {{ unreadCount > 99 ? '99+' : unreadCount }}
                    </span>
                  </router-link>

                  <router-link
                    to="/customer/designs"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    :class="route.path.startsWith('/customer/designs') ? 'text-blue-600 bg-blue-50/60 font-semibold' : ''"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span class="text-sm">My Designs</span>
                  </router-link>

                  <router-link
                    to="/customer/profile"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    :class="route.path.startsWith('/customer/profile') ? 'text-blue-600 bg-blue-50/60 font-semibold' : ''"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span class="text-sm">Profile</span>
                  </router-link>

                  <div class="my-2 mx-5 border-t border-gray-100"></div>

                  <p class="px-5 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Support</p>

                  <router-link
                    to="/customer/policies?tab=faq"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <path d="M12 17h.01"/>
                    </svg>
                    <span class="text-sm">Help & Policies</span>
                  </router-link>
                </template>

                <template v-else>
                  <p class="px-5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</p>

                  <router-link
                    to="/"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    <span class="text-sm">Home</span>
                  </router-link>

                  <router-link
                    to="/catalog"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <span class="text-sm">Catalog</span>
                  </router-link>

                  <router-link
                    to="/customer/policies?tab=faq"
                    class="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    @click="mobileMenuOpen = false"
                  >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <path d="M12 17h.01"/>
                    </svg>
                    <span class="text-sm">Help</span>
                  </router-link>
                </template>
              </nav>

              <!-- Footer actions -->
              <div class="shrink-0 border-t border-gray-100 px-5 py-4">
                <template v-if="isAuthenticated">
                  <button
                    @click="logout"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </template>

                <template v-else>
                  <div class="flex flex-col gap-2">
                    <router-link
                      to="/customer/login"
                      class="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                      @click="mobileMenuOpen = false"
                    >
                      Log In
                    </router-link>
                    <router-link
                      to="/customer/signup"
                      class="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                      @click="mobileMenuOpen = false"
                    >
                      Sign Up
                    </router-link>
                  </div>
                </template>

                <p class="text-center text-[10px] text-gray-400 mt-3">
                  ACAPSHOP · We Are Committed to You
                </p>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  notifCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 }
})

const emit = defineEmits(['bell-click'])

const route = useRoute()
const router = useRouter()
const { userName, userEmail, userInitial, logout: authLogout } = useAuth()

const showUserMenu = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref(null)

const tokenVersion = ref(0)

const isAuthenticated = computed(() => {
  tokenVersion.value
  const token = localStorage.getItem('customerToken')
  const currentUser = localStorage.getItem('currentUser')
  return !!token || !!currentUser
})

function syncAuth() {
  tokenVersion.value++
}

function isActive(path) {
  return route.path === path
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function logout() {
  authLogout()
  router.push('/')
  showUserMenu.value = false
  mobileMenuOpen.value = false
}

function handleClickOutside(event) {
  if (mobileMenuOpen.value) return
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

watch(mobileMenuOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('storage', syncAuth)
  window.addEventListener('authChanged', syncAuth)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('storage', syncAuth)
  window.removeEventListener('authChanged', syncAuth)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-panel-leave-active {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(100%);
}
</style>