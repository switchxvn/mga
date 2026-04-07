import { ref, watch, computed, onMounted } from 'vue';
import { useTrpc } from './useTrpc';
import { useLocalization } from './useLocalization';
import { useTheme } from './useTheme';
import { PageType, Theme, ThemeSection } from '@ew/shared';
import type { Component } from 'vue';
import { defineAsyncComponent, markRaw } from 'vue';
import { useAsyncData } from 'nuxt/app';
import ReviewsSection from '../components/ReviewsSection.vue';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

export function useHomePage() {
  const trpc = useTrpc();
  const { locale } = useLocalization();
  const { getActiveTheme, getPageSections } = useTheme();
  
  const theme = ref<Theme | null>(null);
  const themeSections = ref<ThemeSection[]>([]);
  const latestPosts = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const defaultLocale = ref('en');
  const pageIsMounted = ref(true);
  
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
    'TravelServicesSection': defineAsyncComponent(() => import("../components/sections/home_page/TravelServicesSection.vue")),
    'ReviewsSection': ReviewsSection,
  } as ComponentRegistry;
  
  // Resolve component function
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
      'travel_services': 'TravelServicesSection',
      'reviews': 'ReviewsSection',
    };
  
    const componentName = typeToComponentName[section.type];
    if (componentName && registeredComponents[componentName]) {
      return markRaw(registeredComponents[componentName]);
    }
  
    console.warn(`No component found for section type: ${section.type}`);
    return null;
  };
  
  // Lấy ngôn ngữ mặc định từ server
  async function getDefaultLanguage(): Promise<string> {
    try {
      // Lấy ngôn ngữ mặc định từ server
      const languages = await trpc.language.getAll.query();
      const defaultLang = languages.find((lang: { code: string; isDefault: boolean }) => lang.isDefault);
      return defaultLang?.code || 'en';
    } catch (error) {
      console.error("Error fetching default language:", error);
      return 'en';
    }
  }
  
  // Lấy theme sections với locale phù hợp
  async function fetchThemeSections(themeId: number, currentLocale: string): Promise<ThemeSection[]> {
    try {
      isLoading.value = true;
      // Lấy sections theo pageType và locale và chuyển đổi kiểu
      const sections = await getPageSections(themeId, PageType.HOME_PAGE, currentLocale);
      return sections as unknown as ThemeSection[];
    } catch (err) {
      console.error("Error fetching theme sections:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Fallback khi API page-sections trả rỗng: dùng sections từ active theme.
  function fallbackThemeSectionsFromTheme(activeTheme: Theme | null | undefined): ThemeSection[] {
    if (!activeTheme?.sections || activeTheme.sections.length === 0) {
      return [];
    }

    return activeTheme.sections
      .filter((section) => section.pageType === PageType.HOME_PAGE)
      .sort((a, b) => a.order - b.order) as ThemeSection[];
  }
  
  // Cleanup function
  function cleanup() {
    pageIsMounted.value = false;
    // Reset theme và các states khác
    theme.value = null;
    themeSections.value = [];
    latestPosts.value = [];
    isLoading.value = false;
    error.value = null;
  }
  
  // Fetch data for SSR và CSR
  const { data: pageData } = useAsyncData('home-theme', async () => {
    try {
      // Lấy ngôn ngữ mặc định từ server
      defaultLocale.value = await getDefaultLanguage();
      
      // Lấy theme chính
      const activeTheme = await getActiveTheme({ pageType: PageType.HOME_PAGE });
      
      if (activeTheme) {
        // Gán giá trị cho theme và ép kiểu thành Theme từ shared library
        theme.value = activeTheme as unknown as Theme;
        
        // Sử dụng locale từ user nếu ở client-side, hoặc defaultLocale nếu ở server-side
        const currentLocale = process.client ? locale.value : defaultLocale.value;
        
        // Lấy sections với locale phù hợp
        const fetchedSections = await fetchThemeSections(activeTheme.id, currentLocale);
        themeSections.value = fetchedSections.length > 0
          ? fetchedSections
          : fallbackThemeSectionsFromTheme(theme.value);
        
        // Apply theme colors
        if (theme.value?.colors && process.client) {
          const colors = theme.value.colors;
          document.documentElement.style.setProperty("--primary", colors.light.primary['500']);
          document.documentElement.style.setProperty("--secondary", colors.light.secondary['500']);
          
          // Kiểm tra và áp dụng các màu sắc bổ sung nếu có
          try {
            // Sử dụng cách tiếp cận an toàn hơn để truy cập các thuộc tính tùy chọn
            const themeColors = colors.light as any;
            
            if (themeColors.success && themeColors.success['500']) {
              document.documentElement.style.setProperty("--success", themeColors.success['500']);
            }
            
            if (themeColors.error && themeColors.error['500']) {
              document.documentElement.style.setProperty("--error", themeColors.error['500']);
            }
            
            if (themeColors.warning && themeColors.warning['500']) {
              document.documentElement.style.setProperty("--warning", themeColors.warning['500']);
            }
            
            if (themeColors.info && themeColors.info['500']) {
              document.documentElement.style.setProperty("--info", themeColors.info['500']);
            }
          } catch (err) {
            console.warn('Error setting optional theme colors:', err);
          }
        }
      }
      
      return { theme: activeTheme };
    } catch (err) {
      console.error("Error in page initialization:", err);
      error.value = "Không thể tải dữ liệu trang. Vui lòng thử lại sau.";
      return { theme: null };
    }
  });
  
  // Watch for locale changes to update theme sections
  watch(locale, async () => {
    if (theme.value?.id) {
      const fetchedSections = await fetchThemeSections(theme.value.id, locale.value);
      themeSections.value = fetchedSections.length > 0
        ? fetchedSections
        : fallbackThemeSectionsFromTheme(theme.value);
    }
  });

  // Fix trường hợp SSR trả payload rỗng: refetch lại phía client sau hydration.
  onMounted(async () => {
    if (themeSections.value.length > 0) return;

    try {
      const activeTheme = await getActiveTheme({ pageType: PageType.HOME_PAGE });
      if (!activeTheme) return;

      theme.value = activeTheme as unknown as Theme;
      const fetchedSections = await fetchThemeSections(activeTheme.id, locale.value);
      themeSections.value = fetchedSections.length > 0
        ? fetchedSections
        : fallbackThemeSectionsFromTheme(theme.value);
    } catch (err) {
      console.error('Client hydration refetch for home sections failed:', err);
    }
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

  return {
    theme,
    themeSections,
    latestPosts,
    isLoading,
    error,
    pageIsMounted,
    resolveComponent,
    cleanup,
    getSectionConfig,
    getAuthorName,
    postsSwiperOptions
  };
} 
