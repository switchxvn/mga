<script setup lang="ts">
import { useLocalization } from '../composables/useLocalization';

const { t } = useLocalization();
</script>

<template>
  <div class="about container mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold mb-6">{{ t('about') }}</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">{{ t('welcome') }}</h2>
      <p class="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, 
        nunc nisl aliquet nunc, quis aliquam nisl nisl eu nisl. Nullam euismod, nisl eget aliquam ultricies.
      </p>
      
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border dark:border-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">{{ t('common.save') }}</h3>
          <p>{{ t('common.loading') }}</p>
        </div>
        
        <div class="border dark:border-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-medium mb-2">{{ t('common.edit') }}</h3>
          <p>{{ t('common.success') }}</p>
        </div>
      </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">{{ t('contact') }}</h2>
      <p class="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies.
      </p>
      
      <div class="mt-4">
        <button class="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md mr-2">
          {{ t('common.submit') }}
        </button>
        <button class="bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 px-4 py-2 rounded-md">
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 768px) {
  .about {
    max-width: 1024px;
  }
}
</style>
