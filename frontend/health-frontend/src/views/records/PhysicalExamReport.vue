<template>
  <div class="report-page">
    <MedicalReport :report-id="reportId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MedicalReport from '@/components/MedicalReport.vue'

const route = useRoute()
const reportId = ref('')

onMounted(() => {
  if (route.params.id) {
    reportId.value = route.params.id 
  }
})
</script>

<style scoped>
.report-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style> 