<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { trpc } from '~/utils/trpc';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { useLocalization } from '../../composables/useLocalization';

interface Hero {
  id: number;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  videoUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface HeroSlider {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa kiểu dữ liệu cho video thumbnail
interface VideoThumbnail {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
}

const { t } = useI18n();
const { t: localT } = useLocalization();
const currentSlide = ref(0);
const isLoading = ref(true);
const error = ref<Error | null>(null);

// Fetch hero data
const heroQuery = trpc.hero.getHero.query();
const sliderQuery = trpc.hero.getHeroSliders.query();

const heroData = ref<Hero[]>([]);
const sliderData = ref<HeroSlider[]>([]);

// Dữ liệu mẫu cho video thumbnails
const videoThumbnails = ref<VideoThumbnail[]>([
  {
    id: 1,
    title: 'Hướng dẫn sử dụng sản phẩm',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 2,
    title: 'Quy trình sản xuất',
    thumbnail: 'https://images.unsplash.com/photo-1581092921461-7d65ca45393a?q=80&w=400&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Câu chuyện khách hàng',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
]);

// Cấu hình Swiper cho hero slider
const heroSwiperOptions = {
  modules: [Navigation, Pagination, Autoplay, EffectFade],
  slidesPerView: 1,
  spaceBetween: 0,
  navigation: true,
  pagination: { clickable: true },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  },
};

onMounted(async () => {
  try {
    heroData.value = await heroQuery as Hero[];
    sliderData.value = await sliderQuery as HeroSlider[];
    isLoading.value = false;
  } catch (err) {
    error.value = err as Error;
    isLoading.value = false;
  }
});

const hero = computed(() => {
  if (heroData.value && heroData.value.length > 0) {
    return heroData.value[0];
  }
  return null;
});

const sliders = computed(() => {
  return sliderData.value || [];
});

// Hàm mở video khi click vào thumbnail
const openVideo = (videoUrl: string) => {
  window.open(videoUrl, '_blank');
};

// Thêm hàm xử lý lỗi hình ảnh
const handleImageError = (event: Event, video: VideoThumbnail) => {
  const imgElement = event.target as HTMLImageElement;
  // Thay thế bằng hình ảnh mặc định khi lỗi
  imgElement.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop';
};

interface Slide {
  image_url: string;
  title: string;
  description: string;
  link: string;
  order: number;
}

interface Props {
  slides?: Slide[];
  config?: {
    height?: string;
    layout?: 'split' | 'full';
    autoplay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    videoWidth?: string;
    sliderWidth?: string;
    videoPosition?: 'left' | 'right';
    sliderPosition?: 'left' | 'right';
  };
}

const props = withDefaults(defineProps<Props>(), {
  slides: () => [],
  config: () => ({
    height: '600px',
    layout: 'full',
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    videoWidth: '30%',
    sliderWidth: '70%',
    videoPosition: 'left',
    sliderPosition: 'right'
  })
});

const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay, EffectFade],
  slidesPerView: 1,
  effect: 'fade',
  navigation: props.config.showArrows,
  pagination: props.config.showDots ? { clickable: true } : false,
  autoplay: props.config.autoplay ? {
    delay: props.config.interval,
    disableOnInteraction: false,
  } : false,
}));

const sortedSlides = computed(() => {
  return [...props.slides].sort((a, b) => a.order - b.order);
});
</script>

<template>
  <section class="hero-section relative" :style="{ height: config?.height || '600px' }">
    <div v-if="isLoading" class="flex items-center justify-center w-full h-full">
      <ULoader size="lg" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center w-full h-full">
      <p class="text-red-500">{{ error.message }}</p>
    </div>
    
    <div v-else :class="[
      'flex w-full h-full',
      config?.layout === 'split' ? 'flex-row' : ''
    ]">
      <!-- Video Section -->
      <div v-if="config?.layout === 'split'" 
           :class="[
             'flex flex-col gap-4 p-4',
             config.videoPosition === 'left' ? 'order-1' : 'order-2'
           ]"
           :style="{ width: config.videoWidth }">
        <div v-for="video in videoThumbnails" 
             :key="video.id" 
             class="relative cursor-pointer group"
             @click="openVideo(video.videoUrl)">
          <img :src="video.thumbnail" 
               :alt="video.title"
               @error="handleImageError($event, video)"
               class="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105" />
          <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="heroicons:play-circle" class="w-12 h-12 text-white" />
          </div>
          <h3 class="mt-2 text-sm font-medium">{{ video.title }}</h3>
        </div>
      </div>

      <!-- Slider Section -->
      <div :class="[
        config?.layout === 'split' ? (config.sliderPosition === 'left' ? 'order-1' : 'order-2') : '',
        'relative'
      ]"
      :style="{ width: config?.layout === 'split' ? config.sliderWidth : '100%' }">
        <Swiper v-bind="swiperOptions" class="w-full h-full">
          <SwiperSlide v-for="slide in sortedSlides" :key="slide.order" class="relative">
            <div class="relative w-full h-full">
              <!-- Background Image -->
              <img 
                :src="slide.image_url" 
                :alt="slide.title"
                class="absolute inset-0 w-full h-full object-cover"
              />
              
              <!-- Overlay -->
              <div class="absolute inset-0 bg-black/40"></div>
              
              <!-- Content -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="container mx-auto px-4 text-center text-white">
                  <h1 class="text-4xl md:text-6xl font-bold mb-4">
                    {{ slide.title }}
                  </h1>
                  <p class="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                    {{ slide.description }}
                  </p>
                  <NuxtLink 
                    v-if="slide.link"
                    :to="slide.link"
                    class="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    {{ localT('common.learn_more') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-section {
  :deep(.swiper) {
    .swiper-button-next,
    .swiper-button-prev {
      color: white;
      
      &:hover {
        color: hsl(var(--primary));
      }
    }
    
    .swiper-pagination-bullet {
      background: white;
      opacity: 0.5;
      
      &-active {
        opacity: 1;
        background: hsl(var(--primary));
      }
    }
  }
}
</style> 