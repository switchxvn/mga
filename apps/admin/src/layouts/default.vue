<script setup lang="ts">
import type { DropdownItem } from '#ui/types'
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
  <div class="h-screen flex">
    <!-- Sidebar -->
    <UCard class="w-64 h-full rounded-none">
      <div class="p-4">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <UVerticalNavigation
        :links="navigation"
        class="p-2"
      />
    </UCard>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <UCard class="rounded-none">
        <div class="flex justify-between items-center p-4">
          <h2 class="text-lg font-semibold">
            <template v-if="isLoading">Loading...</template>
            <template v-else-if="user">
              Welcome, {{ user.email }}
              <span v-if="user.roles?.length" class="text-sm text-gray-500 ml-2">({{ user.roles[0] }})</span>
            </template>
          </h2>
          <div class="flex items-center gap-4">
            <button
              class="p-2 rounded-md transition-colors duration-200 ease-in-out"
              :class="[
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              ]"
              @click="colorMode.preference = isDark ? 'light' : 'dark'"
            >
              <component :is="isDark ? Moon : Sun" class="w-5 h-5" />
            </button>
            <UDropdown
              :items="userMenuItems"
            >
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-user-circle"
              >
                <span class="ml-2">{{ user?.email }}</span>
              </UButton>
            </UDropdown>
          </div>
        </div>
      </UCard>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template> 