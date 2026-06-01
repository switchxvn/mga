<script setup lang="ts">
import { useHead } from '#imports';

// Add font awesome and meta tags
useHead({
  link: [
    { rel: 'preconnect', href: 'https://cdn.mgavietnam.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: '//cdn.mgavietnam.com' }
  ],
  style: [
    {
      key: 'base-paint-mode',
      innerHTML: 'html{background:#ffffff;color-scheme:light;}html.dark{color-scheme:dark;}body{background:#ffffff;}#__nuxt{min-height:100vh;background:#ffffff;}html.dark body,html.dark #__nuxt{background:rgb(var(--background,17 24 39));}',
    }
  ],
  script: [
    {
      key: 'theme-mode-init',
      innerHTML: `(function(){try{var stored=localStorage.getItem('color-theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=stored==='dark'||(stored==='auto'&&prefersDark);document.documentElement.classList.toggle('dark',isDark);localStorage.removeItem('vueuse-color-scheme');}catch(e){document.documentElement.classList.remove('dark');}})();`,
      tagPosition: 'head',
    }
  ],
  meta: [
    // Favicon-related meta tags for better browser support
    {
      name: 'msapplication-TileColor',
      content: '#ffffff'
    },
    {
      name: 'theme-color',
      content: '#ffffff'
    }
  ]
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
}
</style>
