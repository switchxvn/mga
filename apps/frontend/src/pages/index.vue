<script setup lang="ts">
import { useTrpc } from '../composables/useTrpc';
import { ref, onMounted } from '../composables/useVueComposables';
import { useSeo } from '../composables/useSeo';
import { useRoute } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import PostCard from '../components/ui/card/PostCard.vue';
import ServicesList from '../components/sections/ServicesList.vue';
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

// Định nghĩa kiểu dữ liệu cho hero slider
interface HeroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
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

// Dữ liệu mẫu cho hero slider
const heroSlides = ref<HeroSlide[]>([
  {
    id: 1,
    title: 'Sản phẩm chất lượng cao',
    description: 'Chúng tôi cung cấp các sản phẩm với chất lượng tốt nhất trên thị trường',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'Khám phá ngay',
    buttonLink: '/products'
  },
  {
    id: 2,
    title: 'Dịch vụ chuyên nghiệp',
    description: 'Đội ngũ nhân viên chuyên nghiệp, tận tâm phục vụ mọi nhu cầu của khách hàng',
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'Tìm hiểu thêm',
    buttonLink: '/services'
  },
  {
    id: 3,
    title: 'Giải pháp toàn diện',
    description: 'Cung cấp giải pháp toàn diện cho doanh nghiệp của bạn',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'Liên hệ ngay',
    buttonLink: '/contact'
  }
]);

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
    <section class="hero-section bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-[hsl(var(--background))] py-8 md:py-12 overflow-hidden">
      <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row items-stretch gap-6">
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
              <SwiperSlide v-for="slide in heroSlides" :key="slide.id" class="relative">
                <div class="relative h-full">
                  <!-- Background Image -->
                  <img 
                    :src="slide.image" 
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
    
    <!-- Featured Products Section -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">{{ t('products.featured') }}</h2>
        
        <FeaturedProducts />
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
          <Swiper v-bind="postsSwiperOptions" class="w-full">
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

<style lang="scss">
@use "@/assets/styles/base/_variables.scss" as *;

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
  .post-slider,
  .hero-slider-container {
    :deep {
      .swiper-button-next,
      .swiper-button-prev {
        display: none;
      }
    }
  }
}

.video-thumbnail {
  &:hover img {
    transform: scale(1.05);
  }
}
</style>
