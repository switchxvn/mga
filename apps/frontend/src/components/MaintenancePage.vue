<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="max-w-2xl w-full text-center space-y-8">
      <!-- Loading Icon Section -->
      <div class="relative w-32 h-32 mx-auto">
        <!-- Outer rotating circle -->
        <div class="absolute inset-0 loading-circle border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
        
        <!-- Inner rotating circle (opposite direction) -->
        <div class="absolute inset-2 loading-circle-reverse border-4 border-secondary-200 border-t-secondary-500 rounded-full"></div>
        
        <!-- Center clock icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          <Icon 
            name="clock" 
            class="w-12 h-12 text-gray-700 dark:text-gray-300"
          />
        </div>
      </div>

      <!-- Text Content -->
      <div class="space-y-4">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          {{ t('maintenance.title', 'Đang Bảo Trì Hệ Thống') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          {{ t('maintenance.description', 'Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn. Vui lòng quay lại sau.') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-circle {
  animation: spin 3s linear infinite;
}

.loading-circle-reverse {
  animation: spin-reverse 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}
</style> 