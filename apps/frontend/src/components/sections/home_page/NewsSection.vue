<!-- NewsSection.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTrpc } from '~/composables/useTrpc';
import { useLocalization } from '~/composables/useLocalization';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PostCard from '~/components/ui/card/PostCard.vue';

interface PostTranslation {
  id: number;
  title: string;
  content: string;
  locale: string;
  slug: string;
  postId: number;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: number;
  title?: string;
  content?: string;
  thumbnail?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  published: boolean;
  author?: any;
  ogImage?: string;
  slug?: string;
  metaDescription?: string;
  shortDescription?: string;
  categories?: any[];
  translations?: PostTranslation[];
}

interface NewsConfig {
  title?: string;
  layout?: 'slider' | 'grid';
  slidesPerView?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  gap?: string;
  maxItems?: number;
  isCompact?: boolean;
  postIds?: number[];
  showDate?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
  excerptLength?: number;
  imageAspectRatio?: string;
  overlayOpacity?: number;
  backgroundGradient?: {
    from: string;
    to: string;
    direction: string;
  };
  buttonText?: string;
  buttonStyle?: string;
  padding?: {
    top: string;
    bottom: string;
  };
}

const props = withDefaults(defineProps<{
  config?: NewsConfig;
}>(), {
  config: () => ({
    layout: 'slider',
    slidesPerView: {
      desktop: 4,
      tablet: 2,
      mobile: 1
    },
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    gap: '1rem',
    maxItems: 12,
    isCompact: false,
    postIds: [],
    showDate: true,
    showAuthor: true,
    showExcerpt: true,
    excerptLength: 120,
    imageAspectRatio: '16/9',
    overlayOpacity: 0.5,
    backgroundGradient: {
      from: 'rgba(0,0,0,0.7)',
      to: 'rgba(0,0,0,0)',
      direction: 'to-t'
    },
    buttonText: 'Xem thêm',
    buttonStyle: 'primary',
    padding: {
      top: '2rem',
      bottom: '2rem'
    }
  })
});

const { t } = useI18n();
const { t: localT, locale } = useLocalization();
const trpc = useTrpc();

const isLoading = ref(false);
const error = ref<string | null>(null);
const latestPosts = ref<Post[]>([]);

// Swiper options
const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: props.config.showArrows,
  pagination: props.config.showDots ? { clickable: true } : false,
  autoplay: props.config.autoplay ? {
    delay: props.config.interval,
    disableOnInteraction: false,
  } : false,
  breakpoints: {
    640: {
      slidesPerView: props.config.slidesPerView?.mobile || 1,
    },
    1024: {
      slidesPerView: props.config.slidesPerView?.tablet || 2,
    },
    1280: {
      slidesPerView: props.config.slidesPerView?.desktop || 4,
    },
  },
}));

// Fetch latest posts
async function fetchLatestPosts() {
  isLoading.value = true;
  error.value = null;
  try {
    let result;
    
    // Nếu có postIds, lấy bài viết theo ID
    if (props.config.postIds && props.config.postIds.length > 0) {
      result = await trpc.post.byIds.query({ 
        ids: props.config.postIds,
        locale: locale.value 
      });
    } else {
      // Nếu không có postIds, lấy bài viết mới nhất
      result = await trpc.post.byLocale.query({ locale: locale.value });
    }
    
    latestPosts.value = result.map((post: any) => {
      const translation = post.translations?.find(
        (t: { locale: string }) => t.locale === locale.value
      );

      const mappedTranslations = post.translations?.map((t: any) => ({
        ...t,
        slug: t.slug || undefined
      }));

      return {
        ...post,
        id: Number(post.id),
        title: translation?.title || post.title,
        content: translation?.content || post.content,
        author: post.author || {},
        translations: mappedTranslations
      } as Post;
    }).slice(0, props.config.maxItems);
  } catch (err: any) {
    console.error("Failed to fetch latest posts:", err);
    error.value = err.message || localT('errors.failed_to_load_posts');
  } finally {
    isLoading.value = false;
  }
}

// Fetch posts on mount
fetchLatestPosts();

// Watch for locale changes
watch(locale, () => {
  fetchLatestPosts();
});

// Watch for postIds changes
watch(() => props.config.postIds, () => {
  fetchLatestPosts();
}, { deep: true });
</script>

<template>
  <section class="latest-posts-section py-12 bg-gray-50 dark:bg-gray-900" 
           :style="{
             paddingTop: config.padding?.top || '2rem',
             paddingBottom: config.padding?.bottom || '2rem'
           }">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">
        {{ config.title || t("home.latest_posts") }}
      </h2>

      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <ULoader size="lg" />
      </div>

      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
      </div>

      <div v-else-if="latestPosts.length === 0" class="text-center py-8">
        {{ t("home.no_posts") }}
      </div>

      <template v-else>
        <!-- Grid Layout -->
        <div v-if="config.layout === 'grid'"
             class="grid gap-6"
             :class="{
               'grid-cols-1': true,
               'sm:grid-cols-2': true,
               'lg:grid-cols-3': true,
               'xl:grid-cols-4': true
             }"
             :style="{ gap: config.gap || '1rem' }">
          <PostCard v-for="post in latestPosts"
                   :key="post.id"
                   :post="post"
                   :compact="config.isCompact"
                   :show-date="config.showDate"
                   :show-author="config.showAuthor"
                   :show-excerpt="config.showExcerpt"
                   :excerpt-length="config.excerptLength"
                   :image-aspect-ratio="config.imageAspectRatio"
                   :overlay-opacity="config.overlayOpacity"
                   :background-gradient="config.backgroundGradient"
                   :button-text="config.buttonText"
                   :button-style="config.buttonStyle" />
        </div>

        <!-- Slider Layout -->
        <Swiper v-else
                v-bind="swiperOptions"
                class="w-full post-slider">
          <SwiperSlide v-for="post in latestPosts"
                       :key="post.id"
                       class="h-full">
            <PostCard :post="post"
                     :compact="config.isCompact"
                     :show-date="config.showDate"
                     :show-author="config.showAuthor"
                     :show-excerpt="config.showExcerpt"
                     :excerpt-length="config.excerptLength"
                     :image-aspect-ratio="config.imageAspectRatio"
                     :overlay-opacity="config.overlayOpacity"
                     :background-gradient="config.backgroundGradient"
                     :button-text="config.buttonText"
                     :button-style="config.buttonStyle" />
          </SwiperSlide>
        </Swiper>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.post-slider {
  :deep {
    .swiper-pagination {
      bottom: -2rem;
    }

    .swiper-button-next,
    .swiper-button-prev {
      color: hsl(var(--primary));
      top: 50%;
      transform: translateY(-50%);

      &:hover {
        color: hsl(var(--primary-600));
      }

      &.swiper-button-disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }

    .swiper-button-next {
      right: -1rem;
      @media (min-width: 768px) {
        right: -2rem;
      }
    }

    .swiper-button-prev {
      left: -1rem;
      @media (min-width: 768px) {
        left: -2rem;
      }
    }

    .swiper-pagination-bullet {
      background: hsl(var(--primary));
      opacity: 0.5;

      &-active {
        opacity: 1;
      }
    }
  }
}

@media (max-width: 640px) {
  .post-slider {
    :deep {
      .swiper-button-next,
      .swiper-button-prev {
        display: none;
      }
    }
  }
}
</style> 