<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { ref, onMounted } from 'vue';
import { useFeatureFlags } from './composables/useFeatureFlags';
import { useComponentStyles } from './composables/useComponentStyles';
import { useTheme } from './composables/useTheme';
import { useDarkMode } from './composables/useDarkMode';

const isLoading = ref(true);

// Safety timeout to prevent infinite loading
if (process.client) {
  setTimeout(() => {
    if (isLoading.value) {
      console.warn('Loading timeout reached, forcing app to show');
      isLoading.value = false;
    }
  }, 5000); // 5 seconds timeout
}

// Initialize theme and component styles
const { initializeTheme } = useTheme();
const { initializeStyles } = useComponentStyles();
const { initializeDarkMode } = useDarkMode();

console.log('Starting app initialization...');

// Initialize theme and dark mode
const initApp = async () => {
  try {
    console.log('Initializing theme...');
    await initializeTheme();
    console.log('Theme initialized successfully');
    
    if (process.client) {
      console.log('Initializing dark mode...');
      initializeDarkMode();
      console.log('Dark mode initialized successfully');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    // Continue loading the app even if theme initialization fails
    isLoading.value = false;
  }
};

// Start initialization
initApp();

// Add font awesome
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

onMounted(async () => {
  console.log('Component mounted, starting additional initialization...');
  try {
    // Initialize component styles after mounting
    console.log('Initializing component styles...');
    await initializeStyles();
    console.log('Component styles initialized successfully');
    
    // Initialize feature flags
    console.log('Fetching feature flags...');
    const { fetchFeatureFlags } = useFeatureFlags();
    await fetchFeatureFlags();
    console.log('Feature flags initialized successfully');
  } catch (error) {
    console.error('Error during mounted initialization:', error);
  } finally {
    // Hide loading screen after everything is initialized
    console.log('Initialization complete, hiding loading screen');
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
}
</style>
