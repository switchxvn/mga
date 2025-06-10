<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useAdminSettings } from '@/composables/useAdminSettings'
import { 
  Settings, 
  Globe, 
  Shield, 
  Mail, 
  Languages, 
  Search as SearchIcon,
  Database,
  Palette,
  Bell,
  Users,
  Key,
  Monitor,
  Zap
} from 'lucide-vue-next'

const { t } = useI18n()
const { isSuperAdmin, hasPermission } = usePermissions()
const { availableGroups, fetchAllSettings } = useAdminSettings()

// Provide page title for layout
provide('pageTitle', ref('Settings'))

// Settings categories
const settingsCategories = ref([
  {
    title: 'General Settings',
    description: 'Basic site configuration and general preferences',
    icon: Settings,
    color: 'blue',
    route: '/settings/general',
    group: 'general',
    permission: 'MANAGE_SETTINGS',
    features: ['Site Name', 'Logo', 'Contact Info', 'Default Language'],
    count: 0
  },
  {
    title: 'Language & Localization',
    description: 'Manage supported languages and translations',
    icon: Languages,
    color: 'green',
    route: '/settings/language',
    group: 'language',
    permission: 'MANAGE_LOCALES',
    features: ['Supported Languages', 'Default Locale', 'Date Formats', 'Number Formats'],
    count: 0
  },
  {
    title: 'SEO & Meta',
    description: 'Search engine optimization and metadata settings',
    icon: SearchIcon,
    color: 'purple',
    route: '/settings/seo',
    group: 'seo',
    permission: 'MANAGE_SEO',
    features: ['Meta Tags', 'Open Graph', 'Sitemap', 'Analytics'],
    count: 0
  },
  {
    title: 'Email & Notifications',
    description: 'SMTP configuration and notification preferences',
    icon: Mail,
    color: 'orange',
    route: '/settings/email',
    group: 'email',
    permission: 'MANAGE_EMAIL',
    features: ['SMTP Settings', 'Email Templates', 'Notification Rules', 'Delivery Status'],
    count: 0
  },
  {
    title: 'Security & Authentication',
    description: 'Security policies and authentication settings',
    icon: Shield,
    color: 'red',
    route: '/settings/security',
    group: 'security',
    permission: 'MANAGE_AUTH',
    features: ['Password Policy', 'Two-Factor Auth', 'Session Management', 'API Keys'],
    count: 0
  },
  {
    title: 'Theme & Appearance',
    description: 'Customize site appearance and branding',
    icon: Palette,
    color: 'pink',
    route: '/settings/theme',
    group: 'theme',
    permission: 'MANAGE_THEME',
    features: ['Color Scheme', 'Typography', 'Layout Options', 'Custom CSS'],
    count: 0
  },
  {
    title: 'User Management',
    description: 'User registration and profile settings',
    icon: Users,
    color: 'indigo',
    route: '/settings/users',
    group: 'user',
    permission: 'MANAGE_USERS',
    features: ['Registration Rules', 'Profile Fields', 'User Roles', 'Permissions'],
    count: 0
  },
  {
    title: 'System & Performance',
    description: 'System configuration and performance optimization',
    icon: Monitor,
    color: 'gray',
    route: '/settings/system',
    group: 'system',
    permission: 'MANAGE_SYSTEM',
    features: ['Cache Settings', 'Database Config', 'Log Management', 'Backup'],
    count: 0
  },
  {
    title: 'API & Integrations',
    description: 'Third-party integrations and API management',
    icon: Key,
    color: 'cyan',
    route: '/settings/api',
    group: 'api',
    permission: 'MANAGE_API',
    features: ['API Keys', 'Webhooks', 'External Services', 'Rate Limiting'],
    count: 0
  },
  {
    title: 'Advanced Settings',
    description: 'Advanced configuration and developer options',
    icon: Zap,
    color: 'yellow',
    route: '/settings/advanced',
    group: 'advanced',
    permission: 'MANAGE_ADVANCED',
    features: ['Debug Mode', 'Feature Flags', 'Custom Fields', 'Scripts'],
    count: 0
  }
])

// Filter categories based on permissions
const accessibleCategories = computed(() => {
  return settingsCategories.value.filter(category => {
    if (isSuperAdmin.value) return true
    return hasPermission(category.permission)
  })
})

// Search functionality
const searchQuery = ref('')
const filteredCategories = computed(() => {
  if (!searchQuery.value) return accessibleCategories.value
  
  const query = searchQuery.value.toLowerCase()
  return accessibleCategories.value.filter(category => 
    category.title.toLowerCase().includes(query) ||
    category.description.toLowerCase().includes(query) ||
    category.features.some(feature => feature.toLowerCase().includes(query))
  )
})

// Color variants for badges
const getColorVariant = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'blue',
    green: 'green', 
    purple: 'purple',
    orange: 'orange',
    red: 'red',
    pink: 'pink',
    indigo: 'indigo',
    gray: 'gray',
    cyan: 'cyan',
    yellow: 'yellow'
  }
  return colorMap[color] || 'gray'
}

// Update counts when available groups change
const updateCategoryCounts = () => {
  settingsCategories.value.forEach(category => {
    // This is a placeholder - you might want to fetch actual counts from API
    category.count = Math.floor(Math.random() * 10) + 1
  })
}

onMounted(async () => {
  // Check permissions
  if (!isSuperAdmin.value && !hasPermission('ACCESS_ADMIN_SETTINGS')) {
    navigateTo('/')
    return
  }
  
  await fetchAllSettings()
  updateCategoryCounts()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Settings class="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('settings.title', 'Settings') }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t('settings.description', 'Manage your system configuration and preferences') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="max-w-md">
        <UInput
          v-model="searchQuery"
          placeholder="Search settings categories..."
          icon="i-lucide-search"
          size="lg"
        />
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-for="category in filteredCategories" :key="category.title">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg hover:shadow-xl transition-all duration-200 group cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-700">
          <NuxtLink :to="category.route" class="block p-6 h-full no-underline">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div :class="`p-3 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/20 group-hover:scale-110 transition-transform`">
                  <component :is="category.icon" :class="`h-6 w-6 text-${category.color}-600 dark:text-${category.color}-400`" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {{ category.title }}
                  </h3>
                </div>
              </div>
              
              <UBadge 
                :color="getColorVariant(category.color)"
                variant="soft" 
                size="sm"
              >
                {{ category.count }} settings
              </UBadge>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {{ category.description }}
            </p>

            <!-- Features List -->
            <div class="space-y-2 mb-4">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(feature, index) in category.features.slice(0, 3)" 
                  :key="index"
                  class="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {{ feature }}
                </span>
                <span 
                  v-if="category.features.length > 3"
                  class="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded"
                >
                  +{{ category.features.length - 3 }} more
                </span>
              </div>
            </div>

            <!-- Action -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('settings.manage_category', 'Manage settings') }}
              </span>
              <div class="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>

    <!-- No Results -->
    <div 
      v-if="filteredCategories.length === 0 && searchQuery"
      class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center"
    >
      <SearchIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('settings.no_results', 'No Settings Found') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {{ t('settings.no_results_message', 'No settings categories match your search. Try a different keyword.') }}
      </p>
      <UButton 
        variant="outline" 
        class="mt-4"
        @click="searchQuery = ''"
      >
        {{ t('common.clear_search', 'Clear Search') }}
      </UButton>
    </div>

    <!-- No Access Message -->
    <div 
      v-if="accessibleCategories.length === 0 && !searchQuery"
      class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center"
    >
      <Shield class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('settings.access_denied', 'Access Denied') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {{ t('settings.access_denied_message', 'You don\'t have sufficient permissions to access the settings. Contact your administrator for access.') }}
      </p>
      <UButton 
        to="/" 
        variant="outline" 
        class="mt-4"
      >
        {{ t('common.back_to_dashboard', 'Back to Dashboard') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-underline {
  text-decoration: none !important;
}

.no-underline:hover {
  text-decoration: none !important;
}

a {
  text-decoration: none !important;
}

a:hover {
  text-decoration: none !important;
}
</style> 