<script setup lang="ts">
import { useLocalization } from '../composables/useLocalization';

const { t, locale, locales, switchLanguage } = useLocalization();
</script>

<template>
  <div class="language-switcher">
    <div class="flex items-center space-x-2">
      <span class="text-sm font-medium">{{ t('language') }}:</span>
      <div class="flex space-x-2">
        <button
          v-for="loc in locales"
          :key="loc.code"
          @click="switchLanguage(loc.code)"
          class="px-2 py-1 text-sm rounded-md transition-colors"
          :class="{
            'bg-primary text-primary-foreground': locale === loc.code,
            'bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50': locale !== loc.code
          }"
        >
          {{ loc.name }}
        </button>
      </div>
    </div>
  </div>
</template> 