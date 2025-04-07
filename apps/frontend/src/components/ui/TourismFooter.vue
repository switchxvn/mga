<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useFooter } from '~/composables/useFooter';
import { useColorMode } from '@vueuse/core';
import { Link, MapPin, Phone, Mail } from 'lucide-vue-next';
import type { Footer } from '~/interfaces/footer.interface';

const isDev = ref(process.env.NODE_ENV === 'development');

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
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);
    }

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v22.0';
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
  } catch (err) {
    console.error('Error in Footer component:', err);
  }
});
</script>

<template>
  <div>
    <footer v-if="activeFooter" class="tourism-footer relative" :style="footerStyle">
      <!-- Main Content -->
      <div class="main-content flex-1">
        <div class="container mx-auto px-4 py-16 relative">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <!-- Company Info Section -->
            <div class="col-span-1 md:col-span-4 backdrop-blur-sm bg-white/5 rounded-xl p-6">
              <div class="company-brand mb-6">
                <img :src="activeFooter.logoUrl" :alt="activeFooter.logoAlt" class="h-20 mb-4 object-contain" />
                <h3 class="text-3xl font-extrabold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text">
                  {{ activeFooter.companyInfo.name }}
                </h3>
                <div class="company-details space-y-2 text-sm text-white/80">
                  <p>{{ activeFooter.companyInfo.registration }}</p>
                  <p v-if="activeFooter.companyInfo.tax_number">{{ activeFooter.companyInfo.tax_number }}</p>
                  <p v-if="activeFooter.companyInfo.business_license">{{ activeFooter.companyInfo.business_license }}</p>
                </div>
              </div>

              <!-- Certifications with enhanced styling -->
              <div v-if="activeFooter.companyInfo.certifications?.length" 
                   class="certifications flex items-center space-x-4 mt-6">
                <div v-for="cert in activeFooter.companyInfo.certifications" 
                     :key="cert.image" 
                     class="certification-item hover:scale-105 transition-all duration-300">
                  <img :src="cert.image" :alt="cert.alt || ''" class="h-12 filter brightness-110" />
                  <span v-if="cert.text" class="text-xs mt-1 text-white/70">{{ cert.text }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Links & Contact Section -->
            <div class="col-span-1 md:col-span-4 backdrop-blur-sm bg-white/5 rounded-xl p-6">
              <!-- Quick Links -->
              <div class="quick-links mb-8">
                <h4 class="section-title">Liên Kết Nhanh</h4>
                <ul class="space-y-4 mt-6">
                  <li v-for="link in activeFooter?.quickLinks" :key="link.url">
                    <NuxtLink :to="link.url" 
                             class="quick-link group flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300">
                      <UIcon :name="link.icon || 'Link'" 
                            class="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" />
                      <span class="text-lg font-bold text-white/70 group-hover:text-white transition-colors duration-300">{{ link.label }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- Contact Info -->
              <div v-for="(address, index) in activeFooter?.addresses" :key="index" class="contact-info">
                <h4 class="section-title">{{ address.title }}</h4>
                <div class="space-y-4 mt-6">
                  <p class="flex items-start space-x-3 group p-3">
                    <MapPin class="w-6 h-6 mt-1 flex-shrink-0 text-white/70" />
                    <span class="text-lg font-bold text-white/70">{{ address.location }}</span>
                  </p>
                  
                  <div v-for="(phone, phoneIndex) in address.phone" :key="'phone-'+phoneIndex">
                    <a :href="'tel:' + phone.number" 
                       class="contact-link group flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300">
                      <Phone class="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" />
                      <span class="text-lg font-bold text-white/70 group-hover:text-white transition-colors duration-300">{{ phone.number }}</span>
                    </a>
                  </div>

                  <div v-for="(email, emailIndex) in address.email" :key="'email-'+emailIndex">
                    <a :href="'mailto:' + email.address" 
                       class="contact-link group flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300">
                      <Mail class="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" />
                      <span class="text-lg font-bold text-white/70 group-hover:text-white transition-colors duration-300">{{ email.address }}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Map & Social Section -->
            <div class="col-span-1 md:col-span-4 backdrop-blur-sm bg-white/5 rounded-xl p-6 space-y-6">
              <!-- Branch Info -->
              <div v-if="activeFooter.branchInfo" class="branch-section mb-6">
                <h4 class="section-title">Chi Nhánh</h4>
                <div class="space-y-4 mt-6">
                  <div v-for="(branch, index) in activeFooter.branchInfo" 
                       :key="index" 
                       class="branch-card p-4 rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                    <h5 class="text-lg font-semibold mb-2 text-white/90">{{ branch.title }}</h5>
                    <p class="text-base text-white/70">{{ branch.address }}</p>
                  </div>
                </div>
              </div>

              <!-- Map with enhanced container -->
              <div v-if="activeFooter.mapUrl" 
                   class="map-container rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 mb-6">
                <iframe :src="activeFooter.mapUrl + '&zoom=15&style=feature:all|element:labels.text.fill|color:0x000000|saturation:36|lightness:40&style=feature:all|element:labels.text.stroke|visibility:off&style=feature:administrative|element:geometry.stroke|color:0xdc2626|weight:1&style=feature:landscape|element:geometry.fill|color:0xfecaca&style=feature:poi|element:geometry.fill|color:0xfee2e2&style=feature:road|element:geometry.fill|color:0xffffff&style=feature:road|element:geometry.stroke|color:0xdc2626|weight:0.5&style=feature:water|element:geometry.fill|color:0xfca5a5'" 
                        width="100%" 
                        height="200" 
                        style="border:0;" 
                        allowfullscreen 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade"
                        class="transition-all duration-500">
                </iframe>
              </div>

              <!-- Facebook Fanpage -->
              <div v-if="activeFooter.fanpageUrl" class="facebook-container rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 mb-6">
                <ClientOnly>
                  <div id="fb-root"></div>
                  <div 
                    class="fb-page" 
                    :data-href="activeFooter.fanpageUrl"
                    data-tabs="timeline"
                    data-width=""
                    data-height="300"
                    data-small-header="true"
                    data-adapt-container-width="true"
                    data-hide-cover="false"
                    data-show-facepile="true"
                  >
                    <blockquote :cite="activeFooter.fanpageUrl" class="fb-xfbml-parse-ignore">
                      <a :href="activeFooter.fanpageUrl" class="text-white">{{ activeFooter.companyInfo.name }}</a>
                    </blockquote>
                  </div>
                </ClientOnly>
              </div>

              <!-- Social Icons -->
              <div class="social-icons flex space-x-6 justify-center pt-4">
                <a v-for="icon in activeFooter.socialIcons" 
                   :key="icon.name" 
                   :href="icon.url" 
                   target="_blank"
                   rel="noopener noreferrer"
                   class="social-icon-link p-4 rounded-full bg-white/10 hover:bg-white/20 transform hover:scale-110 transition-all duration-300"
                   :title="icon.name">
                  <UIcon :name="icon.icon" class="w-7 h-7 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Wave Background -->
        <div class="waves-decoration relative h-40 mt-auto overflow-hidden">
          <svg class="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
            <defs>
              <path id="wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g class="wave-parallax1">
              <use href="#wave-path" x="50" y="3" fill="rgba(255,255,255,0.1)" />
            </g>
            <g class="wave-parallax2">
              <use href="#wave-path" x="50" y="0" fill="rgba(255,255,255,0.2)" />
            </g>
            <g class="wave-parallax3">
              <use href="#wave-path" x="50" y="9" fill="rgba(255,255,255,0.3)" />
            </g>
            <g class="wave-parallax4">
              <use href="#wave-path" x="50" y="6" fill="rgba(255,255,255,0.4)" />
            </g>
          </svg>
        </div>
      </div>

      <!-- Copyright Section -->
      <div class="copyright-section w-full bg-[#9a1c1c]">
        <div class="container mx-auto px-4 py-4">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p class="text-sm text-white/80">{{ activeFooter.copyrightStyle?.text }}</p>
          </div>
        </div>
      </div>
    </footer>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="tourism-footer-loading animate-pulse">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && isDev" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
  </div>
</template>

<style scoped>
.tourism-footer {
  @apply text-white overflow-hidden flex flex-col;
  min-height: 500px;
  background: linear-gradient(180deg, #e53e3e 0%, #dc2626 100%);
}

.main-content {
  @apply flex flex-col flex-1;
}

.waves-decoration {
  @apply relative w-full;
  transform: translateY(2px);
}

.waves {
  @apply w-full h-full block;
  min-width: 2000px;
}

.wave-parallax1 use {
  animation: wave-move 40s cubic-bezier(.55,.5,.45,.5) infinite;
}

.wave-parallax2 use {
  animation: wave-move 30s cubic-bezier(.55,.5,.45,.5) infinite;
}

.wave-parallax3 use {
  animation: wave-move 20s cubic-bezier(.55,.5,.45,.5) infinite;
}

.wave-parallax4 use {
  animation: wave-move 15s cubic-bezier(.55,.5,.45,.5) infinite;
}

@keyframes wave-move {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  50% {
    transform: translate3d(-45px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/* Adjust existing styles to work with new background */
.quick-link, .contact-link, .branch-card, .certification-item {
  @apply backdrop-blur-sm;
  background: rgba(255, 255, 255, 0.1);
}

.social-icon-link {
  @apply shadow-lg hover:shadow-xl backdrop-blur-sm;
  background: rgba(255, 255, 255, 0.1);
}

.social-icon-link:hover {
  background: rgba(185, 28, 28, 0.8); /* Darker red on hover */
}

/* Make sure content sections have proper contrast */
.col-span-1 {
  @apply relative;
}

/* Enhance loading state */
.tourism-footer-loading {
  @apply min-h-[500px];
  background: linear-gradient(180deg, #e53e3e 0%, #dc2626 100%);
}

.section-title {
  @apply text-2xl font-black tracking-wide mb-2 relative uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title::after {
  content: '';
  @apply absolute bottom-0 left-0 w-16 h-1 bg-white/30 rounded-full mt-2;
  transform: translateY(8px);
}

/* Enhance text contrast and readability */
h3, h4, h5 {
  letter-spacing: 0.02em;
  @apply font-extrabold uppercase;
}

.company-brand h3 {
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.15);
}

.quick-link, .contact-link {
  @apply text-white/80 hover:text-white transform hover:translate-x-1 font-black;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.quick-link:hover, .contact-link:hover {
  @apply shadow-lg bg-[#b91c1c] backdrop-blur-sm;
}

.branch-card {
  @apply shadow-md hover:shadow-lg backdrop-blur-sm;
  background: rgba(255, 255, 255, 0.1);
}

.branch-card:hover {
  background: rgba(185, 28, 28, 0.8);
}

/* Remove old Facebook container styling */
.facebook-container {
  @apply shadow-lg hover:shadow-xl transition-all duration-300;
}
</style> 