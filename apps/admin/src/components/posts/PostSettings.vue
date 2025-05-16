<template>
  <section class="bg-white shadow-sm rounded-lg border border-slate-200">
    <div class="p-6 border-b border-slate-200">
      <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
        <SettingsIcon class="w-5 h-5" />
        {{ t('posts.settings.title') }}
      </h3>
    </div>
    
    <div class="p-6">
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-900">{{ t('posts.settings.status') }}</label>
        <select 
          :value="published"
          class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          @change="$emit('update:published', ($event.target as HTMLSelectElement).value === 'true')"
        >
          <option value="false">{{ t('posts.settings.draft') }}</option>
          <option value="true">{{ t('posts.settings.published') }}</option>
        </select>
        <p class="text-sm text-slate-500 flex items-center gap-2">
          <ClockIcon class="w-4 h-4" />
          {{ t('posts.settings.lastUpdated') }}: {{ formatDate(updatedAt) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SettingsIcon, ClockIcon } from 'lucide-vue-next'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()

defineProps<{
  published: boolean
  updatedAt: string
}>()

defineEmits<{
  'update:published': [value: boolean]
}>()

const formatDate = (date: string): string => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 