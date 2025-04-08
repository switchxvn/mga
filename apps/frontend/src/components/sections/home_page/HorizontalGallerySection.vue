<template>
  <section :class="[settings.colors.background, settings.padding.top, settings.padding.bottom]">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div v-if="settings.showTitle" class="mb-8 bg-primary-600 dark:bg-primary-500 rounded-lg">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between gap-4 py-3">
            <div class="w-32 hidden sm:block"><!-- Spacer --></div>
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
            <div class="w-32"><!-- Spacer --></div>
          </div>
        </div>
      </div>

      <!-- Gallery Container -->
      <div class="gallery-container" ref="galleryContainer">
        <div class="gallery-wrapper" ref="galleryWrapper">
          <div class="gallery-grid">
            <!-- Row 1 -->
            <div class="gallery-row">
              <figure 
                v-for="(item, index) in getRowItems(0)"
                :key="item.id"
                class="gallery-item"
                :style="{ width: item.width }"
              >
                <a
                  :href="item.image"
                  @click.prevent="handleGalleryClick($event, getItemIndex(0, index))"
                  target="_blank"
                  rel="noreferrer"
                >
                  <NuxtImg
                    :src="item.image"
                    :alt="item.translations?.[0]?.title || ''"
                    class="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </a>
              </figure>
            </div>
            
            <!-- Row 2 -->
            <div class="gallery-row">
              <figure 
                v-for="(item, index) in getRowItems(1)"
                :key="item.id"
                class="gallery-item"
                :style="{ width: item.width }"
              >
                <a
                  :href="item.image"
                  @click.prevent="handleGalleryClick($event, getItemIndex(1, index))"
                  target="_blank"
                  rel="noreferrer"
                >
                  <NuxtImg
                    :src="item.image"
                    :alt="item.translations?.[0]?.title || ''"
                    class="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </a>
              </figure>
            </div>
            
            <!-- Row 3 -->
            <div class="gallery-row">
              <figure 
                v-for="(item, index) in getRowItems(2)"
                :key="item.id"
                class="gallery-item"
                :style="{ width: item.width }"
              >
                <a
                  :href="item.image"
                  @click.prevent="handleGalleryClick($event, getItemIndex(2, index))"
                  target="_blank"
                  rel="noreferrer"
                >
                  <NuxtImg
                    :src="item.image"
                    :alt="item.translations?.[0]?.title || ''"
                    class="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </a>
              </figure>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center mt-4">
        <button 
          @click="scrollLeft" 
          class="nav-button"
          :disabled="scrollPosition <= 0"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          @click="scrollRight" 
          class="nav-button"
          :disabled="scrollPosition >= maxScroll"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
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
    </div>

    <!-- PhotoSwipe Template -->
    <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter"></div>
            <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
            <button class="pswp__button pswp__button--share" title="Share"></button>
            <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
            <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div class="pswp__share-tooltip"></div>
          </div>
          <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
          <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
          <div class="pswp__caption">
            <div class="pswp__caption__center"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useTrpc } from '~/composables/useTrpc';
import Masonry from 'masonry-layout';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';

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
  type: 'common' | 'food';
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
  layout: 'horizontal',
  columns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  gap: '24',
  padding: {
    top: 'py-8',
    bottom: 'pb-8'
  },
  maxItems: 12,
  showTitle: true,
  colors: {
    background: 'bg-white dark:bg-gray-900'
  },
  loadMoreButton: {
    show: true,
    text: 'Xem thêm',
    style: 'primary'
  },
  useUppercase: true,
  swiperSettings: {
    autoplay: true,
    interval: 5000,
    slidesPerView: 3,
    rows: 3
  }
};

const settings = computed(() => ({
  ...defaultSettings,
  ...(props.section?.settings || {})
}));

// tRPC client
const trpc = useTrpc();

// State
const galleries = ref<Gallery[]>([]);
const isLoading = ref(false);
const currentPage = ref(1);
const totalItems = ref(0);
const currentStartIndex = ref(0);
const itemsPerRow = 3;

// Computed
const hasMoreItems = computed(() => galleries.value.length < totalItems.value);

// Masonry instance
let masonryInstance: any = null;

// Refs for DOM elements
const galleryContainer = ref<HTMLElement | null>(null);
const galleryWrapper = ref<HTMLElement | null>(null);
const masonryContainer = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);
const maxScroll = ref(0);

// Get size class for items with fixed heights
const getItemClass = (index: number) => {
  // Pattern repeats every 6 images
  const pattern = index % 6;
  
  switch (pattern) {
    case 0: // Large landscape
      return 'w-1/2 h-[400px]';
    case 1: // Portrait
      return 'w-1/4 h-[400px]';
    case 2: // Square
      return 'w-1/4 h-[400px]';
    case 3: // Wide landscape
      return 'w-2/3 h-[300px]';
    case 4: // Small square
      return 'w-1/3 h-[300px]';
    case 5: // Medium landscape
      return 'w-1/2 h-[300px]';
    default:
      return 'w-1/3 h-[300px]';
  }
};

// Initialize Masonry
const initMasonry = () => {
  if (masonryContainer.value) {
    masonryInstance = new Masonry(masonryContainer.value, {
      itemSelector: '.gallery-item',
      columnWidth: '.gallery-item',
      percentPosition: true,
      horizontalOrder: true,
      transitionDuration: '0.3s'
    });
  }
};

// Initialize PhotoSwipe
const initPhotoSwipe = (index: number = 0) => {
  const items = galleries.value.map(item => ({
    src: item.image,
    width: 1200,
    height: 800,
    alt: item.translations?.[0]?.title || ''
  }));

  const options = {
    dataSource: items,
    index,
    pswpModule: PhotoSwipe
  };

  const lightbox = new PhotoSwipe(options);
  lightbox.init();
};

// Add click handler for gallery items
const handleGalleryClick = (event: Event, index: number) => {
  event.preventDefault();
  initPhotoSwipe(index);
};

// Update template click handler
const template = `
<figure 
  v-for="(item, index) in galleries" 
  :key="item.id"
  class="gallery-item"
  :class="getItemClass(index)"
>
  <a
    :href="item.image"
    @click.prevent="handleGalleryClick($event, index)"
    target="_blank"
    rel="noreferrer"
  >
    <NuxtImg
      :src="item.image"
      :alt="item.translations?.[0]?.title || ''"
      class="w-full h-full object-cover rounded-lg"
      loading="lazy"
    />
  </a>
  <figcaption class="hidden">
    {{ item.translations?.[0]?.title || '' }}
  </figcaption>
</figure>
`;

// Scroll methods
const scrollLeft = () => {
  if (galleryWrapper.value) {
    scrollPosition.value = Math.max(0, scrollPosition.value - 300);
    galleryWrapper.value.style.transform = `translateX(-${scrollPosition.value}px)`;
  }
};

const scrollRight = () => {
  if (galleryWrapper.value) {
    scrollPosition.value = Math.min(maxScroll.value, scrollPosition.value + 300);
    galleryWrapper.value.style.transform = `translateX(-${scrollPosition.value}px)`;
  }
};

// Update max scroll value
const updateMaxScroll = () => {
  if (galleryWrapper.value && galleryContainer.value) {
    maxScroll.value = galleryWrapper.value.scrollWidth - galleryContainer.value.clientWidth;
  }
};

// Fetch galleries
const fetchGalleries = async () => {
  try {
    isLoading.value = true;
    const { locale } = useI18n();
    const result = await trpc.gallery.active.query({ 
      locale: locale.value,
      type: 'common'
    });
    galleries.value = result;
    totalItems.value = result.length;
    
    // Initialize masonry after images are loaded
    nextTick(() => {
      initMasonry();
      updateMaxScroll();
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
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

// Lifecycle hooks
onMounted(() => {
  fetchGalleries();
  window.addEventListener('resize', updateMaxScroll);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMaxScroll);
  if (masonryInstance) {
    masonryInstance.destroy();
  }
});

// Helper function to get random width
const getRandomWidth = () => {
  // More diverse width variations (200px to 600px)
  const baseWidth = Math.floor(Math.random() * (600 - 200) + 200);
  return `${baseWidth}px`;
};

// Helper functions for row management
const getRowItems = (rowIndex: number) => {
  const itemsPerRow = Math.ceil(galleries.value.length / 3);
  const start = rowIndex * itemsPerRow;
  const items = galleries.value.slice(start, start + itemsPerRow);
  
  // Add random width to each item
  return items.map(item => ({
    ...item,
    width: getRandomWidth()
  }));
};

const getItemIndex = (rowIndex: number, indexInRow: number) => {
  const itemsPerRow = Math.ceil(galleries.value.length / 3);
  return rowIndex * itemsPerRow + indexInRow;
};
</script>

<style lang="scss" scoped>
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

.gallery-container {
  position: relative;
  overflow: hidden;
  margin: 0 -8px;
}

.gallery-wrapper {
  transition: transform 0.3s ease-in-out;
  padding: 0 8px;
}

.gallery-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gallery-row {
  display: flex;
  gap: 16px;
  min-height: 250px;
  overflow-x: auto;
  scrollbar-width: none; // Hide scrollbar for Firefox
  -ms-overflow-style: none; // Hide scrollbar for IE/Edge
  
  &::-webkit-scrollbar {
    display: none; // Hide scrollbar for Chrome/Safari
  }
  
  .gallery-item {
    flex: none; // Don't grow or shrink
    height: 250px;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    transition: all 0.3s ease-in-out;
    
    &:hover {
      z-index: 1;
      transform: translateY(-4px);
      
      img {
        transform: scale(1.05);
      }
    }
    
    a {
      display: block;
      width: 100%;
      height: 100%;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease-in-out;
    }
  }
}

.nav-button {
  @apply px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all duration-300;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  
  &:first-child {
    left: 1rem;
  }
  
  &:last-child {
    right: 1rem;
  }
  
  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.1);
  }
}

// Import PhotoSwipe base styles only
@import 'photoswipe/dist/photoswipe.css';

// PhotoSwipe overrides
:deep(.pswp) {
  --pswp-bg: rgba(0, 0, 0, 0.85);
  
  .pswp__img {
    object-fit: contain;
    border-radius: 8px;
  }
}
</style> 