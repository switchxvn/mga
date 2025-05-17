<template>
  <div class="grid gap-6">
    <!-- Status Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">{{ t('products.settings.productStatus') }}</h3>
        <p class="text-sm text-slate-500">{{ t('products.settings.statusDescription') }}</p>
      </div>
      <div class="p-6">
        <div class="grid gap-6">
          <!-- Published Status -->
          <div class="flex items-center justify-between">
            <div class="grid gap-1.5">
              <label
                for="published"
                class="text-sm font-medium text-slate-900"
              >
                {{ t('products.settings.published') }}
              </label>
              <p class="text-sm text-slate-500">
                {{ t('products.settings.publishedHelp') }}
              </p>
            </div>
            <Switch
              id="published"
              :model-value="published"
              @update:model-value="$emit('update:published', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="published ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Toggle published</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="published ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>

          <!-- Featured Status -->
          <div class="flex items-center justify-between">
            <div class="grid gap-1.5">
              <label
                for="featured"
                class="text-sm font-medium text-slate-900"
              >
                {{ t('products.settings.featured') }}
              </label>
              <p class="text-sm text-slate-500">
                {{ t('products.settings.featuredHelp') }}
              </p>
            </div>
            <Switch
              id="featured"
              :model-value="featured"
              @update:model-value="$emit('update:featured', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="featured ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Toggle featured</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="featured ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>

          <!-- Taxable Status -->
          <div class="flex items-center justify-between">
            <div class="grid gap-1.5">
              <label
                for="taxable"
                class="text-sm font-medium text-slate-900"
              >
                {{ t('products.settings.taxable') }}
              </label>
              <p class="text-sm text-slate-500">
                {{ t('products.settings.taxableHelp') }}
              </p>
            </div>
            <Switch
              id="taxable"
              :model-value="taxable"
              @update:model-value="$emit('update:taxable', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="taxable ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Toggle taxable</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="taxable ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>

    <!-- Last Updated -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">{{ t('products.settings.lastUpdated') }}</h3>
      </div>
      <div class="p-6">
        <p class="text-sm text-slate-500">
          {{ t('products.settings.lastUpdatedOn', { date: formatDate(updatedAt) }) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { useLocalization } from '../../composables/useLocalization'

const { t } = useLocalization()

defineProps<{
  published: boolean
  featured: boolean
  taxable: boolean
  updatedAt: string
}>()

defineEmits<{
  'update:published': [value: boolean]
  'update:featured': [value: boolean]
  'update:taxable': [value: boolean]
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 