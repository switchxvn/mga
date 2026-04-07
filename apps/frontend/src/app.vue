<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { ref, onMounted } from 'vue';
import { useFeatureFlags } from './composables/useFeatureFlags';
import { useComponentStyles } from './composables/useComponentStyles';
import { useTheme } from './composables/useTheme';
import { useDarkMode } from './composables/useDarkMode';
import { useSettings } from './composables/useSettings';
import { useFavicon } from './composables/useFavicon';

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

// Initialize settings and favicon
const { getPublicSettingValueByKey } = useSettings();
const { initializeFavicon } = useFavicon();

console.log('Starting app initialization...');

// Log GTM ID from settings for verification
const logGTMSettings = async () => {
  try {
    console.log('Loading GTM ID from settings for verification...');
    const gtmId = await getPublicSettingValueByKey('google_tag_manager_id', '');
    console.log('GTM ID from database:', gtmId);
    console.log('GTM is hardcoded in nuxt.config.ts, but database value is:', gtmId);
  } catch (error) {
    console.error('Error loading GTM settings:', error);
  }
};

// Initialize theme, dark mode, and favicon
const initApp = async () => {
  try {
    console.log('Initializing theme...');
    await initializeTheme();
    console.log('Theme initialized successfully');
    
    console.log('Initializing favicon...');
    try {
      await initializeFavicon();
      console.log('Favicon initialized successfully');
    } catch (faviconError) {
      console.warn('Favicon initialization failed, using default:', faviconError);
    }
    
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

// Add font awesome and meta tags
useHead({
  link: [
    { rel: 'preconnect', href: 'https://cdn.mgavietnam.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: '//cdn.mgavietnam.com' }
  ],
  meta: [
    // Favicon-related meta tags for better browser support
    {
      name: 'msapplication-TileColor',
      content: '#ffffff'
    },
    {
      name: 'theme-color',
      content: '#ffffff'
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
    
    // Log GTM settings for verification
    console.log('Checking GTM settings...');
    await logGTMSettings();
    console.log('GTM settings check completed');
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
