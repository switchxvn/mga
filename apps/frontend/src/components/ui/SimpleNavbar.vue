<!-- Simple Navbar without Logo and Hotline sections -->
<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useNow, useDateFormat } from '@vueuse/core';
import { useFeatureFlags } from '~/composables/useFeatureFlags';
import { useLocalization } from '~/composables/useLocalization';
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
    mobileMenuBreakpoint: "md"
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
const { getMenuBackgroundColor, getTextColor, processColorValue } = useNavbarSettings(props.settings);

// Time
const now = useNow();
const formattedTime = useDateFormat(now, 'HH:mm:ss - DD/MM/YYYY');

// Features (Time and Cart)
const { checkCartFeatureFlag } = useNavbarFeatures();

onMounted(() => {
  const init = async () => {
    console.log('SimpleNavbar mounted with settings:', props.settings);
    try {
      await fetchMenuItems();
      console.log('Menu items fetched:', menuItems.value);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
    await checkCartFeatureFlag();
  };
  
  init();
});

// Watch for locale changes
watch(locale, () => {
  fetchMenuItems();
});
</script>

<template>
  <div class="navbar-container">
    <!-- Top Menu -->
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
            <template v-if="props.settings?.topMenu?.links">
              <template v-for="(link, index) in props.settings.topMenu.links" :key="index">
                <NuxtLink 
                  :to="link.href"
                  class="transition-colors duration-300 font-bold uppercase"
                  :style="{
                    color: link.textColor,
                    '--hover-color': link.hoverColor
                  }"
                >
                {{ $t(link.label.toLowerCase()) }}
                </NuxtLink>
                <span v-if="index < props.settings.topMenu.links.length - 1" class="text-neutral-500 dark:text-neutral-400">|</span>
              </template>
            </template>
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

    <!-- Navigation Section -->
    <div 
      ref="navWrapperRef"
      class="nav-wrapper w-full"
      :class="{ 'nav-sticky': isScrolled }"
    >
      <nav
        class="navigation-section w-full relative"
      >
        <div 
          class="nav-bg-layer"
          :style="{
            backgroundColor: isDark 
              ? processColorValue(props.settings?.darkMode?.menuBackgroundColor || '#171717')
              : processColorValue(props.settings?.menuBackgroundColor || '#ffffff')
          }"
        ></div>
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between h-full relative">
            <!-- Desktop Navigation -->
            <nav class="hidden md:flex items-center space-x-5 flex-grow justify-start">
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
                    <Icon
                      v-if="item.icon"
                      :name="getIconName(item.icon)"
                      class="h-5 w-5 mr-1"
                      :style="{ 
                        color: isMenuActive(item.href) 
                          ? processColorValue(props.settings?.navigation?.activeTextColor || 'var(--primary-500)')
                          : processColorValue(props.settings?.navigation?.textColor || 'var(--tertiary-500)')
                      }"
                    />
                    <span 
                      class="text-[1.05rem] transition-colors duration-300" 
                      :style="{ 
                        color: isMenuActive(item.href) 
                          ? processColorValue(props.settings?.navigation?.activeTextColor || 'var(--primary-500)')
                          : processColorValue(props.settings?.navigation?.textColor || 'var(--tertiary-500)'),
                        '--hover-color': processColorValue('var(--primary-400)')
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
                          ? processColorValue(props.settings?.navigation?.activeTextColor || 'var(--primary-500)')
                          : processColorValue(props.settings?.navigation?.textColor || 'var(--tertiary-500)')
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
                  class="flex items-center justify-center w-10 h-10 text-white hover:bg-primary-400 rounded-full transition-colors"
                >
                  <Icon name="User" class="h-6 w-6" />
                </NuxtLink>

                <!-- Hamburger Menu Button -->
                <button
                  class="flex items-center justify-center w-10 h-10 text-white hover:bg-primary-400 rounded-full transition-colors"
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
    
    .top-menu-bg-layer {
      @apply absolute inset-0 bg-white dark:bg-neutral-900;
    }
  }

  .nav-wrapper {
    @apply relative z-40;

    &.nav-sticky {
      @apply fixed top-0 left-0 right-0 shadow-md;
      animation: slideDown 0.3s ease-out;
    }
  }

  .navigation-section {
    @apply relative;
    height: var(--nav-height, 60px);

    .nav-bg-layer {
      @apply absolute inset-0;
    }
  }

  .main-menu-item {
    @apply relative;

    &:hover {
      span {
        @apply text-primary-500;
      }
    }

    &.menu-active {
      span {
        @apply text-primary-500;
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