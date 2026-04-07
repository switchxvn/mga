<template>
  <Swiper v-if="slides.length > 0" 
          v-bind="options" 
          class="w-full h-full rounded-lg overflow-hidden shadow-md hero-slider">
    <SwiperSlide v-for="slide in slides" :key="slide.order" class="relative">
      <div class="relative w-full h-full">
        <NuxtImg
          :src="slide.image_url"
          :alt="slide.title"
          width="1600"
          height="900"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1600px"
          format="webp"
          fit="cover"
          quality="75"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover"
        />
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
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
  <div v-else class="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
    <p class="text-gray-500 dark:text-gray-400">{{ localT('common.no_slides') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useLocalization } from '~/composables/useLocalization';

interface Slide {
  image_url: string;
  title: string;
  description: string;
  link: string;
  order: number;
  buttonText?: string;
}

defineProps({
  slides: {
    type: Array as PropType<Slide[]>,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});

const { t: localT } = useLocalization();
</script>

<style scoped>
.hero-section .hero-slider :deep(.swiper) .swiper-pagination-bullet {
  background-color: white !important;
  opacity: 0.5 !important;
}

.hero-section .hero-slider :deep(.swiper) .swiper-pagination-bullet-active {
  background-color: hsl(254 185 20) !important;
  opacity: 1 !important;
}

.hero-section .hero-slider :deep(.swiper) .swiper-button-prev,
.hero-section .hero-slider :deep(.swiper) .swiper-button-next {
  color: hsl(254 185 20) !important;
  opacity: 0.8 !important;
}

.hero-section .hero-slider :deep(.swiper) .swiper-button-prev:hover,
.hero-section .hero-slider :deep(.swiper) .swiper-button-next:hover {
  opacity: 1 !important;
  color: hsl(254 185 20) !important;
}
</style> 
