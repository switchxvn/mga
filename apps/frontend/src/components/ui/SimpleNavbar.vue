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
import { Phone, User, LogIn, UserCircle, LogOut, Settings } from 'lucide-vue-next';
import type { MenuItem, TopMenuItem } from '~/types/navbar';
import { defineAsyncComponent, markRaw } from 'vue';
import type { Component } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useTrpc } from '@/composables/useTrpc';

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

// Mobile Logo - tạo một instance mới của useLogo riêng cho mobile
const mobileLogo = ref<any>(null);
const mobileLogoUrl = ref<string | null>(null);
const isLoadingMobileLogo = ref(false);

// Fetch mobile logo
const fetchMobileLogo = async () => {
  try {
    isLoadingMobileLogo.value = true;
    const mobileTrpc = useTrpc();
    const result = await mobileTrpc.logo.getActiveLogo.query({ type: 'main_mobile' });
    mobileLogo.value = result;
    
    // Xác định URL dựa trên dark mode
    const { isDark } = useDarkMode();
    mobileLogoUrl.value = isDark.value ? result.darkModeUrl : result.lightModeUrl;

    // Watch thay đổi dark mode để cập nhật URL logo mobile
    watch(() => isDark.value, (newValue) => {
      if (mobileLogo.value) {
        mobileLogoUrl.value = newValue ? mobileLogo.value.darkModeUrl : mobileLogo.value.lightModeUrl;
      }
    });
  } catch (err) {
    console.error('Error fetching mobile logo:', err);
    // Fallback to main logo if mobile logo fails
    mobileLogoUrl.value = currentLogoUrl.value;
  } finally {
    isLoadingMobileLogo.value = false;
  }
};

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

// Replace with correct auth state properties
const { user, logout, checkAuth } = useAuth();
const showUserDropdown = ref(false);

const isAuthenticated = computed(() => {
  console.log('Auth state check:', { user: user.value });
  return !!user.value;
});


const userDisplayName = computed(() => {
  if (!user.value) return '';
  return user.value.profile?.firstName || user.value.email;
});


const handleLogout = async () => {
  await logout();
  showUserDropdown.value = false;
};

// Add mobileNavRef
const mobileNavRef = ref<HTMLElement | null>(null);

// Add scrollHandling functionality specifically for mobile
const handleMobileScroll = () => {
  const scrollPosition = window.scrollY;
  isScrolled.value = scrollPosition > 10;
};

onMounted(() => {
  // Check auth state when component mounts
  checkAuth().then(() => {
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
      await fetchMobileLogo();
    };
    
    init();
  });

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
  
  // Add scroll event listener for mobile menu
  window.addEventListener('scroll', handleMobileScroll, { passive: true });
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  // Remove scroll event listener
  window.removeEventListener('scroll', handleMobileScroll);
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
      class="w-full relative hidden lg:block"
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
        <div class="w-full px-2 sm:px-4 lg:px-8">
          <div class="flex items-center h-10 sm:h-12 lg:h-16">
            <!-- Left Column -->
            <div 
              class="flex items-center gap-2 sm:gap-3 lg:gap-4" 
              :style="{
                width: props.settings?.topMenu?.leftColumn?.width || '20%',
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
                    class="nav-icon w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                    :style="{ color: item.textColor }"
                  />
                  <span
                    class="text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap"
                    :style="{ color: item.textColor }"
                  >
                    {{ item.isTranslated ? t(item.content ?? '') : item.content }}
                  </span>
                </div>

                <!-- Link Type with Icon -->
                <NuxtLink
                  v-else-if="item.type === 'link'"
                  :to="item.href"
                  class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base font-[800] uppercase transition-colors duration-300 hover:opacity-90 whitespace-nowrap"
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
                    class="nav-icon w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                    :style="{ color: item.textColor }"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                </NuxtLink>

                <!-- Divider -->
                <div
                  v-else-if="item.type === 'divider'"
                  class="h-3 sm:h-4 lg:h-6 w-[1px] sm:mx-1 lg:mx-2"
                  :style="{ backgroundColor: item.color || '#ffffff' }"
                ></div>
              </template>
            </div>
            
            <!-- Center Column -->
            <div 
              class="flex items-center gap-4" 
              :style="{
                width: props.settings?.topMenu?.centerColumn?.width || '60%',
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
                    class="nav-icon w-4 h-4 md:w-5 md:h-5"
                    :style="{ color: item.textColor }"
                  />
                  <span
                    class="text-sm md:text-base lg:text-[16px] font-medium whitespace-nowrap"
                    :style="{ color: item.textColor }"
                  >
                    {{ item.isTranslated ? t(item.content ?? '') : item.content }}
                  </span>
                </div>

                <!-- Link Type with Icon -->
                <NuxtLink
                  v-else-if="item.type === 'link'"
                  :to="item.href"
                  class="flex items-center gap-1 md:gap-2 text-sm md:text-base lg:text-[18px] font-[800] uppercase transition-colors duration-300 hover:opacity-90 whitespace-nowrap"
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
                    class="nav-icon w-4 h-4 md:w-5 md:h-5"
                    :style="{ color: item.textColor }"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                </NuxtLink>

                <!-- Divider -->
                <div
                  v-else-if="item.type === 'divider'"
                  class="h-4 md:h-6 w-[1px] md:w-[2px] mx-1 md:mx-2"
                  :style="{ backgroundColor: item.color || '#ffffff' }"
                ></div>
              </template>
            </div>

            <!-- Right Column -->
            <div 
              class="flex items-center gap-4" 
              :style="{
                width: props.settings?.topMenu?.rightColumn?.width || '20%',
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
                    class="nav-icon w-4 h-4 md:w-5 md:h-5"
                    :style="{ color: item.textColor }"
                  />
                  <span
                    class="text-sm md:text-base lg:text-[18px] font-medium whitespace-nowrap"
                    :style="{ color: item.textColor }"
                  >
                    {{ item.isTranslated ? t(item.content ?? '') : item.content }}
                  </span>
                </div>

                <!-- Link Type with Icon -->
                <NuxtLink
                  v-else-if="item.type === 'link'"
                  :to="item.href"
                  class="flex items-center gap-1 md:gap-2 text-sm md:text-base lg:text-[18px] font-[800] uppercase transition-colors duration-300 hover:opacity-90 whitespace-nowrap"
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
                    class="nav-icon w-4 h-4 md:w-5 md:h-5"
                    :style="{ color: item.textColor }"
                  />
                  {{ item.isTranslated ? t(item.label ?? '') : item.label }}
                </NuxtLink>

                <!-- Divider -->
                <div
                  v-else-if="item.type === 'divider'"
                  class="h-4 md:h-6 w-[1px] md:w-[2px] mx-1 md:mx-2"
                  :style="{ backgroundColor: item.color || '#ffffff' }"
                ></div>
              </template>

              <!-- User Menu -->
              <div class="relative">
                <button
                  class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-colors duration-300"
                  @click="showUserDropdown = !showUserDropdown"
                >
                  <User class="w-5 h-5 text-white" />
                </button>

                <!-- User Dropdown -->
                <Transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-if="showUserDropdown"
                    class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5"
                    :style="{ zIndex: 65 }"
                    @click.outside="showUserDropdown = false"
                  >
                    <!-- Not Logged In -->
                    <template v-if="!isAuthenticated">
                      <NuxtLink
                        to="/auth/login"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        @click="showUserDropdown = false"
                      >
                        <LogIn class="w-4 h-4" />
                        {{ t('Đăng nhập') }}
                      </NuxtLink>
                      <NuxtLink
                        to="/auth/register"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        @click="showUserDropdown = false"
                      >
                        <UserCircle class="w-4 h-4" />
                        {{ t('Đăng ký') }}
                      </NuxtLink>
                    </template>

                    <!-- Logged In -->
                    <template v-else>
                       <!-- User Info -->
                       <div class="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                        <div class="text-sm font-medium text-neutral-900 dark:text-white">
                          {{ userDisplayName }}
                        </div>
                        <div class="text-xs text-neutral-500 dark:text-neutral-400">
                          {{ user?.email }}
                        </div>
                      </div>
                                            <NuxtLink
                        to="/dashboard"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        @click="showUserDropdown = false"
                      >
                        <Settings class="w-4 h-4" />
                        {{ t('Dashboard') }}
                      </NuxtLink>
                      <button
                        class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        @click="handleLogout"
                      >
                        <LogOut class="w-4 h-4" />
                        {{ t('Đăng xuất') }}
                      </button>
                    </template>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navbar - Simple Version -->
    <div 
      ref="mobileNavRef"
      class="w-full fixed lg:hidden border-b"
      :class="{ 'mobile-shadow': isScrolled }"
      :style="{
        backgroundColor: isDark ? props.settings?.darkMode?.menuBackgroundColor : 'rgb(var(--color-primary-500))',
        borderColor: isDark ? props.settings?.darkMode?.borderColor : 'rgb(var(--color-primary-600))',
        top: 0,
        zIndex: 60
      }"
    >
      <div class="w-full px-3 py-2">
        <div class="flex items-center justify-between">
          <!-- Mobile Logo -->
          <div class="flex-shrink-0">
            <NuxtLink to="/" class="flex items-center">
              <img
                v-if="mobileLogoUrl"
                :src="mobileLogoUrl"
                :alt="mobileLogo?.altText || 'Logo'"
                class="h-10 w-auto object-contain max-w-[120px]"
              />
            </NuxtLink>
          </div>
          
          <!-- Right Actions -->
          <div class="flex items-center gap-2">
            <!-- Phone Button -->
            <a 
              :href="`tel:${props.settings?.phoneButton?.numbers?.[0]?.number?.replace(/\s+/g, '') || ''}`"
              class="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
            >
              <Phone class="w-4 h-4 text-white" />
            </a>
            
            <!-- Cart Icon -->
            <CartIcon v-if="props.settings?.showCart && isCartEnabled" class="w-9 h-9" />
            
            <!-- User Button -->
            <button
              class="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
              @click="showUserDropdown = !showUserDropdown"
            >
              <User class="w-4 h-4 text-white" />
            </button>
            
            <!-- Mobile Menu Button -->
            <button
              class="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
              @click="toggleMobileMenu"
              aria-label="Toggle Menu"
            >
              <Icon :name="isMobileMenuOpen ? 'X' : 'Menu'" class="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- User Dropdown for Mobile -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showUserDropdown"
          class="absolute right-3 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5"
          :style="{ zIndex: 65 }"
          @click.outside="showUserDropdown = false"
        >
          <!-- Not Logged In -->
          <template v-if="!isAuthenticated">
            <NuxtLink
              to="/auth/login"
              class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              @click="showUserDropdown = false"
            >
              <LogIn class="w-4 h-4" />
              {{ t('Đăng nhập') }}
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              @click="showUserDropdown = false"
            >
              <UserCircle class="w-4 h-4" />
              {{ t('Đăng ký') }}
            </NuxtLink>
          </template>

          <!-- Logged In -->
          <template v-else>
            <!-- User Info -->
            <div class="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <div class="text-sm font-medium text-neutral-900 dark:text-white">
                {{ userDisplayName }}
              </div>
              <div class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ user?.email }}
              </div>
            </div>
            <NuxtLink
              to="/dashboard"
              class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              @click="showUserDropdown = false"
            >
              <Settings class="w-4 h-4" />
              {{ t('Dashboard') }}
            </NuxtLink>
            <button
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4" />
              {{ t('Đăng xuất') }}
            </button>
          </template>
        </div>
      </Transition>
    </div>

    <!-- Navigation Section for Desktop -->
    <div 
      ref="navWrapperRef"
      class="nav-wrapper w-full h-[90px] hidden lg:block"
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
                  <span class="text-xs sm:text-sm lg:text-lg font-bold leading-none lg:leading-normal whitespace-nowrap">
                    {{ t(props.settings?.bookingButton?.text ?? 'booking.button') }}
                  </span>
                  <div class="flex flex-col">
                    <template v-for="(phone, index) in props.settings?.bookingButton?.phoneNumbers" :key="index">
                      <button 
                        class="text-[8px] sm:text-[10px] lg:text-sm leading-tight lg:leading-normal opacity-90 hover:underline transition-all duration-300"
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
        style="z-index: 9999 !important;"
        @click="isMobileMenuOpen = false"
      >
        <div 
          class="mobile-menu-content bg-white dark:bg-neutral-900"
          style="z-index: 10000 !important;"
          @click.stop
        >
          <!-- Mobile Menu Header -->
          <div class="mobile-menu-header flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <NuxtLink to="/" class="flex-shrink-0" @click="isMobileMenuOpen = false">
              <img
                v-if="mobileLogoUrl"
                :src="mobileLogoUrl"
                :alt="mobileLogo?.altText || 'Logo'"
                class="h-10 w-auto object-contain"
              />
            </NuxtLink>
            <button
              class="p-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              @click="isMobileMenuOpen = false"
              aria-label="Close Menu"
            >
              <Icon name="X" class="nav-icon w-7 h-7" />
            </button>
          </div>

          <!-- Mobile Call Button & Booking Button -->
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="animate-ring absolute -inset-1 rounded-full border-2 border-primary-500 opacity-75"></div>
                  <div class="relative flex items-center justify-center rounded-full bg-primary-500 w-10 h-10">
                    <Phone class="text-white" :size="20" :stroke-width="2.5" aria-hidden="true" />
                  </div>
                </div>
                <div class="flex flex-col">
                  <span class="text-lg font-bold text-neutral-900 dark:text-white">
                    {{ t(props.settings?.bookingButton?.text ?? 'booking.button') }}
                  </span>
                  <div class="flex flex-col">
                    <template v-for="(phone, index) in props.settings?.bookingButton?.phoneNumbers" :key="index">
                      <button 
                        class="text-base text-primary-600 dark:text-primary-400 font-medium hover:underline transition-all duration-300 text-left"
                        @click="callPhone(phone.number)"
                      >
                        {{ t(phone.label) }}: {{ phone.number }}
                      </button>
                    </template>
                  </div>
                </div>
              </div>
              <NuxtLink
                :to="props.settings?.bookingButton?.href || '/booking'"
                class="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-full transition-all duration-300"
                @click="isMobileMenuOpen = false"
              >
                <Icon name="Calendar" class="w-5 h-5" />
                {{ t('Đặt vé ngay') }}
              </NuxtLink>
            </div>
          </div>

          <div class="px-6 py-4 space-y-4">
            <!-- Cart Icon for Mobile -->
            <div v-if="props.settings?.showCart && isCartEnabled">
              <NuxtLink 
                to="/cart" 
                class="flex items-center gap-3 px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                @click="isMobileMenuOpen = false"
              >
                <Icon name="ShoppingCart" class="nav-icon w-6 h-6" />
                <span class="text-base font-medium">Giỏ hàng</span>
              </NuxtLink>
            </div>

            <!-- Language Switcher and Theme Toggle in Mobile Menu -->
            <div class="flex flex-col space-y-3">
              <div v-if="props.settings?.showLanguageSwitcher" class="w-full">
                <LanguageSwitcher />
              </div>
              <div v-if="props.settings?.showThemeToggle" class="w-full">
                <ThemeToggle mode="full" />
              </div>
            </div>

            <!-- Mobile Menu Items with Mega Menu -->
            <div class="space-y-1 mt-4">
              <div
                v-for="item in processedMenuItems"
                :key="item.id"
                class="mobile-menu-item"
              >
                <!-- Menu Item with Mega Menu -->
                <div
                  v-if="item.children && item.children.length > 0"
                  class="mobile-main-menu-item flex items-center justify-between px-4 py-3 text-base font-semibold uppercase rounded-lg"
                  :class="{ 'mobile-menu-active': isMenuActive(item.href) }"
                >
                  <NuxtLink
                    :to="item.href"
                    class="flex-1 flex items-center gap-3"
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
                    class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                    @click.stop="toggleMobileMegaMenu(item.id)"
                  >
                    <Icon
                      name="ChevronRight"
                      class="nav-icon w-6 h-6 transition-transform duration-300"
                      :class="{ 'rotate-90': activeMobileMegaMenu === item.id }"
                    />
                  </button>
                </div>

                <!-- Regular Menu Item -->
                <NuxtLink
                  v-else
                  :to="item.href"
                  class="mobile-main-menu-item flex items-center gap-3 px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-300"
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
                <Transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="transform -translate-y-4 opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-4 opacity-0"
                >
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
  position: relative;
  z-index: 50;

  .top-menu {
    position: relative;
    z-index: 50;
    background-color: rgb(var(--color-primary-DEFAULT));

    .w-full.px-8 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    @screen sm {
      .w-full.px-8 {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }

    @screen md {
      .w-full.px-8 {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    .icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;

      @screen md {
        width: 1.25rem;
        height: 1.25rem;
      }
    }
  }

  .fixed-time-width {
    display: inline-block;
    width: 240px;
  }

  .nav-icon {
    flex-shrink: 0;
    width: auto;
    height: auto;
  }

  .main-menu-item {
    position: relative;
    transition-property: color;
    transition-duration: 300ms;

    &::after {
      content: none;
    }

    span, .icon {
      transition-property: color;
      transition-duration: 300ms;
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

  .nav-wrapper {
    position: relative;
    z-index: 40;

    &.nav-sticky {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      animation: slideDown 0.3s ease-out;
    }
  }

  .navigation-section {
    position: relative;
    
    .container {
      height: 100%;
      
      > div {
        height: 100%;
      }
    }
  }

  .more-menu {
    position: relative;

    &-dropdown {
      position: absolute;
      right: 0;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      background-color: white;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      border: 1px solid rgb(229 231 235);
      min-width: 280px;
      z-index: 1000;

      .dark & {
        background-color: rgb(38 38 38);
        border-color: rgb(64 64 64);
      }

      &::before {
        content: '';
        position: absolute;
        top: -0.5rem;
        right: 1.25rem;
        height: 1rem;
        width: 1rem;
        background-color: white;
        border-left: 1px solid rgb(229 231 235);
        border-top: 1px solid rgb(229 231 235);
        transform: rotate(45deg);

        .dark & {
          background-color: rgb(38 38 38);
          border-color: rgb(64 64 64);
        }
      }

      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        cursor: pointer;

        &:hover {
          background-color: rgb(243 244 246);
          .dark & {
            background-color: rgb(64 64 64);
          }
        }

        span {
          font-size: 1.05rem;
        }
      }
    }
  }

  .mobile-menu-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);

    .mobile-menu-content {
      position: fixed;
      top: 0;
      right: 0;
      height: 100%;
      width: 100%;
      max-width: 90%;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      animation: slideInRight 0.3s ease-out;

      @media (min-width: 640px) {
        max-width: 400px;
      }
    }
  }

  .mobile-main-menu-item {
    position: relative;

    &:hover {
      background-color: rgb(249 250 251);

      .dark & {
        background-color: rgb(38 38 38);
      }
    }

    &.mobile-menu-active {
      color: rgb(var(--color-primary-500));
      background-color: rgb(239 246 255);

      .dark & {
        background-color: rgba(var(--color-primary-900), 0.2);
      }
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

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.nav-wrapper-mobile {
  position: relative;
  z-index: 40;

  &.nav-sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    animation: slideDown 0.3s ease-out;
  }
}

.top-menu-mobile {
  position: relative;
  z-index: 50;
  background-color: rgb(var(--color-primary-DEFAULT));
}

.mobile-shadow {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.3s ease-in-out;
}

// Add spacer for content below fixed menu
.navbar-container {
  &::before {
    content: '';
    display: block;
    height: 57px; // Adjust based on your mobile menu height
    
    @media (min-width: 1024px) {
      display: none;
    }
  }
}
</style> 