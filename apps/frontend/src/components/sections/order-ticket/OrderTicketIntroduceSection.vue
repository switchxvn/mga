<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';

interface Translation {
  title?: string;
  subtitle?: string;
  content?: string;
  data?: Record<string, any>;
}

interface Props {
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    imageUrl?: string;
  };
  translations: Translation;
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({
    backgroundColor: 'bg-gray-200',
    textColor: 'text-gray-900',
    imageUrl: undefined
  })
});

// PhotoSwipe instance
let pswpInstance: PhotoSwipe | null = null;

// Function to get image dimensions
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = url;
  });
};

// Initialize PhotoSwipe
const initPhotoSwipe = async () => {
  if (!props.settings?.imageUrl) return;

  const dimensions = await getImageDimensions(props.settings.imageUrl);
  
  const options = {
    dataSource: [{
      src: props.settings.imageUrl,
      w: dimensions.width,
      h: dimensions.height,
      alt: props.translations.title
    }],
    pswpModule: PhotoSwipe,
    showHideAnimationType: 'fade' as const,
    showAnimationDuration: 300,
    hideAnimationDuration: 300,
    wheelToZoom: false,
    tapAction: 'none' as const,
    doubleTapAction: 'none' as const,
    bgOpacity: 0.8
  };

  pswpInstance = new PhotoSwipe(options);
  pswpInstance.init();
};

// Cleanup on component unmount
onUnmounted(() => {
  if (pswpInstance) {
    pswpInstance.destroy();
    pswpInstance = null;
  }
});
</script>

<template>
  <section 
    class="introduce-section py-16 md:py-24"
    :class="settings?.backgroundColor || 'bg-gray-200'"
  >
    <div class="container mx-auto px-4">
      <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <!-- Text Content -->
          <div class="space-y-6">
            <div class="relative">
              <div class="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
              <h2 
                class="text-3xl md:text-4xl font-bold leading-tight uppercase"
                :class="[
                  settings?.textColor || 'text-gray-900',
                  'bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500'
                ]"
              >
                {{ translations.title }}
              </h2>
            </div>
            <p 
              class="text-lg md:text-xl"
              :class="settings?.textColor ? `${settings.textColor}/80` : 'text-gray-600'"
            >
              {{ translations.subtitle }}
            </p>
            <div 
              class="prose prose-lg max-w-none"
              :class="settings?.textColor ? `${settings.textColor}/70` : 'text-gray-500'"
              v-html="translations.content"
            ></div>
          </div>
          
          <!-- Image with PhotoSwipe -->
          <div class="relative h-64 md:h-96 cursor-zoom-in" @click="initPhotoSwipe">
            <NuxtImg
              v-if="settings?.imageUrl"
              :src="settings.imageUrl"
              class="rounded-lg object-cover w-full h-full shadow-xl transition-transform duration-300 hover:scale-105"
              :alt="translations.title"
              loading="lazy"
            />
          </div>
        </div>
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

<style scoped>
/* PhotoSwipe customization */
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