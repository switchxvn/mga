<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

interface FaqItem {
  id: number
  question: string
  answer: string
}

interface Props {
  settings: {
    backgroundColor?: string
    typography?: {
      heading?: string
      subheading?: string
      question?: string
      answer?: string
    }
    colors?: {
      heading?: string
      subheading?: string
      question?: string
      answer?: string
      primary?: string
    }
    padding?: string
    cardBackgroundColor?: string
    contentBackgroundColor?: string
    faqLayout?: 'accordion' | 'grid'
  }
  translations: {
    title: string
    subtitle: string
    content?: string
    data?: {
      faqs?: FaqItem[]
    }
  }
  isMobile?: boolean
}

const props = defineProps<Props>()
const openItems = ref<number[]>([])

// Get FAQs from either settings or translations.data
const faqs = computed(() => {
  return props.settings?.faqs || props.translations?.data?.faqs || []
})

const backgroundColor = computed(() => {
  return props.settings?.backgroundColor || 'bg-gray-50 dark:bg-gray-900'
})

const textColor = computed(() => {
  return props.settings?.colors?.heading || 'text-gray-900 dark:text-white'
})

const padding = computed(() => {
  // Adjust padding for mobile
  if (props.isMobile) {
    return props.settings?.padding || '2rem 0'
  }
  return props.settings?.padding || '4rem 0'
})

// Force accordion layout on mobile for better UX
const faqLayout = computed(() => {
  if (props.isMobile) {
    return 'accordion'
  }
  return props.settings?.faqLayout || 'accordion'
})

const cardBackgroundColor = computed(() => {
  return props.settings?.cardBackgroundColor || 'bg-white dark:bg-gray-800'
})

const contentBackgroundColor = computed(() => {
  return props.settings?.contentBackgroundColor || 'bg-white dark:bg-gray-800'
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

const questionClasses = computed(() => {
  const defaultTypography = props.isMobile
    ? 'text-base font-medium'
    : 'text-lg font-medium'
    
  return [
    props.settings?.typography?.question || defaultTypography,
    props.settings?.colors?.question || 'text-gray-900 dark:text-gray-100',
  ].join(' ')
})

const answerClasses = computed(() => {
  return [
    props.settings?.typography?.answer || 'text-base',
    props.settings?.colors?.answer || 'text-gray-600 dark:text-gray-400',
  ].join(' ')
})

const toggleItem = (index: number) => {
  const position = openItems.value.indexOf(index)
  if (position === -1) {
    openItems.value.push(index)
  } else {
    openItems.value.splice(position, 1)
  }
}

const isItemOpen = (index: number) => {
  return openItems.value.includes(index)
}
</script>

<template>
  <section 
    class="w-full"
    :class="[backgroundColor, textColor]"
    :style="{ padding }"
  >
    <div class="container mx-auto px-4">
      <div class="text-center mb-10 md:mb-16">
        <h2 :class="headingClasses" class="mb-6 md:mb-8">{{ translations.title }}</h2>
        
        <div v-if="translations.subtitle">
          <p :class="subheadingClasses">
            {{ translations.subtitle }}
          </p>
        </div>
        
        <p v-if="translations.content" class="text-base md:text-lg max-w-3xl mx-auto mt-4">
          {{ translations.content }}
        </p>
      </div>
      
      <div class="max-w-3xl mx-auto">
        <!-- Accordion Layout -->
        <div v-if="faqLayout === 'accordion'" class="space-y-3 md:space-y-4">
          <div 
            v-for="(faq, index) in faqs" 
            :key="faq.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
            :class="cardBackgroundColor"
          >
            <button 
              class="w-full flex justify-between items-center p-3 md:p-4 text-left font-medium"
              :class="isItemOpen(index) ? contentBackgroundColor : ''"
              @click="toggleItem(index)"
            >
              <span :class="questionClasses" class="flex-1 pr-2">{{ faq.question }}</span>
              <span class="ml-2 md:ml-4 flex-shrink-0">
                <ChevronUp v-if="isItemOpen(index)" class="w-4 h-4 md:w-5 md:h-5" />
                <ChevronDown v-else class="w-4 h-4 md:w-5 md:h-5" />
              </span>
            </button>
            
            <div 
              v-if="isItemOpen(index)"
              class="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700"
              :class="contentBackgroundColor"
            >
              <p :class="answerClasses">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        
        <!-- Grid Layout -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div 
            v-for="(faq, index) in faqs" 
            :key="faq.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
            :class="cardBackgroundColor"
          >
            <h3 :class="questionClasses" class="mb-2 md:mb-3">{{ faq.question }}</h3>
            <p :class="answerClasses">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 767px) {
  /* Improve touch targets for mobile */
  button {
    min-height: 44px;
  }
  
  /* Ensure proper spacing */
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style> 