<script setup lang="ts">
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import type { PropType } from 'vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTrpc } from '~/composables/useTrpc';
import type { Hero, HeroSlider, Slide } from '~/types/hero';
import { useLocalization } from '../../composables/useLocalization';

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
    const [heroResult, sliderResult] = await Promise.all([
      heroQuery,
      sliderQuery
    ]);
    
    heroData.value = heroResult as Hero[];
    sliderData.value = sliderResult as HeroSlider[];
    
    console.log('Hero data:', heroData.value);
    console.log('Slider data:', sliderData.value);
    
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
  effect: 'fade',
  navigation: props.config.showArrows,
  pagination: props.config.showDots ? { clickable: true } : false,
  autoplay: props.config.autoplay ? {
    delay: props.config.interval,
    disableOnInteraction: false,
  } : false,
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

// Hero Slider Component
const HeroSlider = defineComponent({
  props: {
    slides: {
      type: Array as PropType<Slide[]>,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    config: {
      type: Object as PropType<HeroConfig>,
      default: () => ({})
    }
  },
  setup(props) {
    const { t: localT } = useLocalization();
    return { localT };
  },
  template: `
    <Swiper v-if="slides.length > 0" 
            v-bind="options" 
            class="w-full h-full">
      <SwiperSlide v-for="slide in slides" :key="slide.order" class="relative">
        <div class="relative w-full h-full">
          <img 
            :src="slide.image_url" 
            :alt="slide.title"
            class="absolute inset-0 w-full h-full object-cover"
          />
          
          <!-- Gradient overlay -->
          <div class="absolute inset-0" 
               :class="[config.backgroundGradient?.direction || 'bg-gradient-to-t']"
               :style="{
                 background: config.backgroundGradient ? 
                   \`linear-gradient(\${config.backgroundGradient.direction.replace('to-', 'to ')}, \${config.backgroundGradient.from}, \${config.backgroundGradient.to})\` : 
                   'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                 opacity: config.overlayOpacity || '0.5'
               }"></div>
          
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
  `
});
</script>

<template>
  <section class="hero-section-full relative" :style="{ height: config?.height || '600px' }">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0" 
         :style="{ 
           background: config?.backgroundGradient ? 
             `linear-gradient(${config.backgroundGradient.direction.replace('to-', 'to ')}, ${config.backgroundGradient.from}, ${config.backgroundGradient.to})` : 
             'none',
           opacity: config?.overlayOpacity || '0.5',
           pointerEvents: 'none'
         }">
    </div>

    <div v-if="isLoading" class="flex items-center justify-center w-full h-full">
      <ULoader size="lg" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center w-full h-full">
      <p class="text-red-500">{{ error.message }}</p>
    </div>
    
    <div v-else class="w-full h-full">
      <HeroSlider :slides="sortedSlides" :options="swiperOptions" :config="config" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-section-full {
  :deep(.swiper) {
    height: 100%;
    
    .swiper-button-next,
    .swiper-button-prev {
      color: white;
      
      &:hover {
        color: hsl(var(--color-primary-200));
      }
    }
    
    .swiper-pagination-bullet {
      background: white;
      opacity: 0.5;
      
      &-active {
        opacity: 1;
        background: hsl(var(--color-primary-200));
      }
    }
  }
}
</style> 