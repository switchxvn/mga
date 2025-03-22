<script setup lang="ts">
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import type { PropType } from 'vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTrpc } from '~/composables/useTrpc';
import type { Hero, HeroSlider, Slide } from '~/types/hero';
import { useLocalization } from '~/composables/useLocalization';
import HeroSliderComponent from '~/components/sliders/HeroSlider.vue';
import type { Swiper as SwiperType } from 'swiper/types';

interface HeroConfig {
  height?: string;
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  themeId?: number;
  backgroundGradient?: {
    from: string;
    to: string;
    direction: string;
  };
  overlayOpacity?: string;
}

interface Props {
  slides?: Slide[];
  config?: HeroConfig;
}

const props = withDefaults(defineProps<Props>(), {
  slides: () => [],
  config: () => ({
    height: '600px',
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    backgroundGradient: {
      from: 'rgba(0,0,0,0.7)',
      to: 'rgba(0,0,0,0)',
      direction: 'to-t'
    },
    overlayOpacity: '0.5'
  })
});

const { t } = useI18n();
const { t: localT } = useLocalization();
const currentSlide = ref(0);
const isLoading = ref(true);
const error = ref<Error | null>(null);

const trpc = useTrpc();

// Fetch hero data
const heroQuery = trpc.hero.getHero.query();
const sliderQuery = trpc.hero.getHeroSliders.query({ themeId: props.config?.themeId });

const heroData = ref<Hero[]>([]);
const sliderData = ref<HeroSlider[]>([]);

onMounted(async () => {
  try {
    console.log('Fetching hero data...');
    const [heroResult, sliderResult] = await Promise.all([
      heroQuery,
      sliderQuery
    ]);
    
    console.log('Raw hero result:', heroResult);
    console.log('Raw slider result:', sliderResult);
    
    heroData.value = heroResult as Hero[];
    sliderData.value = sliderResult as HeroSlider[];
    
    console.log('Processed hero data:', heroData.value);
    console.log('Processed slider data:', sliderData.value);
    
    const sortedSlides = computed(() => {
      if (sliderData.value && sliderData.value.length > 0) {
        return [...sliderData.value]
          .sort((a, b) => a.order - b.order)
          .map(slider => ({
            image_url: slider.imageUrl,
            title: slider.title,
            description: slider.description || '',
            link: slider.buttonLink || '#',
            buttonText: slider.buttonText,
            order: slider.order
          }));
      }
      return [...props.slides].sort((a, b) => a.order - b.order);
    });
    
    console.log('Computed sortedSlides:', sortedSlides.value);
    
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching hero data:', err);
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

const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay, EffectFade],
  slidesPerView: 1,
  slidesPerGroup: 1,
  effect: 'fade',
  loop: true,
  loopPreventsSliding: false,
  loopAddBlankSlides: true,
  speed: 800,
  allowTouchMove: true,
  watchOverflow: true,
  navigation: {
    nextEl: '.hero-swiper-next',
    prevEl: '.hero-swiper-prev',
    enabled: true
  },
  pagination: props.config.showDots ? {
    el: '.hero-swiper-pagination',
    clickable: true,
    enabled: true
  } : false,
  autoplay: props.config.autoplay ? {
    delay: props.config.interval || 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
    stopOnLastSlide: false,
    waitForTransition: false
  } : false
}));

const sortedSlides = computed(() => {
  if (sliderData.value && sliderData.value.length > 0) {
    return [...sliderData.value]
      .sort((a, b) => a.order - b.order)
      .map(slider => ({
        image_url: slider.imageUrl,
        title: slider.title,
        description: slider.description || '',
        link: slider.buttonLink || '#',
        buttonText: slider.buttonText,
        order: slider.order
      }));
  }
  return [...props.slides].sort((a, b) => a.order - b.order);
});
</script>

<template>
  <section class="hero-section-full relative" :style="{ height: config?.height || '600px' }">
    <div v-if="isLoading" class="flex items-center justify-center w-full h-full">
      <ULoader size="lg" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center w-full h-full">
      <p class="text-red-500">{{ error.message }}</p>
    </div>
    
    <div v-else class="w-full h-full relative">
      <Swiper v-if="sortedSlides.length > 0"
              v-bind="swiperOptions"
              class="w-full h-full hero-swiper">
        <SwiperSlide v-for="slide in sortedSlides" :key="slide.order" class="relative">
          <div class="relative w-full h-full">
            <!-- Image layer (z-index: 1) -->
            <img 
              :src="slide.image_url" 
              :alt="slide.title"
              class="absolute inset-0 w-full h-full object-cover z-[1]"
            />
            
            <!-- Dark overlay layer (z-index: 2) -->
            <div class="absolute inset-0 bg-black/50 z-[2]"></div>
            
            <!-- Content layer (z-index: 3) -->
            <div class="absolute inset-0 flex items-center justify-center z-[3]">
              <div class="container mx-auto px-4 text-center text-white">
                <h1 class="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {{ slide.title }}
                </h1>
                <p class="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow">
                  {{ slide.description }}
                </p>
                <NuxtLink 
                  v-if="slide.link"
                  :to="slide.link"
                  class="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  {{ slide.buttonText || localT('common.learn_more') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div v-else class="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
        <p class="text-gray-500 dark:text-gray-400">{{ localT('common.no_slides') }}</p>
      </div>

      <!-- Move navigation elements inside the relative container -->
      <div v-if="config.showArrows" class="hero-swiper-prev swiper-button-prev !z-10"></div>
      <div v-if="config.showArrows" class="hero-swiper-next swiper-button-next !z-10"></div>
      <div v-if="config.showDots" class="hero-swiper-pagination !absolute !bottom-8 !left-1/2 !-translate-x-1/2 !z-10 !w-auto"></div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-section-full {
  position: relative;
  
  :deep(.hero-swiper) {
    height: 100%;
  }
}

/* Move these styles outside of scoped to override Swiper's default styles */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  margin-top: -22px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 20;
}

:deep(.swiper-button-next)::after,
:deep(.swiper-button-prev)::after {
  font-family: swiper-icons;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-transform: none !important;
  letter-spacing: 0;
  font-variant: initial;
  line-height: 1;
}

:deep(.swiper-button-prev)::after {
  content: 'prev';
}

:deep(.swiper-button-next)::after {
  content: 'next';
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  &::after {
    color: rgb(var(--color-primary-DEFAULT) / var(--tw-bg-opacity));
  }
}

:deep(.swiper-button-next.swiper-button-disabled),
:deep(.swiper-button-prev.swiper-button-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  
  &:hover {
    &::after {
      color: white;
    }
  }
}

:deep(.swiper-button-prev) {
  left: 20px;
}

:deep(.swiper-button-next) {
  right: 20px;
}

@media (max-width: 640px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    display: none;
  }
}

:deep(.hero-swiper-pagination) {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 10;
  padding: 0;
  margin: 0;
  width: auto;
  min-width: max-content;
}

:deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  margin: 0;
  background-color: white;
  opacity: 0.5;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background-color: rgb(var(--color-primary-DEFAULT) / var(--tw-bg-opacity));
  transform: scale(1.2);
}
</style> 