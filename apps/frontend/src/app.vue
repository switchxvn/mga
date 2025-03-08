<script setup lang="ts">
// Không cần định nghĩa layout ở đây vì Nuxt sẽ tự động sử dụng layout default
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==',
      crossorigin: 'anonymous',
      referrerpolicy: 'no-referrer'
    }
  ]
});

import { onMounted } from 'vue';
import { useFeatureFlags } from './composables/useFeatureFlags';

// Khởi tạo feature flags khi ứng dụng được tải
onMounted(async () => {
  const { fetchFeatureFlags } = useFeatureFlags();
  await fetchFeatureFlags();
});
</script>

<template>
  <!-- NuxtLayout sẽ tự động sử dụng layout default -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}
</style>
