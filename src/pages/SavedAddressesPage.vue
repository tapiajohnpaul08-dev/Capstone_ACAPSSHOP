<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold">Saved Addresses</h1>
          <p class="text-gray-600 mt-1">Manage delivery addresses for faster checkout</p>
        </div>
        <button
          @click="openAddForm"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <Plus class="w-4 h-4" />
          Add Address
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="bg-white rounded-xl border p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-sm text-gray-500 mt-3">Loading your addresses...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="addresses.length === 0" class="bg-white rounded-xl border p-12 text-center">
      <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin class="w-8 h-8 text-blue-600" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No saved addresses yet</h3>
      <p class="text-sm text-gray-500 mb-5">
        Save an address here and it'll be available at checkout for faster ordering.
      </p>
      <button
        @click="openAddForm"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-4 h-4" />
        Add Your First Address
      </button>
    </div>

    <!-- Address list -->
    <div v-else class="space-y-3">
      <div
        v-for="addr in addresses"
        :key="addr._id"
        class="bg-white rounded-xl border p-4 transition-all"
        :class="addr.isDefault ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-200'"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="addr.isDefault ? 'bg-blue-100' : 'bg-gray-100'"
          >
            <MapPin
              class="w-5 h-5"
              :class="addr.isDefault ? 'text-blue-600' : 'text-gray-500'"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-semibold text-gray-900">
                {{ addr.label || 'Address' }}
              </span>
              <span
                v-if="addr.isDefault"
                class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wide"
              >
                Default
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1 leading-snug">
              {{ formatAddress(addr) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
          <button
            v-if="!addr.isDefault"
            @click="setDefault(addr)"
            :disabled="isSaving"
            class="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
          >
            Set as Default
          </button>
          <button
            @click="openEditForm(addr)"
            :disabled="isSaving"
            class="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            <Edit2 class="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            @click="confirmDelete(addr)"
            :disabled="isSaving"
            class="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 inline-flex items-center gap-1.5 ml-auto"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit form -->
    <div
      v-if="showForm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeForm"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900">
                {{ editingAddress ? 'Edit Address' : 'Add New Address' }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ editingAddress ? 'Update this saved address' : 'Save this address for future orders' }}
              </p>
            </div>
            <button @click="closeForm" class="text-gray-400 hover:text-gray-600">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-5 space-y-4">
          <!-- Label -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Label <span class="text-gray-400 text-xs">(e.g., Home, Office, Warehouse)</span>
            </label>
            <input
              v-model="form.label"
              type="text"
              maxlength="40"
              placeholder="Home"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <!-- Region -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Region <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.region"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">Select region...</option>
              <option value="Luzon">Luzon</option>
              <option value="Visayas">Visayas</option>
              <option value="Mindanao">Mindanao</option>
            </select>
          </div>

          <!-- Province + Postal -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Province <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.province"
                type="text"
                required
                placeholder="e.g., Metro Manila"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.postalCode"
                type="text"
                required
                pattern="\d{4}"
                maxlength="4"
                placeholder="1100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <!-- Municipality + Barangay -->
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Municipality / City <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.municipality"
                type="text"
                required
                placeholder="Quezon City"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Barangay <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.barangay"
                type="text"
                required
                placeholder="Barangay 123"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <!-- Street Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span class="text-red-500">*</span>
              <span class="text-gray-400 text-xs">(House/Unit/Flr #, Building, Blk/Lot, Purok)</span>
            </label>
            <textarea
              v-model="form.streetAddress"
              required
              rows="2"
              placeholder="e.g., 123 Unit 4B, Tower A, Block 1 Lot 5, Purok 3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            ></textarea>
          </div>

          <!-- Set as default checkbox -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="form.isDefault"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Make this my default delivery address</span>
          </label>

          <!-- Error -->
          <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ formError }}
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeForm"
              :disabled="isSaving"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isSaving ? 'Saving...' : (editingAddress ? 'Save Changes' : 'Add Address') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2"
          :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
        >
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4" />
          <AlertCircle v-else class="w-4 h-4" />
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation -->
    <ConfirmationModal
      v-model:visible="showDeleteConfirm"
      title="Delete Address"
      :message="`Are you sure you want to delete &quot;${addressToDelete?.label || 'this address'}&quot;? This cannot be undone.`"
      type="danger"
      close-label="Cancel"
      confirm-label="Delete"
      @confirm="performDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, X, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { profileApi, addressesApi } from '@/api.js'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'

const router = useRouter()

const addresses = ref([])
const isLoading = ref(true)
const isSaving = ref(false)

const showForm = ref(false)
const editingAddress = ref(null)
const formError = ref('')

const showDeleteConfirm = ref(false)
const addressToDelete = ref(null)

const toast = ref({ show: false, type: 'success', message: '' })
let toastTimer = null

const customerId = ref('')

const form = ref({
  label: '',
  region: '',
  province: '',
  postalCode: '',
  municipality: '',
  barangay: '',
  streetAddress: '',
  country: 'Philippines',
  isDefault: false,
})

function showToast(type, message) {
  clearTimeout(toastTimer)
  toast.value = { show: true, type, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

function formatAddress(addr) {
  const parts = [
    addr.streetAddress,
    addr.barangay,
    addr.municipality,
    addr.province,
    addr.postalCode,
    addr.region,
    addr.country || 'Philippines',
  ].filter(Boolean)
  return parts.join(', ')
}

function resetForm() {
  form.value = {
    label: '',
    region: '',
    province: '',
    postalCode: '',
    municipality: '',
    barangay: '',
    streetAddress: '',
    country: 'Philippines',
    isDefault: addresses.value.length === 0, // first address defaults to true
  }
  formError.value = ''
  editingAddress.value = null
}

async function loadAddresses() {
  isLoading.value = true
  try {
    const profileRes = await profileApi.getProfile()
    if (!profileRes.success || !profileRes.data) {
      showToast('error', 'Failed to load profile')
      return
    }
    customerId.value = profileRes.data.customerId || profileRes.data._id

    const res = await addressesApi.getAll(customerId.value)
    if (res.success && Array.isArray(res.data)) {
      addresses.value = res.data
    } else {
      addresses.value = []
    }
  } catch (e) {
    console.error('Failed to load addresses:', e)
    showToast('error', 'Failed to load addresses')
  } finally {
    isLoading.value = false
  }
}

function openAddForm() {
  resetForm()
  showForm.value = true
}

function openEditForm(addr) {
  editingAddress.value = addr
  form.value = {
    label: addr.label || '',
    region: addr.region || '',
    province: addr.province || '',
    postalCode: addr.postalCode || '',
    municipality: addr.municipality || '',
    barangay: addr.barangay || '',
    streetAddress: addr.streetAddress || '',
    country: addr.country || 'Philippines',
    isDefault: !!addr.isDefault,
  }
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingAddress.value = null
  formError.value = ''
}

async function submitForm() {
  formError.value = ''

  // Minimal validation
  if (!form.value.region) { formError.value = 'Region is required'; return }
  if (!form.value.province?.trim()) { formError.value = 'Province is required'; return }
  if (!/^\d{4}$/.test(form.value.postalCode || '')) {
    formError.value = 'Postal code must be 4 digits'; return
  }
  if (!form.value.municipality?.trim()) { formError.value = 'Municipality / City is required'; return }
  if (!form.value.barangay?.trim()) { formError.value = 'Barangay is required'; return }
  if (!form.value.streetAddress?.trim() || form.value.streetAddress.trim().length < 5) {
    formError.value = 'Please enter a complete street address'; return
  }

  isSaving.value = true
  try {
    let res
    if (editingAddress.value) {
      res = await addressesApi.update(customerId.value, editingAddress.value._id, form.value)
    } else {
      res = await addressesApi.add(customerId.value, form.value)
    }

    if (res.success) {
      showToast('success', editingAddress.value ? 'Address updated' : 'Address added')
      closeForm()
      await loadAddresses()
    } else {
      formError.value = res.message || 'Failed to save address'
    }
  } catch (e) {
    console.error('Save address error:', e)
    formError.value = e.message || 'Something went wrong'
  } finally {
    isSaving.value = false
  }
}

async function setDefault(addr) {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const res = await addressesApi.setDefault(customerId.value, addr._id)
    if (res.success) {
      showToast('success', 'Default address updated')
      await loadAddresses()
    } else {
      showToast('error', res.message || 'Failed to set default')
    }
  } catch (e) {
    console.error('Set default error:', e)
    showToast('error', 'Failed to set default')
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(addr) {
  addressToDelete.value = addr
  showDeleteConfirm.value = true
}

async function performDelete() {
  const addr = addressToDelete.value
  showDeleteConfirm.value = false
  if (!addr) return

  isSaving.value = true
  try {
    const res = await addressesApi.remove(customerId.value, addr._id)
    if (res.success) {
      showToast('success', 'Address deleted')
      await loadAddresses()
    } else {
      showToast('error', res.message || 'Failed to delete')
    }
  } catch (e) {
    console.error('Delete error:', e)
    showToast('error', 'Failed to delete')
  } finally {
    isSaving.value = false
    addressToDelete.value = null
  }
}

function goBack() {
  router.push('/customer/profile')
}

onMounted(loadAddresses)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }

.toast-enter-active,
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>