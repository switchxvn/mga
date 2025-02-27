<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';
import { ref } from '../composables/useVueComposables';

const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
};

const isDarkMode = computed(() => colorMode.value === 'dark');

const navigation = [
  { name: 'Profile', href: '/profile' },
  { name: 'Account', href: '/profile/account' },
  { name: 'Password', href: '/profile/password' },
  { name: 'Notifications', href: '/profile/notifications' },
  { name: 'Billing', href: '/profile/billing' },
];

const currentPath = ref('/profile'); // In real app, get this from router
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center justify-between">
        <a href="/" class="flex items-center space-x-2">
          <span class="font-bold">Your Logo</span>
        </a>
        <nav class="flex items-center space-x-4">
          <button @click="toggleTheme" class="px-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/>
              <path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/>
              <path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/>
              <path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/>
              <path d="m19.07 4.93-1.41 1.41"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          </button>
          <a href="/" class="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2">Back to Home</a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-6">
      <aside class="hidden w-[200px] flex-col md:flex">
        <nav class="grid items-start gap-2">
          <a
            v-for="item in navigation"
            :key="item.href"
            :href="item.href"
            :class="[
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
              currentPath === item.href
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            ]"
          >
            {{ item.name }}
          </a>
        </nav>
      </aside>
      <div class="flex-1">
        <div class="space-y-6">
          <slot />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t bg-background">
      <div class="container flex h-14 items-center justify-between">
        <p class="text-sm text-muted-foreground">
          © 2024 Your Company. All rights reserved.
        </p>
        <nav class="flex items-center space-x-4">
          <a href="/terms" class="text-sm text-muted-foreground hover:text-foreground">Terms</a>
          <a href="/privacy" class="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
        </nav>
      </div>
    </footer>
  </div>
</template> 