<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { computed, ref, onBeforeUnmount } from 'vue';
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

// Add cleanup
onBeforeUnmount(() => {
  if (swiperInstance.value) {
    swiperInstance.value.destroy();
  }
});

const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  slidesPerGroup: 1,
  spaceBetween: 16,
  loop: true,
  loopPreventsSliding: false,
  loopAddBlankSlides: true,
  speed: 800,
  allowTouchMove: true,
  watchOverflow: true,
  centeredSlides: false,
  freeMode: false,
  navigation: {
    nextEl: '.reviews-swiper-next',
    prevEl: '.reviews-swiper-prev',
    enabled: true
  },
  pagination: {
    el: '.reviews-swiper-pagination',
    clickable: true,
    enabled: true,
    dynamicBullets: true,
    dynamicMainBullets: 3
  },
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
    stopOnLastSlide: false,
    waitForTransition: false
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 12,
      pagination: {
        dynamicBullets: false
      }
    },
    640: {
      slidesPerView: Math.min(props.section.settings.slidesPerView.sm, 2),
      spaceBetween: 20
    },
    768: {
      slidesPerView: Math.min(props.section.settings.slidesPerView.md, 2),
      spaceBetween: 24
    },
    1024: {
      slidesPerView: Math.min(props.section.settings.slidesPerView.lg, 3),
      spaceBetween: 32
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
    <div class="w-full relative overflow-hidden" :style="{
      paddingTop: section.settings.padding.top,
      paddingBottom: section.settings.padding.bottom
    }">
      <!-- Section Title -->
      <div class="container mx-auto px-4">
        <div class="text-center mb-8 sm:mb-12">
          <h2 :class="['text-2xl sm:text-3xl font-bold mb-4', section.settings.colors.title]">
            {{ section.title }}
          </h2>
        </div>
      </div>

      <!-- Reviews Slider -->
      <div class="w-full relative">
        <div class="container mx-auto">
          <div class="px-4 sm:px-6 lg:px-8">
            <Swiper 
              v-if="section.settings.reviews && section.settings.reviews.length > 0"
              v-bind="swiperOptions" 
              class="reviews-slider w-full"
              @swiper="onSwiper"
            >
              <SwiperSlide v-for="review in section.settings.reviews" :key="review.id">
                <div class="px-2 sm:px-3">
                  <div :class="[
                    'h-full flex flex-col w-full',
                    'min-h-[350px] sm:min-h-[400px]',
                    section.settings.card.background,
                    section.settings.card.rounded,
                    section.settings.card.shadow,
                    'p-4 sm:p-6'
                  ]">
                    <!-- Quote Icon -->
                    <div :class="['mb-3 sm:mb-4', section.settings.colors.quote]">
                      <Quote class="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>

                    <!-- Review Content -->
                    <div class="flex-grow">
                      <!-- Rating Stars -->
                      <div v-if="section.settings.card.rating.show" class="flex mb-3 sm:mb-4">
                        <template v-for="star in renderStars(review.rating)" :key="star.key">
                          <component
                            :is="star.filled ? Star : StarOff"
                            :class="[section.settings.card.rating.color, 'w-4 h-4 sm:w-5 sm:h-5 mr-1']"
                          />
                        </template>
                      </div>

                      <!-- Review Text -->
                      <p :class="['mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed', section.settings.colors.description]">
                        {{ review.comment }}
                      </p>
                    </div>

                    <!-- Reviewer Info -->
                    <div class="flex items-center mt-3 sm:mt-4">
                      <img
                        :src="review.avatar"
                        :alt="review.name"
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                        <h4 :class="['font-semibold text-sm sm:text-base truncate', section.settings.colors.title]">
                          {{ review.name }}
                        </h4>
                        <p :class="['text-xs sm:text-sm truncate', section.settings.colors.description]">
                          {{ review.position }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="reviews-swiper-prev swiper-button-prev !z-10 hidden sm:flex"></div>
        <div class="reviews-swiper-next swiper-button-next !z-10 hidden sm:flex"></div>
        <div class="reviews-swiper-pagination !absolute !bottom-2 sm:!bottom-4 !z-10 !w-auto !left-1/2 !transform !-translate-x-1/2"></div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.reviews-slider {
  width: 100%;
  overflow: hidden;
  
  :deep(.swiper) {
    overflow: visible;
    width: 100%;
  }
  
  :deep(.swiper-wrapper) {
    width: 100%;
  }
  
  :deep(.swiper-slide) {
    height: auto;
    width: auto;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    @apply w-10 h-10 lg:w-12 lg:h-12;
    color: var(--primary, #3b82f6);
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: calc(-20px);
    
    &::after {
      @apply text-sm lg:text-lg font-bold;
    }
    
    &:hover {
      background: var(--primary, #3b82f6);
      color: white;
    }
  }
  
  :deep(.swiper-button-next) {
    right: 10px;
    
    @media (min-width: 1024px) {
      right: 20px;
    }
  }
  
  :deep(.swiper-button-prev) {
    left: 10px;
    
    @media (min-width: 1024px) {
      left: 20px;
    }
  }

  :deep(.swiper-pagination) {
    position: static !important;
    margin-top: 20px;
    text-align: center;
  }

  :deep(.swiper-pagination-bullet) {
    @apply w-2.5 h-2.5 sm:w-3 sm:h-3;
    background-color: var(--primary, #3b82f6);
    opacity: 0.3;
    margin: 0 4px;
    
    &.swiper-pagination-bullet-active {
      opacity: 1;
      transform: scale(1.2);
    }
  }
}

// Ensure no horizontal overflow on mobile
@media (max-width: 768px) {
  .reviews-slider {
    :deep(.swiper-button-next),
    :deep(.swiper-button-prev) {
      display: none !important;
    }
    
    :deep(.swiper-pagination) {
      margin-top: 16px;
    }
    
    :deep(.swiper-pagination-bullet) {
      @apply w-2 h-2;
      margin: 0 3px;
    }
  }
}

// Prevent any content from overflowing horizontally
* {
  box-sizing: border-box;
}
</style> 