<!-- src/App.vue -->
<template>
  <router-view />
  <FeedbackModal
    v-model:visible="feedbackVisible"
    :title="feedbackTitle"
    :status="feedbackStatus"
    :message="feedbackMessage"
    :duration="feedbackDuration"
  />
</template>

<script>
import FeedbackModal from '@/modals/FeedbackModal.vue'
import {useFeedback} from '@/utils/useFeedback'

export default {
  components: { FeedbackModal },
  setup() {
    return { ...useFeedback() }
  }
}
</script>


