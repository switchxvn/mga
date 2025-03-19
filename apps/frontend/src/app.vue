<script setup lang="ts">
// Không cần định nghĩa layout ở đây vì Nuxt sẽ tự động sử dụng layout default
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==',
      crossorigin: 'anonymous',
      referrerpolicy: 'no-referrer'
    }
  ]
});

import { ref, onMounted } from 'vue';
import { useFeatureFlags } from './composables/useFeatureFlags';
import { useComponentStyles } from './composables/useComponentStyles';
import { useTheme } from './composables/useTheme';
import { useDarkMode } from './composables/useDarkMode';

const isLoading = ref(true);

// Initialize theme and component styles
const { initializeTheme } = useTheme();
const { initializeStyles } = useComponentStyles();
const { initializeDarkMode } = useDarkMode();

// Initialize theme and dark mode immediately in setup
await initializeTheme();
if (process.client) {
  initializeDarkMode();
}

onMounted(async () => {
  try {
    // Initialize component styles after mounting
    await initializeStyles();
    
    // Initialize feature flags
    const { fetchFeatureFlags } = useFeatureFlags();
    await fetchFeatureFlags();
  } finally {
    // Hide loading screen after everything is initialized
    isLoading.value = false;
  }
});
</script>

<template>
  <LoadingScreen :is-loading="isLoading" />
  <!-- NuxtLayout sẽ tự động sử dụng layout default -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}
</style>
