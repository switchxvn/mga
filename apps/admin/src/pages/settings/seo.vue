<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useAdminSettings } from '@/composables/useAdminSettings'
import { 
  Search, 
  ArrowLeft, 
  Globe, 
  FileText, 
  Eye, 
  BarChart3,
  Share2,
  Image as ImageIcon,
  Plus
} from 'lucide-vue-next'

const { t } = useI18n()
const { isSuperAdmin, hasPermission } = usePermissions()
const { 
  isLoading, 
  error, 
  getSettingsByGroup, 
  createSetting, 
  updateSettingByKey, 
  deleteSetting,
  clearError 
} = useAdminSettings()

// Provide page title for layout
provide('pageTitle', ref('SEO Settings'))

// Local state
const seoSettings = ref<any[]>([])
const isLoadingSettings = ref(false)
const showCreateModal = ref(false)
const showSeoManagement = ref(false)

// Form for creating new setting
const createForm = ref({
  key: '',
  value: '',
  description: '',
  is_public: false
})

// SEO settings template
const seoSettingsTemplate = [
  {
    category: 'Meta Tags',
    icon: FileText,
    settings: [
      { 
        key: 'meta_title', 
        label: 'Default Meta Title', 
        description: 'Default title tag for pages without specific titles', 
        type: 'text', 
        placeholder: 'My Awesome Website' 
      },
      { 
        key: 'meta_description', 
        label: 'Default Meta Description', 
        description: 'Default description for pages without specific descriptions', 
        type: 'textarea', 
        placeholder: 'A comprehensive description of your website...' 
      },
      { 
        key: 'meta_keywords', 
        label: 'Default Meta Keywords', 
        description: 'Default keywords for pages (comma-separated)', 
        type: 'text', 
        placeholder: 'keyword1, keyword2, keyword3' 
      },
      { 
        key: 'meta_author', 
        label: 'Author', 
        description: 'Website author information', 
        type: 'text', 
        placeholder: 'Your Company Name' 
      }
    ]
  },
  {
    category: 'Open Graph',
    icon: Share2,
    settings: [
      { 
        key: 'og_site_name', 
        label: 'Site Name', 
        description: 'Site name for Open Graph', 
        type: 'text', 
        placeholder: 'My Website' 
      },
      { 
        key: 'og_title', 
        label: 'Default OG Title', 
        description: 'Default Open Graph title', 
        type: 'text', 
        placeholder: 'Welcome to My Website' 
      },
      { 
        key: 'og_description', 
        label: 'Default OG Description', 
        description: 'Default Open Graph description', 
        type: 'textarea', 
        placeholder: 'A great description for social sharing...' 
      },
      { 
        key: 'og_image', 
        label: 'Default OG Image', 
        description: 'Default Open Graph image URL', 
        type: 'url', 
        placeholder: 'https://example.com/og-image.jpg' 
      },
      { 
        key: 'og_type', 
        label: 'OG Type', 
        description: 'Open Graph object type', 
        type: 'select', 
        options: [
          { value: 'website', label: 'Website' },
          { value: 'article', label: 'Article' },
          { value: 'product', label: 'Product' },
          { value: 'profile', label: 'Profile' }
        ]
      }
    ]
  },
  {
    category: 'Twitter Cards',
    icon: Share2,
    settings: [
      { 
        key: 'twitter_card', 
        label: 'Card Type', 
        description: 'Twitter card type', 
        type: 'select', 
        options: [
          { value: 'summary', label: 'Summary' },
          { value: 'summary_large_image', label: 'Summary Large Image' },
          { value: 'app', label: 'App' },
          { value: 'player', label: 'Player' }
        ]
      },
      { 
        key: 'twitter_site', 
        label: 'Twitter Site', 
        description: 'Twitter username for the website', 
        type: 'text', 
        placeholder: '@yourwebsite' 
      },
      { 
        key: 'twitter_creator', 
        label: 'Twitter Creator', 
        description: 'Twitter username for content creator', 
        type: 'text', 
        placeholder: '@yourcreator' 
      }
    ]
  },
  {
    category: 'Analytics & Tracking',
    icon: BarChart3,
    settings: [
      { 
        key: 'google_analytics_id', 
        label: 'Google Analytics ID', 
        description: 'Google Analytics 4 tracking ID (GA4)', 
        type: 'text', 
        placeholder: 'G-XXXXXXXXXX' 
      },
      { 
        key: 'google_tag_manager_id', 
        label: 'Google Tag Manager ID', 
        description: 'Google Tag Manager container ID', 
        type: 'text', 
        placeholder: 'GTM-XXXXXXX' 
      },
      { 
        key: 'google_ads_id', 
        label: 'Google Ads ID', 
        description: 'Google Ads conversion tracking ID', 
        type: 'text', 
        placeholder: 'AW-XXXXXXXXXX' 
      },
      { 
        key: 'google_ads_conversion_label', 
        label: 'Google Ads Conversion Label', 
        description: 'Default conversion label for Google Ads', 
        type: 'text', 
        placeholder: 'abcdefghijklmnop' 
      },
      { 
        key: 'google_ads_remarketing_enabled', 
        label: 'Enable Google Ads Remarketing', 
        description: 'Enable remarketing tags for Google Ads', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' }
        ]
      },
      { 
        key: 'facebook_pixel_id', 
        label: 'Facebook Pixel ID', 
        description: 'Facebook Pixel tracking ID', 
        type: 'text', 
        placeholder: 'XXXXXXXXXXXXXXX' 
      },
      { 
        key: 'microsoft_clarity_id', 
        label: 'Microsoft Clarity ID', 
        description: 'Microsoft Clarity tracking ID', 
        type: 'text', 
        placeholder: 'xxxxxxxxxx' 
      },
      { 
        key: 'google_site_verification', 
        label: 'Google Site Verification', 
        description: 'Google Search Console verification code', 
        type: 'text', 
        placeholder: 'verification-code-here' 
      }
    ]
  },
  {
    category: 'Google Ads & E-commerce',
    icon: BarChart3,
    settings: [
      { 
        key: 'google_ads_enhanced_conversions', 
        label: 'Enhanced Conversions', 
        description: 'Enable Google Ads enhanced conversions', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' }
        ]
      },
      { 
        key: 'google_ads_purchase_conversion_label', 
        label: 'Purchase Conversion Label', 
        description: 'Conversion label for purchase events', 
        type: 'text', 
        placeholder: 'purchase_conversion_label' 
      },
      { 
        key: 'google_ads_add_to_cart_conversion_label', 
        label: 'Add to Cart Conversion Label', 
        description: 'Conversion label for add to cart events', 
        type: 'text', 
        placeholder: 'add_to_cart_label' 
      },
      { 
        key: 'google_ads_begin_checkout_conversion_label', 
        label: 'Begin Checkout Conversion Label', 
        description: 'Conversion label for checkout start events', 
        type: 'text', 
        placeholder: 'begin_checkout_label' 
      },
      { 
        key: 'google_ads_currency', 
        label: 'Default Currency', 
        description: 'Default currency for conversion values', 
        type: 'select', 
        options: [
          { value: 'USD', label: 'US Dollar (USD)' },
          { value: 'VND', label: 'Vietnamese Dong (VND)' },
          { value: 'EUR', label: 'Euro (EUR)' },
          { value: 'GBP', label: 'British Pound (GBP)' }
        ]
      },
      { 
        key: 'google_ads_customer_match_enabled', 
        label: 'Customer Match', 
        description: 'Enable Google Ads customer match features', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' }
        ]
      }
    ]
  },
  {
    category: 'Sitemap & Robots',
    icon: Globe,
    settings: [
      { 
        key: 'robots_txt_content', 
        label: 'Robots.txt Content', 
        description: 'Content for robots.txt file', 
        type: 'textarea', 
        placeholder: 'User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml' 
      },
      { 
        key: 'sitemap_enabled', 
        label: 'Generate Sitemap', 
        description: 'Automatically generate XML sitemap', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' }
        ]
      },
      { 
        key: 'sitemap_frequency', 
        label: 'Sitemap Update Frequency', 
        description: 'How often to update the sitemap', 
        type: 'select', 
        options: [
          { value: 'always', label: 'Always' },
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
          { value: 'never', label: 'Never' }
        ]
      }
    ]
  }
]

// Get settings organized by category
const organizedSettings = computed(() => {
  return seoSettingsTemplate.map(category => ({
    ...category,
    settings: category.settings.map(template => {
      const existingSetting = seoSettings.value.find(s => s.key === template.key)
      return {
        ...template,
        value: existingSetting?.value || '',
        id: existingSetting?.id || null,
        exists: !!existingSetting
      }
    })
  }))
})

// Save state for feedback
const savingStates = ref<Record<string, boolean>>({})
const savedStates = ref<Record<string, boolean>>({})
const isSavingAll = ref(false)

// Save all settings
const saveAllSettings = async () => {
  try {
    isSavingAll.value = true
    
    // Get all current form values and save them
    const promises = organizedSettings.value.flatMap(category => 
      category.settings.map(async setting => {
        const input = document.querySelector(`input[data-setting-key="${setting.key}"], textarea[data-setting-key="${setting.key}"], select[data-setting-key="${setting.key}"]`) as HTMLInputElement
        if (input && input.value !== setting.value) {
          await saveSettingValue(setting.key, input.value, setting.description)
        }
      })
    )
    
    await Promise.all(promises)
    
  } catch (error) {
    console.error('Failed to save all settings:', error)
  } finally {
    isSavingAll.value = false
  }
}

// Create or update setting
const saveSettingValue = async (settingKey: string, value: string, description: string) => {
  try {
    savingStates.value[settingKey] = true
    savedStates.value[settingKey] = false
    
    const existingSetting = seoSettings.value.find(s => s.key === settingKey)
    
    if (existingSetting) {
      await updateSettingByKey(settingKey, value)
    } else {
      await createSetting({
        key: settingKey,
        value,
        group: 'seo',
        description,
        is_public: false
      })
    }
    
    await loadSeoSettings()
    
    // Show saved feedback
    savedStates.value[settingKey] = true
    setTimeout(() => {
      savedStates.value[settingKey] = false
    }, 2000)
    
  } catch (error) {
    console.error('Failed to save setting:', error)
  } finally {
    savingStates.value[settingKey] = false
  }
}

// Load SEO settings
const loadSeoSettings = async () => {
  try {
    isLoadingSettings.value = true
    const settings = await getSettingsByGroup('seo')
    seoSettings.value = settings || []
  } catch (error) {
    console.error('Failed to load SEO settings:', error)
  } finally {
    isLoadingSettings.value = false
  }
}

// Create new custom setting
const createCustomSetting = async () => {
  try {
    await createSetting({
      ...createForm.value,
      group: 'seo'
    })
    
    showCreateModal.value = false
    createForm.value = {
      key: '',
      value: '',
      description: '',
      is_public: false
    }
    
    await loadSeoSettings()
  } catch (error) {
    console.error('Failed to create setting:', error)
  }
}

// Delete setting
const deleteSetting_ = async (settingId: number) => {
  if (confirm('Are you sure you want to delete this setting?')) {
    try {
      await deleteSetting(settingId)
      await loadSeoSettings()
    } catch (error) {
      console.error('Failed to delete setting:', error)
    }
  }
}

// Permission checks
const canEdit = computed(() => isSuperAdmin.value || hasPermission('MANAGE_SEO'))

onMounted(async () => {
  if (!canEdit.value) {
    navigateTo('/settings')
    return
  }
  
  await loadSeoSettings()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <UButton 
            to="/settings" 
            variant="ghost" 
            icon="i-lucide-arrow-left"
            size="sm"
          >
            Back
          </UButton>
          <Search class="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('settings.seo.title', 'SEO Settings') }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t('settings.seo.description', 'Configure search engine optimization and metadata') }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <UButton 
            @click="saveAllSettings"
            color="green"
            icon="i-lucide-save"
            :loading="isSavingAll"
          >
            {{ t('settings.save_all', 'Save All') }}
          </UButton>
          
          <UButton 
            @click="showCreateModal = true"
            color="purple"
            icon="i-lucide-plus"
          >
            {{ t('settings.add_custom', 'Add Custom Setting') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <UAlert 
      v-if="error" 
      color="red" 
      variant="soft" 
      :title="t('common.error', 'Error')"
      :description="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
      @close="clearError"
    />

    <!-- Loading State -->
    <div v-if="isLoadingSettings" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-purple-600" />
        <span class="ml-2 text-gray-600 dark:text-gray-400">
          {{ t('common.loading', 'Loading settings...') }}
        </span>
      </div>
    </div>

    <!-- Settings Categories -->
    <div v-else class="space-y-6">
      <div 
        v-for="category in organizedSettings" 
        :key="category.category"
        class="bg-white dark:bg-gray-800 shadow rounded-lg"
      >
        <!-- Category Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <component :is="category.icon" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ category.category }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Settings List -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div 
            v-for="setting in category.settings" 
            :key="setting.key"
            class="p-6"
          >
            <div class="flex items-start justify-between">
              <!-- Setting Info -->
              <div class="flex-1 min-w-0 mr-4">
                <div class="flex items-center space-x-2 mb-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ setting.label }}
                  </h4>
                  <UBadge 
                    v-if="!setting.exists"
                    color="orange"
                    variant="soft"
                    size="xs"
                  >
                    Not Set
                  </UBadge>
                  
                  <!-- Saving/Saved indicators -->
                  <UBadge 
                    v-if="savingStates[setting.key]"
                    color="blue"
                    variant="soft"
                    size="xs"
                  >
                    <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin mr-1" />
                    Saving...
                  </UBadge>
                  
                  <UBadge 
                    v-else-if="savedStates[setting.key]"
                    color="green"
                    variant="soft"
                    size="xs"
                  >
                    <UIcon name="i-lucide-check" class="h-3 w-3 mr-1" />
                    Saved
                  </UBadge>
                </div>
                
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {{ setting.description }}
                </p>

                <!-- Input Field -->
                <div class="max-w-xl">
                  <!-- Text/Email/URL/Tel Input -->
                  <UInput
                    v-if="['text', 'email', 'url', 'tel'].includes(setting.type)"
                    :model-value="setting.value"
                    :type="setting.type"
                    :placeholder="setting.placeholder"
                    :data-setting-key="setting.key"
                    @blur="(e) => saveSettingValue(setting.key, e.target.value, setting.description)"
                  />
                  
                  <!-- Textarea -->
                  <UTextarea
                    v-else-if="setting.type === 'textarea'"
                    :model-value="setting.value"
                    :placeholder="setting.placeholder"
                    :rows="4"
                    :data-setting-key="setting.key"
                    @blur="(e) => saveSettingValue(setting.key, e.target.value, setting.description)"
                  />
                  
                  <!-- Select -->
                  <USelect
                    v-else-if="setting.type === 'select'"
                    :model-value="setting.value"
                    :options="setting.options"
                    option-attribute="label"
                    value-attribute="value"
                    :data-setting-key="setting.key"
                    @update:model-value="(value) => saveSettingValue(setting.key, value, setting.description)"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div v-if="setting.exists && canEdit" class="flex items-center space-x-2">
                <UButton 
                  size="xs"
                  color="red"
                  variant="soft"
                  icon="i-lucide-trash-2"
                  @click="deleteSetting_(setting.id)"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Settings -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Custom SEO Settings
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Additional custom SEO settings
          </p>
        </div>

        <div class="p-6">
          <!-- Custom settings from database that aren't in template -->
          <template v-if="seoSettings.filter(s => !seoSettingsTemplate.some(cat => cat.settings.some(template => template.key === s.key))).length > 0">
            <div class="space-y-4">
              <div 
                v-for="setting in seoSettings.filter(s => !seoSettingsTemplate.some(cat => cat.settings.some(template => template.key === s.key)))" 
                :key="setting.id"
                class="flex items-start justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div class="flex-1 min-w-0 mr-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {{ setting.key }}
                  </h4>
                  <p v-if="setting.description" class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {{ setting.description }}
                  </p>
                  
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    <span class="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                      {{ setting.value }}
                    </span>
                  </div>
                </div>

                <div v-if="canEdit" class="flex items-center space-x-2">
                  <UButton 
                    size="xs"
                    color="red"
                    variant="soft"
                    icon="i-lucide-trash-2"
                    @click="deleteSetting_(setting.id)"
                  >
                    Delete
                  </UButton>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            <Search class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No custom SEO settings found</p>
            <p class="text-xs">Click "Add Custom Setting" to create one</p>
          </div>
        </div>
      </div>

      <!-- SEO Tips -->
      <div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-lg p-6">
        <div class="flex items-start space-x-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Eye class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              SEO & Tracking Best Practices
            </h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Keep meta titles under 60 characters</li>
              <li>• Write meta descriptions between 150-160 characters</li>
              <li>• Use unique titles and descriptions for each page</li>
              <li>• Include target keywords naturally</li>
              <li>• Ensure Open Graph images are 1200x630 pixels</li>
              <li>• Test your pages with Google's Rich Results Test</li>
              <li>• Google Analytics 4 IDs start with "G-" (e.g. G-XXXXXXXXXX)</li>
              <li>• Google Ads IDs start with "AW-" (e.g. AW-XXXXXXXXXX)</li>
              <li>• Google Tag Manager IDs start with "GTM-" (e.g. GTM-XXXXXXX)</li>
              <li>• Test tracking with Google Tag Assistant or similar tools</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Google Ads Setup Instructions -->
      <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg p-6">
        <div class="flex items-start space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <BarChart3 class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Google Ads Setup Instructions
            </h3>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>1. Google Tag Manager (Recommended):</strong></p>
              <ul class="ml-4 space-y-1">
                <li>• Create a GTM container and add the GTM ID above</li>
                <li>• Configure Google Ads conversion tracking in GTM</li>
                <li>• Set up enhanced conversions in GTM</li>
              </ul>
              
              <p><strong>2. Direct Google Ads Integration:</strong></p>
              <ul class="ml-4 space-y-1">
                <li>• Add your Google Ads ID (AW-XXXXXXXXXX)</li>
                <li>• Configure conversion labels for different actions</li>
                <li>• Enable enhanced conversions for better tracking</li>
              </ul>
              
              <p><strong>3. E-commerce Tracking:</strong></p>
              <ul class="ml-4 space-y-1">
                <li>• Set purchase conversion label for completed orders</li>
                <li>• Set add-to-cart label for shopping behavior</li>
                <li>• Configure begin checkout label for checkout starts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO Page Management Section -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Page-Specific SEO Management
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage SEO settings for individual pages and routes
            </p>
          </div>
          <UButton 
            @click="showSeoManagement = !showSeoManagement"
            :color="showSeoManagement ? 'red' : 'green'"
            :icon="showSeoManagement ? 'i-lucide-x' : 'i-lucide-settings'"
          >
            {{ showSeoManagement ? 'Close' : 'Manage Pages' }}
          </UButton>
        </div>
      </div>

      <!-- SEO Management Interface -->
      <div v-if="showSeoManagement" class="p-6">
        <SeoManagement />
      </div>
    </div>

    <!-- Create Custom Setting Modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ t('settings.create_custom_seo', 'Create Custom SEO Setting') }}
          </h3>
        </template>

        <form @submit.prevent="createCustomSetting" class="space-y-4">
          <UFormGroup label="Setting Key" required>
            <UInput
              v-model="createForm.key"
              placeholder="custom_seo_setting_key"
              required
            />
            <template #help>
              <span class="text-xs text-gray-500">Use lowercase letters, numbers, and underscores only</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Value" required>
            <UTextarea
              v-model="createForm.value"
              placeholder="Setting value"
              required
            />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="createForm.description"
              placeholder="Description of this SEO setting"
            />
          </UFormGroup>

          <UFormGroup>
            <UCheckbox
              v-model="createForm.is_public"
              label="Make this setting publicly accessible"
            />
          </UFormGroup>
        </form>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton 
              variant="outline" 
              @click="showCreateModal = false"
            >
              {{ t('common.cancel', 'Cancel') }}
            </UButton>
            <UButton 
              color="purple"
              :loading="isLoading"
              @click="createCustomSetting"
            >
              {{ t('common.create', 'Create') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 