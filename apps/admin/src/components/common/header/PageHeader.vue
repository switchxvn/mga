<template>
  <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
          <DocumentTextIcon class="h-8 w-8 text-indigo-600" />
          {{ title }}
        </h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <InformationCircleIcon class="h-5 w-5" />
          {{ description }}
        </p>
      </div>
      <div class="mt-4 flex flex-col sm:flex-row gap-3 sm:mt-0">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentTextIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { useLocalization } from '../../../composables/useLocalization';

const { t } = useLocalization();

defineProps<{
  title: string
  description: string
}>()
</script> 