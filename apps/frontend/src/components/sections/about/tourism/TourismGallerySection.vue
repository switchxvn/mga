<script setup lang="ts">
import { computed, onUnmounted } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';

const { t } = useLocalization();

interface GalleryItem {
  image: string;
  title: string;
  link: string;
}

interface Props {
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    animation?: {
      enabled: boolean;
      type: string;
      duration: number;
      delay: number;
    };
    gallery?: GalleryItem[];
  };
  translations?: {
    title?: string;
    subtitle?: string;
    content?: string;
    data?: Record<string, any>;
  };
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({
    backgroundColor: 'bg-white',
    textColor: 'text-gray-900',
    padding: '4rem 0',
    animation: {
      enabled: true,
      type: 'fade-up',
      duration: 1000,
      delay: 200
    },
    gallery: []
  }),
  translations: () => ({})
});

// Default locations data
const defaultLocations: GalleryItem[] = [
  {
    image: '/images/tourism/bo-ba-chua-xu.jpg',
    title: 'Bộ Bà Chùa Xứ',
    link: '/features/chua-xu'
  },
  {
    image: '/images/tourism/den-phat-ngoc.jpg',
    title: 'Đền Phật Ngọc Hoà Bình Thế Giới',
    link: '/features/den-phat-ngoc'
  },
  {
    image: '/images/tourism/nha-ga.jpg',
    title: 'Nhà Ga Cáp Treo',
    link: '/features/nha-ga'
  },
  {
    image: '/images/tourism/bai-giu-xe.jpg',
    title: 'Bãi Giữ Xe Rộng Rãi',
    link: '/features/bai-giu-xe'
  },
  {
    image: '/images/tourism/chua-mot-cot.jpg',
    title: 'Chùa Một Cột',
    link: '/features/chua-mot-cot'
  },
  {
    image: '/images/tourism/phat-thien-thu.jpg',
    title: 'Phật Thiên Thủ Thiên Nhãn',
    link: '/features/phat-thien-thu'
  },
  {
    image: '/images/tourism/dien-phat-duoc-su.jpg',
    title: 'Điện Phật Dược sư',
    link: '/features/dien-phat-duoc-su'
  },
  {
    image: '/images/tourism/dai-vong-canh.jpg',
    title: 'Đài Vọng Cảnh',
    link: '/features/dai-vong-canh'
  }
];

// Use computed to combine props data with default data
const locations = computed(() => {
  return props.settings?.gallery?.length ? props.settings.gallery : defaultLocations;
});

const containerClasses = computed(() => [
  props.settings?.backgroundColor,
  props.settings?.textColor,
  props.settings?.padding
]);

// PhotoSwipe
let pswpInstance: PhotoSwipe | null = null;

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

const initPhotoSwipe = async (index: number = 0) => {
  const items = await Promise.all(
    locations.value.map(async (item) => {
      const dimensions = await getImageDimensions(item.image);
      return {
        src: item.image,
        w: dimensions.width,
        h: dimensions.height,
        originalSrc: item.image,
        title: item.title
      };
    })
  );

  const options = {
    index,
    bgOpacity: 0.9,
    padding: { top: 20, bottom: 20, left: 20, right: 20 },
    showHideOpacity: true,
    allowPanToNext: true,
    wheelToZoom: false,
    pinchToClose: true,
    maxZoomLevel: 4,
    imageClickAction: false,
    tapAction: false,
    doubleTapAction: false,
    errorMsg: 'Không thể tải ảnh',
    pswpModule: PhotoSwipe
  };

  pswpInstance = new PhotoSwipe({
    dataSource: items,
    ...options
  });

  // Set zoom levels for maintaining aspect ratio
  pswpInstance.on('firstUpdate', () => {
    const slide = pswpInstance?.currSlide;
    if (slide) {
      slide.zoomLevels.initial = 1;
      slide.zoomLevels.secondary = 2;
      slide.zoomLevels.max = 4;
    }
  });

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
  <section :class="containerClasses">
    <div class="container mx-auto px-4 py-16">
      <!-- Section Header -->
      <div class="text-center mb-12" v-if="translations?.title || translations?.subtitle">
        <h2 class="text-4xl font-extrabold mb-4 text-primary-600 uppercase" v-if="translations?.title">
          {{ translations.title }}
        </h2>
        <p class="text-2xl font-bold text-gray-600 dark:text-gray-400" v-if="translations?.subtitle">
          {{ translations.subtitle }}
        </p>
        <div class="mt-6 max-w-3xl mx-auto text-xl font-bold" v-if="translations?.content" v-html="translations.content">
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(location, index) in locations" :key="index" 
             class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
             :data-aos="settings?.animation?.enabled ? settings.animation.type : ''"
             :data-aos-duration="settings?.animation?.duration"
             :data-aos-delay="(settings?.animation?.delay ?? 200) * index">
          
          <!-- Image Container -->
          <div class="relative aspect-ratio-4-3 overflow-hidden cursor-pointer" @click="initPhotoSwipe(index)">
            <img :src="location.image" 
                 :alt="location.title"
                 class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="text-2xl font-extrabold mb-2 text-primary-600 hover:text-primary-700 transition-colors duration-300">{{ location.title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.aspect-ratio-4-3 {
  aspect-ratio: 4/3;
}

/* PhotoSwipe customization */
:deep(.pswp__bg) {
  background: rgba(0, 0, 0, 0.9);
}

:deep(.pswp__top-bar) {
  background: none !important;
}

:deep(.pswp__counter) {
  color: white;
}

:deep(.pswp__button) {
  background: none !important;
}

:deep(.pswp__button--arrow--left:before),
:deep(.pswp__button--arrow--right:before) {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

:deep(.pswp__img) {
  object-fit: contain !important;
}

:deep(.pswp__zoom-wrap) {
  transform-origin: center !important;
}
</style> 