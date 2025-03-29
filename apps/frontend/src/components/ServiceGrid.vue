<script setup lang="ts">
import { computed } from 'vue';
import { useLocalization } from '../composables/useLocalization';
import { useRouter } from 'vue-router';

const { t, locale } = useLocalization();
const router = useRouter();

const props = defineProps<{
  services: any[];
  loading?: boolean;
  locale?: string;
  columns?: number;
}>();

// Compute grid columns class
const gridClass = computed(() => {
  const cols = props.columns || 3;
  return `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-${cols}`;
});

// Get translated content
const getTranslatedContent = (service: any) => {
  const translation = service.translations?.find(
    (t: any) => t.locale === (props.locale || locale.value)
  );
  return translation || service.translations?.[0];
};

// Get truncated description
const getTruncatedDescription = (service: any) => {
  const description = getTranslatedContent(service)?.shortDescription || '';
  if (description.length <= 120) return description;
  return description.slice(0, 120) + '...';
};

// Navigate to service detail
const navigateToService = (service: any) => {
  const translation = getTranslatedContent(service);
  if (!translation) return;
  
  router.push({
    path: `/services/${translation.slug}`,
    query: props.locale ? { locale: props.locale } : undefined,
  });
};
</script>

<template>
  <div :class="gridClass">
    <div
      v-for="service in services"
      :key="service.id"
      class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
      @click="navigateToService(service)"
    >
      <!-- Icon -->
      <div class="aspect-w-16 aspect-h-9 relative overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <i
          :class="[service.icon, 'text-6xl text-primary-500']"
        />
        <!-- Badges -->
        <div class="absolute left-2 top-2 flex flex-wrap gap-2">
          <span
            v-if="service.isNew"
            class="rounded-full bg-primary-500 px-2 py-1 text-xs font-medium text-white"
          >
            {{ t('services.newBadge') }}
          </span>
          <span
            v-if="service.isFeatured"
            class="rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white"
          >
            {{ t('services.featuredBadge') }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4 flex flex-col h-[220px]">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white h-14 line-clamp-2 mb-2">
          {{ getTranslatedContent(service)?.title }}
        </h3>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400 h-[72px] line-clamp-3">
          {{ getTruncatedDescription(service) }}
        </p>

        <!-- Categories -->
        <div v-if="service.categories?.length" class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="category in service.categories"
            :key="category.id"
            class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {{ category.name }}
          </span>
        </div>

        <!-- Action -->
        <div class="mt-auto flex items-center justify-between">
          <button
            class="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {{ t('services.learnMore') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 