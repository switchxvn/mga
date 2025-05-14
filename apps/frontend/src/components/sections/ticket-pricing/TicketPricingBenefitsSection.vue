<script setup lang="ts">
import { computed } from 'vue'
import Icon from '~/components/ui/Icon.vue'

interface Benefit {
  id: number
  title: string
  description: string
  icon: string
}

interface Props {
  settings: {
    backgroundColor?: string
    typography?: {
      heading?: string
      subheading?: string
      benefitTitle?: string
      benefitDescription?: string
    }
    colors?: {
      heading?: string
      subheading?: string
      benefitTitle?: string
      benefitDescription?: string
      icon?: string
      primary?: string
    }
  }
  translations: {
    title: string
    subtitle: string
    benefits: Benefit[]
  }
  isMobile?: boolean
}

const props = defineProps<Props>()

const sectionClasses = computed(() => {
  return [
    'w-full',
    props.settings?.backgroundColor || 'bg-gray-50 dark:bg-gray-900',
  ].join(' ')
})

const headingClasses = computed(() => {
  const defaultTypography = props.isMobile
    ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center tracking-tight'
    : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center tracking-tight'
    
  const defaultColor = props.settings?.colors?.primary || 'text-primary-600 dark:text-primary-400'
  
  return [
    props.settings?.typography?.heading || defaultTypography,
    props.settings?.colors?.heading || defaultColor,
  ].join(' ')
})

const subheadingClasses = computed(() => {
  const defaultTypography = props.isMobile
    ? 'text-base sm:text-lg md:text-xl text-center max-w-2xl mx-auto font-medium'
    : 'text-lg sm:text-xl md:text-2xl text-center max-w-2xl mx-auto font-medium'
    
  return [
    props.settings?.typography?.subheading || defaultTypography,
    props.settings?.colors?.subheading || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})

const benefitTitleClasses = computed(() => {
  const defaultTypography = props.isMobile
    ? 'text-lg sm:text-xl font-semibold line-clamp-2 min-h-[3rem]'
    : 'text-xl font-semibold line-clamp-2 min-h-[3.5rem]'
    
  return [
    props.settings?.typography?.benefitTitle || defaultTypography,
    props.settings?.colors?.benefitTitle || 'text-gray-900 dark:text-gray-100',
  ].join(' ')
})

const benefitDescriptionClasses = computed(() => {
  return [
    props.settings?.typography?.benefitDescription || 'text-base leading-relaxed',
    props.settings?.colors?.benefitDescription || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})

const iconClasses = computed(() => {
  const iconSize = props.isMobile ? 'w-10 h-10' : 'w-12 h-12'
  
  return [
    iconSize,
    props.settings?.colors?.icon || 'text-primary-500 dark:text-primary-400',
  ].join(' ')
})
</script>

<template>
  <section :class="sectionClasses">
    <div class="container mx-auto px-4 py-10 sm:py-12 md:py-16 lg:py-24">
      <div class="text-center max-w-4xl mx-auto mb-10 md:mb-16">
        <h2 :class="headingClasses" class="mb-6 md:mb-8">{{ translations.title }}</h2>
        <div v-if="translations.subtitle">
          <p :class="subheadingClasses">
            {{ translations.subtitle }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        <div
          v-for="benefit in translations.benefits"
          :key="benefit.id"
          class="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-md md:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
        >
          <div class="flex flex-col items-center text-center">
            <div class="mb-4 md:mb-6 bg-primary-50 dark:bg-primary-900/20 rounded-full p-3 md:p-4">
              <Icon
                :name="benefit.icon"
                :class="iconClasses"
              />
            </div>
            <h3 :class="benefitTitleClasses" class="mb-3 md:mb-4">{{ benefit.title }}</h3>
            <p :class="benefitDescriptionClasses">
              {{ benefit.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 767px) {
  /* Remove hover effect on mobile for better performance */
  .hover\:scale-105:hover {
    transform: none;
  }
  
  /* Ensure proper touch targets */
  .grid > div {
    min-height: 200px;
  }
}
</style> 