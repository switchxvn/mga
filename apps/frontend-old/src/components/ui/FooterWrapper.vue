<script setup lang="ts">
import { computed } from 'vue';
import { useFooter } from '~/composables/useFooter';

const {
  activeFooter,
  isLoading,
  error,
} = useFooter();

// Compute which component to use based on API response
const FooterComponent = computed(() => {
  if (!activeFooter.value?.componentName) return defineAsyncComponent(() => import('./Footer.vue'));
  
  // Try to load the specified component, fallback to default if not found
  return defineAsyncComponent(() => 
    import(`./${activeFooter.value.componentName}.vue`)
      .catch(() => import('./Footer.vue'))
  );
});
</script>

<template>
  <Suspense>
    <template #default>
      <component :is="FooterComponent" />
    </template>
    <template #fallback>
      <div class="footer-loading animate-pulse">
        <div class="container mx-auto px-4 py-8">
          <div class="h-40 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>
    </template>
  </Suspense>
</template>

<style scoped>
.footer-loading {
  @apply w-full border-t min-h-[200px];
}
</style> 