<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useFooter } from '~/composables/useFooter';

// Kiểm tra môi trường phát triển
const isDev = ref(process.env.NODE_ENV === 'development');
const isDarkMode = ref(false);

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

// Tính toán style dựa trên theme từ API hoặc sử dụng CSS từ file SCSS
const footerStyle = computed(() => {
  // Nếu không có theme từ API, trả về object rỗng để sử dụng CSS từ file SCSS
  if (!theme.value) {
    // Nếu đang ở dark mode, áp dụng style dark mode
    if (isDarkMode.value) {
      return {
        backgroundColor: '#111827',
        color: '#f9fafb'
      };
    }
    return {};
  }

  // Nếu có theme từ API, sử dụng nó
  return {
    backgroundColor: isDarkMode.value ? '#111827' : theme.value.backgroundColor,
    color: isDarkMode.value ? '#f9fafb' : theme.value.textColor,
  };
});

// Kiểm tra dark mode
const checkDarkMode = () => {
  if (typeof document !== 'undefined') {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  }
};

// Theo dõi thay đổi của dark mode
watch(isDarkMode, () => {
  // Cập nhật style khi dark mode thay đổi
}, { immediate: true });

// Fetch footer khi component được mount
onMounted(() => {
  try {
    fetchActiveFooter();
    checkDarkMode();
    
    // Theo dõi thay đổi của dark mode
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            checkDarkMode();
          }
        });
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  } catch (err) {
    console.error('Error in Footer component:', err);
  }
});
</script>

<template>
  <!-- Footer từ API -->
  <footer v-if="activeFooter" class="footer" :style="footerStyle" :class="{ 'dark-footer': isDarkMode }">
    <div class="container mx-auto px-4 py-8">
      <!-- Links Section -->
      <div v-if="linksSection" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        <div v-for="item in linksSection.items || []" :key="item.label" class="footer__column">
          <h3 v-if="item.label" class="text-xl font-bold mb-4 footer__title">
            {{ item.label }}
          </h3>
          <ul class="space-y-2" v-if="item.url">
            <li>
              <NuxtLink :to="item.url" class="footer__link hover:underline">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Social Media Section -->
      <div v-if="socialSection" class="footer__social mb-8">
        <h3 v-if="socialSection.title" class="text-xl font-bold mb-4 footer__title">
          {{ socialSection.title }}
        </h3>
        <div class="flex space-x-4">
          <a 
            v-for="item in socialSection.items || []" 
            :key="item.label"
            :href="item.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer__social-link transition-colors duration-300"
          >
            {{ item.label }}
          </a>
        </div>
      </div>

      <!-- Contact Section -->
      <div v-if="contactSection" class="footer__contact mb-8">
        <h3 v-if="contactSection.title" class="text-xl font-bold mb-4 footer__title">
          {{ contactSection.title }}
        </h3>
        <div class="space-y-2">
          <div v-for="item in contactSection.items || []" :key="item.label">
            <a v-if="item.url" :href="item.url" class="footer__link hover:underline">{{ item.label }}</a>
            <p v-else class="footer__text">{{ item.label }}</p>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div v-if="copyright" class="footer__copyright text-center pt-4">
        <p>{{ copyright }}</p>
      </div>
    </div>
  </footer>

  <!-- Fallback Footer khi không có dữ liệu từ API -->
  <footer v-else-if="!isLoading && !error" class="footer" :class="{ 'dark-footer': isDarkMode }">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        <div class="footer__column">
          <h3 class="text-xl font-bold mb-4 footer__title">Về chúng tôi</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/about" class="footer__link hover:underline">Giới thiệu</NuxtLink></li>
            <li><NuxtLink to="/contact" class="footer__link hover:underline">Liên hệ</NuxtLink></li>
            <li><NuxtLink to="/careers" class="footer__link hover:underline">Tuyển dụng</NuxtLink></li>
          </ul>
        </div>
        <div class="footer__column">
          <h3 class="text-xl font-bold mb-4 footer__title">Hỗ trợ</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/faq" class="footer__link hover:underline">FAQ</NuxtLink></li>
            <li><NuxtLink to="/shipping" class="footer__link hover:underline">Vận chuyển</NuxtLink></li>
            <li><NuxtLink to="/returns" class="footer__link hover:underline">Đổi trả</NuxtLink></li>
          </ul>
        </div>
        <div class="footer__column">
          <h3 class="text-xl font-bold mb-4 footer__title">Chính sách</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/privacy" class="footer__link hover:underline">Bảo mật</NuxtLink></li>
            <li><NuxtLink to="/terms" class="footer__link hover:underline">Điều khoản</NuxtLink></li>
          </ul>
        </div>
        <div class="footer__column">
          <h3 class="text-xl font-bold mb-4 footer__title">Liên hệ</h3>
          <ul class="space-y-2">
            <li><a href="tel:19001234" class="footer__link hover:underline">Hotline: 1900 1234</a></li>
            <li><a href="mailto:info@example.com" class="footer__link hover:underline">Email: info@example.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__copyright text-center pt-4 border-t">
        <p>© {{ new Date().getFullYear() }} E-Commerce. Tất cả các quyền được bảo lưu.</p>
      </div>
    </div>
  </footer>

  <!-- Loading Placeholder -->
  <div v-if="isLoading" class="footer-placeholder animate-pulse">
    <div class="container mx-auto px-4 py-8">
      <div class="h-40 bg-gray-200 rounded dark:bg-gray-700"></div>
    </div>
  </div>

  <!-- Error Message - Only visible in development mode -->
  <div v-if="error && isDev" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100" role="alert">
    <strong class="font-bold">Footer Error:</strong>
    <span class="block sm:inline"> {{ error }}</span>
  </div>
</template>

<style scoped>
/* Các style cụ thể cho component này đã được di chuyển sang file SCSS riêng */
.footer-placeholder {
  width: 100%;
  border-top: 1px solid var(--border);
  background-color: var(--background);
}

/* Đảm bảo footer có màu nền đúng trong dark mode */
html.dark .footer,
.dark-footer {
  background-color: #111827 !important;
  color: #f9fafb !important;
  border-color: #374151 !important;
}

.dark-footer .footer__title {
  color: #f9fafb !important;
}

.dark-footer .footer__link {
  color: #9ca3af !important;
}

.dark-footer .footer__link:hover {
  color: #60a5fa !important;
}

.dark-footer .footer__text {
  color: #9ca3af !important;
}

.dark-footer .footer__copyright {
  border-color: #374151 !important;
  color: #9ca3af !important;
}
</style>
