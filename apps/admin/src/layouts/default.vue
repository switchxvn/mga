<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui/dist/runtime/types'
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'
import { Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const userStore = useUserStore()
const { user, isLoading } = storeToRefs(userStore)
const route = useRoute()

// Try to get injected page title from child components
const injectedTitle = inject('pageTitle', ref(''))

// Improved active route checking
const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const navigation = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Posts', icon: 'i-heroicons-document-text', to: '/posts' },
  { label: 'Products', icon: 'i-heroicons-shopping-bag', to: '/products' },
  { label: 'Orders', icon: 'i-heroicons-shopping-cart', to: '/orders' },
  { label: 'Customers', icon: 'i-heroicons-users', to: '/customers' },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
]

// Get current section from route
const getCurrentSection = () => {
  const path = route.path
  // If we have an injected title from a child component, use it
  if (injectedTitle.value) return injectedTitle.value
  
  if (path.includes('/posts/create')) return 'Create Post'
  if (path.includes('/products/edit/')) return 'Edit Product'
  if (path.includes('/products/create')) return 'Create Product'
  
  const currentRoute = navigation.find(item => isActiveRoute(item.to))
  return currentRoute?.label || 'Admin Dashboard'
}

// Dynamic page title based on current route with SSR support
const pageTitle = computed(() => {
  const section = getCurrentSection()
  // If section already includes "- Admin Dashboard", return as is
  if (section.includes('- Admin Dashboard')) return section
  return section !== 'Dashboard' ? `${section} - Admin Dashboard` : 'Admin Dashboard'
})

// Set page title with SSR support
useHead(() => ({
  title: pageTitle.value
}))

// Fetch user data when component mounts
onMounted(async () => {
  try {
    await userStore.fetchUser()
    console.log('User data in component:', user.value)
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }
})

const handleLogout = async () => {
  userStore.clearUser()
  // Redirect to login page
  navigateTo('/login')
}

const userMenuItems: DropdownItem[][] = [[
  { 
    label: 'Profile', 
    icon: 'i-heroicons-user-circle',
    to: '/profile'
  },
  { 
    label: 'Logout', 
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: handleLogout
  }
]]
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-72 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg">
      <!-- Logo/Header -->
      <div class="shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Admin Dashboard</h1>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            isActiveRoute(item.to)
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
          ]"
        >
          <UIcon 
            :name="item.icon"
            :class="[
              'w-6 h-6',
              isActiveRoute(item.to)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400'
            ]"
          />
          <span class="text-[16px] font-medium">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <header class="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex justify-between items-center px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            <template v-if="isLoading">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
              Loading...
            </template>
            <template v-else-if="user">
              Welcome, 
              <span class="text-primary-600 dark:text-primary-400">{{ user.email }}</span>
              <span v-if="user.roles?.length" class="text-sm text-gray-500 dark:text-gray-400 ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                {{ user.roles[0] }}
              </span>
            </template>
          </h2>
          <div class="flex items-center gap-4">
            <button
              class="p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              :class="[
                isDark 
                  ? 'text-gray-400 hover:text-primary-400' 
                  : 'text-gray-600 hover:text-primary-600'
              ]"
              @click="colorMode.preference = isDark ? 'light' : 'dark'"
            >
              <component :is="isDark ? Moon : Sun" class="w-5 h-5" />
            </button>
            <UDropdown
              :items="userMenuItems"
              :ui="{
                wrapper: 'relative',
                container: 'z-50 w-48',
                width: 'w-48',
                background: 'bg-white dark:bg-gray-800',
                shadow: 'shadow-lg',
                rounded: 'rounded-md',
                ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
                base: 'overflow-hidden focus:outline-none',
                button: {
                  base: 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'
                },
                item: {
                  base: 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }
              }"
            >
              <UButton
                color="gray"
                variant="ghost"
                class="flex items-center space-x-2"
              >
                <UAvatar
                  :src="user?.avatar || ''"
                  :alt="user?.email || ''"
                  size="sm"
                />
                <span class="font-medium">{{ user?.email }}</span>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
              </UButton>
            </UDropdown>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply bg-primary-500/10 text-primary-600 dark:text-primary-400;
}
</style> 