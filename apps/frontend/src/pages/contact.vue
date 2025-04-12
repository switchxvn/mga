<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTrpc } from '~/composables/useTrpc'
import { PageType } from '@ew/shared'
import { useI18n } from 'vue-i18n'

interface Translation {
  locale: string
  content: Record<string, any>
}

interface ThemeSection {
  pageType: PageType
  type: string
  title: string
  order: number
  isActive: boolean
  id: number
  settings: Record<string, any>
  themeId: number
  componentName?: string
  translations?: Translation[]
}

interface ThemeResponse {
  name: string
  sections: ThemeSection[]
  colors: {
    light: Record<string, any>
    dark: Record<string, any>
  }
  componentStyleConfigs: Record<string, any>[]
}

const trpc = useTrpc()
const { locale } = useI18n()

// Fetch contact data
const { data: contactData, pending, error, refresh } = useAsyncData<ThemeResponse>(
  'contact-data',
  async () => {
    try {
      const response = await trpc.theme.getActiveTheme.query({
        pageType: PageType.CONTACT_PAGE
      })
      return response as ThemeResponse
    } catch (err: any) {
      console.error('Error fetching contact data:', err)
      throw new Error(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau')
    }
  }
)

// Process sections
const sections = computed(() => {
  if (!contactData.value?.sections) return []
  
  return contactData.value.sections
    .filter((section: ThemeSection) => section.isActive)
    .sort((a: ThemeSection, b: ThemeSection) => a.order - b.order)
})

// Extract settings and translations
const settings = computed(() => {
  if (!contactData.value) return null
  
  const result = {
    showHero: false,
    showContactForm: false,
    showBranches: false,
    showFaq: false,
    showMap: false,
    showSocialMedia: false
  }
  
  sections.value.forEach((section: ThemeSection) => {
    switch (section.type) {
      case 'hero':
        result.showHero = true
        break
      case 'contact_form':
        result.showContactForm = true
        break
      case 'branch_contact':
        result.showBranches = true
        break
      case 'faq':
        result.showFaq = true
        break
      case 'map':
        result.showMap = true
        break
      case 'social_media':
        result.showSocialMedia = true
        break
    }
  })
  
  return result
})

const translations = computed(() => {
  if (!contactData.value) return {}
  
  const result: Record<string, any> = {}
  
  sections.value.forEach((section: ThemeSection) => {
    const translation = section.translations?.find(
      (t: Translation) => t.locale === locale.value
    )
    
    if (translation) {
      result[section.type] = translation.content
    }
  })
  
  return result
})

const branches = computed(() => {
  if (!contactData.value) return []
  
  const branchSection = sections.value.find(
    (section: ThemeSection) => section.type === 'branch_contact'
  )
  
  if (branchSection?.settings.branches) {
    return branchSection.settings.branches
  }
  
  return []
})

// Handle refresh button click
const handleRefresh = () => {
  refresh()
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Loading state -->
    <div v-if="pending" class="flex items-center justify-center min-h-[50vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4">{{ error.message }}</h2>
        <button
          @click="handleRefresh"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Thử lại
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Hero Section -->
      <ContactHeroSection
        v-if="settings?.showHero"
        :settings="contactData?.sections.find((s: ThemeSection) => s.type === 'hero')?.settings || {}"
        :translations="translations?.hero || {}"
      />

      <!-- Contact Form Section -->
      <ContactFormSection
        v-if="settings?.showContactForm"
        :settings="contactData?.sections.find((s: ThemeSection) => s.type === 'contact_form')?.settings || {}"
        :translations="translations?.contact_form || {}"
      />

      <!-- Branch Section -->
      <ContactBranchSection
        v-if="settings?.showBranches && branches.length"
        :settings="contactData?.sections.find((s: ThemeSection) => s.type === 'branch_contact')?.settings || {}"
        :translations="translations?.branch_contact || {}"
      />

      <!-- FAQ Section -->
      <ContactFaqSection
        v-if="settings?.showFaq"
        :settings="contactData?.sections.find((s: ThemeSection) => s.type === 'faq')?.settings || {}"
        :translations="translations?.faq || {}"
      />

      <!-- Map Section -->
      <ContactMapSection
        v-if="settings?.showMap"
        :settings="contactData?.sections.find((s: ThemeSection) => s.type === 'map')?.settings || {}"
        :translations="translations?.map || {}"
      />
    </div>
  </div>
</template> 