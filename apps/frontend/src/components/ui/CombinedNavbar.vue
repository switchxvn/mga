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

// Process menu items with translations
const processedMenuItems = computed(() => {
  // Get parent menu items first
  const parentMenuItems = menuItems.value
    .filter(item => !item.parentId && item.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Process each parent menu item
  return parentMenuItems.map(item => {
    // Get child menu items
    const childItems = menuItems.value
      .filter(child => child.parentId === item.id && child.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Check if this menu item has children (mega menu)
    const hasMegaMenu = childItems.length > 0;

    // Get translation for current item
    const currentTranslation = item.translations?.find(t => t.locale === locale.value) || 
      item.translations?.[0];

    // Group child items into columns (3 items per column)
    const itemsPerColumn = 3;
    const megaMenuColumns = hasMegaMenu ? Array.from({ length: Math.ceil(childItems.length / itemsPerColumn) }, (_, columnIndex) => {
      const startIndex = columnIndex * itemsPerColumn;
      const columnItems = childItems.slice(startIndex, startIndex + itemsPerColumn);
      return {
        title: getTranslation(item, locale.value), // Use parent item's label as column title
        items: columnItems.map(child => {
          const childTranslation = child.translations?.find(t => t.locale === locale.value) || 
            child.translations?.[0];
          return {
            href: childTranslation?.href || "#",
            label: getTranslation(child, locale.value)
          };
        })
      };
    }) : [];

    return {
      ...item,
      href: currentTranslation?.href || "#",
      hasMegaMenu,
      label: getTranslation(item, locale.value),
      megaMenuColumns
    };
  });
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

// Handle scroll event
const handleScroll = () => {
  if (!navWrapperRef.value) return;
  
  const currentScrollPosition = Math.round(window.scrollY);
  const logoSection = document.querySelector('.logo-section');
  
  if (logoSection) {
    const logoHeight = Math.round(logoSection.getBoundingClientRect().height);
    
    // Update sticky state based on scroll position
    if (currentScrollPosition <= 0) {
      isScrolled.value = false;
    } else {
      isScrolled.value = currentScrollPosition > logoHeight;
    }
    
    // Update nav height when becoming sticky
    if (isScrolled.value) {
      nextTick(() => {
        const nav = document.querySelector('.navigation-section') as HTMLElement;
        if (nav) {
          const navHeight = Math.round(nav.offsetHeight);
          document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
          document.documentElement.style.setProperty('--mobile-menu-top', mobileMenuTop.value);
        }
      });
    }
  }
  
  lastScrollPosition.value = currentScrollPosition;
};

// Watch route changes
watch(
  () => route.path,
  () => {
    // Reset scroll position and sticky state
    window.scrollTo(0, 0);
    isScrolled.value = false;
    lastScrollPosition.value = 0;
    
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

// Watch for mobile menu state changes
watch(isMobileMenuOpen, (newVal) => {
  if (newVal) {
    // When menu opens, update its position
    nextTick(() => {
      document.documentElement.style.setProperty('--mobile-menu-top', mobileMenuTop.value);
    });
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  } else {
    // Re-enable body scroll when menu closes
    document.body.style.overflow = '';
  }
});

// Improve throttle function
const throttledHandleScroll = (() => {
  let frame: number | undefined;
  let lastTime = 0;
  const throttleMs = 16; // Approximately 60fps

  return () => {
    const now = Date.now();
    
    if (now - lastTime >= throttleMs) {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      
      frame = requestAnimationFrame(() => {
        handleScroll();
        lastTime = now;
      });
    }
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

// Update onMounted
onMounted(() => {
  console.log('CombinedNavbar mounted with settings:', props.settings);
  window.addEventListener('scroll', throttledHandleScroll, { passive: true });
  fetchMenuItems();
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
});
</script>

<template>
  <div class="navbar-container">
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
      class="nav-wrapper w-full z-50"
      :class="{ 'nav-sticky': isScrolled }"
    >
      <nav
        class="navigation-section w-full border-b"
        :class="[
          `text-${props.settings?.menuAlignment || 'center'}`
        ]"
      >
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between py-2">
            <!-- Mobile Logo -->
            <div class="flex-shrink-0 md:hidden">
              <NuxtLink to="/" class="block">
                <div class="mobile-logo">
                  <img
                    v-if="currentLogoUrl"
                    :src="currentLogoUrl"
                    :alt="logo?.altText || 'Logo'"
                    class="transition-transform duration-300 hover:scale-110"
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
                  v-for="item in processedMenuItems"
                  :key="item.id"
                  class="relative group"
                  @mouseenter="item.hasMegaMenu ? showMegaMenu(item.id) : null"
                  @mouseleave="item.hasMegaMenu ? hideMegaMenu() : null"
                >
                  <NuxtLink
                    :to="item.href"
                    class="main-menu-item text-base uppercase transition-colors py-5 flex items-center space-x-1"
                    :class="{ 'menu-active': isMenuActive(item.href) }"
                  >
                    <span 
                      class="text-base transition-colors duration-300" 
                      :style="{ 
                        color: isMenuActive(item.href) 
                          ? processColorValue(props.settings?.navigation?.activeTextColor || 'var(--primary-500)')
                          : processColorValue(props.settings?.navigation?.textColor || 'var(--tertiary-500)'),
                        '--hover-color': processColorValue('var(--primary-400)'),
                        fontWeight: props.settings?.navigation?.fontWeight || 'extrabold'
                      }"
                    >
                      {{ item.label }}
                    </span>
                    <Icon
                      v-if="item.hasMegaMenu"
                      name="ChevronDown"
                      class="transition-transform duration-300 group-hover:rotate-180 h-4 w-4"
                    />
                  </NuxtLink>

                  <!-- Mega Menu -->
                  <div
                    v-if="item.hasMegaMenu && activeMegaMenu === item.id"
                    class="mega-menu absolute top-full left-0 w-screen max-w-4xl shadow-lg rounded-b-lg border-t transition-all duration-300 transform origin-top z-50 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    style="left: 50%; transform: translateX(-50%)"
                    @mouseenter="keepMegaMenu"
                    @mouseleave="hideMegaMenu"
                  >
                    <div class="grid grid-cols-3 gap-6 p-6">
                      <div
                        v-for="(column, columnIndex) in item.megaMenuColumns"
                        :key="columnIndex"
                        class="space-y-3"
                      >
                        <h3 class="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                          {{ column.title }}
                        </h3>
                        <ul class="space-y-2">
                          <li
                            v-for="(subItem, subItemIndex) in column.items"
                            :key="subItemIndex"
                            class="block"
                          >
                            <NuxtLink
                              :to="subItem.href"
                              class="navbar-megamenu-item block py-1.5 px-2 rounded-md text-sm text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
                              @click="activeMegaMenu = null"
                            >
                              {{ subItem.label }}
                            </NuxtLink>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </nav>

            <!-- Right side actions -->
            <div class="flex items-center space-x-4">
              <div class="hidden md:block">
                <!-- Language Switcher -->
                <LanguageSwitcher v-if="props.settings?.showLanguageSwitcher" />
              </div>

              <div class="hidden md:block">
                <!-- Theme Toggle -->
                <ThemeToggle v-if="props.settings?.showThemeToggle" />
              </div>

              <!-- Cart Icon -->
              <CartIcon v-if="props.settings?.showCart && isCartEnabled" class="hidden md:block" />
            </div>

            <!-- Mobile Menu Button -->
            <div class="md:hidden flex items-center space-x-2">
              <!-- Cart Icon for Mobile -->
              <CartIcon v-if="props.settings?.showCart && isCartEnabled" />

              <button
                class="flex items-center text-neutral-700 dark:text-neutral-300"
                @click="toggleMobileMenu"
                aria-label="Toggle Menu"
              >
                <Icon :name="isMobileMenuOpen ? 'X' : 'Menu'" class="h-6 w-6" />
              </button>
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
          <div class="px-4 py-3 space-y-1">
            <div v-if="isLoading" class="text-sm text-neutral-500 dark:text-neutral-400 px-3 py-2">
              Đang tải menu...
            </div>
            <div v-else-if="error" class="text-sm text-red-500 px-3 py-2">{{ error }}</div>
            <template v-else>
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

              <NuxtLink
                v-for="item in processedMenuItems"
                :key="item.id"
                :to="item.href"
                class="mobile-main-menu-item block px-3 py-2 text-lg font-extrabold uppercase rounded-md"
                :class="{ 'mobile-menu-active': isMenuActive(item.href) }"
                @click="isMobileMenuOpen = false"
              >
                {{ item.label }}
              </NuxtLink>
            </template>
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
}

.nav-wrapper {
  position: relative;
  width: 100%;
  transition: none; /* Remove transition to prevent jank */
  will-change: transform;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  perspective: 1000;
  -webkit-perspective: 1000;
  z-index: 110;
}

.nav-wrapper.nav-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background-color: var(--navbar-menu-bg);
}

.navigation-section {
  background-color: var(--navbar-menu-bg) !important;
  border-color: var(--navbar-border) !important;
  color: var(--navbar-text) !important;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  height: 64px;
  display: flex;
  align-items: center;
  will-change: transform;
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
  box-shadow: 0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04);
}

/* Remove the body padding since we're handling position differently now */
:global(body) {
  padding-top: 0;
}

/* Add a placeholder when nav is sticky to prevent content jump */
.nav-wrapper.nav-sticky + * {
  margin-top: var(--nav-height);
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
  z-index: 95;
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
  @apply fixed inset-0 bg-black bg-opacity-50 z-[90] md:hidden;
}

.mobile-menu-content {
  position: fixed;
  top: var(--nav-height); /* Use dynamic nav height */
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 64px; /* Add padding to prevent overlap */
  background-color: var(--navbar-menu-bg);
  border-top: 1px solid var(--navbar-border);
  overflow-y: auto;
  z-index: 100;
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

/* Mega menu styles */
.mega-menu {
  z-index: 110 !important;
}
</style> 