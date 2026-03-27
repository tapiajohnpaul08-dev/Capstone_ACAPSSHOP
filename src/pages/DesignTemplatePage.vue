<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Header with Back Button -->
    <div class="mb-6">
      <button 
        @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4"
      >
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">My Design Templates</h1>
      <p class="text-gray-600 mt-1">Manage your saved design templates for quick reordering</p>
    </div>

    <!-- Templates Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DesignTemplateCard
        v-for="template in templates"
        :key="template.id"
        :template="template"
        @rename="handleRename"
        @delete="handleDelete"
      />
    </div>

    <!-- Empty State -->
    <div v-if="templates.length === 0" class="text-center py-12">
      <p class="text-gray-500">No design templates saved yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import DesignTemplateCard from '@/components/design/DesignTemplateCard.vue'

const router = useRouter()

const templates = ref([
  {
    id: 1,
    name: 'ABC Corp Logo',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop',
    printSize: '3x3 inches',
    placement: 'Front center',
    createdAt: 'February 1, 2024'
  },
  {
    id: 2,
    name: 'Coffee Shop Logo',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&h=400&fit=crop',
    printSize: '4x4 inches',
    placement: 'Wrap around',
    createdAt: 'January 15, 2024'
  },
  {
    id: 3,
    name: 'Tech Startup Brand',
    image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=400&h=400&fit=crop',
    printSize: '2x2 inches',
    placement: 'Side print',
    createdAt: 'March 1, 2024'
  }
])

function goBack() {
  router.push('/customer/profile')
}

function handleRename(template) {
  const newName = prompt('Enter new template name:', template.name)
  if (newName && newName.trim()) {
    template.name = newName.trim()
    alert(`Template renamed to "${newName}"`)
  }
}

function handleDelete(template) {
  if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      alert('Template deleted successfully')
    }
  }
}
</script>