<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';
import { useLogo } from '~/composables/useLogo';

const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');
const { currentLogoUrl, logo, isLoading: isLoadingLogo } = useLogo();

const toggleTheme = () => {
  colorMode.value = isDarkMode.value ? 'light' : 'dark';
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <main class="flex min-h-screen">
      <!-- Left side - Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-primary/5 dark:bg-primary/10">
        <div class="flex flex-col justify-center items-center w-full p-12">
          <!-- Modern Authentication Illustration -->
          <div class="relative w-full max-w-md mb-8">
            <!-- Background Circles -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/20 animate-pulse-slow"></div>
              <div class="w-64 h-64 rounded-full bg-primary/20 dark:bg-primary/30 absolute animate-pulse-slower"></div>
            </div>
            
            <!-- Logo Box -->
            <div class="relative flex items-center justify-center">
              <div class="w-48 h-48 bg-[#FEB914] rounded-3xl flex items-center justify-center shadow-lg overflow-hidden group">
                <!-- Logo with animation -->
                <div class="relative w-40 h-40 flex items-center justify-center p-4">
                  <img
                    v-if="currentLogoUrl"
                    :src="currentLogoUrl"
                    :alt="logo?.altText || 'Logo'"
                    class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  <span v-else-if="isLoadingLogo" class="h-16 w-16 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded"></span>
                </div>
              </div>
            </div>
          </div>

          <h2 class="text-3xl font-bold text-center mb-4">
            Chào mừng bạn trở lại
          </h2>
          <p class="text-center text-muted-foreground max-w-md">
            Đăng nhập để truy cập tài khoản của bạn và khám phá các tính năng tuyệt vời của chúng tôi
          </p>
        </div>
      </div>

      <!-- Right side - Form -->
      <div class="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

@keyframes pulse-slower {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-pulse-slower {
  animation: pulse-slower 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Logo loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 