<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <div class="mb-6">
      <button @click="goBack" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Profile
      </button>
      <h1 class="text-2xl font-bold">My Design Templates</h1>
      <p class="text-gray-600 mt-1">Manage your saved design templates for quick reordering</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DesignTemplateCard
          v-for="template in designs"
          :key="template.id"
          :template="template"
          @rename="handleRename"
          @delete="handleDelete"
        />
      </div>

      <div v-if="designs.length === 0" class="text-center py-12">
        <p class="text-gray-500">No design templates saved yet.</p>
      </div>
    </div>

    <ConfirmationModal
      v-model:visible="showConfirm"
      title="Delete Template"
      :message="`Are you sure you want to delete '${templateToDelete?.name}'? This action cannot be undone.`"
      type="danger"
      confirm-label="Delete"
      confirm-loading-label="Deleting..."
      :is-loading="isDeleting"
      @confirm="confirmDelete"
      @close="cancelDelete"
    />

    <FeedbackModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :status="feedbackStatus"
      :message="feedbackMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import DesignTemplateCard from '@/components/design/DesignTemplateCard.vue'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'
import { useDesigns } from '@/composables/useDesigns.js'

const router = useRouter()
const { designs, fetchDesigns, renameDesign, deleteDesign } = useDesigns()
const isLoading = ref(true)

// ── Delete flow ───────────────────────────────────────────────────────────────
const showConfirm = ref(false)
const isDeleting = ref(false)
const templateToDelete = ref(null)

function handleDelete(template) {
  templateToDelete.value = template
  showConfirm.value = true
}

async function confirmDelete() {
  isDeleting.value = true
  const res = await deleteDesign(templateToDelete.value.id)
  isDeleting.value = false
  showConfirm.value = false
  showFeedback(
    res.success ? 'Template Deleted' : 'Delete Failed',
    res.success ? `'${templateToDelete.value.name}' has been removed.` : 'Something went wrong.',
    res.success ? 'success' : 'error'
  )
  templateToDelete.value = null
}

function cancelDelete() {
  showConfirm.value = false
  templateToDelete.value = null
}

// ── Rename ────────────────────────────────────────────────────────────────────
async function handleRename(template) {
  const newName = prompt('Enter new template name:', template.name)
  if (!newName?.trim()) return
  const res = await renameDesign(template.id, newName.trim())
  showFeedback(
    res.success ? 'Template Renamed' : 'Rename Failed',
    res.success ? `Renamed to "${newName.trim()}".` : 'Something went wrong.',
    res.success ? 'success' : 'error'
  )
}

// ── Feedback ──────────────────────────────────────────────────────────────────
const feedbackVisible = ref(false)
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackStatus = ref('success')

function showFeedback(title, message, status = 'success') {
  feedbackTitle.value = title
  feedbackMessage.value = message
  feedbackStatus.value = status
  feedbackVisible.value = true
}

// ── Navigation ────────────────────────────────────────────────────────────────
function goBack() { router.push('/customer/profile') }

onMounted(async () => {
  await fetchDesigns()
  isLoading.value = false
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>