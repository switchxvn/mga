# Tạo file mới cho trang chi tiết dịch vụ
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { computed, ref, watch } from 'vue';
import Breadcrumb from '../../components/Breadcrumb.vue';
import LazyImage from '../../components/ui/LazyImage.vue';
import Icon from '../../components/ui/Icon.vue';
import { useI18n } from 'vue-i18n';
import type { Service } from '@ew/shared';
import { useLocalization } from '../../composables/useLocalization';
import { getLocalizedRoute } from '../../utils/routes';
import * as LucideIcons from 'lucide-vue-next';

// Định nghĩa meta cho trang
definePageMeta({
  layout: "default"
});

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();
const { locale } = useI18n();
const { t } = useLocalization();
const slug = route.params.slug as string;

// Convert kebab-case to PascalCase for icon names
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Get icon component dynamically
const getIconComponent = (iconName: string) => {
  const pascalCaseName = toPascalCase(iconName);
  return (LucideIcons as any)[pascalCaseName] || LucideIcons.HelpCircle; // Fallback to HelpCircle if icon not found
};

// Fetch service data
const { data: service, pending: loading, error, refresh } = useAsyncData(
  `service-${slug}`,
  () => trpc.service.bySlug.query({ slug, locale: locale.value })
);

// Computed properties
const serviceData = computed(() => service.value || {} as Service);

const currentTranslation = computed(() => {
  if (!serviceData.value.translations) return null;
  return serviceData.value.translations.find(t => t.locale === locale.value) || serviceData.value.translations[0];
});

const serviceTitle = computed(() => currentTranslation.value?.title || '');
const serviceContent = computed(() => currentTranslation.value?.description || '');
const serviceShortDescription = computed(() => currentTranslation.value?.shortDescription || '');
const serviceIcon = computed(() => serviceData.value.icon || '');
const serviceId = computed(() => serviceData.value.id || 0);

// Lấy URL hiện tại từ server
const baseUrl = ref(process.client ? window.location.origin : '');

// Watch locale changes to update content
watch(locale, async (newLocale) => {
  const translation = serviceData.value.translations?.find(t => t.locale === newLocale);
  if (translation?.slug) {
    const basePath = newLocale === 'vi' ? '/dich-vu' : '/services';
    await router.replace(`${basePath}/${translation.slug}`);
  }
});

// Xử lý đường dẫn dựa trên locale
const getLocalizedPath = () => {
  return locale.value === 'vi' ? '/dich-vu' : '/services';
};

// Breadcrumb items with localized paths
const breadcrumbItems = computed(() => [
  {
    label: locale.value === 'vi' ? 'Dịch vụ' : 'Services',
    to: getLocalizedPath()
  },
  {
    label: serviceTitle.value || (locale.value === 'vi' ? 'Chi tiết dịch vụ' : 'Service Detail')
  }
]);

// Canonical URL
const canonicalUrl = computed(() => {
  const translation = currentTranslation.value;
  if (!translation) return '';
  
  const basePath = getLocalizedPath();
  return `${baseUrl.value}${basePath}/${slug}`;
});

// SEO meta tags
useHead(() => {
  const translation = currentTranslation.value;
  if (!translation) return {};

  return {
    title: translation.metaTitle || serviceTitle.value || 'Dịch vụ',
    meta: [
      { name: 'description', content: translation.metaDescription || serviceShortDescription.value || '' },
      { name: 'keywords', content: translation.metaKeywords || '' },
      { property: 'og:title', content: translation.ogTitle || serviceTitle.value || '' },
      { property: 'og:description', content: translation.ogDescription || serviceShortDescription.value || '' },
      { property: 'og:image', content: translation.ogImage || '' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: translation.ogTitle || serviceTitle.value || '' },
      { name: 'twitter:description', content: translation.ogDescription || serviceShortDescription.value || '' },
      { name: 'twitter:image', content: translation.ogImage || '' }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value }
    ]
  };
});
</script>

<template>
      <div class="service-detail bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
    <div class="container mx-auto px-4 py-8 flex-grow">
      <!-- Breadcrumb -->
      <Breadcrumb 
        :items="breadcrumbItems" 
        variant="default" 
        separator="/"
        :showHomeIcon="true"
      />
      
      <!-- Loading state -->
      <div v-if="loading" class="service-detail__loading py-20 flex-grow flex items-center justify-center">
        <div class="service-detail__loading-spinner"></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="service-detail__error py-20 flex-grow flex flex-col items-center justify-center">
        <p class="service-detail__error-message">{{ error }}</p>
        <button 
          @click="() => refresh()" 
          class="service-detail__error-button"
        >
          {{ t('common.tryAgain') }}
        </button>
      </div>
      
      <!-- Service content -->
      <div v-else-if="service" class="service-detail__main mt-8 flex-grow">
        <!-- Service article content -->
        <article class="service-detail__article bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 h-full w-full">
          <!-- Service icon -->
          <div v-if="serviceIcon" class="service-detail__icon">
            <component 
              :is="getIconComponent(serviceIcon)"
              class="w-16 h-16 text-primary-500"
            />
          </div>
          
          <!-- Service header -->
          <div class="service-detail__header">
            <h1 class="service-detail__title">{{ serviceTitle }}</h1>
            
            <!-- Short Description -->
            <div v-if="serviceShortDescription" class="service-detail__short-description">
              {{ serviceShortDescription }}
            </div>
          </div>
          
          <!-- Service content -->
          <div class="service-detail__body">
            <div class="service-prose">
              <p class="whitespace-pre-line">{{ serviceContent }}</p>
            </div>
          </div>
        </article>
      </div>
      
      <!-- Not found state -->
      <div v-else class="service-detail__not-found py-20 flex-grow flex flex-col items-center justify-center">
        <div class="service-detail__not-found-emoji">😕</div>
        <h2 class="service-detail__not-found-title">
          {{ t('services.notFound') }}
        </h2>
        <p class="service-detail__not-found-message">
          {{ t('services.notFoundDescription') }}
        </p>
        <NuxtLink 
          :to="getLocalizedPath()"
          class="service-detail__not-found-button"
        >
          {{ t('services.backToServices') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.service-detail__main {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.service-detail__article {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.service-detail__icon {
  @apply flex justify-center mb-8;
}

.service-detail__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white text-center mb-4;
}

.service-detail__short-description {
  @apply text-lg text-gray-600 dark:text-gray-300 my-6 font-medium italic text-center;
}

.service-prose {
  @apply prose prose-lg dark:prose-invert max-w-none;
  margin-top: 2rem;
}

.service-detail__loading {
  @apply flex justify-center items-center min-h-[400px];
}

.service-detail__loading-spinner {
  @apply w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin;
}

.service-detail__error {
  @apply text-center py-12;
}

.service-detail__error-message {
  @apply text-red-600 dark:text-red-400 mb-4;
}

.service-detail__error-button {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors;
}

.service-detail__not-found {
  @apply text-center py-12;
}

.service-detail__not-found-emoji {
  @apply text-6xl mb-4;
}

.service-detail__not-found-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.service-detail__not-found-message {
  @apply text-gray-600 dark:text-gray-400 mb-6;
}

.service-detail__not-found-button {
  @apply px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2;
}

/* Styling for rich text content */
.service-prose h2 {
  @apply text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white;
}

.service-prose h3 {
  @apply text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white;
}

.service-prose p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}

.service-prose ul, .service-prose ol {
  @apply my-4 pl-6;
}

.service-prose li {
  @apply mb-2 text-gray-700 dark:text-gray-300;
}

.service-prose a {
  @apply text-primary-600 dark:text-primary-400 hover:underline;
}

.service-prose blockquote {
  @apply pl-4 border-l-4 border-gray-300 italic my-4 text-gray-600 dark:text-gray-400;
}

@media (max-width: 768px) {
  .service-detail__title {
    @apply text-2xl;
  }
  
  .service-detail__short-description {
    @apply text-base;
  }
  
  .service-prose {
    @apply prose-base;
  }
  
  .service-detail__article {
    @apply p-4;
  }
}
</style> 