<template>
  <div class="mb-4">
    <label>Theme</label>
    <select :value="modelValue" @change="onChange" class="select select-bordered w-full">
      <option v-for="theme in themes" :key="theme.id" :value="theme.id">{{ theme.name }}</option>
    </select>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useHeroSlider } from '@/composables/useHeroSlider'
const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits(['update:modelValue'])
const { themes, fetchThemes } = useHeroSlider()
onMounted(fetchThemes)
function onChange(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLSelectElement).value))
}
</script> 