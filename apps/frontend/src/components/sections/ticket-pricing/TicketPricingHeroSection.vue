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
    image?: {
      src: string
      alt: string
      width: number
      height: number
      position: string
      objectFit: string
      overlay?: {
        enabled: boolean
        color: string
        blendMode: string
      }
    }
  }
  translations: {
    title: string
    subtitle: string
  }
  isMobile?: boolean
}

const props = defineProps<Props>()

const sectionClasses = computed(() => {
  return [
    'w-full relative overflow-hidden',
    props.settings?.backgroundColor || 'bg-white dark:bg-gray-800',
  ].join(' ')
})

const headingClasses = computed(() => {
  // Adjust typography for mobile
  const defaultTypography = props.isMobile
    ? 'text-3xl sm:text-4xl md:text-5xl font-bold'
    : 'text-4xl md:text-5xl font-bold'
    
  return [
    props.settings?.typography?.heading || defaultTypography,
    props.settings?.colors?.heading || 'text-gray-900 dark:text-gray-100',
  ].join(' ')
})

const subheadingClasses = computed(() => {
  // Adjust typography for mobile
  const defaultTypography = props.isMobile
    ? 'text-lg sm:text-xl md:text-2xl'
    : 'text-xl md:text-2xl'
    
  return [
    props.settings?.typography?.subheading || defaultTypography,
    props.settings?.colors?.subheading || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})

const hasImage = computed(() => {
  return !!props.settings?.image?.src
})

const overlayStyle = computed(() => {
  if (!props.settings?.image?.overlay?.enabled) return {}
  
  return {
    backgroundColor: props.settings.image.overlay.color,
    mixBlendMode: props.settings.image.overlay.blendMode,
  }
})

const sectionStyle = computed(() => {
  if (!props.settings?.image) return {}
  
  // Adjust height for mobile
  const minHeight = props.isMobile
    ? `${Math.min(props.settings.image.height, 400)}px`
    : `${props.settings.image.height}px`
  
  return {
    minHeight,
  }
})
</script>

<template>
  <section :class="sectionClasses" :style="sectionStyle">
    <!-- Background Image with Overlay -->
    <div v-if="hasImage" class="absolute inset-0 z-0">
      <img 
        :src="settings.image.src" 
        :alt="settings.image.alt"
        :width="settings.image.width"
        :height="settings.image.height"
        class="w-full h-full object-cover"
        :style="{ objectPosition: settings.image.position }"
      />
      <div 
        v-if="settings.image.overlay?.enabled" 
        class="absolute inset-0 z-10"
        :style="overlayStyle"
      ></div>
    </div>
    
    <!-- Content -->
    <div class="container mx-auto px-4 py-10 sm:py-12 md:py-16 lg:py-24 relative z-20">
      <div class="text-center max-w-4xl mx-auto">
        <h1 :class="headingClasses" class="leading-tight">{{ translations.title }}</h1>
        <p v-if="translations.subtitle" :class="subheadingClasses" class="mt-4 md:mt-6">
          {{ translations.subtitle }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 767px) {
  /* Ensure text is readable on mobile */
  h1 {
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
  
  /* Improve spacing on mobile */
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style> 