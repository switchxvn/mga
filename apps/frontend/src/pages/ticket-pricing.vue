<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTrpc } from '~/composables/useTrpc'
import { useI18n } from 'vue-i18n'
import { defineAsyncComponent, markRaw } from 'vue'
import type { Component } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import { useTheme } from '~/composables/useTheme'
import { PageType } from '@ew/shared'

// Define component types
type ComponentType = Component
type ComponentRegistry = Record<string, ComponentType>

// Register components using defineAsyncComponent
const registeredComponents = {
  'TicketPricingHeroSection': defineAsyncComponent(() => import("../components/sections/ticket-pricing/TicketPricingHeroSection.vue")),
  'TicketPricingTableSection': defineAsyncComponent(() => import("../components/sections/ticket-pricing/TicketPricingTableSection.vue")),
  'TicketPricingBenefitsSection': defineAsyncComponent(() => import("../components/sections/ticket-pricing/TicketPricingBenefitsSection.vue")),
  'TicketPricingFaqSection': defineAsyncComponent(() => import("../components/sections/ticket-pricing/TicketPricingFaqSection.vue")),
  'TicketPricingCtaSection': defineAsyncComponent(() => import("../components/sections/ticket-pricing/TicketPricingCtaSection.vue")),
} as ComponentRegistry

// Setup responsive breakpoints
const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
})

const isMobile = breakpoints.smaller('md')

// Resolve component function
const resolveComponent = (section: any): ComponentType | null => {
  if (!section?.type && !section?.componentName) {
    console.warn('Invalid section configuration')
    return null
  }

  // First try componentName if specified
  if (section.componentName && registeredComponents[section.componentName]) {
    return markRaw(registeredComponents[section.componentName])
  }

  // Then try type mapping
  const typeToComponentName: Record<string, keyof typeof registeredComponents> = {
    'hero': 'TicketPricingHeroSection',
    'pricing_table': 'TicketPricingTableSection',
    'benefits': 'TicketPricingBenefitsSection',
    'faq': 'TicketPricingFaqSection',
    'cta': 'TicketPricingCtaSection'
  }

  const componentName = typeToComponentName[section.type]
  if (componentName && registeredComponents[componentName]) {
    return markRaw(registeredComponents[componentName])
  }

  console.warn(`No component found for section type: ${section.type}`)
  return null
}

const trpc = useTrpc()
const { locale } = useI18n()
const { getActiveTheme, getPageSections } = useTheme()

// State management
const sections = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const themeId = ref<number | null>(null)

// Helper function to get translation by locale
const getTranslation = (translations: any[] | undefined, fallback: any) => {
  if (!translations || !Array.isArray(translations) || translations.length === 0) return fallback
  const translation = translations.find(t => t?.locale === locale.value)
  return translation || translations.find(t => t?.locale === 'en') || fallback
}

// Computed properties for translated content
const translatedSections = computed(() => {
  if (!sections.value) return []
  
  return sections.value.map(section => {
    if (!section) return null
    const translation = getTranslation(section.translations, {})
    
    // Add mobile-specific settings for each section type
    let mobileSettings = {}
    
    if (isMobile.value) {
      // Add mobile-specific settings based on section type
      if (section.type === 'pricing_table') {
        mobileSettings = {
          mobileView: true,
          compactLayout: true
        }
      }
    }
    
    // Lấy dữ liệu từ translation settings
    const translationSettings = translation?.settings || {}
    
    // Cấu trúc dữ liệu cho phù hợp với component
    const translatedSection = {
      ...section,
      title: translation?.title || section.title,
      subtitle: translation?.settings?.subtitle || '',
      content: translation?.settings?.content || translation?.description || '',
      settings: {
        ...(section.settings || {}),
        ...(translationSettings || {}),
        ...mobileSettings
      }
    }
    
    return translatedSection
  }).filter(Boolean)
})

// Fetch data using tRPC and Theme services
const fetchData = async () => {
  try {
    console.log('Fetching ticket pricing sections with locale:', locale.value)
    isLoading.value = true
    error.value = null

    // Tìm active theme trước
    const theme = await getActiveTheme()
    if (!theme) {
      error.value = 'No active theme found'
      return
    }

    themeId.value = theme.id

    // Lấy các section cho ticket pricing page
    const pageSections = await getPageSections(
      theme.id, 
      PageType.TICKET_PRICING_PAGE, 
      locale.value
    )

    if (!pageSections || pageSections.length === 0) {
      error.value = 'No active ticket pricing sections found'
      return
    }

    sections.value = pageSections

  } catch (e) {
    console.error('Error fetching ticket pricing sections:', e)
    error.value = 'Failed to load ticket pricing sections'
  } finally {
    isLoading.value = false
  }
}

// Watch for locale changes and refetch data
watch(locale, () => {
  fetchData()
})

// Initial fetch
fetchData()
</script>

<template>
  <div class="ticket-pricing w-full bg-gray-50">
    <div v-if="isLoading" class="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[200px]">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"
      ></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>

    <div v-else-if="error" class="container mx-auto py-8 px-4">
      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p class="text-red-600 dark:text-red-400 text-sm md:text-base">{{ error }}</p>
      </div>
    </div>

    <template v-else>
      <template v-for="(section, index) in translatedSections" :key="index">
        <ClientOnly>
          <component
            v-if="section.isActive"
            :is="resolveComponent(section)"
            :settings="section.settings"
            :translations="{
              title: section.title,
              subtitle: section.subtitle,
              content: section.content,
              benefits: section.settings?.benefits || [],
              tiers: section.settings?.tiers || [],
              faqs: section.settings?.faqs || []
            }"
            :is-mobile="isMobile"
          />
          <template #fallback>
            <div class="p-4 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </template>
        </ClientOnly>
      </template>
    </template>
  </div>
</template>

<style scoped>
/* Mobile-specific styles */
@media (max-width: 767px) {
  .ticket-pricing {
    overflow-x: hidden;
  }
}
</style> 