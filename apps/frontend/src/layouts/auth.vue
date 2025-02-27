<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';

const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
};

const isDarkMode = computed(() => colorMode.value === 'dark');
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center justify-between">
        <a href="/" class="flex items-center space-x-2">
          <span class="font-bold">Your Logo</span>
        </a>
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
      </div>
    </header>

    <!-- Main Content -->
    <main class="container flex min-h-screen flex-col items-center justify-center">
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p class="text-sm text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>
        <slot />
        <p class="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a href="/terms" class="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" class="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  </div>
</template> 