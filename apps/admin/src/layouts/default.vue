<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui/dist/runtime/types'
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'
import { Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const userStore = useUserStore()
const { user, isLoading } = storeToRefs(userStore)

// Fetch user data when component mounts
onMounted(async () => {
  try {
    await userStore.fetchUser()
    console.log('User data in component:', user.value)
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }
})

const navigation = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Products', icon: 'i-heroicons-shopping-bag', to: '/products' },
  { label: 'Orders', icon: 'i-heroicons-shopping-cart', to: '/orders' },
  { label: 'Customers', icon: 'i-heroicons-users', to: '/customers' },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
]

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
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <UCard class="w-72 h-full rounded-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Admin Dashboard</h1>
      </div>
      <UVerticalNavigation
        :links="navigation"
        class="p-4 space-y-1"
        :ui="{
          wrapper: 'text-base',
          base: 'flex flex-col gap-1',
          item: {
            base: 'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            active: 'bg-primary-500/10 dark:bg-primary-400/10',
            inactive: 'hover:bg-gray-100 dark:hover:bg-gray-800'
          },
          icon: {
            base: 'flex-shrink-0 w-6 h-6',
            active: 'text-primary-600 dark:text-primary-400',
            inactive: 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500'
          },
          label: 'relative text-[20px] font-medium'
        }"
      >
        <template #default="{ link, isActive }">
          <div class="flex items-center gap-3">
            <div :class="[
              link.icon,
              'flex-shrink-0 w-6 h-6 my-auto',
              isActive 
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500'
            ]" />
            <span :class="[
              'text-[16px] font-semibold leading-6 flex items-center',
              isActive 
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-500'
            ]">
              {{ link.label }}
            </span>
          </div>
        </template>
      </UVerticalNavigation>
    </UCard>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <UCard class="rounded-none border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
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
      </UCard>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <slot />
      </main>
    </div>
  </div>
</template> 