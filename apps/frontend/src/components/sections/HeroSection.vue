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
</script>

<template>
  <section class="hero-section bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-[hsl(var(--background))] py-8 md:py-12 overflow-hidden">
    <div class="container mx-auto px-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <ULoader size="lg" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        <p>{{ t('common.error_loading') }}</p>
      </div>

      <!-- Hero content -->
      <div v-else class="flex flex-col lg:flex-row items-stretch gap-6">
        <!-- Left Column - Video Thumbnails (30%) -->
        <div class="lg:w-[30%] h-[500px] flex flex-col">
          <!-- 3 Video Thumbnails -->
          <div class="grid grid-cols-1 grid-rows-3 gap-4 h-full">
            <div 
              v-for="video in videoThumbnails" 
              :key="video.id"
              class="video-thumbnail relative rounded-[var(--radius)] overflow-hidden cursor-pointer group row-span-1 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-[var(--transition-normal)]"
              @click="openVideo(video.videoUrl)"
            >
              <div class="absolute inset-0">
                <img 
                  :src="video.thumbnail" 
                  :alt="video.title"
                  class="w-full h-full object-cover transition-transform duration-[var(--transition-normal)] group-hover:scale-105"
                  @error="handleImageError($event, video)"
                />
                <div class="absolute inset-0 bg-[hsl(var(--foreground)/0.4)] group-hover:bg-[hsl(var(--foreground)/0.3)] transition-colors duration-[var(--transition-normal)] flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-[hsl(var(--background)/0.9)] flex items-center justify-center text-[hsl(var(--primary))] transform group-hover:scale-110 transition-transform duration-[var(--transition-normal)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Column - Hero Slider (70%) -->
        <div class="lg:w-[70%] hero-slider-container">
          <Swiper v-bind="heroSwiperOptions" class="w-full h-[500px] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow-lg)]">
            <SwiperSlide v-for="slide in sliders" :key="slide.id" class="relative">
              <div class="relative h-full">
                <!-- Background Image -->
                <img 
                  :src="slide.imageUrl" 
                  :alt="slide.title"
                  class="absolute inset-0 w-full h-full object-cover"
                />
                
                <!-- Overlay -->
                <div class="absolute inset-0 bg-gradient-to-r from-[hsl(var(--foreground)/0.7)] to-[hsl(var(--foreground)/0.2)]"></div>
                
                <!-- Content -->
                <div class="absolute inset-0 flex items-center">
                  <div class="container mx-auto px-8 md:px-12 max-w-3xl">
                    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[hsl(var(--background))]">{{ slide.title }}</h2>
                    <p class="text-lg md:text-xl mb-6 max-w-xl text-[hsl(var(--background)/0.9)]">{{ slide.description }}</p>
                    <NuxtLink 
                      v-if="slide.buttonText && slide.buttonLink" 
                      :to="slide.buttonLink"
                      class="inline-block bg-[hsl(var(--background))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] px-6 py-3 rounded-[var(--radius)] font-medium transition-colors shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
                    >
                      {{ slide.buttonText }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-section {
  .hero-slider-container {
    :deep {
      .swiper-pagination {
        bottom: var(--spacing-5);
      }

      .swiper-pagination-bullet {
        width: var(--spacing-2-5);
        height: var(--spacing-2-5);
        background: hsl(var(--background));
        opacity: 0.5;
        transition: all var(--transition-normal);
      }

      .swiper-pagination-bullet-active {
        opacity: 1;
        background: hsl(var(--background));
        transform: scale(1.2);
      }

      .swiper-button-next,
      .swiper-button-prev {
        color: hsl(var(--background));
        background: var(--background-10);
        width: var(--spacing-10);
        height: var(--spacing-10);
        border-radius: var(--radius-full);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-normal);

        &:hover {
          background: var(--background-20);
          transform: scale(1.1);
        }

        &::after {
          font-size: var(--font-size-lg);
        }
      }
    }
  }
}

.video-thumbnail {
  &:hover img {
    transform: scale(1.05);
  }
}

@media (max-width: 640px) {
  .hero-slider-container {
    :deep {
      .swiper-button-next,
      .swiper-button-prev {
        display: none;
      }
    }
  }
}
</style> 