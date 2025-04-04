<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar component -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div class="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </NuxtLink>
      </div>
      
      <nav class="p-4 space-y-2">
        <NuxtLink
          to="/"
          class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <UIcon name="i-heroicons-home" class="w-5 h-5 mr-3" />
          Dashboard
        </NuxtLink>
        
        <NuxtLink
          to="/products"
          class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 mr-3" />
          Products
        </NuxtLink>

        <NuxtLink
          to="/orders"
          class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 mr-3" />
          Orders
        </NuxtLink>

        <NuxtLink
          to="/customers"
          class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <UIcon name="i-heroicons-users" class="w-5 h-5 mr-3" />
          Customers
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="pl-64">
      <!-- Top header -->
      <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-end h-full px-4 space-x-4">
          <!-- Theme toggle -->
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-moon"
            @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'"
          />
          
          <!-- User menu -->
          <UDropdown
            :items="[
              [{
                label: 'Profile',
                icon: 'i-heroicons-user-circle',
                to: '/profile'
              }],
              [{
                label: 'Sign out',
                icon: 'i-heroicons-arrow-right-on-rectangle',
                click: () => {}
              }]
            ]"
          >
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-user-circle"
            />
          </UDropdown>
        </div>
      </header>

      <!-- Page content -->
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Layout level composables can be added here
</script> 