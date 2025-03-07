<script setup lang="ts">
import { useTrpc } from '../composables/useTrpc';
import { ref, onMounted } from '../composables/useVueComposables';
import { useSeo } from '../composables/useSeo';
import { useRoute } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import PostCard from '../components/ui/card/PostCard.vue';
import ServicesList from '../components/sections/ServicesList.vue';
// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const route = useRoute();
const trpc = useTrpc();
const { t } = useLocalization();
const latestPosts = ref<Post[]>([]);
const services = ref<Service[]>([]);
const isLoading = ref(false);
const isLoadingServices = ref(false);
const error = ref<string | null>(null);
const serviceError = ref<string | null>(null);

// Cấu hình Swiper
const swiperOptions = {
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
    <section class="hero-section bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 md:py-24">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="md:w-1/2 mb-8 md:mb-0">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('welcome') }}</h1>
            <p class="text-xl mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies.
            </p>
            <div class="flex space-x-4">
              <button class="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors">
                {{ t('common.create') }}
              </button>
              <button class="bg-transparent border border-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-colors">
                {{ t('common.edit') }}
              </button>
            </div>
          </div>
          <div class="md:w-1/2">
          </div>
        </div>
      </div>
    </section>
    
    <!-- Latest Posts Section -->
    <section class="py-16 bg-muted/50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">Bài viết mới nhất</h2>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
          <p>{{ error }}</p>
          <Button 
            @click="fetchLatestPosts" 
            variant="destructive"
            class="mt-2"
          >
            Thử lại
          </Button>
        </div>
        
        <!-- Posts Slider -->
        <div v-else-if="latestPosts.length > 0" class="post-slider">
          <Swiper v-bind="swiperOptions" class="w-full">
            <SwiperSlide v-for="post in latestPosts" :key="post.id" class="pb-12">
              <PostCard 
                :post="post"
                :compact="false"
              />
            </SwiperSlide>
          </Swiper>
        </div>
        
        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-muted-foreground mb-4">Chưa có bài viết nào</p>
          <NuxtLink to="/posts/new">
            <Button>
              Tạo bài viết đầu tiên
            </Button>
          </NuxtLink>
        </div>
        
        <!-- View all button -->
        <div v-if="latestPosts.length > 0" class="text-center mt-10">
          <NuxtLink to="/posts">
            <Button size="lg">
              Xem tất cả bài viết
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Services Section -->
    <ServicesList 
      :services="services"
      :isLoading="isLoadingServices"
      :error="serviceError"
      @retry="fetchServices"
    />
  </div>
</template>

<style scoped>
.post-slider :deep(.swiper-pagination) {
  bottom: 0;
}

.post-slider :deep(.swiper-button-next),
.post-slider :deep(.swiper-button-prev) {
  color: var(--color-primary);
  top: 50%;
  transform: translateY(-50%);
}

.post-slider :deep(.swiper-button-next) {
  right: 10px;
}

.post-slider :deep(.swiper-button-prev) {
  left: 10px;
}

@media (max-width: 640px) {
  .post-slider :deep(.swiper-button-next),
  .post-slider :deep(.swiper-button-prev) {
    display: none;
  }
}
</style>
