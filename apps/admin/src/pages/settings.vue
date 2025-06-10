<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { Settings, Database, Users, Globe, Shield, Bell } from 'lucide-vue-next'

const { t } = useI18n()
const { isSuperAdmin, hasPermission } = usePermissions()

// Provide page title for layout
provide('pageTitle', ref('Settings'))

// Settings sections
const settingsSections = ref([
  {
    title: 'System Settings',
    description: 'Core system configuration and preferences',
    icon: Settings,
    items: [
      { label: 'General Settings', description: 'Basic site configuration', permission: 'MANAGE_SETTINGS' },
      { label: 'Theme Configuration', description: 'Customize appearance and branding', permission: 'MANAGE_THEME' },
      { label: 'Language Settings', description: 'Manage supported languages', permission: 'MANAGE_LOCALES' }
    ]
  },
  {
    title: 'User Management',
    description: 'Manage users, roles and permissions',
    icon: Users,
    items: [
      { label: 'User Settings', description: 'Configure user registration and profiles', permission: 'MANAGE_USERS' },
      { label: 'Role Management', description: 'Define roles and permissions', permission: 'MANAGE_ROLES' },
      { label: 'Access Control', description: 'Configure access permissions', permission: 'MANAGE_PERMISSIONS' }
    ]
  },
  {
    title: 'Content Management',
    description: 'Configure content settings and policies',
    icon: Globe,
    items: [
      { label: 'SEO Settings', description: 'Search engine optimization', permission: 'MANAGE_SEO' },
      { label: 'Media Settings', description: 'File upload and media configuration', permission: 'MANAGE_MEDIA' },
      { label: 'Content Policies', description: 'Define content guidelines', permission: 'MANAGE_CONTENT' }
    ]
  },
  {
    title: 'Security',
    description: 'Security and authentication settings',
    icon: Shield,
    items: [
      { label: 'Authentication', description: 'Login and security policies', permission: 'MANAGE_AUTH' },
      { label: 'API Settings', description: 'API keys and integrations', permission: 'MANAGE_API' },
      { label: 'Backup Settings', description: 'Data backup configuration', permission: 'MANAGE_BACKUP' }
    ]
  },
  {
    title: 'Notifications',
    description: 'Email and notification preferences',
    icon: Bell,
    items: [
      { label: 'Email Settings', description: 'SMTP and email configuration', permission: 'MANAGE_EMAIL' },
      { label: 'Push Notifications', description: 'Configure push notifications', permission: 'MANAGE_NOTIFICATIONS' },
      { label: 'Alert Settings', description: 'System alerts and warnings', permission: 'MANAGE_ALERTS' }
    ]
  },
  {
    title: 'Database & Performance',
    description: 'Database and performance optimization',
    icon: Database,
    items: [
      { label: 'Database Settings', description: 'Database configuration and maintenance', permission: 'MANAGE_DATABASE' },
      { label: 'Cache Settings', description: 'Caching and performance', permission: 'MANAGE_CACHE' },
      { label: 'Log Management', description: 'System logs and monitoring', permission: 'MANAGE_LOGS' }
    ]
  }
])

// Check if user can see any settings in a section
const canViewSection = (section: any) => {
  // SUPER_ADMIN can access all sections
  if (isSuperAdmin.value) return true
  // Regular users need specific permissions
  return section.items.some((item: any) => hasPermission(item.permission))
}

// Check if user can access specific setting
const canAccessSetting = (permission: string) => {
  // SUPER_ADMIN bypasses all permission checks
  if (isSuperAdmin.value) return true
  // Regular users need the specific permission
  return hasPermission(permission)
}

onMounted(() => {
  // SUPER_ADMIN always has access to settings
  if (isSuperAdmin.value) return
  
  // Regular users need specific permission to access admin settings
  if (!hasPermission('ACCESS_ADMIN_SETTINGS')) {
    // Redirect to dashboard if no permission
    navigateTo('/')
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center space-x-3">
        <Settings class="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('settings.title', 'Settings') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ t('settings.description', 'Manage system settings and configuration') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <template v-for="section in settingsSections" :key="section.title">
        <div 
          v-if="canViewSection(section)"
          class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <!-- Section Header -->
          <div class="flex items-start space-x-4 mb-4">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <component :is="section.icon" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {{ section.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ section.description }}
              </p>
            </div>
          </div>

          <!-- Settings Items -->
          <div class="space-y-3">
            <template v-for="item in section.items" :key="item.label">
              <div 
                v-if="canAccessSetting(item.permission)"
                class="group flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {{ item.label }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ item.description }}
                  </p>
                </div>
                <div class="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </template>

            <!-- No permissions message -->
            <div 
              v-if="!section.items.some((item: any) => canAccessSetting(item.permission))"
              class="text-center py-4 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ t('settings.no_permissions', 'You don\'t have permission to access these settings') }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- No Access Message -->
    <div 
      v-if="!isSuperAdmin && settingsSections.every(section => !canViewSection(section))"
      class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center"
    >
      <Shield class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('settings.access_denied', 'Access Denied') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {{ t('settings.access_denied_message', 'You don\'t have sufficient permissions to access the settings page. Contact your administrator for access.') }}
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