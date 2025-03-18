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
import { useTheme } from '../composables/useTheme';

// Định nghĩa kiểu dữ liệu cho bài viết
interface PostTranslation {
  id: number;
  title: string;
  content: string;
  locale: string;
  slug?: string;
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
interface ThemeColors {
  primary: Record<number, string>;
  secondary: Record<number, string>;
  success: Record<number, string>;
  error: Record<number, string>;
  warning: Record<number, string>;
  info: Record<number, string>;
}

interface Theme {
  id: number;
  name: string;
  isActive: boolean;
  sections?: ThemeSection[];
  colors?: ThemeColors;
  createdAt: string;
  updatedAt: string;
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
const { getActiveTheme } = useTheme();
const theme = computed(() => getActiveTheme());

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

  if (!theme?.sections) return defaultConfig;

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

const postsSwiperOptions = computed(() => getPostsSwiperOptions(theme.value));

onMounted(async () => {
  try {
    // Fetch posts and services only, theme is handled by useTheme
    await Promise.all([fetchLatestPosts(), fetchServices()]);

    // Apply theme colors
    if (theme.value?.colors) {
      const colors = theme.value.colors;
      document.documentElement.style.setProperty("--primary", colors.primary[500]);
      document.documentElement.style.setProperty("--secondary", colors.secondary[500]);
      document.documentElement.style.setProperty("--success", colors.success[500]);
      document.documentElement.style.setProperty("--error", colors.error[500]);
      document.documentElement.style.setProperty("--warning", colors.warning[500]);
      document.documentElement.style.setProperty("--info", colors.info[500]);
    }
  } catch (err) {
    console.error("Error in page initialization:", err);
  }
});

async function fetchLatestPosts() {
  isLoading.value = true;
  error.value = null;
  try {
    // Gọi tRPC endpoint để lấy danh sách bài viết theo locale hiện tại
    const result = await trpc.post.byLocale.query({ locale: locale.value });

    // Chuyển đổi dữ liệu để phù hợp với kiểu Post
    latestPosts.value = result.map((post: any) => {
      // Tìm bản dịch cho locale hiện tại
      const translation = post.translations?.find(
        (t: { locale: string }) => t.locale === locale.value
      );

      // Chuyển đổi translations để phù hợp với PostTranslation
      const mappedTranslations = post.translations?.map((t: any) => ({
        ...t,
        slug: t.slug || undefined
      }));

      return {
        ...post,
        id: Number(post.id),
        // Sử dụng title và content từ bản dịch nếu có, nếu không sử dụng giá trị mặc định
        title: translation?.title || post.title,
        content: translation?.content || post.content,
        author: post.author || {},
        translations: mappedTranslations
      } as Post;
    }).slice(0, 20); // Lấy tối đa 20 bài viết
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
  const currentTheme = theme.value;
  if (!currentTheme?.sections) return undefined;
  
  const section = currentTheme.sections.find((section: ThemeSection) => section.type === type);
  if (!section) return undefined;

  return {
    ...section.settings,
    title: section.title,
    isActive: section.isActive,
    themeId: currentTheme.id,
  };
};

const sliderConfig = computed(() => getSectionConfig("hero") as SliderConfig | undefined);
const productsConfig = computed(() => getSectionConfig("featured_products") as ProductsConfig | undefined);
const servicesConfig = computed(() => getSectionConfig("services") as ServicesConfig | undefined);
const categoriesConfig = computed(() => getSectionConfig("product_categories") as CategoriesConfig | undefined);
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900">
    <template v-if="isLoading">
      <div class="flex justify-center items-center min-h-screen">
        <ULoader size="lg" />
      </div>
    </template>
    <template v-else-if="error">
      <div class="container mx-auto px-4 py-12 text-center">
        {{ error }}
      </div>
    </template>
    <template v-else>
      <!-- Render sections based on their order -->
      <template v-for="section in theme?.sections" :key="section.id">
        <!-- Hero Section -->
        <HeroSection
          v-if="section.type === 'hero' && section.isActive"
          :config="sliderConfig"
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
            <FeaturedProducts :config="productsConfig" />
          </div>
        </section>

        <!-- Categories Section -->
        <ProductCategoriesSection
          v-if="
            section.type === 'product_categories' &&
            section.isActive &&
            categoriesConfig
          "
          :config="categoriesConfig"
        />

        <!-- Services Section -->
        <section
          v-if="section.type === 'services' && section.isActive"
          class="services-section relative"
          :style="{
            paddingTop: servicesConfig?.padding?.top,
            paddingBottom: servicesConfig?.padding?.bottom,
          }"
        >
          <!-- Background gradient overlay -->
          <div
            class="absolute inset-0"
            :style="{
              backgroundImage: servicesConfig?.backgroundGradient
                ? `linear-gradient(${servicesConfig.backgroundGradient.direction.replace(
                    'to-',
                    'to '
                  )}, ${servicesConfig.backgroundGradient.from}, ${
                    servicesConfig.backgroundGradient.to
                  })`
                : 'none',
              opacity: servicesConfig?.overlayOpacity,
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
              :config="servicesConfig"
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
