<script setup lang="ts">
import { useRoute } from "vue-router";
import { useLocalization } from "../composables/useLocalization";
import { useTrpc } from "../composables/useTrpc";
import { computed, onMounted, ref, watch } from "../composables/useVueComposables";
import { onBeforeUnmount } from 'vue';
// Import Swiper
import type { Seo } from '@ew/shared';
import { PageType } from '@ew/shared';
import { useHead } from '@unhead/vue';
import { useAsyncData } from 'nuxt/app';
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Component } from 'vue';
import { defineAsyncComponent, markRaw } from 'vue';
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

// Định nghĩa type cho components
type ComponentType = Component;
type ComponentRegistry = Record<string, ComponentType>;

// Register components using defineAsyncComponent
const registeredComponents = {
  'HeroSection': defineAsyncComponent(() => import("../components/sections/home_page/HeroSection.vue")),
  'HeroBannerSection': defineAsyncComponent(() => import("../components/sections/HeroBannerSection.vue")),
  'FeaturedProductsSection': defineAsyncComponent(() => import("../components/sections/home_page/FeaturedProductsSection.vue")),
  'ProductCategoriesSection': defineAsyncComponent(() => import("../components/sections/home_page/ProductCategoriesSection.vue")),
  'ServiceSection': defineAsyncComponent(() => import("../components/sections/home_page/ServiceSection.vue")),
  'NewsSection': defineAsyncComponent(() => import("../components/sections/home_page/NewsSection.vue")),
  'CompanyIntroSection': defineAsyncComponent(() => import("../components/sections/home_page/CompanyIntroSection.vue")),
  'HeroSectionFullWidth': defineAsyncComponent(() => import("../components/sections/home_page/HeroSectionFullWidth.vue")),
  'VideoIntroSection': defineAsyncComponent(() => import("../components/sections/home_page/VideoIntroSection.vue")),
  'StyledProductCategoriesSection': defineAsyncComponent(() => import("../components/sections/home_page/StyledProductCategoriesSection.vue")),
  'StyledFeaturedProductsSection': defineAsyncComponent(() => import("../components/sections/home_page/StyledFeaturedProductsSection.vue")),
  'CustomerLogosSection': defineAsyncComponent(() => import("../components/sections/home_page/CustomerLogosSection.vue")),
  'FeatureServicesSection': defineAsyncComponent(() => import("../components/sections/home_page/FeatureServicesSection.vue")),
  'WhyChooseUsSection': defineAsyncComponent(() => import("../components/sections/home_page/WhyChooseUsSection.vue")),
  'TicketBookingSection': defineAsyncComponent(() => import("../components/sections/home_page/TicketBookingSection.vue")),
  'VideoIntroWithTextSection': defineAsyncComponent(() => import("../components/sections/home_page/VideoIntroWithTextSection.vue")),
  'GalleryMasonrySection': defineAsyncComponent(() => import("../components/sections/home_page/GalleryMasonrySection.vue")),
  'FoodGallerySection': defineAsyncComponent(() => import("../components/sections/home_page/FoodGallerySection.vue")),
  'StyledNewsSection': defineAsyncComponent(() => import("../components/sections/home_page/StyledNewsSection.vue")),
  'CustomerReviewsSection': defineAsyncComponent(() => import("../components/sections/home_page/CustomerReviewsSection.vue")),
  'HorizontalGallerySection': defineAsyncComponent(() => import("../components/sections/home_page/HorizontalGallerySection.vue")),
  'TravelServicesSection': defineAsyncComponent(() => import("../components/sections/home_page/TravelServicesSection.vue"))
} as ComponentRegistry;

// Modify the resolveComponent function
const resolveComponent = (section: ThemeSection): ComponentType | null => {
  if (!section?.type && !section?.componentName) {
    console.warn('Invalid section configuration');
    return null;
  }

  // First try componentName if specified
  if (section.componentName && registeredComponents[section.componentName]) {
    return markRaw(registeredComponents[section.componentName]);
  }

  // Then try type mapping
  const typeToComponentName: Record<string, keyof typeof registeredComponents> = {
    'hero': 'HeroSection',
    'hero_banner': 'HeroBannerSection',
    'featured_products': 'FeaturedProductsSection',
    'product_categories': 'ProductCategoriesSection',
    'services': 'ServiceSection',
    'news': 'NewsSection',
    'company_intro': 'CompanyIntroSection',
    'hero_full_width': 'HeroSectionFullWidth',
    'video_intro': 'VideoIntroSection',
    'styled_product_categories': 'StyledProductCategoriesSection',
    'styled_featured_products': 'StyledFeaturedProductsSection',
    'customer_logos': 'CustomerLogosSection',
    'feature_services': 'FeatureServicesSection',
    'ticket_booking': 'TicketBookingSection',
    'gallery': 'GalleryMasonrySection',
    'food_gallery': 'FoodGallerySection',
    'styled_news': 'StyledNewsSection',
    'customer_reviews': 'CustomerReviewsSection',
    'horizontal_gallery': 'HorizontalGallerySection',
    'travel_services': 'TravelServicesSection'
  };

  const componentName = typeToComponentName[section.type];
  if (componentName && registeredComponents[componentName]) {
    return markRaw(registeredComponents[componentName]);
  }

  console.warn(`No component found for section type: ${section.type}`);
  return null;
};

// Thêm ref để kiểm soát mounted state
const pageIsMounted = ref(true);

// Cleanup khi unmount
onBeforeUnmount(() => {
  pageIsMounted.value = false;
  // Reset theme và các states khác
  theme.value = null;
  latestPosts.value = [];
  isLoading.value = false;
  error.value = null;
});

// Fetch theme on mount
onMounted(async () => {
  theme.value = await getActiveTheme({ pageType: PageType.HOME_PAGE });
  try {
   

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

const getSectionConfig = (section: ThemeSection) => {
  if (!section) return undefined;

  return {
    ...section.settings,
    title: section.title,
    isActive: section.isActive,
    themeId: theme.value?.id,
  };
};

const seoData = ref<Seo | null>(null);

useAsyncData('home-seo', () => 
  useTrpc().seo.getSeoByPath.query('/'),
  {
    server: true,
    lazy: false,
    transform: (data) => {
      seoData.value = data as Seo;
      return data;
    }
  }
);

useHead({
  title: computed(() => seoData.value?.title || 'Trang Chủ'),
  meta: computed(() => [
    { name: 'title', content: seoData.value?.title || 'Trang Chủ' },
    { property: 'og:title', content: seoData.value?.ogTitle || seoData.value?.title || 'Trang Chủ' },
    { name: 'description', content: seoData.value?.description },
    { property: 'og:description', content: seoData.value?.ogDescription || seoData.value?.description },
    { property: 'og:image', content: seoData.value?.ogImage },
    { name: 'keywords', content: seoData.value?.keywords }
  ])
});
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900" v-if="pageIsMounted">
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
      <template v-if="theme?.sections">
        <template v-for="(section, index) in theme.sections" :key="`section-${section.id}-${index}`">
          <ClientOnly>
            <component
              v-if="section.isActive"
              :is="resolveComponent(section)"
              :section="section"
              :config="getSectionConfig(section)"
            />
            <template #fallback>
              <div class="p-4 text-center">
                <ULoader />
              </div>
            </template>
          </ClientOnly>
        </template>
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
