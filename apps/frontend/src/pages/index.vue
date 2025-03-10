<script setup lang="ts">
import { useTrpc } from '../composables/useTrpc';
import { ref, onMounted } from '../composables/useVueComposables';
import { useSeo } from '../composables/useSeo';
import { useRoute } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import PostCard from '../components/ui/card/PostCard.vue';
import ServicesList from '../components/sections/ServicesList.vue';
import HeroSection from '../components/sections/HeroSection.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import FeaturedProducts from '../components/sections/FeaturedProducts.vue';

// Định nghĩa kiểu dữ liệu cho bài viết
interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  published?: boolean;
  author?: any;
  ogImage?: string;
  slug?: string;
  metaDescription?: string;
  [key: string]: any;
}

// Định nghĩa kiểu dữ liệu cho dịch vụ
interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Định nghĩa kiểu dữ liệu cho video thumbnail
interface VideoThumbnail {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
}

const route = useRoute();
const trpc = useTrpc();
const { t } = useLocalization();
const latestPosts = ref<Post[]>([]);
const services = ref<Service[]>([]);
const isLoading = ref(false);
const isLoadingServices = ref(false);
const error = ref<string | null>(null);
const serviceError = ref<string | null>(null);

// Cấu hình Swiper cho posts
const postsSwiperOptions = {
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: true,
  pagination: { clickable: true },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
    1280: {
      slidesPerView: 4,
    },
  },
};

onMounted(async () => {
  try {
    // Fetch posts and services
    await Promise.all([
      fetchLatestPosts(),
      fetchServices()
    ]);
  } catch (err) {
    console.error('Error in page initialization:', err);
  }
});

async function fetchLatestPosts() {
  isLoading.value = true;
  error.value = null;
  try {
    // Gọi tRPC endpoint để lấy danh sách bài viết mới nhất
    const result = await trpc.post.all.query();
    // Chuyển đổi dữ liệu để phù hợp với kiểu Post
    latestPosts.value = result.map(post => ({
      ...post,
      id: Number(post.id), // Đảm bảo id là kiểu number
      author: post.author || {}
    })).slice(0, 20); // Lấy tối đa 20 bài viết
  } catch (err: any) {
    console.error('Failed to fetch latest posts:', err);
    error.value = err.message || 'Đã xảy ra lỗi khi tải bài viết';
  } finally {
    isLoading.value = false;
  }
}

async function fetchServices() {
  isLoadingServices.value = true;
  serviceError.value = null;
  try {
    // Gọi tRPC endpoint để lấy danh sách dịch vụ
    const result = await trpc.service.all.query();
    services.value = result;
  } catch (err: any) {
    console.error('Failed to fetch services:', err);
    serviceError.value = err.message || 'Đã xảy ra lỗi khi tải dịch vụ';
  } finally {
    isLoadingServices.value = false;
  }
}

const getAuthorName = (author: any) => {
  if (author?.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author?.username || author?.email?.split('@')[0] || 'Ẩn danh';
};
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection />

    <!-- Featured Products Section -->
    <section class="featured-products-section py-12 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">{{ t('products.featured') }}</h2>
        <FeaturedProducts />
      </div>
    </section>

    <!-- Services Section -->
    <ServicesList :services="services" :is-loading="isLoadingServices" :error="serviceError" />

    <!-- Latest Posts Section -->
    <section class="latest-posts-section py-12 bg-[hsl(var(--muted))]">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">{{ t('home.latest_posts') }}</h2>
        
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <ULoader size="lg" />
        </div>
        
        <div v-else-if="error" class="text-center text-red-500 py-8">
          {{ error }}
        </div>
        
        <div v-else-if="latestPosts.length === 0" class="text-center py-8">
          {{ t('home.no_posts') }}
        </div>
        
        <div v-else>
          <Swiper v-bind="postsSwiperOptions" class="w-full">
            <SwiperSlide v-for="post in latestPosts" :key="post.id" class="h-full">
              <PostCard 
                :post="post"
                :compact="false"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/base/_variables.scss" as *;

.post-slider {
  :deep {
    .swiper-pagination {
      bottom: 0;
    }

    .swiper-button-next,
    .swiper-button-prev {
      color: hsl(var(--primary));
      top: 50%;
      transform: translateY(-50%);
    }

    .swiper-button-next {
      right: var(--spacing-2-5);
    }

    .swiper-button-prev {
      left: var(--spacing-2-5);
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
