<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useFooter } from '~/composables/useFooter';

// Sử dụng composable useFooter để lấy dữ liệu từ API
const { 
  activeFooter, 
  isLoading, 
  fetchActiveFooter, 
  copyright, 
  theme,
  linksSection,
  socialSection,
  contactSection
} = useFooter();

// Tính toán style dựa trên theme
const footerStyle = computed(() => {
  if (!theme.value) return {};
  
  return {
    backgroundColor: theme.value.backgroundColor || '#1f2937',
    color: theme.value.textColor || '#ffffff'
  };
});

// Fetch footer khi component được mount
onMounted(() => {
  fetchActiveFooter();
});
</script>

<template>
  <!-- Footer từ API -->
  <footer 
    v-if="activeFooter" 
    class="footer-dynamic"
    :style="footerStyle"
  >
    <div class="container mx-auto px-4 py-8">
      <!-- Links Section -->
      <div v-if="linksSection" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        <div v-for="(item, i) in linksSection.items || []" :key="i" class="footer-column">
          <h3 v-if="item.label" class="text-xl font-bold mb-4">{{ item.label }}</h3>
          <ul class="space-y-2" v-if="item.url">
            <li>
              <NuxtLink :to="item.url" class="hover:underline">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Social Media Section -->
      <div v-if="socialSection" class="social-section mb-8">
        <h3 v-if="socialSection.title" class="text-xl font-bold mb-4">{{ socialSection.title }}</h3>
        <div class="flex space-x-4">
          <a 
            v-for="(item, i) in socialSection.items || []" 
            :key="i"
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
        <h3 v-if="contactSection.title" class="text-xl font-bold mb-4">{{ contactSection.title }}</h3>
        <div class="space-y-2">
          <div v-for="(item, i) in contactSection.items || []" :key="i">
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