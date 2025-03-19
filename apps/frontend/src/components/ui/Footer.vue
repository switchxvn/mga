<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useFooter } from '~/composables/useFooter';
import { useColorMode } from '@vueuse/core';

// Kiểm tra môi trường phát triển
const isDev = ref(process.env.NODE_ENV === 'development');

// Sử dụng composable useFooter để lấy dữ liệu từ API
const {
  activeFooter,
  isLoading,
  error,
  fetchActiveFooter,
} = useFooter();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');

// Tính toán style dựa trên theme từ API
const footerStyle = computed(() => {
  if (!activeFooter.value) return {};
  
  return {
    backgroundColor: isDark.value 
      ? activeFooter.value.backgroundDarkColor 
      : activeFooter.value.backgroundLightColor,
  };
});

// Thêm type definitions cho Facebook SDK
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: { xfbml: boolean; version: string; appId?: string }) => void;
      XFBML: {
        parse: () => void;
      };
    };
  }
}

// Khởi tạo Facebook SDK
const initFacebookSDK = () => {
  return new Promise((resolve) => {
    // Add fb-root if not exists
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);
    }

    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v22.0&appId=495583615052994';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    
    resolve(true);
  });
};

// Khởi tạo lại Facebook plugin
const reloadFacebookPlugin = () => {
  if (window.FB) {
    window.FB.XFBML.parse();
  }
};

onMounted(async () => {
  try {
    await fetchActiveFooter();
    await initFacebookSDK();
    console.log('Active footer:', activeFooter.value);
  } catch (err) {
    console.error('Error in Footer component:', err);
  }
});
</script>

<template>
  <!-- Footer từ API -->
  <footer v-if="activeFooter" class="footer" :style="footerStyle">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        <!-- Logo and Company Info -->
        <div class="col-span-1">
          <img :src="activeFooter.logoUrl" :alt="activeFooter.logoAlt" class="h-12 mb-4" />
          <div class="company-info">
            <h3 class="font-bold mb-2">{{ activeFooter.companyInfo.name }}</h3>
            <p>{{ activeFooter.companyInfo.registration }}</p>
            <p v-if="activeFooter.companyInfo.tax_number">MST: {{ activeFooter.companyInfo.tax_number }}</p>
            <p v-if="activeFooter.companyInfo.business_license">{{ activeFooter.companyInfo.business_license }}</p>
          </div>
        </div>

        <!-- Addresses -->
        <div class="col-span-1">
          <h3 class="font-bold mb-4">Trụ sở chính</h3>
          <div v-for="(address, index) in activeFooter.addresses" :key="index" class="mb-4">
            <p v-if="address.title" class="font-semibold">{{ address.title }}</p>
            <p v-if="address.subtitle" class="text-sm text-gray-600 dark:text-gray-400">{{ address.subtitle }}</p>
            <p class="mt-1">{{ address.location }}</p>
            
            <!-- Phone numbers -->
            <div v-if="address.phone && address.phone.length > 0" class="mt-2">
              <div v-for="(phone, phoneIndex) in address.phone" :key="phoneIndex" class="flex items-center space-x-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ phone.label }}:</span>
                <a :href="'tel:' + phone.number" class="hover:text-primary">{{ phone.number }}</a>
                <span v-if="phone.contact" class="text-sm text-gray-500">({{ phone.contact }})</span>
              </div>
            </div>
            
            <!-- Email addresses -->
            <div v-if="address.email && address.email.length > 0" class="mt-2">
              <div v-for="(email, emailIndex) in address.email" :key="emailIndex" class="flex items-center space-x-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ email.label }}:</span>
                <a :href="'mailto:' + email.address" class="hover:text-primary">{{ email.address }}</a>
                <span v-if="email.contact" class="text-sm text-gray-500">({{ email.contact }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="col-span-1">
          <h3 class="font-bold mb-4">Liên kết nhanh</h3>
          <ul class="space-y-2">
            <li v-for="link in activeFooter.quickLinks" :key="link.url">
              <a :href="link.url" class="hover:text-primary flex items-center">
                <Icon v-if="link.icon" :name="link.icon" class="w-5 h-5 mr-2" />
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Social Links -->
        <div class="col-span-1">
          <h3 class="font-bold mb-4">Kết nối với chúng tôi</h3>
          <div class="flex space-x-4">
            <a v-for="icon in activeFooter.socialIcons" 
               :key="icon.name" 
               :href="icon.url" 
               target="_blank"
               rel="noopener noreferrer"
               class="hover:opacity-80">
              <Icon :name="icon.icon" class="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      <!-- Maps and Fanpage -->
      <div v-if="activeFooter.mapUrl || activeFooter.fanpageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div v-if="activeFooter.mapUrl" class="h-[300px]">
          <iframe :src="activeFooter.mapUrl" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
        <div v-if="activeFooter.fanpageUrl" class="h-[300px] overflow-hidden w-full">
          <div class="fb-page" 
               :data-href="activeFooter.fanpageUrl"
               data-tabs="timeline"
               data-small-header="false"
               data-adapt-container-width="true"
               data-hide-cover="false"
               data-show-facepile="true"
               data-height="300"
               data-width="608"
               style="width: 100%; height: 100%;">
            <blockquote :cite="activeFooter.fanpageUrl" class="fb-xfbml-parse-ignore">
              <a :href="activeFooter.fanpageUrl">{{ activeFooter.companyInfo.name }}</a>
            </blockquote>
          </div>
        </div>
      </div>

      <!-- Copyright and Social Icons -->
      <div class="mt-8 pt-4 border-t flex justify-between items-center">
        <p v-if="activeFooter.copyright" class="text-sm">
          {{ activeFooter.copyright }}
        </p>
        <div class="flex space-x-4">
          <a v-for="icon in activeFooter.socialIcons" 
             :key="icon.name" 
             :href="icon.url" 
             target="_blank"
             rel="noopener noreferrer"
             class="hover:opacity-80">
            <Icon :name="icon.icon" class="w-6 h-6" />
          </a>
        </div>
      </div>

      <!-- Certifications -->
      <div v-if="activeFooter.companyInfo.certifications" class="mt-4 flex items-center space-x-4">
        <div v-for="cert in activeFooter.companyInfo.certifications" 
             :key="cert.image" 
             class="certification">
          <img :src="cert.image" :alt="cert.alt || ''" class="h-12" />
          <span v-if="cert.text" class="text-xs mt-1">{{ cert.text }}</span>
        </div>
      </div>

    </div>
  </footer>

  <!-- Loading Placeholder -->
  <div v-else-if="isLoading" class="footer-placeholder animate-pulse">
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
.footer {
  @apply border-t;
}

.footer__title {
  @apply text-xl font-bold mb-4;
}

.footer__link {
  @apply transition-colors duration-300;
}

.footer__link:hover {
  @apply underline;
}

.footer__item {
  @apply flex items-start;
}

.footer-placeholder {
  @apply w-full border-t;
}

/* Dark mode styles */
html.dark .footer,
.dark-footer {
  @apply bg-gray-900 text-gray-100 border-gray-700;
}

.dark-footer .footer__title {
  @apply text-gray-100;
}

.dark-footer .footer__link {
  @apply text-gray-300;
}

.dark-footer .footer__link:hover {
  @apply text-blue-400;
}

.dark-footer .footer__text {
  @apply text-gray-300;
}

.dark-footer .footer__copyright {
  @apply border-gray-700 text-gray-300;
}

.certification {
  @apply flex flex-col items-center;
}
</style>
