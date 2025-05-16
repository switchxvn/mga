<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore';
import { storeToRefs } from 'pinia';
import { useAuth } from '@/composables/useAuth';
import { computed } from 'vue';
import LocaleSwitcher from './LocaleSwitcher.vue';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const auth = useAuth();

const userName = computed(() => {
  if (user.value && user.value.profile) {
    return user.value.profile.firstName || user.value.email;
  }
  return 'User';
});

const logout = async () => {
  await auth.logout();
};
</script>

<template>
  <header class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div class="flex h-16 items-center justify-between px-4">
      <!-- Left section with logo/title -->
      <div class="flex items-center">
        <NuxtLink to="/" class="flex items-center">
          <img src="/images/logo.svg" alt="Logo" class="h-8 w-auto" />
          <span class="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Admin</span>
        </NuxtLink>
      </div>

      <!-- Right section with user menu -->
      <div class="flex items-center space-x-4">
        <!-- Language Switcher -->
        <LocaleSwitcher />
        
        <!-- Theme Toggle -->
        <button
          class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle dark mode"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        </button>

        <!-- Notifications -->
        <button
          class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="View notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>

        <!-- User dropdown -->
        <div class="relative">
          <button
            class="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="user-menu-button"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <span class="sr-only">Open user menu</span>
            <img
              class="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </button>

          <!-- Dropdown menu -->
          <div
            class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabindex="-1"
          >
            <div class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
              <div class="font-medium">{{ userName }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user?.email }}</div>
            </div>
            <div class="border-t border-gray-100 dark:border-gray-700"></div>
            <NuxtLink
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Your Profile
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Settings
            </NuxtLink>
            <button
              @click="logout"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template> 