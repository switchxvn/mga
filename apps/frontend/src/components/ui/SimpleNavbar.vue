<!-- Simple Navbar without Logo and Hotline sections -->
<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useNow, useDateFormat } from '@vueuse/core';
import { useFeatureFlags } from '~/composables/useFeatureFlags';
import { useLocalization } from '~/composables/useLocalization';
import { useLogo } from '~/composables/useLogo';
import { useNavbar } from '~/composables/useNavbar';
import { useNavMenu } from '~/composables/useNavMenu';
import { useNavbarSettings } from '~/composables/useNavbarSettings';
import { useNavbarFeatures } from '~/composables/useNavbarFeatures';
import { useDarkMode } from '~/composables/useDarkMode';
import Icon from './Icon.vue';
import ThemeToggle from '~/components/common/ThemeToggle.vue';
import LanguageSwitcher from '~/components/common/LanguageSwitcher.vue';
import CartIcon from '~/components/cart/CartIcon.vue';
import MegaMenu from '~/components/menu/MegaMenu.vue';
import MobileMegaMenu from '~/components/menu/MobileMegaMenu.vue';
import { getIconName } from '~/utils/icon';
import type { Icon as LucideIcon } from 'lucide-vue-next';
import { useCssColorValue } from '~/composables/useColorUtils';

// Props cho component
interface NavbarProps {
  settings?: {
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

    // Top menu settings
    topMenu?: {
      links: {
        label: string;
        href: string;
        textColor: string;
        hoverColor: string;
        isTranslated: boolean;
      }[];
    };
  };
}

const props = withDefaults(defineProps<NavbarProps>(), {
  settings: () => ({
    menuBackgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#e5e7eb",
    menuAlignment: "center",
    showLanguageSwitcher: true,
    showThemeToggle: true,
    showCart: true,
    mobileMenuBreakpoint: "md",
    darkMode: {
      menuBackgroundColor: "#171717",
      textColor: "#ffffff",
      borderColor: "#404040"
    },
    navigation: {
      textColor: "var(--tertiary-500)",
      fontWeight: "semibold",
      activeTextColor: "var(--primary-500)"
    }
  })
});

// Dark mode
const { isDark } = useDarkMode();

// Feature flags
const { isFeatureEnabled } = useFeatureFlags();
const isCartEnabled = ref<boolean | null>(null);
const isLoadingFeatureFlag = ref(true);

// Localization
const { locale } = useLocalization();

// Navbar
const {
  isMobileMenuOpen,
  isScrolled,
  navWrapperRef,
  activeMegaMenu,
  activeMobileMegaMenu,
  toggleMobileMenu,
  toggleMobileMegaMenu,
  showMegaMenu,
  hideMegaMenu,
  keepMegaMenu,
  updateBodyPadding
} = useNavbar();

// Menu
const {
  menuItems,
  isLoading,
  error,
  fetchMenuItems,
  processedMenuItems,
  isMenuActive,
  getColumnTitleTranslation,
  getParentMenuLeftOffset
} = useNavMenu();

// Settings
const navbarSettings = useNavbarSettings(props.settings);
const { settings, menuBackgroundColor, textColor, borderColor, navigationTextColor, navigationActiveTextColor } = navbarSettings;
const { processColorValue } = useCssColorValue();

// Time
const now = useNow();
const formattedTime = useDateFormat(now, 'HH:mm:ss - DD/MM/YYYY');

// Features (Time and Cart)
const { checkCartFeatureFlag } = useNavbarFeatures();

// Logo
const { currentLogoUrl, logo, isLoading: isLoadingLogo } = useLogo();

// Update MenuItem interface to match API response
interface MenuItemTranslation {
  locale: string;
  label: string;
}

interface MenuItem {
  id: number;
  href: string;
  label: string;
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

// Add these refs and computed properties
const menuContainerRef = ref<HTMLElement | null>(null);
const menuItemsRefs = ref<HTMLElement[]>([]);
const visibleMenuItems = ref<MenuItem[]>([]);
const hiddenMenuItems = ref<MenuItem[]>([]);
const showMoreMenu = ref(false);

// Add method to calculate visible items
const calculateVisibleItems = () => {
  if (!menuContainerRef.value || !menuItemsRefs.value.length || !processedMenuItems.value) return;

  const containerWidth = menuContainerRef.value.clientWidth;
  const moreButtonWidth = 60; // Width reserved for more button
  let availableWidth = containerWidth - moreButtonWidth;
  let totalWidth = 0;
  
  visibleMenuItems.value = [];
  hiddenMenuItems.value = [];

  processedMenuItems.value.forEach((item, index) => {
    const itemWidth = menuItemsRefs.value[index]?.clientWidth || 0;
    if (totalWidth + itemWidth <= availableWidth) {
      visibleMenuItems.value.push(item);
      totalWidth += itemWidth;
    } else {
      hiddenMenuItems.value.push(item);
    }
  });
};

// Update the resize observer
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const init = async () => {
    try {
      await fetchMenuItems();
      nextTick(() => {
        calculateVisibleItems();
      });
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
    await checkCartFeatureFlag();
  };
  
  init();

  resizeObserver = new ResizeObserver(() => {
    calculateVisibleItems();
  });

  if (menuContainerRef.value) {
    resizeObserver.observe(menuContainerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// Watch for locale changes
watch(locale, () => {
  fetchMenuItems();
});
</script>

<template>
  <div class="navbar-container">
    <!-- Top Menu -->
    <div 
      class="w-full relative"
      :style="{
        backgroundColor: isDark ? props.settings?.darkMode?.menuBackgroundColor : 'rgb(var(--color-primary-DEFAULT))'
      }"
    >
      <div 
        class="top-menu w-full border-b relative" 
        :style="{
          borderColor: isDark ? props.settings?.darkMode?.borderColor : 'rgb(var(--color-primary-DEFAULT))',
          color: isDark ? props.settings?.darkMode?.textColor : '#ffffff'
        }"
      >
        <div class="container mx-auto px-4">
          <div class="flex items-center h-12">
            <!-- Current Time -->
            <div class="w-1/3 flex items-center gap-2">
              <Icon 
                name="Clock" 
                class="h-4 w-4 text-white"
              />
              <span class="text-sm font-medium text-white">
                {{ formattedTime }}
              </span>
            </div>
            
            <!-- Center Hotline -->
            <div class="w-1/3 flex justify-center">
              <div class="flex items-center gap-3">
                <Icon 
                  name="Phone" 
                  class="h-6 w-6 text-white"
                />
                <span class="text-lg font-bold text-white">
                  Hotline: 1900 1234
                </span>
              </div>
            </div>

            <!-- Right Actions -->
            <div class="w-1/3 flex items-center gap-6 justify-end">
              <div class="w-44">
                <LanguageSwitcher v-if="props.settings?.showLanguageSwitcher" />
              </div>
              <div class="w-44">
                <ThemeToggle v-if="props.settings?.showThemeToggle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Section -->
    <div 
      ref="navWrapperRef"
      class="nav-wrapper w-full h-[80px]"
      :class="{ 'nav-sticky': isScrolled }"
      :style="{
        backgroundColor: isDark ? props.settings?.darkMode?.menuBackgroundColor : props.settings?.menuBackgroundColor
      }"
    >
      <nav class="navigation-section w-full h-full relative">
        <div class="max-w-[1920px] mx-auto px-4 h-full">
          <div class="flex items-center h-full relative">
            <!-- Logo -->
            <NuxtLink to="/" class="flex-shrink-0 mr-8 py-3">
              <div 
                class="flex items-center justify-center"
                :style="logo ? `width: ${Math.min(logo.width * 1.5, 200)}px; height: ${Math.min(logo.height * 1.5, 60)}px` : ''"
              >
                <img
                  v-if="currentLogoUrl"
                  :src="currentLogoUrl"
                  :alt="logo?.altText || 'Logo'"
                  :width="logo?.width"
                  :height="logo?.height"
                  class="transition-transform duration-300 hover:scale-110 object-contain w-full h-full max-h-[60px]"
                />
                <span
                  v-else-if="isLoadingLogo"
                  class="h-12 w-12 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded"
                ></span>
              </div>
            </NuxtLink>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex flex-1 items-center">
              <div class="flex-1 flex items-center" ref="menuContainerRef">
                <div v-if="isLoading" class="text-sm" :style="{ color: isDark ? props.settings?.darkMode?.textColor : props.settings?.textColor }">
                  Đang tải menu...
                </div>
                <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>
                <template v-else>
                  <div class="flex items-center gap-x-8 w-full">
                    <!-- Visible Menu Items -->
                    <div
                      v-for="(item, itemIndex) in processedMenuItems"
                      :key="item.id"
                      class="relative group"
                      :data-menu-id="item.id"
                      :ref="el => { if (el) menuItemsRefs[itemIndex] = el as HTMLElement }"
                      @mouseenter="(e) => { if (item.children?.length) { showMegaMenu(item.id); } }"
                      @mouseleave="item.children?.length ? hideMegaMenu() : null"
                    >
                      <NuxtLink
                        :to="item.href"
                        class="main-menu-item flex items-center space-x-1 whitespace-nowrap py-5"
                        :class="{ 
                          'menu-active': isMenuActive(item.href),
                          [props.settings?.navigation?.fontWeight || '']: true
                        }"
                      >
                        <Icon
                          v-if="item.icon"
                          :name="getIconName(item.icon)"
                          class="h-5 w-5"
                          :style="{ 
                            color: isMenuActive(item.href) 
                              ? props.settings?.navigation?.activeTextColor
                              : props.settings?.navigation?.textColor
                          }"
                        />
                        <span 
                          class="text-[1.05rem] uppercase transition-colors duration-300" 
                          :style="{ 
                            color: isMenuActive(item.href) 
                              ? props.settings?.navigation?.activeTextColor
                              : props.settings?.navigation?.textColor
                          }"
                        >
                          {{ item.label }}
                        </span>
                        <Icon
                          v-if="item.children?.length"
                          name="ChevronDown"
                          class="transition-transform duration-300 group-hover:rotate-180 h-4 w-4"
                          :style="{ 
                            color: isMenuActive(item.href) 
                              ? props.settings?.navigation?.activeTextColor
                              : props.settings?.navigation?.textColor
                          }"
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

                    <!-- More Menu -->
                    <div 
                      v-if="hiddenMenuItems.length > 0"
                      class="relative"
                      @mouseenter="showMoreMenu = true"
                      @mouseleave="showMoreMenu = false"
                    >
                      <button 
                        class="flex items-center space-x-1 py-5"
                        :style="{ color: props.settings?.navigation?.textColor }"
                      >
                        <Icon name="MoreHorizontal" class="h-5 w-5" />
                      </button>

                      <!-- More Menu Dropdown -->
                      <Transition name="fade">
                        <div 
                          v-if="showMoreMenu"
                          class="absolute top-full right-0 bg-white dark:bg-neutral-800 shadow-lg rounded-md py-2 min-w-[200px] z-50"
                        >
                          <NuxtLink
                            v-for="item in hiddenMenuItems"
                            :key="item.id"
                            :to="item.href"
                            class="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 whitespace-nowrap"
                            :style="{ color: props.settings?.navigation?.textColor }"
                            @click="showMoreMenu = false"
                          >
                            <Icon
                              v-if="item.icon"
                              :name="getIconName(item.icon)"
                              class="h-5 w-5"
                            />
                            <span>{{ item.label }}</span>
                          </NuxtLink>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </template>
              </div>
            </nav>

            <!-- Right Actions -->
            <div class="flex items-center gap-4">
              <CartIcon v-if="props.settings?.showCart && isCartEnabled" />
              
              <!-- Mobile Menu Button -->
              <button
                class="lg:hidden flex items-center justify-center w-10 h-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
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
          <!-- Mobile Menu Header -->
          <div class="mobile-menu-header flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
            <h2 class="text-lg font-semibold">Menu</h2>
            <button
              class="p-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
              @click="isMobileMenuOpen = false"
              aria-label="Close Menu"
            >
              <Icon name="X" class="h-6 w-6" />
            </button>
          </div>

          <div class="px-4 py-3 space-y-1 bg-white dark:bg-neutral-900">
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

            <!-- Mobile Menu Items with Mega Menu -->
            <div class="space-y-1">
              <div
                v-for="item in processedMenuItems"
                :key="item.id"
                class="mobile-menu-item"
              >
                <!-- Menu Item with Mega Menu -->
                <div
                  v-if="item.children && item.children.length > 0"
                  class="mobile-main-menu-item flex items-center justify-between px-3 py-2 text-base font-semibold uppercase rounded-md"
                  :class="{ 'mobile-menu-active': isMenuActive(item.href) }"
                >
                  <NuxtLink
                    :to="item.href"
                    class="flex-1 flex items-center gap-2"
                    @click="isMobileMenuOpen = false"
                  >
                    <Icon
                      v-if="item.icon"
                      :name="getIconName(item.icon)"
                      class="h-5 w-5"
                    />
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
                  class="mobile-main-menu-item flex items-center gap-2 px-3 py-2 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-md transition-colors duration-300"
                  :class="{ 'text-primary-600 dark:text-primary-400': isMenuActive(item.href) }"
                  @click="isMobileMenuOpen = false"
                >
                  <Icon
                    v-if="item.icon"
                    :name="getIconName(item.icon)"
                    class="h-5 w-5"
                  />
                  {{ item.label }}
                </NuxtLink>

                <!-- Mobile Mega Menu Content -->
                <Transition name="slide-fade">
                  <MobileMegaMenu
                    v-if="item.children && item.children.length > 0 && activeMobileMegaMenu === item.id"
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

<style lang="scss" scoped>
.navbar-container {
  @apply relative z-50;

  .top-menu {
    @apply relative z-50;
    background-color: rgb(var(--color-primary-DEFAULT));
  }

  .nav-wrapper {
    @apply relative z-40;
    position: relative;

    &.nav-sticky {
      @apply fixed top-0 left-0 right-0 shadow-md;
      animation: slideDown 0.3s ease-out;
    }
  }

  .navigation-section {
    @apply relative;
    
    .container {
      @apply h-full;
      
      > div {
        @apply h-full;
      }
    }
  }

  .main-menu-item {
    @apply relative;

    span, .icon {
      @apply transition-colors duration-300;
    }

    &:hover {
      span, .icon {
        color: var(--primary-500) !important;
      }
    }

    &.menu-active {
      span, .icon {
        color: var(--primary-500) !important;
      }
    }
  }

  .mobile-menu-overlay {
    @apply fixed inset-0 bg-black/50 z-50;

    .mobile-menu-content {
      @apply fixed top-0 right-0 h-full w-full max-w-sm overflow-y-auto;
    }
  }

  .mobile-main-menu-item {
    @apply relative;

    &:hover {
      @apply bg-neutral-100 dark:bg-neutral-800;
    }

    &.mobile-menu-active {
      @apply text-primary-500;
    }
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style> 