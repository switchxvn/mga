<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';

const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

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
              <div class="w-64 h-64 rounded-full bg-primary/10 dark:bg-primary/20"></div>
              <div class="w-48 h-48 rounded-full bg-primary/20 dark:bg-primary/30 absolute"></div>
            </div>
            
            <!-- Lock Icon -->
            <div class="relative flex items-center justify-center">
              <div class="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <UIcon
                  name="i-heroicons-lock-closed"
                  class="w-16 h-16 text-white"
                />
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