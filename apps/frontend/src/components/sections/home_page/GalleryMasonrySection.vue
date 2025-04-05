<!-- GalleryMasonrySection.vue -->
<template>
  <section :class="[settings.colors.background, settings.padding.top, settings.padding.bottom]">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div v-if="settings.showTitle" class="mb-8 bg-primary-600 dark:bg-primary-500 rounded-lg">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between gap-4 py-3">
            <div class="w-32 hidden sm:block"><!-- Spacer to help with centering --></div>
            <div class="category-header flex-1 text-center">
              <h2 
                class="inline-flex items-center px-4 py-2 mobile-title"
                :class="[
                  'text-2xl sm:text-3xl',
                  'font-bold text-white',
                  settings.useUppercase ? 'uppercase' : ''
                ]"
              >
                {{ section.title }}
              </h2>
            </div>
            <div class="w-32"><!-- Spacer to help with centering --></div>
          </div>
        </div>
      </div>

      <!-- Masonry Gallery -->
      <div v-if="galleries?.length" class="masonry-grid" :style="gridStyle">
        <div
          v-for="(item, index) in galleries"
          :key="item.id"
          class="masonry-item"
          :style="{ marginBottom: settings.gap }"
          @click="openLightbox(index)"
        >
          <div class="relative overflow-hidden rounded-lg">
            <NuxtImg
              :src="item.image"
              :alt="item.translations?.[0]?.title || ''"
              class="w-full h-auto object-cover transition-transform duration-300"
              :class="{ 'hover:scale-110': settings.imageHoverEffect === 'zoom' }"
              loading="lazy"
            />
            <div
              v-if="settings.showTitle && item.translations?.[0]?.title"
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
            >
              <h3 class="text-white text-lg font-semibold">{{ item.translations[0].title }}</h3>
              <p v-if="settings.showDescription && item.translations?.[0]?.description" class="text-white/80 text-sm mt-1">
                {{ item.translations[0].description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="settings.loadMoreButton.show && hasMoreItems" class="text-center mt-8">
        <UButton
          variant="solid"
          color="primary"
          :label="settings.loadMoreButton.text"
          @click="loadMore"
          :loading="isLoading"
        />
      </div>

      <!-- Lightbox -->
      <UModal v-model="isLightboxOpen" :ui="{ width: 'max-w-7xl' }">
        <div class="relative">
          <button
            class="absolute top-2 right-2 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            @click="closeLightbox"
          >
            <UIcon name="i-heroicons-x-mark" />
          </button>
          <UCarousel
            v-if="settings.lightbox.enabled"
            v-model="currentSlide"
            :items="galleries.map(g => ({
              url: g.image,
              alt: g.translations?.[0]?.title
            }))"
          >
            <template #item="{ item }">
              <img :src="item.url" :alt="item.alt" class="w-full h-auto object-contain" />
            </template>
          </UCarousel>
          <div
            v-if="settings.lightbox.showCaption && galleries[currentSlide]?.translations?.[0]"
            class="text-center mt-4"
          >
            <h3 class="text-lg font-semibold">{{ galleries[currentSlide].translations[0].title }}</h3>
            <p v-if="galleries[currentSlide].translations[0].description" class="text-sm mt-1 text-gray-600">
              {{ galleries[currentSlide].translations[0].description }}
            </p>
          </div>
        </div>
      </UModal>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTrpc } from '~/composables/useTrpc';

interface GalleryTranslation {
  id: number;
  locale: string;
  title: string;
  description?: string;
}

interface Gallery {
  id: number;
  image: string;
  isActive: boolean;
  sequence: number;
  translations: GalleryTranslation[];
}

interface ThemeSection {
  id: number;
  type: string;
  title: string;
  settings?: Record<string, any>;
}

const props = defineProps<{
  section: ThemeSection;
}>();

// Default settings
const defaultSettings = {
  layout: 'masonry',
  columns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  gap: '1rem',
  padding: {
    top: 'py-4',
    bottom: 'pb-4'
  },
  maxItems: 12,
  showTitle: true,
  showDescription: true,
  titleAlignment: 'center',
  colors: {
    title: 'text-gray-900 dark:text-white',
    description: 'text-gray-600 dark:text-gray-400',
    background: 'bg-white dark:bg-gray-900'
  },
  imageHoverEffect: 'zoom',
  loadMoreButton: {
    show: true,
    text: 'Xem thêm',
    style: 'primary'
  },
  lightbox: {
    enabled: true,
    showCaption: true,
    showThumbnails: true
  },
  useUppercase: true
};

const settings = computed(() => ({
  ...defaultSettings,
  ...(props.section?.settings || {})
}));

const description = ref('Khám phá bộ sưu tập hình ảnh đa dạng của chúng tôi');

// tRPC client
const trpc = useTrpc();

// State
const galleries = ref<Gallery[]>([]);
const isLoading = ref(false);
const currentPage = ref(1);
const isLightboxOpen = ref(false);
const currentSlide = ref(0);

// Computed
const hasMoreItems = computed(() => galleries.value.length < totalItems.value);
const totalItems = ref(0);

const gridStyle = computed(() => {
  const columns = settings.value.columns;
  return {
    display: 'grid',
    gap: settings.value.gap,
    gridTemplateColumns: `repeat(${columns.sm}, 1fr)`,
    '@media (min-width: 768px)': {
      gridTemplateColumns: `repeat(${columns.md}, 1fr)`,
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: `repeat(${columns.lg}, 1fr)`,
    },
    '@media (min-width: 1280px)': {
      gridTemplateColumns: `repeat(${columns.xl}, 1fr)`,
    },
  };
});

// Methods
const fetchGalleries = async () => {
  try {
    isLoading.value = true;
    const { locale } = useI18n();
    const result = await trpc.gallery.active.query({ locale: locale.value });
    galleries.value = result;
    totalItems.value = result.length;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    // Show user-friendly error message
    const { t } = useI18n();
    useToast().add({
      id: 'gallery-error',
      title: t('common.error'),
      description: t('gallery.fetchError'),
      color: 'red'
    });
    galleries.value = [];
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const loadMore = async () => {
  if (isLoading.value || !hasMoreItems.value) return;
  currentPage.value++;
  await fetchGalleries();
};

const openLightbox = (index: number) => {
  if (!settings.value.lightbox.enabled) return;
  currentSlide.value = index;
  isLightboxOpen.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
};

// Initial fetch
onMounted(() => {
  fetchGalleries();
});
</script>

<style lang="scss" scoped>
.masonry-grid {
  columns: v-bind('settings.columns.sm');
  column-gap: v-bind('settings.gap');
  
  @media (min-width: 768px) {
    columns: v-bind('settings.columns.md');
  }
  
  @media (min-width: 1024px) {
    columns: v-bind('settings.columns.lg');
  }
  
  @media (min-width: 1280px) {
    columns: v-bind('settings.columns.xl');
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: v-bind('settings.gap');
  display: inline-block;
  width: 100%;
  transition: transform 0.3s ease-in-out;
  
  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-5px);
  }
}

.category-header {
  position: relative;

  @media (max-width: 640px) {
    text-align: left !important;
    
    h2.mobile-title {
      font-size: 0.875rem !important;
      line-height: 1.25rem !important;
      padding: 0.375rem 0 !important;
      justify-content: flex-start !important;
      letter-spacing: 0.025em !important;
      font-weight: 600 !important;
    }
  }
}
</style> 