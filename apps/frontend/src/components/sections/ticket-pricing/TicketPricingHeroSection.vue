<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  settings: {
    backgroundColor?: string
    typography?: {
      heading?: string
      subheading?: string
    }
    colors?: {
      heading?: string
      subheading?: string
    }
  }
  translations: {
    title: string
    subtitle: string
  }
}

const props = defineProps<Props>()

const sectionClasses = computed(() => {
  return [
    'w-full',
    props.settings?.backgroundColor || 'bg-white dark:bg-gray-800',
  ].join(' ')
})

const headingClasses = computed(() => {
  return [
    props.settings?.typography?.heading || 'text-4xl md:text-5xl font-bold',
    props.settings?.colors?.heading || 'text-gray-900 dark:text-gray-100',
  ].join(' ')
})

const subheadingClasses = computed(() => {
  return [
    props.settings?.typography?.subheading || 'text-xl md:text-2xl',
    props.settings?.colors?.subheading || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})
</script>

<template>
  <section :class="sectionClasses">
    <div class="container mx-auto px-4 py-16 md:py-24">
      <div class="text-center max-w-4xl mx-auto">
        <h1 :class="headingClasses">{{ translations.title }}</h1>
        <p v-if="translations.subtitle" :class="subheadingClasses" class="mt-6">
          {{ translations.subtitle }}
        </p>
      </div>
    </div>
  </section>
</template> 