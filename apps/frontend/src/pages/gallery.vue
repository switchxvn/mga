<template>
  <div class="bg-white dark:bg-gray-900 min-h-screen">
    <div class="container mx-auto px-4 py-16">
      <!-- Page Header -->
      <div class="mb-8 bg-primary-600 dark:bg-primary-500 rounded-lg">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between gap-4 py-3">
            <div class="w-32 hidden sm:block"><!-- Spacer --></div>
            <div class="category-header flex-1 text-center">
              <h1 
                class="inline-flex items-center px-4 py-2 mobile-title text-2xl sm:text-3xl font-bold text-white uppercase"
              >
                {{ t('gallery.title') }}
              </h1>
            </div>
            <div class="w-32"><!-- Spacer --></div>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-4 justify-center">
          <UButton
            variant="soft"
            :color="galleryType === 'common' ? 'primary' : 'gray'"
            @click="setGalleryType('common')"
          >
            {{ t('gallery.commonGallery') }}
          </UButton>
          <UButton
            variant="soft"
            :color="galleryType === 'food' ? 'primary' : 'gray'"
            @click="setGalleryType('food')"
          >
            {{ t('gallery.foodGallery') }}
          </UButton>
        </div>
      </div>

      <!-- Gallery Container -->
      <div class="gallery-outer-container relative">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-16">
          <UIcon name="i-heroicons-arrow-path" class="text-primary-500 animate-spin w-10 h-10" />
        </div>

        <!-- Error State -->
        <div v-else-if="hasError" class="text-center py-16">
          <p class="text-red-500 mb-4">{{ t('gallery.fetchError') }}</p>
          <UButton @click="fetchGalleries" color="primary">
            {{ t('common.tryAgain') }}
          </UButton>
        </div>

        <!-- Empty State -->
        <div v-else-if="galleries.length === 0" class="text-center py-16">
          <p class="text-gray-500 dark:text-gray-400">{{ t('gallery.noImages') }}</p>
        </div>

        <!-- Gallery Content -->
        <template v-else>
          <!-- Navigation Buttons -->
          <button 
            @click="handleScrollLeft" 
            class="nav-button left-button"
            :class="{ 'opacity-0': scrollPosition <= 0 }"
          >
            <ChevronLeft class="h-6 w-6" />
            <span class="sr-only">Previous images</span>
          </button>

          <button 
            @click="handleScrollRight" 
            class="nav-button right-button"
            :class="{ 'opacity-0': scrollPosition >= maxScroll }"
          >
            <ChevronRight class="h-6 w-6" />
            <span class="sr-only">Next images</span>
          </button>

          <!-- Gallery Content -->
          <div 
            class="gallery-container cursor-grab active:cursor-grabbing" 
            ref="galleryContainer"
            @mousedown="startDragging"
            @mouseleave="stopDragging"
            @mouseup="stopDragging"
            @mousemove="onDrag"
          >
            <div class="gallery-wrapper" ref="galleryWrapper">
              <div class="gallery-grid">
                <!-- Row 1 -->
                <div class="gallery-row">
                  <figure 
                    v-for="(item, itemIndex) in getRowItems(0)"
                    :key="`row0-${item.id}-${itemIndex}`"
                    class="gallery-item"
                    :style="{ width: item.width }"
                  >
                    <a
                      :href="item.image"
                      @click.prevent="handleGalleryClick($event, getItemIndex(0, itemIndex))"
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
                    v-for="(item, itemIndex) in getRowItems(1)"
                    :key="`row1-${item.id}-${itemIndex}`"
                    class="gallery-item"
                    :style="{ width: item.width }"
                  >
                    <a
                      :href="item.image"
                      @click.prevent="handleGalleryClick($event, getItemIndex(1, itemIndex))"
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
                    v-for="(item, itemIndex) in getRowItems(2)"
                    :key="`row2-${item.id}-${itemIndex}`"
                    class="gallery-item"
                    :style="{ width: item.width }"
                  >
                    <a
                      :href="item.image"
                      @click.prevent="handleGalleryClick($event, getItemIndex(2, itemIndex))"
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
        </template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useTrpc } from '~/composables/useTrpc';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Define SEO metadata
useHead({
  title: 'Thư viện ảnh',
  meta: [
    { name: 'description', content: 'Khám phá bộ sưu tập ảnh đẹp của chúng tôi' }
  ]
});

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
  width?: string;
}

// i18n
const { t, locale } = useI18n();

// tRPC client
const trpc = useTrpc();

// State
const galleries = ref<Gallery[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const galleryType = ref<'common' | 'food'>('common');

// Refs for DOM elements
const galleryContainer = ref<HTMLElement | null>(null);
const galleryWrapper = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);
const maxScroll = ref(0);

// Add drag scroll functionality
const isDragging = ref(false);
const startX = ref(0);
const dragScrollLeft = ref(0);

// Helper function to get fixed width based on index
const getItemWidth = (index: number) => {
  // Pattern repeats every 6 images for consistent layout
  const pattern = index % 6;
  
  switch (pattern) {
    case 0: // Large landscape
      return '500px';
    case 1: // Portrait
      return '300px';
    case 2: // Square
      return '300px';
    case 3: // Wide landscape
      return '600px';
    case 4: // Small square
      return '400px';
    case 5: // Medium landscape
      return '500px';
    default:
      return '400px';
  }
};

// Scroll methods
const handleScrollLeft = () => {
  if (!galleryContainer.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const newPosition = Math.max(0, scrollPosition.value - containerWidth);
  galleryContainer.value.scrollTo({
    left: newPosition,
    behavior: 'smooth'
  });
};

const handleScrollRight = () => {
  if (!galleryContainer.value || !galleryWrapper.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const scrollWidth = galleryWrapper.value.scrollWidth;
  const currentScroll = galleryContainer.value.scrollLeft;
  
  // Calculate the maximum scroll position
  const maxScrollPosition = scrollWidth - containerWidth;
  
  // Calculate new scroll position
  const newPosition = Math.min(maxScrollPosition, currentScroll + containerWidth);
  
  // Update scroll position
  galleryContainer.value.scrollTo({
    left: newPosition,
    behavior: 'smooth'
  });
};

// Add drag scroll functionality
const startDragging = (e: MouseEvent) => {
  if (!galleryContainer.value) return;
  isDragging.value = true;
  startX.value = e.pageX - galleryContainer.value.offsetLeft;
  dragScrollLeft.value = galleryContainer.value.scrollLeft;
};

const stopDragging = () => {
  isDragging.value = false;
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !galleryContainer.value) return;
  e.preventDefault();
  const x = e.pageX - galleryContainer.value.offsetLeft;
  const walk = (x - startX.value) * 2;
  galleryContainer.value.scrollLeft = dragScrollLeft.value - walk;
  scrollPosition.value = galleryContainer.value.scrollLeft;
};

// Update scroll position on scroll
const onScroll = () => {
  if (!galleryContainer.value || !galleryWrapper.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const scrollWidth = galleryWrapper.value.scrollWidth;
  
  scrollPosition.value = galleryContainer.value.scrollLeft;
  maxScroll.value = scrollWidth - containerWidth;
};

// Update max scroll value
const updateMaxScroll = () => {
  if (!galleryContainer.value || !galleryWrapper.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const scrollWidth = galleryWrapper.value.scrollWidth;
  
  maxScroll.value = scrollWidth - containerWidth;
  scrollPosition.value = galleryContainer.value.scrollLeft;
};

// Function to preload image dimensions
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 600 }); // Default fallback size
    };
    img.src = url;
  });
};

// Initialize PhotoSwipe
const initPhotoSwipe = async (index: number = 0) => {
  // Prepare items with actual dimensions
  const itemPromises = galleries.value.map(async (item) => {
    const dimensions = await getImageDimensions(item.image);
    return {
      src: item.image,
      w: dimensions.width,
      h: dimensions.height,
      alt: item.translations?.[0]?.title || ''
    };
  });

  const items = await Promise.all(itemPromises);

  const options = {
    dataSource: items,
    index,
    pswpModule: PhotoSwipe,
    showHideAnimationType: 'fade' as const,
    showAnimationDuration: 300,
    hideAnimationDuration: 300,
    closeOnVerticalDrag: true,
    allowPanToNext: true,
    allowMouseDrag: true,
    maxZoomLevel: 3,
    scaleMode: 'fit' as const
  };

  const lightbox = new PhotoSwipe(options);
  lightbox.init();
};

// Add click handler for gallery items
const handleGalleryClick = (event: Event, index: number) => {
  event.preventDefault();
  initPhotoSwipe(index);
};

const getItemIndex = (rowIndex: number, indexInRow: number) => {
  const itemsPerRow = Math.ceil(galleries.value.length / 3);
  return rowIndex * itemsPerRow + indexInRow;
};

// Helper functions for row management
const getRowItems = (rowIndex: number) => {
  const itemsPerRow = Math.ceil(galleries.value.length / 3);
  const start = rowIndex * itemsPerRow;
  const items = galleries.value.slice(start, start + itemsPerRow);
  
  // Add fixed width based on position in overall gallery
  return items.map((item, indexInRow) => ({
    ...item,
    width: getItemWidth(start + indexInRow)
  }));
};

// Change gallery type
const setGalleryType = (type: 'common' | 'food') => {
  galleryType.value = type;
  fetchGalleries();
};

// Fetch galleries
const fetchGalleries = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    const result = await trpc.gallery.active.query({ 
      locale: locale.value,
      type: galleryType.value
    });
    galleries.value = result;
    
    // Update scroll values after images are loaded
    nextTick(() => {
      updateMaxScroll();
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    useToast().add({
      id: 'gallery-error',
      title: t('common.error'),
      description: t('gallery.fetchError'),
      color: 'red'
    });
    galleries.value = [];
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

// Add ResizeObserver
let resizeObserver: ResizeObserver;

onMounted(() => {
  fetchGalleries();
  
  if (galleryContainer.value) {
    // Initialize ResizeObserver
    resizeObserver = new ResizeObserver(() => {
      updateMaxScroll();
    });
    resizeObserver.observe(galleryContainer.value);
    
    // Add scroll event listener
    galleryContainer.value.addEventListener('scroll', onScroll);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (galleryContainer.value) {
    galleryContainer.value.removeEventListener('scroll', onScroll);
  }
});
</script>

<style lang="scss" scoped>
.category-header {
  position: relative;

  @media (max-width: 640px) {
    text-align: left !important;
    
    h1.mobile-title {
      font-size: 0.875rem !important;
      line-height: 1.25rem !important;
      padding: 0.375rem 0 !important;
      justify-content: flex-start !important;
      letter-spacing: 0.025em !important;
      font-weight: 600 !important;
    }
  }
}

.gallery-outer-container {
  position: relative;
  margin: 0;
  overflow: hidden;
  min-height: 300px;
  padding: 0 48px;
}

.gallery-container {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  cursor: grab;
  margin: 0;
  padding: 0;
  width: 100%;
  
  &:active {
    cursor: grabbing;
  }
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.gallery-wrapper {
  display: inline-flex;
  min-width: min-content;
  padding: 0 48px;
}

.gallery-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 48px; // Add padding to ensure last items are reachable
}

.gallery-row {
  display: flex;
  gap: 16px;
  min-height: 250px;
  
  .gallery-item {
    flex: none;
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
  }
}

// Navigation buttons
.nav-button {
  @apply bg-white/80 dark:bg-gray-800/80 
         backdrop-blur-sm
         text-gray-700 dark:text-gray-200 
         rounded-full shadow-lg
         hover:bg-primary-50 dark:hover:bg-primary-900
         transition-all duration-300 ease-in-out;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid theme('colors.gray.200');
  opacity: 1;
  pointer-events: auto;
  
  &.left-button {
    left: 0;
  }
  
  &.right-button {
    right: 0;
  }
  
  &:hover {
    transform: translateY(-50%) scale(1.1);
  }
  
  &.hidden {
    opacity: 0;
    pointer-events: none;
  }
}

// Media queries for responsive design
@media (max-width: 768px) {
  .gallery-outer-container {
    padding: 0 36px;
  }

  .gallery-container {
    margin: 0 -36px;
    padding: 0 36px;
  }

  .gallery-grid {
    flex-direction: row !important;
    gap: 12px !important;
  }

  .gallery-row {
    display: none !important;
    
    &:first-child {
      display: flex !important;
      gap: 12px;
      
      .gallery-item {
        width: 280px !important;
        min-width: 280px !important;
        height: 200px !important;
        
        &:last-child {
          width: 320px !important;
          min-width: 320px !important;
        }
      }
    }
  }

  .nav-button {
    width: 36px;
    height: 36px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
}

@media (max-width: 640px) {
  .gallery-outer-container {
    padding: 0 24px;
  }

  .gallery-container {
    margin: 0 -24px;
    padding: 0 24px;
  }

  .gallery-row:first-child {
    .gallery-item {
      width: 240px !important;
      min-width: 240px !important;
      height: 180px !important;
      
      &:last-child {
        width: 280px !important;
        min-width: 280px !important;
      }
    }
  }

  .nav-button {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

// Import PhotoSwipe base styles only
@import 'photoswipe/dist/photoswipe.css';

// PhotoSwipe overrides
:deep(.pswp) {
  --pswp-bg: rgba(0, 0, 0, 0.85);
  
  .pswp__img {
    object-fit: contain !important;
    border-radius: 8px;
    max-height: 90vh !important;
    max-width: 90vw !important;
  }
  
  .pswp__zoom-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style> 