<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const { t } = useLocalization();

interface BannerSlide {
  backgroundImage: string;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface Props {
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    height?: {
      mobile?: string;
      desktop?: string;
    };
    animation?: {
      enabled: boolean;
      type: string;
      duration: number;
      delay: number;
    };
    slides?: BannerSlide[];
    swiperOptions?: {
      autoplay?: boolean;
      delay?: number;
      effect?: 'slide' | 'fade';
      loop?: boolean;
    };
    overlayColor?: string;
    overlayOpacity?: number;
    defaultButtonText?: string;
    defaultButtonLink?: string;
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
    backgroundColor: 'bg-primary-900',
    textColor: 'text-white',
    padding: '0',
    height: {
      mobile: 'h-[600px]',
      desktop: 'h-[800px]'
    },
    animation: {
      enabled: true,
      type: 'fade-up',
      duration: 1000,
      delay: 200
    },
    slides: [
      {
        backgroundImage: '/images/banner/slide-1.jpg',
        title: 'Khám phá vẻ đẹp núi Sam',
        subtitle: 'Trải nghiệm hành trình tâm linh độc đáo',
        buttonText: 'Đặt vé ngay',
        buttonLink: '#ticket-order'
      },
      {
        backgroundImage: '/images/banner/slide-2.jpg',
        title: 'Cáp treo hiện đại',
        subtitle: 'Công nghệ Châu Âu đẳng cấp',
        buttonText: 'Xem chi tiết',
        buttonLink: '#features'
      }
    ],
    swiperOptions: {
      autoplay: true,
      delay: 5000,
      effect: 'fade',
      loop: true
    },
    overlayColor: 'bg-black',
    overlayOpacity: 0.4,
    defaultButtonText: 'Đặt vé ngay',
    defaultButtonLink: '#ticket-order'
  }),
  translations: () => ({})
});

const containerClasses = computed(() => [
  props.settings?.backgroundColor,
  props.settings?.textColor,
  props.settings?.padding
]);

const overlayClasses = computed(() => [
  props.settings?.overlayColor
]);

const overlayStyle = computed(() => {
  const opacity = props.settings?.overlayOpacity || 0.4;
  return {
    opacity: opacity
  };
});

const heightClasses = computed(() => [
  props.settings?.height?.mobile || 'h-[600px]',
  `md:${props.settings?.height?.desktop || 'h-[800px]'}`
]);

// Swiper modules
const modules = [Autoplay, Pagination, Navigation, EffectFade];

// Swiper options
const swiperOptions = computed(() => ({
  modules,
  slidesPerView: 1,
  slidesPerGroup: 1,
  effect: props.settings?.swiperOptions?.effect || 'fade',
  loop: props.settings?.swiperOptions?.loop ?? true,
  loopPreventsSliding: false,
  loopAddBlankSlides: true,
  speed: 800,
  allowTouchMove: true,
  watchOverflow: true,
  navigation: {
    nextEl: '.order-ticket-swiper-next',
    prevEl: '.order-ticket-swiper-prev',
    enabled: true
  },
  pagination: {
    el: '.order-ticket-swiper-pagination',
    clickable: true,
    enabled: true
  },
  autoplay: props.settings?.swiperOptions?.autoplay ? {
    delay: props.settings?.swiperOptions?.delay || 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
    stopOnLastSlide: false,
    waitForTransition: false
  } : false
}));
</script>

<template>
  <section :class="[containerClasses, heightClasses]" class="relative overflow-hidden">
    <Swiper v-bind="swiperOptions" class="h-full order-ticket-swiper">
      <SwiperSlide v-for="(slide, index) in settings?.slides" :key="index" class="h-full">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img 
            :src="slide.backgroundImage" 
            :alt="slide.title"
            class="w-full h-full object-cover"
          />
          <div 
            v-if="(settings?.overlayOpacity ?? 0) > 0"
            class="absolute inset-0 bg-black"
            :class="overlayClasses"
            :style="overlayStyle"
          ></div>
        </div>

        <!-- Content -->
        <div class="container mx-auto px-4 h-full relative z-10 flex items-center">
          <div class="max-w-4xl mx-auto text-center"
               :data-aos="settings?.animation?.enabled ? settings.animation.type : ''"
               :data-aos-duration="settings?.animation?.duration"
               :data-aos-delay="settings?.animation?.delay">
            
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6" v-if="slide.title">
              {{ slide.title }}
            </h1>
            
            <p class="text-xl md:text-3xl lg:text-4xl mb-8 opacity-90" v-if="slide.subtitle">
              {{ slide.subtitle }}
            </p>
            
            <div class="prose prose-lg prose-invert mx-auto mb-12" v-if="slide.content"
                 v-html="slide.content">
            </div>

            <a v-if="slide.buttonText || settings?.defaultButtonText"
               :href="slide.buttonLink || settings?.defaultButtonLink"
               class="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              {{ slide.buttonText || settings?.defaultButtonText }}
            </a>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Navigation -->
    <div class="order-ticket-swiper-prev swiper-button-prev !z-10 !hidden md:!flex"></div>
    <div class="order-ticket-swiper-next swiper-button-next !z-10 !hidden md:!flex"></div>
    <div class="order-ticket-swiper-pagination !absolute !bottom-4 md:!bottom-8 !left-1/2 !-translate-x-1/2 !z-10 !w-auto"></div>
  </section>
</template>

<style lang="scss" scoped>
.prose :deep(a) {
  @apply text-primary-300 hover:text-primary-200;
}

.prose :deep(ul) {
  @apply list-disc list-inside;
}

.prose :deep(ol) {
  @apply list-decimal list-inside;
}

/* Swiper custom styles */
.order-ticket-swiper {
  height: 100%;
  
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    @apply w-8 h-8 md:w-12 md:h-12 text-white/70 hover:text-white transition-colors duration-300 cursor-pointer;
    
    &::after {
      @apply text-base md:text-xl;
    }
    
    &.swiper-button-disabled {
      @apply opacity-50 pointer-events-none;
    }
  }
  
  :deep(.swiper-pagination-bullet) {
    @apply w-2 h-2 md:w-3 md:h-3 bg-white/70 cursor-pointer;
    
    &.swiper-pagination-bullet-active {
      @apply bg-primary-500;
    }
  }
}
</style> 