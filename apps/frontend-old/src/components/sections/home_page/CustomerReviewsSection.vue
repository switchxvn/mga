<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { computed, ref } from 'vue';
import { Quote, Star, StarOff } from 'lucide-vue-next';

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  position: string;
  date: string;
}

interface SectionSettings {
  layout: string;
  slidesPerView: {
    sm: number;
    md: number;
    lg: number;
  };
  gap: string;
  padding: {
    top: string;
    bottom: string;
  };
  autoplay: {
    delay: number;
    disableOnInteraction: boolean;
    pauseOnMouseEnter: boolean;
  };
  navigation: boolean;
  pagination: boolean;
  colors: {
    background: string;
    title: string;
    description: string;
    quote: string;
  };
  card: {
    background: string;
    rounded: string;
    shadow: string;
    padding: string;
    avatar: {
      size: string;
      rounded: string;
    };
    rating: {
      show: boolean;
      color: string;
    };
  };
  reviews: Review[];
}

interface Props {
  section: {
    title: string;
    settings: SectionSettings;
  };
}

const props = defineProps<Props>();

const swiperInstance = ref<SwiperType>();

const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper;
  // Ensure autoplay is started
  swiper.autoplay.start();
};

const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  slidesPerGroup: 1,
  spaceBetween: 32,
  loop: true,
  loopPreventsSliding: false,
  loopAddBlankSlides: true,
  speed: 800,
  allowTouchMove: true,
  watchOverflow: true,
  navigation: {
    nextEl: '.reviews-swiper-next',
    prevEl: '.reviews-swiper-prev',
    enabled: true
  },
  pagination: {
    el: '.reviews-swiper-pagination',
    clickable: true,
    enabled: true,
    dynamicBullets: true
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
    stopOnLastSlide: false,
    waitForTransition: false
  },
  breakpoints: {
    640: {
      slidesPerView: props.section.settings.slidesPerView.sm
    },
    768: {
      slidesPerView: props.section.settings.slidesPerView.md
    },
    1024: {
      slidesPerView: props.section.settings.slidesPerView.lg
    }
  }
}));

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => ({
    filled: index < rating,
    key: index
  }));
};
</script>

<template>
  <section :class="section.settings.colors.background">
    <div class="container mx-auto px-4 relative" :style="{
      paddingTop: section.settings.padding.top,
      paddingBottom: section.settings.padding.bottom
    }">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 :class="['text-3xl font-bold mb-4', section.settings.colors.title]">
          {{ section.title }}
        </h2>
      </div>

      <!-- Reviews Slider -->
      <div class="relative">
        <Swiper 
          v-bind="swiperOptions" 
          class="reviews-slider"
        >
          <SwiperSlide v-for="review in section.settings.reviews" :key="review.id">
            <div :class="[
              'h-full flex flex-col min-h-[400px]',
              section.settings.card.background,
              section.settings.card.rounded,
              section.settings.card.shadow,
              section.settings.card.padding
            ]">
              <!-- Quote Icon -->
              <div :class="['mb-4', section.settings.colors.quote]">
                <Quote class="w-8 h-8" />
              </div>

              <!-- Review Content -->
              <div class="flex-grow">
                <!-- Rating Stars -->
                <div v-if="section.settings.card.rating.show" class="flex mb-4">
                  <template v-for="star in renderStars(review.rating)" :key="star.key">
                    <component
                      :is="star.filled ? Star : StarOff"
                      :class="[section.settings.card.rating.color, 'w-5 h-5 mr-1']"
                    />
                  </template>
                </div>

                <!-- Review Text -->
                <p :class="['mb-6', section.settings.colors.description]">
                  {{ review.comment }}
                </p>
              </div>

              <!-- Reviewer Info -->
              <div class="flex items-center mt-4">
                <img
                  :src="review.avatar"
                  :alt="review.name"
                  :class="[
                    section.settings.card.avatar.size,
                    section.settings.card.avatar.rounded,
                    'object-cover'
                  ]"
                />
                <div class="ml-4">
                  <h4 :class="['font-semibold', section.settings.colors.title]">
                    {{ review.name }}
                  </h4>
                  <p :class="['text-sm', section.settings.colors.description]">
                    {{ review.position }}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <!-- Navigation buttons -->
        <div class="reviews-swiper-prev swiper-button-prev !z-10"></div>
        <div class="reviews-swiper-next swiper-button-next !z-10"></div>
        <div class="reviews-swiper-pagination !absolute !bottom-4 !z-10 !w-auto"></div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.reviews-slider {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    @apply w-8 h-8 md:w-12 md:h-12;
    color: var(--primary);
    
    &::after {
      @apply text-base md:text-xl;
    }
  }

  :deep(.swiper-pagination) {
    @apply left-1/2 -translate-x-1/2;
  }

  :deep(.swiper-pagination-bullet) {
    @apply w-2 h-2 md:w-3 md:h-3;
    background-color: var(--primary);
  }

  :deep(.swiper-slide) {
    height: auto;
  }
}

@media (max-width: 640px) {
  .reviews-slider {
    :deep(.swiper-button-next),
    :deep(.swiper-button-prev) {
      @apply hidden;
    }
  }
}
</style> 