<!-- Kết hợp NavbarWithLogoHotline và NavbarWithoutLogo -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { useMenuItems } from "~/composables/useMenuItems";
import type { MenuItem } from "@ew/shared";
import Icon from "./Icon.vue";
import ThemeToggle from "~/components/common/ThemeToggle.vue";
import LanguageSwitcher from "~/components/common/LanguageSwitcher.vue";
import CartIcon from "~/components/cart/CartIcon.vue";
import { useRoute } from "vue-router";
import { useFeatureFlags } from "~/composables/useFeatureFlags";
import { useLocalization } from "~/composables/useLocalization";
import { useLogo } from "~/composables/useLogo";
import { useDarkMode } from "~/composables/useDarkMode";
import { useCssColorValue } from "~/composables/useColorUtils";
import MegaMenu from "~/components/menu/MegaMenu.vue";
import MobileMegaMenu from "~/components/menu/MobileMegaMenu.vue";
import { useNow, useDateFormat } from '@vueuse/core';

// Add MenuItem interface at the top of the script section
interface MenuItemTranslation {
  id?: number;
  label: string;
  href: string;
  locale: string;
  menuItemId?: number;
}

interface MenuItem {
  id: number;
  defaultLocale: string;
  icon?: string | null;
  order: number;
  level: number;
  isActive: boolean;
  parentId: number | null;
  translations: MenuItemTranslation[];
  children?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

// Props cho component
interface NavbarProps {
  settings?: {
    // Header section settings
    headerBackgroundColor?: string;
    slogan?: {
      text: string;
      subText: string;
      additionalText: string;
      fontSize: string;
      fontWeight: string;
    };
    hotlines?: {
      sales: {
        text: string;
        number: string;
        textColor?: string;
        backgroundColor?: string;
      };
      support: {
        text: string;
        number: string;
        textColor?: string;
        backgroundColor?: string;
      };
    };
    
    // Menu section settings
    menuBackgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    menuAlignment?: string;
    
    // Global settings
    showLanguageSwitcher?: boolean;
    showThemeToggle?: boolean;
    showCart?: boolean;
    mobileMenuBreakpoint?: string;

    // Dark mode settings
    darkMode?: {
      headerBackgroundColor?: string;
      menuBackgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };

    // Navigation settings
    navigation?: {
      textColor?: string;
      fontWeight?: string;
      activeTextColor?: string;
    };
  };
}

const props = withDefaults(defineProps<NavbarProps>(), {
  settings: () => ({
    // Header section settings
    headerBackgroundColor: "#ffffff",
    slogan: {
      text: "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM",
      subText: "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN",
      additionalText: "BÁN VÀ CHO THUÊ GIÁ TỐT NHẤT",
      fontSize: "lg",
      fontWeight: "bold"
    },
    hotlines: {
      sales: {
        text: "Mua hàng",
        number: "0901.20.30.70"
      },
      support: {
        text: "Hỗ trợ kỹ thuật",
        number: "028.3620.80.81"
      }
    },
    
    // Menu section settings
    menuBackgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#e5e7eb",
    menuAlignment: "center",
    
    // Global settings
    showLanguageSwitcher: true,
    showThemeToggle: true,
    showCart: true,
    mobileMenuBreakpoint: "md"
  })
});

// Route
const route = useRoute();

// Watch route changes to reset sticky state
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
    activeMobileMegaMenu.value = null;
    isScrolled.value = false;
    lastScrollPosition.value = 0;
    window.scrollTo(0, 0);
    
    // Reset nav height
    nextTick(() => {
      const nav = document.querySelector('.navigation-section') as HTMLElement;
      if (nav) {
        const navHeight = nav.offsetHeight;
        document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
      }
    });
  }
);

// Feature flags
const { isFeatureEnabled } = useFeatureFlags();
const isCartEnabled = ref<boolean | null>(null);
const isLoadingFeatureFlag = ref(true);

// Localization
const { locale } = useLocalization();

// Menu items
const { menuItems, isLoading, error, fetchMenuItems } = useMenuItems();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Scroll state
const isScrolled = ref(false);
const lastScrollPosition = ref(0);
const navWrapperRef = ref<HTMLElement | null>(null);
const logoSectionRef = ref<HTMLElement | null>(null);

// Mega menu state
const activeMegaMenu = ref<number | null>(null);
const megaMenuTimeout = ref<number | null>(null);

// Logo
const { currentLogoUrl, logo, isLoading: isLoadingLogo } = useLogo();

// Dark mode
const { isDark } = useDarkMode();

// Color utils
const { processColorValue } = useCssColorValue();

// Add new ref for mobile mega menu
const activeMobileMegaMenu = ref<number | null>(null);

// Process menu items with translations
const processedMenuItems = computed(() => {
  if (!menuItems.value || menuItems.value.length === 0) {
    console.log('No menu items available');
    return [];
  }

  console.log('Processing menu items:', menuItems.value);

  // Get level 0 items (parent menu items)
  const parentItems = (menuItems.value as MenuItem[])
    .filter(item => item.level === 0 && item.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  console.log('Parent items:', parentItems);

  return parentItems.map(item => ({
    ...item,
    href: item.translations?.find(t => t.locale === locale.value)?.href || 
          item.translations?.[0]?.href || "#",
    label: getTranslation(item, locale.value)
  }));
});

// Hàm lấy bản dịch theo ngôn ngữ
const getTranslation = (item: any, targetLocale: string) => {
  if (!item.translations || item.translations.length === 0) {
    return item.label;
  }

  const translation = item.translations.find((t: any) => t.locale === targetLocale);
  if (translation) {
    return translation.label;
  }

  const defaultTranslation = item.translations.find(
    (t: any) => t.locale === item.defaultLocale
  );
  if (defaultTranslation) {
    return defaultTranslation.label;
  }

  return item.label;
};

// Hàm lấy bản dịch cho tiêu đề menu
const getColumnTitleTranslation = (column: any, targetLocale: string) => {
  if (!column.titleTranslations || column.titleTranslations.length === 0) {
    return column.title;
  }

  const translation = column.titleTranslations.find((t: any) => t.locale === targetLocale);
  return translation?.label || column.title;
};

const updateNavbarVariables = () => {
  if (typeof document === 'undefined' || !props.settings) return;

  console.log('Updating navbar variables with settings:', props.settings);
  const root = document.documentElement;
  if (isDark.value && props.settings.darkMode) {
    console.log('Applying dark mode settings');
    root.style.setProperty('--navbar-header-bg', props.settings.darkMode.headerBackgroundColor || '#171717');
    root.style.setProperty('--navbar-menu-bg', props.settings.darkMode.menuBackgroundColor || '#171717');
    root.style.setProperty('--navbar-text', props.settings.darkMode.textColor || '#ffffff');
    root.style.setProperty('--navbar-border', props.settings.darkMode.borderColor || '#404040');
  } else {
    console.log('Applying light mode settings');
    root.style.setProperty('--navbar-header-bg', props.settings.headerBackgroundColor || '#ffffff');
    root.style.setProperty('--navbar-menu-bg', props.settings.menuBackgroundColor || '#ffffff');
    root.style.setProperty('--navbar-text', props.settings.textColor || '#000000');
    root.style.setProperty('--navbar-border', props.settings.borderColor || '#e5e7eb');
  }
};

// Watch for settings changes
watch(() => props.settings, (newSettings) => {
  console.log('Settings changed:', newSettings);
  updateNavbarVariables();
}, { deep: true });

// Watch for dark mode changes
watch(isDark, () => {
  console.log('Dark mode changed:', isDark.value);
  updateNavbarVariables();
});

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const isMenuActive = (href: string) => {
  if (href === "/") {
    return route.path === "/";
  }
  return href !== "/" && route.path.startsWith(href);
};

const showMegaMenu = (id: number) => {
  if (megaMenuTimeout.value) {
    clearTimeout(megaMenuTimeout.value);
    megaMenuTimeout.value = null;
  }
  activeMegaMenu.value = id;
};

const hideMegaMenu = () => {
  megaMenuTimeout.value = window.setTimeout(() => {
    activeMegaMenu.value = null;
  }, 300);
};

const keepMegaMenu = () => {
  if (megaMenuTimeout.value) {
    clearTimeout(megaMenuTimeout.value);
    megaMenuTimeout.value = null;
  }
};

// Add new computed property for mobile menu position
const mobileMenuTop = computed(() => {
  if (!navWrapperRef.value) return '0px';
  const navRect = navWrapperRef.value.getBoundingClientRect();
  return `${navRect.bottom}px`;
});

// Add these refs at the top of your script
const initialNavPosition = ref<number>(0);
const isInitialized = ref(false);

// Update the handleScroll function
const handleScroll = () => {
  if (!navWrapperRef.value || !isInitialized.value) return;
  
  const currentScrollPosition = Math.round(window.scrollY);
  
  // Check if we've scrolled past the original navbar position
  if (currentScrollPosition >= initialNavPosition.value) {
    if (!isScrolled.value) {
      isScrolled.value = true;
      nextTick(() => {
        const nav = document.querySelector('.navigation-section') as HTMLElement;
        if (nav) {
          const navHeight = Math.round(nav.offsetHeight);
          document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
        }
      });
    }
  } else {
    if (isScrolled.value) {
      isScrolled.value = false;
      // Remove padding when navbar is not sticky
      document.documentElement.style.setProperty('--nav-height', '0px');
    }
  }
  
  lastScrollPosition.value = currentScrollPosition;
};

// Update onMounted to initialize position
onMounted(() => {
  console.log('CombinedNavbar mounted with settings:', props.settings);
  
  // Initialize navbar position after everything is loaded
  nextTick(() => {
    if (navWrapperRef.value) {
      // Get the top offset of the navbar relative to the document
      const navRect = navWrapperRef.value.getBoundingClientRect();
      initialNavPosition.value = navRect.top + window.scrollY;
      isInitialized.value = true;

      // Initial scroll check
      handleScroll();
    }
  });
  
  window.addEventListener('scroll', throttledHandleScroll, { passive: true });
  console.log('Fetching menu items...');
  fetchMenuItems().then(() => {
    console.log('Menu items fetched:', menuItems.value);
  }).catch(err => {
    console.error('Error fetching menu items:', err);
  });
  checkCartFeatureFlag();
  updateNavbarVariables();
  
  // Initial scroll check and height calculation
  nextTick(() => {
    handleScroll();
    const nav = document.querySelector('.navigation-section') as HTMLElement;
    if (nav) {
      const navHeight = nav.offsetHeight;
      document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
    }
  });
  updateBodyPadding();

  // Add resize handler to update initial position
  const handleResize = () => {
    if (navWrapperRef.value) {
      const navRect = navWrapperRef.value.getBoundingClientRect();
      initialNavPosition.value = navRect.top + window.scrollY;
    }
  };

  // Update onMounted to add resize listener
  window.addEventListener('resize', handleResize, { passive: true });
});

// Watch for locale changes
watch(locale, () => {
  fetchMenuItems();
});

// Update onUnmounted
onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('scroll', throttledHandleScroll);
  document.documentElement.style.removeProperty('--nav-height');
  document.documentElement.style.removeProperty('--mobile-menu-top');
  if (typeof document !== 'undefined') {
    document.body.classList.remove('has-sticky-nav');
  }

  // Update onUnmounted to remove resize listener
  window.removeEventListener('resize', handleResize);
});

// Add new method for mobile mega menu
const toggleMobileMegaMenu = (itemId: number) => {
  activeMobileMegaMenu.value = activeMobileMegaMenu.value === itemId ? null : itemId;
};

// Add new computed property for mega menu position
const getMegaMenuPosition = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  if (!target) return { left: '0px' };
  
  const rect = target.getBoundingClientRect();
  return {
    left: `${rect.left + rect.width / 2}px`
  };
};

// Add new computed property for generating unique keys
const getUniqueKey = (prefix: string, item: any, index: number) => {
  return `${prefix}-${item.id || index}`;
};

// Add new method to calculate parent menu item position
const getParentMenuLeftOffset = (menuId: string) => {
  const menuElement = document.querySelector(`[data-menu-id="${menuId}"]`);
  const container = document.querySelector('.navigation-section .container');
  
  if (!menuElement || !container) return 0;
  
  const menuRect = menuElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // Calculate center position of the menu item
  const menuCenterX = menuRect.left + (menuRect.width / 2);
  
  // Calculate the offset from the container's left edge
  const offset = menuCenterX - containerRect.left;
  
  return offset;
};

// Add these near the top of the script
const now = useNow();
const formattedTime = computed(() => {
  return useDateFormat(now, 'HH:mm:ss - DD/MM/YYYY').value;
});

// Add this to your script setup
const updateBodyPadding = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('has-sticky-nav', isScrolled.value);
  }
};

// Update your watch for isScrolled
watch(isScrolled, (newValue) => {
  nextTick(() => {
    updateBodyPadding();
  });
});

// Update the throttled scroll handler to be more precise
const throttledHandleScroll = (() => {
  let frame: number | undefined;
  
  return () => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    
    frame = requestAnimationFrame(() => {
      handleScroll();
    });
  };
})();

// Check cart feature flag
const checkCartFeatureFlag = async () => {
  try {
    isLoadingFeatureFlag.value = true;
    isCartEnabled.value = await isFeatureEnabled("enable_add_to_cart", true);
  } catch (err) {
    console.error("Error checking cart feature flag:", err);
    isCartEnabled.value = false;
  } finally {
    isLoadingFeatureFlag.value = false;
  }
};

// Watch for logo changes to update navbar height
watch([logo, isLoadingLogo], () => {
  nextTick(() => {
    const nav = document.querySelector('.navigation-section') as HTMLElement;
    if (nav) {
      const navHeight = nav.offsetHeight;
      document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
    }
  });
});
</script>

<template>
  <div class="navbar-container">
    <!-- Top Menu - New Section -->
    <div class="top-menu w-full border-b relative">
      <div class="top-menu-bg-layer"></div>
      <div class="container mx-auto">
        <div class="flex items-center justify-between h-12 px-4">
          <!-- Current Time -->
          <div class="flex items-center gap-2">
            <Icon 
              name="Clock" 
              class="h-4 w-4 text-neutral-500 dark:text-neutral-400" 
            />
            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {{ formattedTime }}
            </span>
          </div>
          
          <!-- Right Actions -->
          <div class="hidden md:flex items-center gap-3">
            <div class="min-w-[140px]">
              <LanguageSwitcher v-if="props.settings?.showLanguageSwitcher" />
            </div>
            <div class="min-w-[140px]">
              <ThemeToggle v-if="props.settings?.showThemeToggle" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logo + Hotline Section - Hidden on Mobile -->
    <div class="logo-section w-full border-b hidden md:block">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between py-4">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <NuxtLink to="/" class="block">
              <div 
                class="flex items-center justify-center" 
                :style="logo ? `width: ${logo.width}px; height: ${logo.height}px` : ''"
              >
                <img
                  v-if="currentLogoUrl"
                  :src="currentLogoUrl"
                  :alt="logo?.altText || 'Logo'"
                  :width="logo?.width"
                  :height="logo?.height"
                  class="transition-transform duration-300 hover:scale-110 object-contain w-full h-full"
                />
                <span v-else-if="isLoadingLogo" class="h-8 w-8 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded"></span>
              </div>
            </NuxtLink>
          </div>

          <!-- Slogan -->
          <div class="flex flex-col items-center justify-center text-center">
            <h1 v-if="props.settings?.slogan" class="text-xl font-bold text-red-600">
              {{ props.settings.slogan.text }}
            </h1>
            <h4 v-if="props.settings?.slogan" class="text-md font-semibold text-black-600">
              {{ props.settings.slogan.subText }}
            </h4>
            <p v-if="props.settings?.slogan?.additionalText" class="text-2xl font-bold text-red-600">
              {{ props.settings.slogan.additionalText }}
            </p>
          </div>

          <!-- Hotlines -->
          <div class="flex items-center gap-3">
            <!-- Mua hàng -->
            <NuxtLink
              v-if="props.settings?.hotlines?.sales"
              :to="`tel:${props.settings.hotlines.sales.number}`"
              class="hotline-button group flex items-center gap-3 px-4 py-2.5 rounded-full border border-neutral-200 hover:border-primary-500 transition-all duration-300 shadow-sm hover:shadow-md"
              :style="{
                backgroundColor: processColorValue(props.settings.hotlines.sales.backgroundColor || '#0EA5E9'),
                color: props.settings.hotlines.sales.textColor || '#ffffff'
              }"
            >
              <div class="relative">
                <div 
                  class="animate-ring absolute -inset-1 rounded-full border-2 opacity-75"
                  :style="{ borderColor: processColorValue('var(--tertiary-900)') }"
                ></div>
                <div class="relative flex items-center justify-center rounded-full bg-white/20 p-2">
                  <Icon name="Phone" class="h-5 w-5" :style="{ color: props.settings.hotlines.sales.textColor || '#ffffff' }" />
                </div>
              </div>
              <div class="flex flex-col">
                <span class="text-sm" :style="{ color: props.settings.hotlines.sales.textColor || '#ffffff' }">
                  {{ props.settings.hotlines.sales.text }}
                </span>
                <span class="text-lg font-bold" :style="{ color: props.settings.hotlines.sales.textColor || '#ffffff' }">
                  {{ props.settings.hotlines.sales.number }}
                </span>
              </div>
            </NuxtLink>

            <!-- Hỗ trợ kỹ thuật -->
            <NuxtLink
              v-if="props.settings?.hotlines?.support"
              :to="`tel:${props.settings.hotlines.support.number}`"
              class="hotline-button group flex items-center gap-3 px-4 py-2.5 rounded-full border border-neutral-200 hover:border-primary-500 transition-all duration-300 shadow-sm hover:shadow-md"
              :style="{
                backgroundColor: processColorValue(props.settings.hotlines.support.backgroundColor || '#0EA5E9'),
                color: props.settings.hotlines.support.textColor || '#ffffff'
              }"
            >
              <div class="relative">
                <div 
                  class="animate-ring absolute -inset-1 rounded-full border-2 opacity-75"
                  :style="{ borderColor: processColorValue('var(--tertiary-900)') }"
                ></div>
                <div class="relative flex items-center justify-center rounded-full bg-white/20 p-2">
                  <Icon name="Phone" class="h-5 w-5" :style="{ color: props.settings.hotlines.support.textColor || '#ffffff' }" />
                </div>
              </div>
              <div class="flex flex-col">
                <span class="text-sm" :style="{ color: props.settings.hotlines.support.textColor || '#ffffff' }">
                  {{ props.settings.hotlines.support.text }}
                </span>
                <span class="text-lg font-bold" :style="{ color: props.settings.hotlines.support.textColor || '#ffffff' }">
                  {{ props.settings.hotlines.support.number }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Section -->
    <div 
      ref="navWrapperRef"
      class="nav-wrapper w-full"
      :class="{ 'nav-sticky': isScrolled }"
    >
      <nav
        class="navigation-section w-full border-b relative"
      >
        <div class="nav-bg-layer"></div>
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between h-full relative">
            <!-- Mobile Logo - Left -->
            <div class="flex-shrink-0 md:hidden">
              <NuxtLink to="/" class="block py-3">
                <div 
                  class="mobile-logo flex items-center justify-center" 
                  :style="logo ? `width: ${logo.width * 0.5}px; height: ${logo.height * 0.5}px` : ''"
                >
                  <img
                    v-if="currentLogoUrl"
                    :src="currentLogoUrl"
                    :alt="logo?.altText || 'Logo'"
                    class="transition-transform duration-300 hover:scale-110 object-contain w-full h-full"
                  />
                  <span v-else-if="isLoadingLogo" class="h-8 w-8 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded"></span>
                </div>
              </NuxtLink>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex items-center space-x-6 flex-grow justify-start">
              <div v-if="isLoading" class="text-sm text-neutral-500 dark:text-neutral-400">Đang tải menu...</div>
              <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>
              <template v-else>
                <div
                  v-for="(item, itemIndex) in processedMenuItems"
                  :key="itemIndex"
                  class="relative group"
                  :data-menu-id="item.id"
                  @mouseenter="(e) => { if (item.children?.length) { showMegaMenu(item.id); } }"
                  @mouseleave="item.children?.length ? hideMegaMenu() : null"
                >
                  <NuxtLink
                    :to="item.href"
                    class="main-menu-item text-[1.05rem] uppercase transition-colors py-5 flex items-center space-x-1"
                    :style="{ fontSize: '1.05rem' }"
                    :class="{ 'menu-active': isMenuActive(item.href) }"
                  >
                    <span 
                      class="text-[1.05rem] transition-colors duration-300" 
                      :style="{ 
                        color: isMenuActive(item.href) 
                          ? processColorValue(props.settings?.navigation?.activeTextColor || 'var(--primary-500)')
                          : processColorValue(props.settings?.navigation?.textColor || 'var(--tertiary-500)'),
                        '--hover-color': processColorValue('var(--primary-400)'),
                        fontWeight: props.settings?.navigation?.fontWeight || 'extrabold',
                        fontSize: '1.05rem'
                      }"
                    >
                      {{ item.label }}
                    </span>
                    <Icon
                      v-if="item.children?.length"
                      name="ChevronDown"
                      class="transition-transform duration-300 group-hover:rotate-180 h-4 w-4"
                    />
                  </NuxtLink>

                  <!-- Mega Menu -->
                  <Transition name="fade">
                    <MegaMenu
                      v-if="item.children?.length && activeMegaMenu === item.id"
                      :item="item"
                      :is-active="true"
                      :on-close="() => activeMegaMenu = null"
                      @mouseenter="keepMegaMenu"
                      @mouseleave="hideMegaMenu"
                    />
                  </Transition>
                </div>
              </template>
            </nav>

            <!-- Right side actions -->
            <div class="flex items-center space-x-2">
              <!-- Cart Icon - Desktop Only -->
              <div class="hidden md:block">
                <CartIcon v-if="props.settings?.showCart && isCartEnabled" />
              </div>

              <!-- Mobile Actions -->
              <div class="md:hidden flex items-center gap-2 py-3">
                <!-- User Icon -->
                <NuxtLink 
                  to="/auth/login" 
                  class="flex items-center justify-center w-10 h-10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <Icon name="User" class="h-6 w-6" />
                </NuxtLink>

                <!-- Hamburger Menu Button -->
                <button
                  class="flex items-center justify-center w-10 h-10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                  @click="toggleMobileMenu"
                  aria-label="Toggle Menu"
                >
                  <Icon :name="isMobileMenuOpen ? 'X' : 'Menu'" class="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-fade">
      <div
        v-if="isMobileMenuOpen"
        class="mobile-menu-overlay"
        @click="isMobileMenuOpen = false"
      >
        <div 
          class="mobile-menu-content bg-white dark:bg-neutral-900"
          @click.stop
        >
          <!-- Mobile Menu Header -->
          <div class="mobile-menu-header flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
            <NuxtLink to="/" class="block" @click="isMobileMenuOpen = false">
              <div 
                class="flex items-center justify-center" 
                :style="logo ? `width: ${logo.width * 0.6}px; height: ${logo.height * 0.6}px` : ''"
              >
                <img
                  v-if="currentLogoUrl"
                  :src="currentLogoUrl"
                  :alt="logo?.altText || 'Logo'"
                  class="transition-transform duration-300 hover:scale-110 object-contain w-full h-full max-h-[40px]"
                />
                <span v-else-if="isLoadingLogo" class="h-6 w-6 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded"></span>
              </div>
            </NuxtLink>
            
            <button
              class="p-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
              @click="isMobileMenuOpen = false"
              aria-label="Close Menu"
            >
              <Icon name="X" class="h-6 w-6" />
            </button>
          </div>

          <div class="px-4 py-3 space-y-1">
            <!-- Cart Icon for Mobile -->
            <div v-if="props.settings?.showCart && isCartEnabled" class="mb-4">
              <NuxtLink 
                to="/cart" 
                class="flex items-center gap-3 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                @click="isMobileMenuOpen = false"
              >
                <Icon name="ShoppingCart" class="h-6 w-6" />
                <span class="text-base font-medium">Giỏ hàng</span>
              </NuxtLink>
            </div>

            <!-- Language Switcher and Theme Toggle in Mobile Menu -->
            <div class="flex flex-col space-y-2 px-3 py-2 mb-4">
              <div v-if="props.settings?.showLanguageSwitcher" class="w-full">
                <LanguageSwitcher />
              </div>
              <div v-if="props.settings?.showThemeToggle" class="w-full">
                <ThemeToggle />
              </div>
            </div>

            <!-- Hotlines for Mobile -->
            <div class="space-y-2 mb-4">
              <NuxtLink
                v-if="props.settings?.hotlines?.sales"
                :to="`tel:${props.settings.hotlines.sales.number}`"
                class="mobile-hotline flex items-center gap-2 px-3 py-2 text-primary-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Icon name="Phone" class="h-5 w-5" />
                <div class="flex flex-col">
                  <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ props.settings.hotlines.sales.text }}</span>
                  <span class="font-bold">{{ props.settings.hotlines.sales.number }}</span>
                </div>
              </NuxtLink>
              
              <NuxtLink
                v-if="props.settings?.hotlines?.support"
                :to="`tel:${props.settings.hotlines.support.number}`"
                class="mobile-hotline flex items-center gap-2 px-3 py-2 text-primary-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Icon name="Phone" class="h-5 w-5" />
                <div class="flex flex-col">
                  <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ props.settings.hotlines.support.text }}</span>
                  <span class="font-bold">{{ props.settings.hotlines.support.number }}</span>
                </div>
              </NuxtLink>
            </div>

            <!-- Mobile Menu Items with Mega Menu -->
            <div class="space-y-1">
              <div
                v-for="item in processedMenuItems"
                :key="item.id"
                class="mobile-menu-item"
              >
                <!-- Menu Item with Mega Menu -->
                <div
                  v-if="item.children?.length > 0"
                  class="mobile-main-menu-item flex items-center justify-between px-3 py-2 text-lg font-extrabold uppercase rounded-md"
                  :class="{ 'mobile-menu-active': isMenuActive(item.href) }"
                >
                  <NuxtLink
                    :to="item.href"
                    class="flex-1 block"
                    @click="isMobileMenuOpen = false"
                  >
                    {{ item.label }}
                  </NuxtLink>
                  <button
                    class="p-2 -m-2"
                    @click.stop="toggleMobileMegaMenu(item.id)"
                  >
                    <Icon
                      name="ChevronRight"
                      class="h-5 w-5 transition-transform duration-300"
                      :class="{ 'rotate-90': activeMobileMegaMenu === item.id }"
                    />
                  </button>
                </div>

                <!-- Regular Menu Item -->
                <NuxtLink
                  v-else
                  :to="item.href"
                  class="mobile-main-menu-item block px-3 py-2 text-lg font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-md transition-colors duration-300"
                  :class="{ 'text-primary-600 dark:text-primary-400': isMenuActive(item.href) }"
                  @click="isMobileMenuOpen = false"
                >
                  {{ item.label }}
                </NuxtLink>

                <!-- Mobile Mega Menu Content -->
                <Transition name="slide-fade">
                  <MobileMegaMenu
                    v-if="item.children?.length > 0 && activeMobileMegaMenu === item.id"
                    :item="item"
                    :is-active="isMenuActive(item.href)"
                    :on-close="() => { isMobileMenuOpen = false; activeMobileMegaMenu = null; }"
                  />
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Remove hardcoded values since they will be set dynamically */
:root {
  --navbar-header-bg: #ffffff;
  --navbar-menu-bg: #ffffff;
  --navbar-text: #000000;
  --navbar-border: #e5e7eb;
  --nav-height: 0px; /* Default height */
}

:root.dark {
  --navbar-header-bg: #171717;
  --navbar-menu-bg: #171717;
  --navbar-text: #ffffff;
  --navbar-border: #404040;
}

.navbar-container {
  position: relative;
  width: 100%;
  overflow-x: clip;
}

.nav-wrapper {
  position: relative;
  width: 100%;
  z-index: 900;
  transition: all 0.3s ease;
  will-change: transform, position;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.nav-wrapper.nav-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Add this to ensure smooth transition when unsticking */
.nav-wrapper:not(.nav-sticky) {
  transform: none;
  position: relative;
  top: auto;
  box-shadow: none;
}

.navigation-section {
  border-color: var(--navbar-border);
  color: var(--navbar-text);
  min-height: var(--nav-height, 64px);
  height: auto;
  display: flex;
  align-items: stretch;
  position: relative;
  z-index: 900;
  width: 100%;
  overflow-x: clip;
}

.nav-bg-layer {
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  height: 100%;
  background-color: rgb(255 255 255 / 1);
  z-index: -1;
}

:root.dark .nav-bg-layer {
  background-color: rgb(23 23 23 / 1);
}

.navigation-section > .container {
  height: 100%;
}

.navigation-section > .container > div {
  min-height: var(--nav-height, 64px);
  height: 100%;
}

/* Dark mode overrides */
:root.dark .navigation-section::before {
  background-color: var(--navbar-menu-bg);
}

/* Mobile logo styles */
.navigation-section .mobile-logo {
  height: 40px;
  width: auto;
  display: flex;
  align-items: center;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.navigation-section .mobile-logo img {
  max-height: 100%;
  width: auto;
  object-fit: contain;
}

.nav-wrapper.nav-sticky .navigation-section {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Remove the body padding since we're handling position differently now */
:global(body) {
  padding-top: 0;
}

/* Add a placeholder when nav is sticky to prevent content jump */
.nav-wrapper.nav-sticky + * {
  margin-top: var(--nav-height);
  padding-top: 1px; /* Fix gap issue in some browsers */
}

.navigation-section .main-menu-item {
  transition: all 0.3s ease;
}

.navigation-section .main-menu-item:hover > span {
  color: var(--hover-color) !important;
}
/* Mobile menu styles */
.mobile-main-menu-item.menu-active {
  color: var(--primary-500) !important;
}

:root.dark .mobile-main-menu-item.menu-active {
  color: var(--primary-400) !important;
}

/* Simplified hotline button */
.hotline-button-simple {
  transition: all 0.3s ease;
  background-color: var(--navbar-header-bg);
  border-color: var(--navbar-border);
  color: var(--navbar-text);
}

.hotline-button-simple:hover {
  @apply shadow-sm;
}

/* Dark mode styles */
:root.dark .hotline-button-simple {
  background-color: var(--navbar-header-bg) !important;
  border-color: var(--navbar-border) !important;
  color: var(--navbar-text) !important;
}

:root.dark .hotline-button-simple:hover {
  @apply border-primary-400;
}

/* Mobile hotline styles */
.mobile-hotline {
  @apply rounded-md transition-colors duration-300;
}

.mobile-hotline:hover {
  @apply bg-neutral-100 dark:bg-neutral-800;
}

.logo-section {
  position: relative;
  width: 100%;
  z-index: 950;
  border-color: var(--navbar-border) !important;
  color: var(--navbar-text) !important;
  background-color: #FEB914;
}

/* Keep existing animations */
@keyframes ring {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

.animate-ring {
  animation: ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

.hotline-button {
  transition: all 0.3s ease;
  min-width: 220px;
}

.hotline-button:hover {
  opacity: 0.9;
}

.hotline-button:hover .animate-ring {
  animation: ring 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.hotline-button:hover .animate-wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}

/* Dark mode styles */
:root.dark .hotline-button {
  opacity: 0.95;
}

:root.dark .hotline-button:hover {
  opacity: 1;
}

:root.dark .hotline-button .text-neutral-600 {
  color: var(--navbar-text) !important;
}

/* Mobile menu styles */
.mobile-menu-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-[1100] md:hidden;
}

.mobile-menu-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--navbar-menu-bg);
  border-top: 1px solid var(--navbar-border);
  overflow-y: auto;
  z-index: 50;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Transition for mobile menu */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from .mobile-menu-content {
  transform: translateY(-10px);
}

.slide-fade-leave-to .mobile-menu-content {
  transform: translateY(-10px);
}

/* Updated flyout menu styles */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0) translateX(-50%);
}

/* Remove old mega menu styles that might conflict */
.mega-menu-wrapper,
.mega-menu-arrow,
.mega-menu-content,
.mega-menu-bg {
  display: none;
}

/* Update navbar item styles */
.main-menu-item {
  position: relative;
  z-index: 50;
}

.main-menu-item:hover {
  z-index: 51;
}

/* Container styles */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
  position: relative;
}

@media (max-width: 1280px) {
  .mega-menu {
    width: calc(100vw - 2rem);
    max-width: 1024px;
  }
}

/* Add new mobile mega menu styles */
.mobile-mega-menu {
  background-color: var(--navbar-menu-bg);
  border-left: 2px solid var(--navbar-border);
  margin-left: 1rem;
}

.mobile-submenu-item {
  @apply border-b border-neutral-200 dark:border-neutral-700;
  transition: all 0.3s ease;
}

.mobile-submenu-item:last-child {
  border-bottom: none;
}

.mobile-submenu-item:hover {
  transform: translateX(4px);
}

/* Update mobile menu transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.navbar-megamenu-item {
  @apply border-b border-neutral-200 dark:border-neutral-700;
  transition: all 0.3s ease;
}

.navbar-megamenu-item:last-child {
  border-bottom: none;
}

/* Add these styles to the <style> section */
.mobile-main-menu-item {
  @apply text-neutral-700 dark:text-neutral-300;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
}

.mobile-main-menu-item:hover {
  @apply text-primary-600 dark:text-primary-400;
}

.mobile-main-menu-item.mobile-menu-active {
  @apply text-primary-600 dark:text-primary-400 font-semibold;
}

/* Add these styles to the <style> section */
.mobile-menu-header {
  position: sticky;
  top: 0;
  background-color: var(--navbar-menu-bg);
  z-index: 60;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mobile-logo {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.mobile-logo img {
  max-height: 32px;
  width: auto;
  object-fit: contain;
}

/* Add these styles to your existing styles */
.top-menu {
  position: relative;
  width: 100%;
  z-index: 1000;
  border-color: var(--navbar-border);
  color: var(--navbar-text);
  background-color: var(--navbar-header-bg);
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  min-height: 48px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.top-menu-bg-layer {
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  height: 100%;
  background-color: var(--navbar-header-bg);
  transition: background-color 0.3s ease;
  z-index: -1;
}

/* Dark mode specific styles for top menu */
:root.dark .top-menu {
  background-color: rgb(17 24 39 / 1); /* Darker background for dark mode */
  border-color: rgb(55 65 81 / 1);
}

:root.dark .top-menu-bg-layer {
  background-color: rgb(17 24 39 / 1);
}

/* Update text colors for dark mode */
.top-menu .text-color-base {
  color: rgb(75 85 99); /* text-neutral-600 */
  transition: color 0.3s ease;
}

:root.dark .top-menu .text-color-base {
  color: rgb(209 213 219); /* dark:text-neutral-300 */
}

.top-menu .text-color-secondary {
  color: rgb(107 114 128); /* text-neutral-500 */
  transition: color 0.3s ease;
}

:root.dark .top-menu .text-color-secondary {
  color: rgb(156 163 175); /* dark:text-neutral-400 */
}

/* Update icon colors for dark mode */
.top-menu .icon {
  color: rgb(107 114 128); /* text-neutral-500 */
  transition: color 0.3s ease;
}

:root.dark .top-menu .icon {
  color: rgb(156 163 175); /* dark:text-neutral-400 */
}

.top-menu .icon:hover {
  color: rgb(55 65 81); /* text-neutral-700 */
}

:root.dark .top-menu .icon:hover {
  color: rgb(209 213 219); /* dark:text-neutral-300 */
}

/* Add padding to body when nav is sticky to prevent content jump */
body.has-sticky-nav {
  padding-top: var(--nav-height, 64px);
}

/* Update mobile menu position */
.mobile-menu-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
}

/* Add transition for clock icon */
.top-menu .icon {
  transition: color 0.3s ease;
}

/* Update existing styles */
.navbar-container {
  position: relative;
  width: 100%;
  overflow-x: clip;
}

/* Add responsive styles for top menu */
@media (max-width: 768px) {
  .nav-wrapper.nav-sticky {
    top: 0;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  
  .mobile-menu-content {
    top: 0;
  }
  
  .top-menu {
    display: none;
  }
}

/* ... rest of existing styles ... */

/* Add styles for dropdown menus */
:deep(.language-switcher .dropdown-menu),
:deep(.theme-toggle .dropdown-menu) {
  z-index: 1200 !important;
}
</style> 