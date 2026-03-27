<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <div class="mb-6">
      <button 
        @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4"
      >
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">Privacy Settings</h1>
      <p class="text-gray-600 mt-1">Control your privacy settings</p>
    </div>

    <div class="space-y-4">
      <div class="bg-white rounded-xl border">
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Profile Visibility</h3>
              <p class="text-sm text-gray-600">Control who can see your profile information</p>
            </div>
            <select
              v-model="privacy.profileVisibility"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="contacts">Only Contacts</option>
            </select>
          </div>
          
          <div class="border-t pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">Order History Visibility</h3>
                <p class="text-sm text-gray-600">Allow others to see your order history</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="privacy.orderHistoryVisible" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">Marketing Communications</h3>
                <p class="text-sm text-gray-600">Receive promotional emails and updates</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="privacy.marketingEmails" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">Data Sharing</h3>
                <p class="text-sm text-gray-600">Allow us to share data for better recommendations</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="privacy.dataSharing" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="savePrivacy"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
        <button
          @click="goBack"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const privacy = ref({
  profileVisibility: 'private',
  orderHistoryVisible: false,
  marketingEmails: true,
  dataSharing: false
})

onMounted(() => {
  const saved = localStorage.getItem('privacySettings')
  if (saved) {
    privacy.value = JSON.parse(saved)
  }
})

function savePrivacy() {
  localStorage.setItem('privacySettings', JSON.stringify(privacy.value))
  alert('Privacy settings saved successfully!')
  router.push('/customer/profile')
}

function goBack() {
  router.push('/customer/profile')
}
</script>