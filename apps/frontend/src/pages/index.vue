<script setup lang="ts">
import { useRoute } from "vue-router";
import HeroSection from "../components/sections/HeroSection.vue";
import ProductCategoriesSection from "../components/sections/ProductCategoriesSection.vue";
import ServicesList from "../components/sections/ServicesList.vue";
import PostCard from "../components/ui/card/PostCard.vue";
import { useLocalization } from "../composables/useLocalization";
import { useTrpc } from "../composables/useTrpc";
import { computed, onMounted, ref, watch } from "../composables/useVueComposables";
// Import Swiper
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import FeaturedProducts from "../components/sections/FeaturedProducts.vue";

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
  translations?: Array<{
    id: number;
    title: string;
    content: string;
    locale: string;
  }>;
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

// Theme section interface
interface ThemeSection {
  id: number;
  type: string;
  title: string;
  order: number;
  settings: Record<string, any>;
  isActive: boolean;
}

// Theme interface
interface Theme {
  id: number;
  name: string;
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: Record<string, string>;
    error: Record<string, string>;
    warning: Record<string, string>;
    info: Record<string, string>;
  };
  sections: ThemeSection[];
  isActive: boolean;
}

// Section config interfaces
interface SliderConfig {
  height?: string;
  layout?: "split-columns" | "stacked-rows";
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  videoWidth?: string;
  sliderWidth?: string;
  videoPosition?: "left" | "right";
  sliderPosition?: "left" | "right";
  themeId?: number;
  items?: Array<{
    image_url: string;
    title: string;
    description: string;
    link: string;
    order: number;
  }>;
}

interface ProductsConfig {
  layout?: "grid" | "slider";
  columns?: number;
  maxItems?: number;
  showPrice?: boolean;
  showRating?: boolean;
  limit?: number;
  slidesPerView?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

interface ServicesConfig {
  layout: "grid";
  columns: number;
  maxItems: number;
  showIcon: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showPrice: boolean;
  showButton: boolean;
  descriptionLength: number;
  gap: string;
  backgroundGradient: {
    from: string;
    to: string;
    direction: string;
  };
  overlayOpacity: string;
  padding: {
    top: string;
    bottom: string;
  };
  buttonText: string;
  buttonStyle: string;
  cardStyle: {
    background: string;
    shadow: string;
    border: string;
    rounded: string;
    padding: string;
    transition: string;
  };
  iconStyle: {
    size: string;
    background: string;
    color: string;
    rounded: string;
    padding: string;
  };
  titleStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
  descriptionStyle: {
    size: string;
    color: string;
    margin: string;
  };
  priceStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
}

interface CategoriesConfig {
  title: string;
  layout: "grid" | "slider";
  columns: number;
  maxItems: number;
  showIcon: boolean;
  showTitle: boolean;
  showDescription: boolean;
  descriptionLength: number;
  gap: string;
  backgroundGradient: {
    from: string;
    to: string;
    direction: string;
  };
  overlayOpacity: string;
  padding: {
    top: string;
    bottom: string;
  };
  cardStyle: {
    background: string;
    shadow: string;
    border: string;
    rounded: string;
    padding: string;
    transition: string;
  };
  iconStyle: {
    size: string;
    background: string;
    color: string;
    rounded: string;
    padding: string;
  };
  titleStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
  descriptionStyle: {
    size: string;
    color: string;
    margin: string;
  };
  categoryIds?: number[];
  productsPerCategory?: number;
  displayMode: "grid" | "slider";
}

const route = useRoute();
const trpc = useTrpc();
const { t, locale } = useLocalization();
const latestPosts = ref<Post[]>([]);
const services = ref<Service[]>([]);
const isLoading = ref(false);
const isLoadingServices = ref(false);
const error = ref<string | null>(null);
const serviceError = ref<string | null>(null);
const activeTheme = ref<Theme | null>(null);
const isLoadingTheme = ref(false);
const themeError = ref<string | null>(null);

// Cấu hình Swiper cho posts dựa trên theme
const getPostsSwiperOptions = (theme: Theme | null) => {
  const defaultConfig = {
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

  if (!theme) return defaultConfig;

  const newsSection = theme.sections.find((section) => section.type === "news");
  if (!newsSection) return defaultConfig;

  return {
    ...defaultConfig,
    autoplay: {
      delay: newsSection.settings.delay || 5000,
      disableOnInteraction: false,
    },
    breakpoints: {
      640: {
        slidesPerView: newsSection.settings.slidesPerView?.mobile || 1,
      },
      1024: {
        slidesPerView: newsSection.settings.slidesPerView?.tablet || 2,
      },
      1280: {
        slidesPerView: newsSection.settings.slidesPerView?.desktop || 4,
      },
    },
  };
};

const postsSwiperOptions = computed(() => getPostsSwiperOptions(activeTheme.value));

onMounted(async () => {
  try {
    // Fetch theme, posts and services
    await Promise.all([fetchActiveTheme(), fetchLatestPosts(), fetchServices()]);
  } catch (err) {
    console.error("Error in page initialization:", err);
  }
});

async function fetchActiveTheme() {
  isLoadingTheme.value = true;
  themeError.value = null;
  try {
    const theme = await trpc.theme.getActiveTheme.query();
    // Sort sections by order field
    if (theme.sections) {
      theme.sections.sort((a, b) => a.order - b.order);
    }
    activeTheme.value = theme;

    // Apply theme colors
    if (theme.colors) {
      document.documentElement.style.setProperty("--primary", theme.colors.primary[500]);
      document.documentElement.style.setProperty(
        "--secondary",
        theme.colors.secondary[500]
      );
      document.documentElement.style.setProperty("--success", theme.colors.success[500]);
      document.documentElement.style.setProperty("--error", theme.colors.error[500]);
      document.documentElement.style.setProperty("--warning", theme.colors.warning[500]);
      document.documentElement.style.setProperty("--info", theme.colors.info[500]);
    }
  } catch (err: any) {
    console.error("Failed to fetch active theme:", err);
    themeError.value = err.message || "Đã xảy ra lỗi khi tải theme";
  } finally {
    isLoadingTheme.value = false;
  }
}

async function fetchLatestPosts() {
  isLoading.value = true;
  error.value = null;
  try {
    // Gọi tRPC endpoint để lấy danh sách bài viết theo locale hiện tại
    const result = await trpc.post.byLocale.query({ locale: locale.value });

    // Chuyển đổi dữ liệu để phù hợp với kiểu Post
    latestPosts.value = result
      .map((post: Post) => {
        // Tìm bản dịch cho locale hiện tại
        const translation = post.translations?.find(
          (t: { locale: string }) => t.locale === locale.value
        );

        return {
          ...post,
          id: Number(post.id),
          // Sử dụng title và content từ bản dịch nếu có, nếu không sử dụng giá trị mặc định
          title: translation?.title || post.title,
          content: translation?.content || post.content,
          author: post.author || {},
        };
      })
      .slice(0, 20); // Lấy tối đa 20 bài viết
  } catch (err: any) {
    console.error("Failed to fetch latest posts:", err);
    error.value = err.message || "Đã xảy ra lỗi khi tải bài viết";
  } finally {
    isLoading.value = false;
  }
}

// Thêm watcher để theo dõi thay đổi ngôn ngữ
watch(locale, () => {
  fetchLatestPosts();
});

async function fetchServices() {
  isLoadingServices.value = true;
  serviceError.value = null;
  try {
    // Gọi tRPC endpoint để lấy danh sách dịch vụ
    const result = await trpc.service.all.query();
    services.value = result;
  } catch (err: any) {
    console.error("Failed to fetch services:", err);
    serviceError.value = err.message || "Đã xảy ra lỗi khi tải dịch vụ";
  } finally {
    isLoadingServices.value = false;
  }
}

const getAuthorName = (author: any) => {
  if (author?.profile) {
    const firstName = author.profile.firstName || "";
    const lastName = author.profile.lastName || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author?.username || author?.email?.split("@")[0] || "Ẩn danh";
};

const getSectionConfig = (type: string) => {
  if (!activeTheme.value?.sections) return undefined;
  const section = activeTheme.value.sections.find((section) => section.type === type);
  if (!section) return undefined;

  return {
    ...section.settings,
    title: section.title,
    isActive: section.isActive,
    themeId: activeTheme.value.id,
  };
};

const getSliderConfig = computed(() => {
  const config = getSectionConfig("hero");
  return config as SliderConfig | undefined;
});

const getProductsConfig = computed(() => {
  const config = getSectionConfig("featured_products");
  return config as ProductsConfig | undefined;
});

const getServicesConfig = computed(() => {
  const config = getSectionConfig("services");
  return config as ServicesConfig | undefined;
});

const getCategoriesConfig = computed(() => {
  const config = getSectionConfig("product_categories");
  return config as CategoriesConfig | undefined;
});
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoadingTheme" class="flex justify-center items-center min-h-screen">
      <ULoader size="lg" />
    </div>

    <template v-else>
      <!-- Render sections based on their order -->
      <template v-for="section in activeTheme?.sections" :key="section.id">
        <!-- Hero Section -->
        <HeroSection
          v-if="section.type === 'hero' && section.isActive"
          :config="getSliderConfig"
        />

        <!-- Featured Products Section -->
        <section
          v-if="section.type === 'featured_products' && section.isActive"
          class="featured-products-section py-12 bg-white dark:bg-gray-900"
        >
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold mb-8 text-center">
              {{ section.title || t("products.featured") }}
            </h2>
            <FeaturedProducts :config="getProductsConfig" />
          </div>
        </section>

        <!-- Categories Section -->
        <ProductCategoriesSection
          v-if="
            section.type === 'product_categories' &&
            section.isActive &&
            getCategoriesConfig
          "
          :config="getCategoriesConfig"
        />

        <!-- Services Section -->
        <section
          v-if="section.type === 'services' && section.isActive"
          class="services-section relative"
          :style="{
            paddingTop: getServicesConfig?.padding?.top,
            paddingBottom: getServicesConfig?.padding?.bottom,
          }"
        >
          <!-- Background gradient overlay -->
          <div
            class="absolute inset-0"
            :style="{
              backgroundImage: getServicesConfig?.backgroundGradient
                ? `linear-gradient(${getServicesConfig.backgroundGradient.direction.replace(
                    'to-',
                    'to '
                  )}, ${getServicesConfig.backgroundGradient.from}, ${
                    getServicesConfig.backgroundGradient.to
                  })`
                : 'none',
              opacity: getServicesConfig?.overlayOpacity,
              pointerEvents: 'none',
            }"
          />

          <div class="container mx-auto px-4 relative">
            <h2 class="text-3xl font-bold mb-8 text-center">
              {{ section.title || t("services.title") }}
            </h2>

            <ServicesList
              :services="services"
              :is-loading="isLoadingServices"
              :error="serviceError"
              :config="getServicesConfig"
            />
          </div>
        </section>

        <!-- Latest Posts Section -->
        <section
          v-if="section.type === 'news' && section.isActive"
          class="latest-posts-section py-12 bg-[hsl(var(--muted))]"
        >
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold mb-8 text-center">
              {{ section.title || t("home.latest_posts") }}
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

            <div v-else>
              <Swiper v-bind="postsSwiperOptions" class="w-full">
                <SwiperSlide v-for="post in latestPosts" :key="post.id" class="h-full">
                  <PostCard :post="post" :compact="false" />
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </section>
      </template>
    </template>
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
