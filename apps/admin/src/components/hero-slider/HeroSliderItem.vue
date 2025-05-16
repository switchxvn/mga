<template>
  <div class="flex items-center gap-4 p-2 border rounded mb-2">
    <img :src="slider.imageUrl" alt="" class="w-24 h-16 object-cover rounded" />
    <div class="flex-1">
      <div class="font-bold">{{ slider.title }}</div>
      <div class="text-xs text-gray-500">{{ t('hero_slider.order') }}: {{ slider.order }}</div>
    </div>
    <button @click="$emit('edit', slider)" class="btn btn-sm btn-primary">{{ t('actions.edit') }}</button>
    <button @click="$emit('delete', slider)" class="btn btn-sm btn-danger">{{ t('actions.delete') }}</button>
  </div>
</template>
<script setup lang="ts">
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
defineProps<{ slider: any }>()
</script> 