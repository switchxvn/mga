<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '@vueuse/core';

const colorMode = useColorMode();
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <div class="mr-4 flex">
          <button @click="toggleSidebar" class="mr-2 px-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
          <a href="/" class="flex items-center space-x-2">
            <span class="font-bold">Your Logo</span>
          </a>
        </div>
        <div class="flex-1"></div>
        <nav class="flex items-center space-x-4">
          <button @click="toggleTheme" class="px-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg v-if="colorMode === 'dark'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
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
          <a href="/profile" class="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2">Profile</a>
        </nav>
      </div>
    </header>

    <!-- Sidebar -->
    <aside :class="[
      'fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <div class="space-y-4 py-4">
        <div class="px-3 py-2">
          <div class="space-y-1">
            <a href="/" class="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Home
            </a>
            <a href="/dashboard" class="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Dashboard
            </a>
            <a href="/settings" class="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Settings
            </a>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="[
      'min-h-[calc(100vh-8rem)] transition-all duration-300',
      isSidebarOpen ? 'ml-64' : 'ml-0'
    ]">
      <div class="container py-6">
        <slot />
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