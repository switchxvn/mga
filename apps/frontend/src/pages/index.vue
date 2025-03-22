<script setup lang="ts">
import { useRoute } from "vue-router";
import HeroSection from "../components/sections/home_page/HeroSection.vue";
import HeroSectionFullWidth from "../components/sections/home_page/HeroSectionFullWidth.vue";
import ProductCategoriesSection from "../components/sections/home_page/ProductCategoriesSection.vue";
import ServiceSection from "../components/sections/home_page/ServiceSection.vue";
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
import FeaturedProductsSection from "../components/sections/home_page/FeaturedProductsSection.vue";
import { useTheme } from '../composables/useTheme';
import CompanyIntroSection from "../components/sections/home_page/CompanyIntroSection.vue";
import NewsSection from "../components/sections/home_page/NewsSection.vue";
import VideoIntroSection from "../components/sections/home_page/VideoIntroSection.vue";
import StyledProductCategoriesSection from "../components/sections/home_page/StyledProductCategoriesSection.vue";
import StyledFeaturedProductsSection from "../components/sections/home_page/StyledFeaturedProductsSection.vue";
import { PageType } from '@ew/shared';

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
interface ServiceTranslation {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  locale: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  serviceId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Service {
  id: number;
  icon: string;
  order: number;
  isActive: boolean;
  translations: ServiceTranslation[];
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
  pageType: PageType;
  componentName?: string;
  settings: Record<string, any>;
  isActive: boolean;
}

// Theme colors interface
interface ThemeColorShades {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
}

interface ThemeColorMode {
  primary: ThemeColorShades;
  secondary: ThemeColorShades;
  success?: ThemeColorShades;
  error?: ThemeColorShades;
  warning?: ThemeColorShades;
  info?: ThemeColorShades;
}

interface ThemeColors {
  light: ThemeColorMode;
  dark: ThemeColorMode;
}

// Theme interface
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

interface CompanyIntroConfig {
  layout: 'left-image' | 'right-image';
  title: string;
  description: string;
  image: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

const route = useRoute();
const trpc = useTrpc();
const { t, locale } = useLocalization();
const latestPosts = ref<Post[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const { getActiveTheme } = useTheme();
const theme = ref<Theme | null>(null);

// Register components
const components = {
  HeroSection,
  FeaturedProductsSection,
  ProductCategoriesSection,
  ServiceSection,
  NewsSection,
  CompanyIntroSection,
  HeroSectionFullWidth,
  VideoIntroSection,
  StyledProductCategoriesSection,
  StyledFeaturedProductsSection
} as const;

// Function to get component name based on section type and componentName
const resolveComponent = (section: ThemeSection) => {
  console.log('Resolving component for section:', section);
  if (section.componentName && components[section.componentName as keyof typeof components]) {
    return components[section.componentName as keyof typeof components];
  }
  const component = getDefaultComponent(section.type);
  console.log('Resolved component:', component?.name);
  return component;
};

// Function to get default component based on section type
const getDefaultComponent = (type: string) => {
  const typeToComponent: Record<string, any> = {
    'hero': components.HeroSection,
    'featured_products': components.FeaturedProductsSection,
    'product_categories': components.ProductCategoriesSection,
    'services': components.ServiceSection,
    'news': components.NewsSection,
    'company_intro': components.CompanyIntroSection,
    'hero_full_width': components.HeroSectionFullWidth,
    'video_intro': components.VideoIntroSection,
    'styled_product_categories': components.StyledProductCategoriesSection,
    'styled_featured_products': components.StyledFeaturedProductsSection
  };
  
  return typeToComponent[type] || null;
};

// Fetch theme on mount
onMounted(async () => {
  theme.value = await getActiveTheme({ pageType: PageType.HOME_PAGE });
  try {
    // Fetch posts only, theme is handled by useTheme
    await fetchLatestPosts();

    // Debug theme sections
    console.log('Theme sections:', theme.value?.sections);
    console.log('Active sections:', theme.value?.sections?.filter(s => s.isActive));

    // Apply theme colors
    if (theme.value?.colors) {
      const colors = theme.value.colors;
      document.documentElement.style.setProperty("--primary", colors.light.primary['500']);
      document.documentElement.style.setProperty("--secondary", colors.light.secondary['500']);
      if (colors.light.success) {
        document.documentElement.style.setProperty("--success", colors.light.success['500']);
      }
      if (colors.light.error) {
        document.documentElement.style.setProperty("--error", colors.light.error['500']);
      }
      if (colors.light.warning) {
        document.documentElement.style.setProperty("--warning", colors.light.warning['500']);
      }
      if (colors.light.info) {
        document.documentElement.style.setProperty("--info", colors.light.info['500']);
      }
    }
  } catch (err) {
    console.error("Error in page initialization:", err);
  }
});

// Watch for locale changes to update theme and posts
watch(locale, async () => {
  theme.value = await getActiveTheme({ pageType: PageType.HOME_PAGE });
  fetchLatestPosts();
});

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
const companyIntroConfig = computed(() => getSectionConfig("company_intro") as CompanyIntroConfig | undefined);
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
      <template v-for="(section, index) in theme?.sections" :key="`section-${section.id}-${index}`">
        <component 
          :is="resolveComponent(section)"
          v-if="section.isActive"
          :config="getSectionConfig(section.type)"
        />
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
