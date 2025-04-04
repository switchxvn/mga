<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const navigation = [
  { name: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { name: 'Products', icon: 'i-heroicons-shopping-bag', to: '/products' },
  { name: 'Orders', icon: 'i-heroicons-shopping-cart', to: '/orders' },
  { name: 'Customers', icon: 'i-heroicons-users', to: '/customers' },
  { name: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
]
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
          <h2 class="text-lg font-semibold">Welcome, Admin</h2>
          <div class="flex items-center gap-4">
            <UButton
              :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
              color="gray"
              variant="ghost"
              @click="colorMode.preference = isDark ? 'light' : 'dark'"
            />
            <UDropdown
              :items="[
                { label: 'Profile', icon: 'i-heroicons-user-circle' },
                { label: 'Logout', icon: 'i-heroicons-arrow-right-on-rectangle' }
              ]"
            >
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-user-circle"
              />
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