<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useLogo } from '../composables/useLogo';

const { theme, initializeTheme } = useTheme();
const { currentLogoUrl, logo, isLoading: isLoadingLogo } = useLogo();
const isLoading = ref(true);

// Khởi tạo theme trước khi component được mounted
onBeforeMount(async () => {
  try {
    await initializeTheme();
  } catch (error) {
    console.error('Failed to initialize theme in auth layout (onBeforeMount):', error);
  }
});

// Khởi tạo theme khi component được mounted
onMounted(async () => {
  try {
    // Khởi tạo theme một lần nữa để đảm bảo
    await initializeTheme();
    // Đợi một chút để CSS được áp dụng
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Failed to initialize theme in auth layout (onMounted):', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding & Illustration -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600/30 via-primary-400/20 to-primary-800/40"></div>

      <!-- Background Image with slight transparency -->
      <div class="absolute inset-0">
        <img 
          src="../assets/images/admin_bg.png" 
          alt="Admin Dashboard Illustration"
          class="w-full h-full object-contain opacity-90"
        />
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <template v-if="isLoading">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span class="mt-4 block text-sm text-gray-500 dark:text-gray-400">
            Loading theme...
          </span>
        </div>
      </template>

      <div v-else class="w-full max-w-md">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="relative w-48 h-16">
            <img
              v-if="currentLogoUrl"
              :src="currentLogoUrl"
              :alt="logo?.altText || 'Company Logo'"
              class="w-full h-full object-contain"
            />
            <div 
              v-else-if="isLoadingLogo" 
              class="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mix-blend-overlay {
  mix-blend-mode: overlay;
}
</style> 