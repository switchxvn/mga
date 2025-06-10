<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useAdminSettings } from '@/composables/useAdminSettings'
import { 
  Languages, 
  ArrowLeft, 
  Globe2, 
  Type, 
  Calendar,
  DollarSign,
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
provide('pageTitle', ref('Language Settings'))

// Local state
const languageSettings = ref<any[]>([])
const isLoadingSettings = ref(false)
const showCreateModal = ref(false)

// Form for creating new setting
const createForm = ref({
  key: '',
  value: '',
  description: '',
  is_public: false
})

// Language settings template
const languageSettingsTemplate = [
  {
    category: 'Supported Languages',
    icon: Languages,
    settings: [
      { 
        key: 'default_language', 
        label: 'Default Language', 
        description: 'Primary language for the application', 
        type: 'select', 
        options: [
          { value: 'en', label: 'English' },
          { value: 'vi', label: 'Tiếng Việt' },
          { value: 'fr', label: 'Français' },
          { value: 'es', label: 'Español' },
          { value: 'de', label: 'Deutsch' },
          { value: 'ja', label: '日本語' },
          { value: 'ko', label: '한국어' },
          { value: 'zh', label: '中文' }
        ]
      },
      { 
        key: 'available_languages', 
        label: 'Available Languages', 
        description: 'Comma-separated list of available language codes', 
        type: 'text', 
        placeholder: 'en,vi,fr,es' 
      },
      { 
        key: 'fallback_language', 
        label: 'Fallback Language', 
        description: 'Language to use when translation is missing', 
        type: 'select', 
        options: [
          { value: 'en', label: 'English' },
          { value: 'vi', label: 'Tiếng Việt' }
        ]
      },
      { 
        key: 'auto_detect_language', 
        label: 'Auto-detect Language', 
        description: 'Automatically detect user language from browser', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' }
        ]
      }
    ]
  },
  {
    category: 'Regional Settings',
    icon: Globe2,
    settings: [
      { 
        key: 'default_timezone', 
        label: 'Default Timezone', 
        description: 'Default timezone for the application', 
        type: 'select', 
        options: [
          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
          { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (UTC+7)' },
          { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
          { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
          { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
          { value: 'Europe/London', label: 'London (UTC+0)' },
          { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
          { value: 'America/New_York', label: 'New York (UTC-5)' },
          { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' }
        ]
      },
      { 
        key: 'user_timezone_detection', 
        label: 'User Timezone Detection', 
        description: 'Allow users to set their own timezone', 
        type: 'select', 
        options: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' }
        ]
      }
    ]
  },
  {
    category: 'Date & Time Formats',
    icon: Calendar,
    settings: [
      { 
        key: 'date_format', 
        label: 'Date Format', 
        description: 'Default date display format', 
        type: 'select', 
        options: [
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' },
          { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2023)' },
          { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2023)' },
          { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2023)' }
        ]
      },
      { 
        key: 'time_format', 
        label: 'Time Format', 
        description: 'Default time display format', 
        type: 'select', 
        options: [
          { value: '24h', label: '24-hour (23:59)' },
          { value: '12h', label: '12-hour (11:59 PM)' }
        ]
      },
      { 
        key: 'week_start_day', 
        label: 'Week Start Day', 
        description: 'First day of the week', 
        type: 'select', 
        options: [
          { value: '0', label: 'Sunday' },
          { value: '1', label: 'Monday' },
          { value: '6', label: 'Saturday' }
        ]
      }
    ]
  },
  {
    category: 'Number & Currency Formats',
    icon: DollarSign,
    settings: [
      { 
        key: 'number_format', 
        label: 'Number Format', 
        description: 'Number formatting style', 
        type: 'select', 
        options: [
          { value: 'en-US', label: 'English (1,234.56)' },
          { value: 'vi-VN', label: 'Vietnamese (1.234,56)' },
          { value: 'fr-FR', label: 'French (1 234,56)' },
          { value: 'de-DE', label: 'German (1.234,56)' }
        ]
      },
      { 
        key: 'currency_format', 
        label: 'Currency Format', 
        description: 'Currency display format', 
        type: 'select', 
        options: [
          { value: 'symbol', label: 'Symbol ($100)' },
          { value: 'code', label: 'Code (100 USD)' },
          { value: 'name', label: 'Name (100 US Dollars)' }
        ]
      },
      { 
        key: 'default_currency', 
        label: 'Default Currency', 
        description: 'Default currency for the application', 
        type: 'select', 
        options: [
          { value: 'USD', label: 'US Dollar (USD)' },
          { value: 'VND', label: 'Vietnamese Dong (VND)' },
          { value: 'EUR', label: 'Euro (EUR)' },
          { value: 'GBP', label: 'British Pound (GBP)' },
          { value: 'JPY', label: 'Japanese Yen (JPY)' },
          { value: 'CNY', label: 'Chinese Yuan (CNY)' }
        ]
      },
      { 
        key: 'currency_placement', 
        label: 'Currency Symbol Placement', 
        description: 'Where to place currency symbol', 
        type: 'select', 
        options: [
          { value: 'before', label: 'Before ($100)' },
          { value: 'after', label: 'After (100$)' },
          { value: 'before_space', label: 'Before with space ($ 100)' },
          { value: 'after_space', label: 'After with space (100 $)' }
        ]
      }
    ]
  },
  {
    category: 'Text & Typography',
    icon: Type,
    settings: [
      { 
        key: 'text_direction', 
        label: 'Text Direction', 
        description: 'Default text direction', 
        type: 'select', 
        options: [
          { value: 'ltr', label: 'Left to Right (LTR)' },
          { value: 'rtl', label: 'Right to Left (RTL)' }
        ]
      },
      { 
        key: 'character_encoding', 
        label: 'Character Encoding', 
        description: 'Character encoding for the application', 
        type: 'select', 
        options: [
          { value: 'UTF-8', label: 'UTF-8' },
          { value: 'UTF-16', label: 'UTF-16' },
          { value: 'ISO-8859-1', label: 'ISO-8859-1' }
        ]
      },
      { 
        key: 'language_switch_style', 
        label: 'Language Switcher Style', 
        description: 'How to display language switcher', 
        type: 'select', 
        options: [
          { value: 'dropdown', label: 'Dropdown Menu' },
          { value: 'flags', label: 'Flag Icons' },
          { value: 'codes', label: 'Language Codes' },
          { value: 'names', label: 'Language Names' }
        ]
      }
    ]
  }
]

// Get settings organized by category
const organizedSettings = computed(() => {
  return languageSettingsTemplate.map(category => ({
    ...category,
    settings: category.settings.map(template => {
      const existingSetting = languageSettings.value.find(s => s.key === template.key)
      return {
        ...template,
        value: existingSetting?.value || '',
        id: existingSetting?.id || null,
        exists: !!existingSetting
      }
    })
  }))
})

// Create or update setting
const saveSettingValue = async (settingKey: string, value: string, description: string) => {
  try {
    const existingSetting = languageSettings.value.find(s => s.key === settingKey)
    
    if (existingSetting) {
      await updateSettingByKey(settingKey, value)
    } else {
      await createSetting({
        key: settingKey,
        value,
        group: 'language',
        description,
        is_public: true // Most language settings should be public
      })
    }
    
    await loadLanguageSettings()
  } catch (error) {
    console.error('Failed to save setting:', error)
  }
}

// Load language settings
const loadLanguageSettings = async () => {
  try {
    isLoadingSettings.value = true
    const settings = await getSettingsByGroup('language')
    languageSettings.value = settings || []
  } catch (error) {
    console.error('Failed to load language settings:', error)
  } finally {
    isLoadingSettings.value = false
  }
}

// Create new custom setting
const createCustomSetting = async () => {
  try {
    await createSetting({
      ...createForm.value,
      group: 'language'
    })
    
    showCreateModal.value = false
    createForm.value = {
      key: '',
      value: '',
      description: '',
      is_public: false
    }
    
    await loadLanguageSettings()
  } catch (error) {
    console.error('Failed to create setting:', error)
  }
}

// Delete setting
const deleteSetting_ = async (settingId: number) => {
  if (confirm('Are you sure you want to delete this setting?')) {
    try {
      await deleteSetting(settingId)
      await loadLanguageSettings()
    } catch (error) {
      console.error('Failed to delete setting:', error)
    }
  }
}

// Permission checks
const canEdit = computed(() => isSuperAdmin.value || hasPermission('MANAGE_LOCALES'))

onMounted(async () => {
  if (!canEdit.value) {
    navigateTo('/settings')
    return
  }
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
          <Languages class="h-8 w-8 text-green-600 dark:text-green-400" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('settings.language.title', 'Language & Localization') }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t('settings.language.description', 'Configure languages, regions, and formatting') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Coming Soon -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
      <Languages class="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Language Settings
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Language and localization settings will be available soon. This will include options for managing multiple languages, date formats, and regional preferences.
      </p>
    </div>
  </div>
</template> 