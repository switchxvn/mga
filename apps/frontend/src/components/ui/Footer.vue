<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useFooter } from '~/composables/useFooter';

// Kiểm tra môi trường phát triển
const isDev = ref(process.env.NODE_ENV === 'development');

// Sử dụng composable useFooter để lấy dữ liệu từ API
const {
  activeFooter,
  isLoading,
  error,
  fetchActiveFooter,
  copyright,
  theme,
  linksSection,
  socialSection,
  contactSection,
} = useFooter();

// Tính toán style dựa trên theme
const footerStyle = computed(() => {
  if (!theme.value) return {};

  return {
    backgroundColor: theme.value.backgroundColor || '#1f2937',
    color: theme.value.textColor || '#ffffff',
  };
});

// Fetch footer khi component được mount
onMounted(() => {
  try {
    fetchActiveFooter();
  } catch (err) {
    console.error('Error in Footer component:', err);
  }
});
</script>

<template>
  <!-- Footer từ API -->
  <footer v-if="activeFooter" class="footer-dynamic" :style="footerStyle">
    <div class="container mx-auto px-4 py-8">
      <!-- Links Section -->
      <div v-if="linksSection" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        <div v-for="item in linksSection.items || []" :key="item.label" class="footer-column">
          <h3 v-if="item.label" class="text-xl font-bold mb-4">
            {{ item.label }}
          </h3>
          <ul class="space-y-2" v-if="item.url">
            <li>
              <NuxtLink :to="item.url" class="hover:underline">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Social Media Section -->
      <div v-if="socialSection" class="social-section mb-8">
        <h3 v-if="socialSection.title" class="text-xl font-bold mb-4">
          {{ socialSection.title }}
        </h3>
        <div class="flex space-x-4">
          <a 
            v-for="item in socialSection.items || []" 
            :key="item.label"
            :href="item.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-white transition-colors duration-300"
          >
            {{ item.label }}
          </a>
        </div>
      </div>

      <!-- Contact Section -->
      <div v-if="contactSection" class="contact-section mb-8">
        <h3 v-if="contactSection.title" class="text-xl font-bold mb-4">
          {{ contactSection.title }}
        </h3>
        <div class="space-y-2">
          <div v-for="item in contactSection.items || []" :key="item.label">
            <a v-if="item.url" :href="item.url" class="text-gray-400 hover:text-white hover:underline">{{ item.label }}</a>
            <p v-else class="text-gray-400">{{ item.label }}</p>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div v-if="copyright" class="copyright text-center pt-4 border-t border-gray-700">
        <p>{{ copyright }}</p>
      </div>
    </div>
  </footer>

  <!-- Loading Placeholder -->
  <div v-if="isLoading" class="footer-placeholder animate-pulse">
    <div class="container mx-auto px-4 py-8">
      <div class="h-40 bg-gray-200 rounded"></div>
    </div>
  </div>

  <!-- Error Message - Only visible in development mode -->
  <div v-if="error && isDev" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong class="font-bold">Footer Error:</strong>
    <span class="block sm:inline"> {{ error }}</span>
  </div>
</template>

<style scoped>
.footer-dynamic {
  width: 100%;
  border-top: 1px solid #374151;
}

.footer-placeholder {
  width: 100%;
  border-top: 1px solid #e5e7eb;
  background-color: #f8f9fa;
}
</style>
