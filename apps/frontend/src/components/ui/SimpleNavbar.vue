<!-- Simple Navbar without Logo and Hotline sections -->
<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { useNow, useDateFormat, onClickOutside } from '@vueuse/core';
import { useFeatureFlags } from '~/composables/useFeatureFlags';
import { useLocalization } from '~/composables/useLocalization';
import { useLogo } from '~/composables/useLogo';
import { useNavbar } from '~/composables/useNavbar';
import { useNavMenu } from '~/composables/useNavMenu';
import { useNavbarSettings } from '~/composables/useNavbarSettings';
import { useNavbarFeatures } from '~/composables/useNavbarFeatures';
import { useDarkMode } from '~/composables/useDarkMode';
import { useIcon } from '~/composables/useIcon';
import { useCssColorValue } from '~/composables/useColorUtils';
import { Phone } from 'lucide-vue-next';
import type { MenuItem, TopMenuItem } from '~/types/navbar';
import { defineAsyncComponent, markRaw } from 'vue';
import type { Component } from 'vue';

// Register components using defineAsyncComponent
const registeredComponents = {
  'LanguageSwitcher': defineAsyncComponent(() => import('~/components/common/LanguageSwitcher.vue')),
  'ThemeToggle': defineAsyncComponent(() => import('~/components/common/ThemeToggle.vue')),
  'CartIcon': defineAsyncComponent(() => import('~/components/cart/CartIcon.vue')),
  'MegaMenu': defineAsyncComponent(() => import('~/components/menu/MegaMenu.vue')),
  'MobileMegaMenu': defineAsyncComponent(() => import('~/components/menu/MobileMegaMenu.vue')),
  'Icon': defineAsyncComponent(() => import('~/components/ui/Icon.vue')),
  'CurrentDateTime': defineAsyncComponent(() => import('~/components/common/CurrentDateTime.vue'))
} as Record<string, Component>;

// Function to resolve component
const resolveComponent = (item: TopMenuItem): Component | null => {
  if (!item?.type || !item?.component) {
    console.warn('Invalid component configuration');
    return null;
  }

  const componentName = item.component.split('/').pop()?.replace('.vue', '');
  if (componentName && registeredComponents[componentName]) {
    return markRaw(registeredComponents[componentName]);
  }

  console.warn(`No component found for: ${item.component}`);
  return null;
};

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

    // Top menu settings with new column structure
    topMenu?: {
      leftColumn?: {
        items: TopMenuItem[];
        width?: string;
        alignment?: 'start' | 'center' | 'end';
      };
      centerColumn?: {
        items: TopMenuItem[];
        width?: string;
        alignment?: 'start' | 'center' | 'end';
      };
      rightColumn?: {
        items: TopMenuItem[];
        width?: string;
        alignment?: 'start' | 'center' | 'end';
      };
    };

    // Update button settings
    bookingButton?: {
      text: string;
      href: string;
      phoneNumbers: {
        label: string;
        number: string;
      }[];
      backgroundColor?: string;
      textColor?: string;
    };
    
    // Add phone button settings
    phoneButton?: {
      text: string;
      numbers: {
        label: string;
        number: string;
        textColor?: string;
        backgroundColor?: string;
      }[];
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

// Define types for top menu items
interface TopMenuItem {
  type: 'component' | 'link' | 'text' | 'divider';
  component?: string;
  settings?: Record<string, any>;
  href?: string;
  label?: string;
  content?: string;
  textColor?: string;
  hoverColor?: string;
  isTranslated?: boolean;
  icon?: string;
  color?: string;
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
    },
    bookingButton: {
      text: "Đặt vé ngay",
      href: "/booking",
      phoneNumbers: [
        {
          label: "Hotline",
          number: "1900 1234"
        }
      ],
      backgroundColor: "rgb(var(--color-primary-500))",
      textColor: "#ffffff"
    },
    phoneButton: {
      text: "Hotline",
      numbers: [
        {
          label: "Hotline",
          number: "1900 1234",
          textColor: "#ffffff",
          backgroundColor: "rgb(var(--color-primary-500))"
        }
      ],
      backgroundColor: "rgb(var(--color-primary-500))",
      textColor: "#ffffff"
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
const { locale, t } = useLocalization();

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

// Time
const now = useNow();
const formattedTime = useDateFormat(now, 'HH:mm:ss - DD/MM/YYYY');

// Features (Time and Cart)
const { checkCartFeatureFlag } = useNavbarFeatures();

// Logo
const { currentLogoUrl, logo, isLoading: isLoadingLogo } = useLogo();

// Add these refs and computed properties
const menuContainerRef = ref<HTMLElement | null>(null);
const menuItemsRefs = ref<HTMLElement[]>([]);
const visibleMenuItems = ref<MenuItem[]>([]);
const hiddenMenuItems = ref<MenuItem[]>([]);
const showMoreMenu = ref(false);

// Add method to calculate visible items
const calculateVisibleItems = () => {
  if (!menuContainerRef.value || !processedMenuItems.value) return;

  const containerWidth = menuContainerRef.value.clientWidth;
  const moreButtonWidth = 0;
  let availableWidth = containerWidth - moreButtonWidth;
  let totalWidth = 0;
  
  visibleMenuItems.value = [];
  hiddenMenuItems.value = [];

  // Reset refs array
  menuItemsRefs.value = [];

  processedMenuItems.value.forEach((item: MenuItem) => {
    const estimatedWidth = 
      (item.label.length * 10.5) +
      40 +
      (item.icon ? 32 : 0) +
      (item.children?.length ? 24 : 0) +
      16;

    const withBuffer = estimatedWidth;

    if (totalWidth + withBuffer <= availableWidth) {
      visibleMenuItems.value.push(item);
      totalWidth += withBuffer;
    } else {
      hiddenMenuItems.value.push(item);
    }
  });

  if (visibleMenuItems.value.length === 1 && hiddenMenuItems.value.length > 0) {
    hiddenMenuItems.value.unshift(visibleMenuItems.value[0]);
    visibleMenuItems.value = [];
  }
};

// Update the resize observer
let resizeObserver: ResizeObserver | null = null;

// Add these refs and handlers
const moreMenuRef = ref<HTMLElement | null>(null);

const { getIconComponent } = useIcon();

// Hàm để gọi điện thoại
const callPhone = (phoneNumber: string) => {
  window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
};

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

  if (moreMenuRef.value) {
    onClickOutside(moreMenuRef, () => {
      showMoreMenu.value = false;
    });
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
        <div class="w-full px-8">
          <div class="flex items-center h-16">
            <!-- Left Column -->
            <div 
              class="flex items-center gap-4" 
              :style="{
                width: props.settings?.topMenu?.leftColumn?.width || '30%',
                justifyContent: props.settings?.topMenu?.leftColumn?.alignment === 'center' ? 'center' : 
                              props.settings?.topMenu?.leftColumn?.alignment === 'end' ? 'flex-end' : 'flex-start'
              }"
            >
              <template v-for="(item, index) in props.settings?.topMenu?.leftColumn?.items" :key="index">
                <!-- Component Type -->
                <component
                  v-if="item.type === 'component' && item.component"
                  :is="resolveComponent(item)"
                  v-bind="item.settings || {}"
                />
                
                <!-- Text Type with Icon -->
                <div
                  v-else-if="item.type === 'text'"
                  class="flex items-center gap-2"
                >
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="nav-icon w-5 h-5"
                    :style="{ color: item.textColor }"
                  />
                  <span
                    class="text-[18px] font-medium whitespace-nowrap"
                    :style="{ color: item.textColor }"
                  >
                    {{ item.isTranslated ? t(item.content ?? '') : item.content }}
                  </span>
                </div>

                <!-- Link Type with Icon -->
                <NuxtLink
                  v-else-if="item.type === 'link'"
                  :to="item.href"
                  class="flex items-center gap-2 text-[18px] font-[800] uppercase transition-colors duration-300 hover:opacity-90 whitespace-nowrap"
                  :style="{
                    color: item.textColor,
                    '&:hover': {
                      color: item.hoverColor
                    }
                  }"
                >
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="nav-icon w-5 h-5"
                    :style="{ color: item.textColor }"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                </NuxtLink>

                <!-- Divider -->
                <div
                  v-else-if="item.type === 'divider'"
                  class="h-6 w-[2px] mx-2"
                  :style="{ backgroundColor: item.color || '#ffffff' }"
                ></div>
              </template>
            </div>
            
            <!-- Center Column -->
            <div 
              class="flex items-center gap-4" 
              :style="{
                width: props.settings?.topMenu?.centerColumn?.width || '40%',
                justifyContent: props.settings?.topMenu?.centerColumn?.alignment === 'start' ? 'flex-start' : 
                              props.settings?.topMenu?.centerColumn?.alignment === 'end' ? 'flex-end' : 'center'
              }"
            >
              <template v-for="(item, index) in props.settings?.topMenu?.centerColumn?.items" :key="index">
                <!-- Component Type -->
                <component
                  v-if="item.type === 'component' && item.component"
                  :is="resolveComponent(item)"
                  v-bind="item.settings || {}"
                />
                
                <!-- Text Type with Icon -->
                <div
                  v-else-if="item.type === 'text'"
                  class="flex items-center gap-2"
                >
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="nav-icon w-5 h-5"
                    :style="{ color: item.textColor }"
                  />
                  <span
                    class="text-[18px] font-medium whitespace-nowrap"
                    :style="{ color: item.textColor }"
                  >
                    {{ item.isTranslated ? t(item.content ?? '') : item.content }}
                  </span>
                </div>

                <!-- Link Type with Icon -->
                <NuxtLink
                  v-else-if="item.type === 'link'"
                  :to="item.href"
                  class="flex items-center gap-2 text-[18px] font-[800] uppercase transition-colors duration-300 hover:opacity-90 whitespace-nowrap"
                  :style="{
                    color: item.textColor,
                    '&:hover': {
                      color: item.hoverColor
                    }
                  }"
                >
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="nav-icon w-5 h-5"
                    :style="{ color: item.textColor }"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                </NuxtLink>

                <!-- Divider -->
                <div
                  v-else-if="item.type === 'divider'"
                  class="h-6 w-[2px] mx-2"
                  :style="{ backgroundColor: item.color || '#ffffff' }"
                ></div>
              </template>
            </div>

            <!-- Right Column -->
            <div 
              class="flex items-center gap-4" 
              :style="{
                width: props.settings?.topMenu?.rightColumn?.width || '30%',
                justifyContent: props.settings?.topMenu?.rightColumn?.alignment === 'center' ? 'center' : 
                              props.settings?.topMenu?.rightColumn?.alignment === 'start' ? 'flex-start' : 'flex-end'
              }"
            >
              <template v-for="(item, index) in props.settings?.topMenu?.rightColumn?.items" :key="index">
                <!-- Component Type -->
                <component
                  v-if="item.type === 'component' && item.component"
                  :is="resolveComponent(item)"
                  v-bind="item.settings || {}"
                />
                
                <!-- Text Type with Icon -->
                <div
                  v-else-if="item.type === 'text'"
                  class="flex items-center gap-2"
                >
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="nav-icon w-5 h-5"
                    :style="{ color: item.textColor }"
                  />
                  <span
                    class="text-[18px] font-medium whitespace-nowrap"
                    :style="{ color: item.textColor }"
                  >
                    {{ item.isTranslated ? t(item.content ?? '') : item.content }}
                  </span>
                </div>

                <!-- Link Type with Icon -->
                <NuxtLink
                  v-else-if="item.type === 'link'"
                  :to="item.href"
                  class="flex items-center gap-2 text-[18px] font-[800] uppercase transition-colors duration-300 hover:opacity-90 whitespace-nowrap"
                  :style="{
                    color: item.textColor,
                    '&:hover': {
                      color: item.hoverColor
                    }
                  }"
                >
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="nav-icon w-5 h-5"
                    :style="{ color: item.textColor }"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                </NuxtLink>

                <!-- Divider -->
                <div
                  v-else-if="item.type === 'divider'"
                  class="h-6 w-[2px] mx-2"
                  :style="{ backgroundColor: item.color || '#ffffff' }"
                ></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Section -->
    <div 
      ref="navWrapperRef"
      class="nav-wrapper w-full h-[90px]"
      :class="{ 'nav-sticky': isScrolled }"
      :style="{
        backgroundColor: isDark ? props.settings?.darkMode?.menuBackgroundColor : props.settings?.menuBackgroundColor
      }"
    >
      <nav class="navigation-section w-full h-full relative">
        <div class="w-full px-8 h-full">
          <div class="flex items-center h-full relative">
            <!-- Logo - Left column -->
            <div class="w-[15%] flex justify-start">
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
            </div>

            <!-- Navigation Menu - Center column -->
            <nav class="w-[70%] hidden lg:flex h-full">
              <div class="flex items-center justify-between w-full h-full" ref="menuContainerRef">
                <div class="flex items-center justify-between w-full h-full">
                  <div v-if="isLoading" class="text-sm" :style="{ color: isDark ? props.settings?.darkMode?.textColor : props.settings?.textColor }">
                    Đang tải menu...
                  </div>
                  <template v-else>
                    <div class="flex items-center justify-between w-full gap-2">
                      <!-- Visible Menu Items -->
                      <div
                        v-for="(item, itemIndex) in visibleMenuItems"
                        :key="item.id"
                        class="relative group h-full flex items-center"
                        :data-menu-id="item.id"
                        :ref="el => { if (el) menuItemsRefs[itemIndex] = el as HTMLElement }"
                        @mouseenter="(e) => { if (item.children?.length) { showMegaMenu(Number(item.id)); } }"
                        @mouseleave="item.children?.length ? hideMegaMenu() : null"
                      >
                        <NuxtLink
                          :to="item.href"
                          class="main-menu-item flex items-center space-x-2 whitespace-nowrap h-full px-4"
                          :class="{ 
                            'menu-active': isMenuActive(item.href),
                            [props.settings?.navigation?.fontWeight || '']: true
                          }"
                        >
                          <Icon
                            v-if="item.icon"
                            :name="item.icon"
                            class="nav-icon w-6 h-6"
                            :style="{ 
                              color: isMenuActive(item.href) 
                                ? 'rgb(var(--color-primary-500))'
                                : props.settings?.navigation?.textColor
                            }"
                          />
                          <span 
                            class="text-[1.25rem] uppercase font-black" 
                            :style="{ 
                              color: isMenuActive(item.href) 
                                ? 'rgb(var(--color-primary-500))'
                                : props.settings?.navigation?.textColor
                            }"
                          >
                            {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                          </span>
                          <Icon
                            v-if="item.children?.length"
                            name="ChevronDown"
                            class="nav-icon w-5 h-5 transition-transform duration-300 group-hover:rotate-180"
                            :style="{ 
                              color: isMenuActive(item.href) 
                                ? 'rgb(var(--color-primary-500))'
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
                        class="more-menu flex-shrink-0 ml-2"
                        ref="moreMenuRef"
                      >
                        <button 
                          class="flex items-center space-x-1 py-5 px-4 hover:bg-white/30 dark:hover:bg-neutral-800 rounded-md"
                          :style="{ color: props.settings?.navigation?.textColor }"
                          @click="showMoreMenu = !showMoreMenu"
                        >
                          <Icon name="MoreHorizontal" class="nav-icon w-6 h-6" />
                        </button>

                        <!-- More Menu Dropdown -->
                        <Transition
                          enter-active-class="transition ease-out duration-200"
                          enter-from-class="transform opacity-0 scale-95"
                          enter-to-class="transform opacity-100 scale-100"
                          leave-active-class="transition ease-in duration-150"
                          leave-from-class="transform opacity-100 scale-100"
                          leave-to-class="transform opacity-0 scale-95"
                        >
                          <div
                            v-show="showMoreMenu"
                            class="more-menu-dropdown"
                          >
                            <div
                              v-for="item in hiddenMenuItems"
                              :key="item.id"
                              class="menu-item"
                              @mouseenter="(e) => { if (item.children?.length) { showMegaMenu(item.id); } }"
                              @mouseleave="item.children?.length ? hideMegaMenu() : null"
                            >
                              <NuxtLink
                                :to="item.href"
                                class="flex items-center space-x-2 w-full"
                                :style="{ color: props.settings?.navigation?.textColor }"
                                @click="showMoreMenu = false"
                              >
                                <Icon
                                  v-if="item.icon"
                                  :name="item.icon"
                                  class="nav-icon w-5 h-5"
                                />
                                <span>{{ item.isTranslated ? t(item.label ?? '') : item.label }}</span>
                                <Icon
                                  v-if="item.children?.length"
                                  name="ChevronRight"
                                  class="nav-icon w-5 h-5 ml-auto"
                                />
                              </NuxtLink>

                              <!-- Mega Menu for More Menu Items -->
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
                          </div>
                        </Transition>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </nav>

            <!-- Right Actions - Right column -->
            <div class="w-[15%] flex items-center justify-end gap-4">
              <!-- Combined Book Now Button -->
              <NuxtLink
                :to="props.settings?.bookingButton?.href || '/booking'"
                class="hidden lg:flex items-center gap-1 lg:gap-4 px-2 lg:px-6 py-1 lg:py-3 min-h-[40px] lg:min-h-[60px] rounded-full transition-all duration-300 hover:opacity-90"
                :style="{
                  backgroundColor: props.settings?.bookingButton?.backgroundColor || 'rgb(var(--color-primary-500))',
                  color: props.settings?.bookingButton?.textColor || '#ffffff'
                }"
              >
                <div class="relative">
                  <div class="animate-ring absolute -inset-0.5 lg:-inset-1 rounded-full border border-white lg:border-2 opacity-75"></div>
                  <div class="relative flex items-center justify-center rounded-full bg-white/20 w-5 lg:w-10 h-5 lg:h-10">
                    <Phone
                      class="text-white"
                      :size="14"
                      :stroke-width="2.5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div class="flex flex-col items-start py-0.5">
                  <span class="text-xs lg:text-lg font-bold leading-none lg:leading-normal whitespace-nowrap">
                    {{ t(props.settings?.bookingButton?.text ?? 'booking.button') }}
                  </span>
                  <div class="flex flex-col">
                    <template v-for="(phone, index) in props.settings?.bookingButton?.phoneNumbers" :key="index">
                      <button 
                        class="text-[10px] lg:text-sm leading-tight lg:leading-normal opacity-90 hover:underline transition-all duration-300"
                        @click.stop="callPhone(phone.number)"
                      >
                        {{ t(phone.label) }}: {{ phone.number }}
                      </button>
                    </template>
                  </div>
                </div>
              </NuxtLink>

              <!-- Cart Icon -->
              <CartIcon v-if="props.settings?.showCart && isCartEnabled" />
              
              <!-- Mobile Menu Button -->
              <button
                class="lg:hidden flex items-center justify-center w-10 h-10 hover:bg-white/30 dark:hover:bg-neutral-800 rounded-full"
                @click="toggleMobileMenu"
                aria-label="Toggle Menu"
              >
                <Icon :name="isMobileMenuOpen ? 'X' : 'Menu'" class="nav-icon w-6 h-6" />
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
              <Icon name="X" class="nav-icon w-6 h-6" />
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
                <Icon name="ShoppingCart" class="nav-icon w-6 h-6" />
                <span class="text-base font-medium">Giỏ hàng</span>
              </NuxtLink>
            </div>

            <!-- Language Switcher and Theme Toggle in Mobile Menu -->
            <div class="flex flex-col space-y-2 px-3 py-2 mb-4">
              <div v-if="props.settings?.showLanguageSwitcher" class="w-full">
                <LanguageSwitcher />
              </div>
              <div v-if="props.settings?.showThemeToggle" class="w-full">
                <ThemeToggle mode="full" />
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
                      :name="item.icon"
                      class="nav-icon w-6 h-6"
                    />
                    {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                  </NuxtLink>
                  <button
                    class="p-2 -m-2"
                    @click.stop="toggleMobileMegaMenu(item.id)"
                  >
                    <Icon
                      name="ChevronRight"
                      class="nav-icon w-5 h-5 transition-transform duration-300"
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
                    :name="item.icon"
                    class="nav-icon w-6 h-6"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
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

  .fixed-time-width {
    @apply inline-block;
    width: 240px; // Fixed width to accommodate "23:59:59 - 31/12/2024" format
  }

  .nav-icon {
    @apply flex-shrink-0;
    width: auto;
    height: auto;
  }

  .main-menu-item {
    @apply relative transition-colors duration-300;

    &::after {
      content: none;
    }

    span, .icon {
      @apply transition-colors duration-300;
    }

    &:hover {
      span, .icon {
        color: rgb(var(--color-primary-500)) !important;
      }
    }

    &.menu-active {
      span, .icon {
        color: rgb(var(--color-primary-500)) !important;
      }

      &::after {
        content: none;
      }
    }
  }

  .top-menu {
    @apply relative z-50;
    background-color: rgb(var(--color-primary-DEFAULT));

    .icon {
      width: auto;
      height: auto;
    }
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

  // Add styles for More menu
  .more-menu {
    @apply relative;

    &-dropdown {
      @apply absolute right-0 mt-2 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700;
      min-width: 280px;
      z-index: 1000;

      &::before {
        content: '';
        @apply absolute -top-2 right-[20px] h-4 w-4 bg-white dark:bg-neutral-800 border-l border-t border-neutral-200 dark:border-neutral-700 rotate-45;
      }

      .menu-item {
        @apply flex items-center justify-between px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer;

        span {
          @apply text-[1.05rem];
        }
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

  @keyframes ring {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }

  .animate-ring {
    animation: ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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