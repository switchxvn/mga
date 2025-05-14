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
  isMobile?: boolean
}

const props = defineProps<Props>()

const sectionClasses = computed(() => {
  return [
    'w-full',
    props.settings?.backgroundColor || 'bg-blue-600 dark:bg-blue-700',
  ].join(' ')
})

const headingClasses = computed(() => {
  // Adjust typography for mobile
  const defaultTypography = props.isMobile
    ? 'text-2xl sm:text-3xl md:text-4xl font-bold'
    : 'text-3xl md:text-4xl font-bold'
    
  return [
    props.settings?.typography?.heading || defaultTypography,
    props.settings?.colors?.heading || 'text-white',
  ].join(' ')
})

const subheadingClasses = computed(() => {
  // Adjust typography for mobile
  const defaultTypography = props.isMobile
    ? 'text-base sm:text-lg md:text-xl'
    : 'text-xl'
    
  return [
    props.settings?.typography?.subheading || defaultTypography,
    props.settings?.colors?.subheading || 'text-blue-100',
  ].join(' ')
})

const buttonClasses = computed(() => {
  // Adjust button size for mobile
  const defaultTypography = props.isMobile
    ? 'text-base font-medium'
    : 'text-lg font-medium'
    
  return [
    props.settings?.typography?.button || defaultTypography,
    props.settings?.colors?.button || 'bg-white hover:bg-blue-50',
    props.settings?.colors?.buttonText || 'text-blue-600',
    'px-6 py-3 sm:px-8 rounded-lg transition-colors shadow-md',
  ].join(' ')
})
</script>

<template>
  <section :class="sectionClasses">
    <div class="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
      <div class="text-center max-w-4xl mx-auto">
        <h2 :class="headingClasses" class="leading-tight">{{ translations.title }}</h2>
        <p v-if="translations.subtitle" :class="subheadingClasses" class="mt-3 md:mt-4">
          {{ translations.subtitle }}
        </p>
        <div class="mt-6 md:mt-8">
          <a
            :href="translations.buttonLink"
            :class="buttonClasses"
            class="inline-block w-full sm:w-auto"
          >
            {{ translations.buttonText }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 639px) {
  /* Make button full width on small mobile screens */
  a.inline-block {
    display: block;
    text-align: center;
  }
  
  /* Improve touch targets */
  a {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style> 