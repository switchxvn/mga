<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  settings: {
    backgroundColor?: string
    typography?: {
      heading?: string
      subheading?: string
      button?: string
    }
    colors?: {
      heading?: string
      subheading?: string
      button?: string
      buttonText?: string
    }
  }
  translations: {
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
  }
}

const props = defineProps<Props>()

const sectionClasses = computed(() => {
  return [
    'w-full',
    props.settings?.backgroundColor || 'bg-blue-600 dark:bg-blue-700',
  ].join(' ')
})

const headingClasses = computed(() => {
  return [
    props.settings?.typography?.heading || 'text-3xl md:text-4xl font-bold',
    props.settings?.colors?.heading || 'text-white',
  ].join(' ')
})

const subheadingClasses = computed(() => {
  return [
    props.settings?.typography?.subheading || 'text-xl',
    props.settings?.colors?.subheading || 'text-blue-100',
  ].join(' ')
})

const buttonClasses = computed(() => {
  return [
    props.settings?.typography?.button || 'text-lg font-medium',
    props.settings?.colors?.button || 'bg-white hover:bg-blue-50',
    props.settings?.colors?.buttonText || 'text-blue-600',
    'px-8 py-3 rounded-lg transition-colors',
  ].join(' ')
})
</script>

<template>
  <section :class="sectionClasses">
    <div class="container mx-auto px-4 py-16 md:py-24">
      <div class="text-center max-w-4xl mx-auto">
        <h2 :class="headingClasses">{{ translations.title }}</h2>
        <p v-if="translations.subtitle" :class="subheadingClasses" class="mt-4">
          {{ translations.subtitle }}
        </p>
        <div class="mt-8">
          <a
            :href="translations.buttonLink"
            :class="buttonClasses"
            class="inline-block"
          >
            {{ translations.buttonText }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template> 