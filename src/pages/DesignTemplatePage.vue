<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Header -->
    <div class="mb-6">
      <button @click="goBack" class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4">
        <ArrowLeft class="w-4 h-4" />
        Back to Profile
      </button>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">My Design Templates</h1>
          <p class="text-gray-600 mt-1">Manage your saved design templates for quick reordering</p>
        </div>
        <div class="flex gap-2">
          <button 
            @click="refreshTemplates"
            :disabled="isLoading"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw class="w-4 h-4" :class="{'animate-spin': isLoading}" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 text-blue-600 animate-spin" />
    </div>

    <!-- Templates Grid -->
    <div v-else>
      <div v-if="templates.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DesignTemplateCard
          v-for="template in templates"
          :key="template.id || template.templateId"
          :template="template"
          @rename="handleRename"
          @delete="handleDelete"
          @use="handleUseTemplate"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
        <LayoutTemplate class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500 text-lg font-medium">No design templates saved yet</p>
        <p class="text-gray-400 text-sm mt-1">Create a design template from your order or upload one</p>
        <button 
          @click="goToCreateOrder" 
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Create New Order
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
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

    <!-- Feedback Modal -->
    <SimpleModal
      v-model:visible="feedbackVisible"
      :title="feedbackTitle"
      :message="feedbackMessage"
      :icon-type="feedbackStatus"
      :show-cancel="false"
      confirm-label="Got it"
      @confirm="feedbackVisible = false"
    />

    <!-- Rename Modal -->
    <SimpleModal
      v-model:visible="renameModalVisible"
      title="Rename Template"
      message="Enter a new name for this template"
      icon-type="info"
      confirm-label="Save"
      cancel-label="Cancel"
      :show-input="true"
      :input-value="renameValue"
      :input-placeholder="'Enter new template name...'"
      :loading="isRenaming"
      @update:input-value="renameValue = $event"
      @confirm="confirmRename"
      @close="renameModalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  RefreshCw, 
  Loader2, 
  LayoutTemplate, 
  Plus 
} from 'lucide-vue-next'
import DesignTemplateCard from '@/components/design/DesignTemplateCard.vue'
import ConfirmationModal from '@/modals/ConfirmationModal.vue'
import SimpleModal from '@/modals/SimpleModal.vue'
import { useTemplates } from '@/composables/useTemplates.js'

const router = useRouter()
const { templates, isLoading, fetchTemplates, deleteTemplate, renameTemplate } = useTemplates()

// ── State ──────────────────────────────────────────────────────────────────────
const isDeleting = ref(false)
const isRenaming = ref(false)

// ── Delete flow ───────────────────────────────────────────────────────────────
const showConfirm = ref(false)
const templateToDelete = ref(null)

function handleDelete(template) {
  templateToDelete.value = template
  showConfirm.value = true
}

async function confirmDelete() {
  isDeleting.value = true
  const id = templateToDelete.value.id || templateToDelete.value.templateId
  const res = await deleteTemplate(id)
  isDeleting.value = false
  showConfirm.value = false
  
  if (res.success) {
    showFeedback('Template Deleted', `'${templateToDelete.value.name}' has been removed.`, 'success')
  } else {
    showFeedback('Delete Failed', res.message || 'Something went wrong.', 'error')
  }
  templateToDelete.value = null
}

function cancelDelete() {
  showConfirm.value = false
  templateToDelete.value = null
}

// ── Rename flow ──────────────────────────────────────────────────────────────
const renameModalVisible = ref(false)
const renameValue = ref('')
const renameTarget = ref(null)

async function handleRename(template) {
  renameTarget.value = template
  renameValue.value = template.name
  renameModalVisible.value = true
}

async function confirmRename() {
  if (!renameValue.value?.trim()) {
    showFeedback('Invalid Name', 'Please enter a valid template name.', 'warning')
    return
  }
  
  isRenaming.value = true
  const id = renameTarget.value.id || renameTarget.value.templateId
  const res = await renameTemplate(id, renameValue.value.trim())
  isRenaming.value = false
  
  if (res.success) {
    renameModalVisible.value = false
    showFeedback('Template Renamed', `Renamed to "${renameValue.value.trim()}".`, 'success')
  } else {
    showFeedback('Rename Failed', res.message || 'Something went wrong.', 'error')
  }
  renameTarget.value = null
}

// ── Use Template ─────────────────────────────────────────────────────────────
function handleUseTemplate(template) {
  sessionStorage.setItem('selectedTemplate', JSON.stringify(template))
  router.push('/customer/orders/create?type=company-product&template=' + (template.id || template.templateId))
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

// ── Actions ──────────────────────────────────────────────────────────────────
function goBack() { 
  router.push('/customer/profile') 
}

function goToCreateOrder() {
  router.push('/customer/orders/create?type=company-product')
}

async function refreshTemplates() {
  await fetchTemplates()
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchTemplates()
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>