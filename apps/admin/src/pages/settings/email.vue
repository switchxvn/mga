<script setup lang="ts">
import { ref, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mail } from 'lucide-vue-next'

const { t } = useI18n()

// Provide page title for layout
provide('pageTitle', ref(t('settings.email.title')))
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <UButton 
            to="/settings" 
            variant="ghost" 
            icon="i-lucide-arrow-left"
            size="sm"
          >
            {{ t('settings.common.back') }}
          </UButton>
          <Mail class="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('settings.email.title') }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t('settings.email.description') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Coming Soon -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
      <Mail class="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('settings.email.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {{ t('settings.email.comingSoon') }}
      </p>
    </div>
  </div>
</template> 