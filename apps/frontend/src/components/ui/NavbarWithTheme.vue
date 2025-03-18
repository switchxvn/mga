<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useMenuItems } from '../../composables/useMenuItems';
import type { MenuItem } from '@ew/shared';
import Icon from './Icon.vue';
import ThemeToggle from '../ThemeToggle.vue';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import CartIcon from '../cart/CartIcon.vue';
import { useRoute } from 'vue-router';
import { useFeatureFlags } from '../../composables/useFeatureFlags';
import { useLocalization } from '../../composables/useLocalization';

// Props cho component
interface NavbarProps {
  logo?: string;
  hotline?: string;
}

const props = withDefaults(defineProps<NavbarProps>(), {
  logo: "/logo.svg",
  hotline: "1900 1234",
});

// Lấy route hiện tại
const route = useRoute();

// Feature flags
const { isFeatureEnabled } = useFeatureFlags();
const isCartEnabled = ref<boolean | null>(null);
const isLoadingFeatureFlag = ref(true);

// Localization
const { locale } = useLocalization();

// Kiểm tra feature flag enable_add_to_cart
const checkCartFeatureFlag = async () => {
  try {
    isLoadingFeatureFlag.value = true;
    isCartEnabled.value = await isFeatureEnabled('enable_add_to_cart', true);
    console.log('Cart feature flag in NavbarWithTheme:', isCartEnabled.value);
  } catch (err) {
    console.error('Error checking cart feature flag:', err);
    isCartEnabled.value = false;
  } finally {
    isLoadingFeatureFlag.value = false;
  }
};

// Scroll behavior
const isScrolled = ref(false);
const lastScrollPosition = ref(0);
const isNavbarVisible = ref(true);

// Menu items from composable
const { menuItems, isLoading, error, fetchMenuItems } = useMenuItems();

// Định nghĩa interface cho translations
interface Translation {
  id: number;
  locale: string;
  label: string;
  menuItemId: number;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho translatable item
interface TranslatableItem {
  label: string;
  defaultLocale: string;
  translations?: Translation[];
}

// Định nghĩa interface cho menu column với translations
interface MenuColumn {
  title: string;
  titleTranslations?: Translation[];
  items: MenuColumnItem[];
}

// Định nghĩa interface cho menu column item
interface MenuColumnItem extends TranslatableItem {
  href: string;
}

// Định nghĩa interface cho menu item với translations
interface MenuItemWithTranslations extends MenuItem, TranslatableItem {
  id: number;
  megaMenuColumns?: {
    title: string;
    titleTranslations?: Translation[];
    items: {
      href: string;
      label: string;
      translations?: Translation[];
    }[];
  }[];
}

// Định nghĩa interface cho menu item đã được xử lý
interface ProcessedMenuItem extends MenuItemWithTranslations {
  megaMenuColumns: MenuColumn[];
  href: string;
  hasMegaMenu: boolean;
}

const processedMenuItems = computed<ProcessedMenuItem[]>(() => {
  return menuItems.value
    .filter(item => item.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => {
      const processedItem: ProcessedMenuItem = {
        ...item,
        href: item.href || '#',
        hasMegaMenu: Boolean(item.hasMegaMenu),
        megaMenuColumns: (item.megaMenuColumns || []).map(column => ({
          title: column.title,
          titleTranslations: column.titleTranslations || [],
          items: column.items.map(subItem => ({
            href: subItem.href || '#',
            label: subItem.label,
            translations: subItem.translations || [],
            defaultLocale: 'vi' // Since menu items are in Vietnamese by default
          }))
        })),
        translations: item.translations || [],
        defaultLocale: item.defaultLocale || 'en'
      };
      return processedItem;
    });
});

// Hàm lấy bản dịch theo ngôn ngữ
const getTranslation = (item: TranslatableItem, targetLocale: string) => {
  if (!item.translations || item.translations.length === 0) {
    return item.label;
  }

  const translation = item.translations.find(t => t.locale === targetLocale);
  if (translation) {
    return translation.label;
  }

  // Fallback to default locale if translation not found
  const defaultTranslation = item.translations.find(t => t.locale === item.defaultLocale);
  if (defaultTranslation) {
    return defaultTranslation.label;
  }

  return item.label;
};

// Hàm lấy bản dịch cho tiêu đề menu
const getColumnTitleTranslation = (column: MenuColumn, targetLocale: string) => {
  if (!column.titleTranslations || column.titleTranslations.length === 0) {
    return column.title;
  }

  const translation = column.titleTranslations.find(t => t.locale === targetLocale);
  return translation?.label || column.title;
};

// Kiểm tra xem menu có active không
const isMenuActive = (href: string) => {
  if (href === '/') {
    return route.path === '/';
  }
  return href !== '/' && route.path.startsWith(href);
};

// Active mega menu
const activeMegaMenu = ref<number | null>(null);
const megaMenuTimeout = ref<number | null>(null);

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

// Mobile menu state
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Scroll handler
const handleScroll = () => {
  const currentScrollPosition = window.scrollY;
  isScrolled.value = currentScrollPosition > 50;

  if (currentScrollPosition < 0) return;

  if (currentScrollPosition > lastScrollPosition.value + 50) {
    isNavbarVisible.value = false;
  } else if (currentScrollPosition < lastScrollPosition.value - 10) {
    isNavbarVisible.value = true;
  }

  lastScrollPosition.value = currentScrollPosition;
};

// Computed classes for navbar
const navbarClasses = computed(() => ({
  "shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),_0_10px_20px_-2px_rgba(0,0,0,0.04)]": isScrolled.value,
  "translate-y-0 opacity-100": isNavbarVisible.value,
  "-translate-y-full opacity-0": !isNavbarVisible.value,
}));

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  fetchMenuItems();
  checkCartFeatureFlag();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Watch for locale changes to refetch menu items
watch(locale, () => {
  fetchMenuItems();
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-background"
    :class="navbarClasses"
  >
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <img
              :src="logo"
              alt="Logo"
              class="h-8 w-auto transition-transform duration-300 hover:scale-110"
            />
            <span class="font-bold text-xl hidden sm:inline-block dark:text-white">E-Commerce</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <div v-if="isLoading" class="text-sm text-gray-500">Đang tải menu...</div>
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
                class="main-menu-item text-sm font-semibold uppercase transition-colors py-5 flex items-center space-x-1"
                :class="{ 'menu-active': isMenuActive(item.href) }"
              >
                <span>{{ getTranslation(item, locale) }}</span>
                <Icon
                  v-if="item.hasMegaMenu"
                  name="ChevronDown"
                  class="transition-transform duration-300 group-hover:rotate-180 h-4 w-4"
                />
              </NuxtLink>

              <!-- Mega Menu -->
              <div
                v-if="item.hasMegaMenu && activeMegaMenu === item.id"
                class="mega-menu absolute top-full left-0 w-screen max-w-4xl shadow-lg rounded-b-lg border-t transition-all duration-300 transform origin-top z-50 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 dark:shadow-gray-900/50"
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
                    <h3 class="font-medium text-sm text-gray-900 dark:text-white">
                      {{ getColumnTitleTranslation(column, locale) }}
                    </h3>
                    <ul class="space-y-2">
                      <li 
                        v-for="(subItem, subItemIndex) in column.items" 
                        :key="subItemIndex"
                        class="block"
                      >
                        <NuxtLink
                          :to="subItem.href"
                          class="navbar-megamenu-item block py-1.5 px-2 rounded-md text-sm text-gray-700 dark:text-gray-200"
                          @click="activeMegaMenu = null"
                        >
                          {{ getTranslation(subItem, locale) }}
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
        <div class="hidden md:flex items-center space-x-4">
          <!-- Language Switcher -->
          <LanguageSwitcher />
          
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <!-- Cart Icon - Chỉ render khi feature flag là true -->
          <CartIcon v-if="isCartEnabled" />
          
          <!-- Hotline -->
          <a :href="`tel:${hotline}`" class="flex items-center space-x-2 text-sm dark:text-gray-200">
            <Icon
              name="Phone"
              class="text-primary h-[18px] w-[18px] dark:text-blue-400"
            />
            <span class="font-medium">{{ hotline }}</span>
          </a>
        </div>

        <!-- Mobile Menu Button and Theme Toggle -->
        <div class="md:hidden flex items-center space-x-2">
          <!-- Cart Icon for Mobile - Chỉ render khi feature flag là true -->
          <CartIcon v-if="isCartEnabled" />
          
          <ThemeToggle />
          
          <button
            class="flex items-center dark:text-gray-200"
            @click="toggleMobileMenu"
            aria-label="Toggle Menu"
          >
            <Icon
              :name="isMobileMenuOpen ? 'X' : 'Menu'"
              class="h-6 w-6"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      class="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
      :class="{ hidden: !isMobileMenuOpen }"
    >
      <div class="px-4 py-3 space-y-1">
        <div v-if="isLoading" class="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">Đang tải menu...</div>
        <div v-else-if="error" class="text-sm text-red-500 px-3 py-2">{{ error }}</div>
        <template v-else>
          <NuxtLink
            v-for="item in processedMenuItems"
            :key="item.id"
            :to="item.href"
            class="mobile-main-menu-item block px-3 py-2 text-base font-semibold uppercase rounded-md"
            :class="{ 'mobile-menu-active': isMenuActive(item.href) }"
            @click="isMobileMenuOpen = false"
          >
            {{ getTranslation(item, locale) }}
          </NuxtLink>
        </template>
      </div>
      <div class="px-4 py-3 border-t dark:border-gray-700">
        <!-- Language Switcher in Mobile Menu -->
        <div class="px-3 py-2 mb-2">
          <LanguageSwitcher />
        </div>
        
        <a :href="`tel:${hotline}`" class="flex items-center space-x-2 px-3 py-2 dark:text-gray-200">
          <Icon
            name="Phone"
            class="text-primary h-[18px] w-[18px] dark:text-blue-400"
          />
          <span class="font-medium">{{ hotline }}</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Spacer to prevent content from being hidden under fixed navbar -->
  <div class="h-16"></div>
</template>

<style lang="scss" scoped>

.main-menu-item {
  color: $main-menu-color;
  font-weight: $main-menu-font-weight;
  letter-spacing: $main-menu-letter-spacing;
  position: relative;
  text-shadow: 0 0 0.5px $main-menu-color;
  
  &:hover {
    color: $main-menu-hover-color;
    text-shadow: 0 0 0.5px $main-menu-hover-color;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: $main-menu-hover-color;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
}

.menu-active {
  color: $main-menu-active-color !important;
  text-shadow: 0 0 1px $main-menu-active-color !important;
  
  &::after {
    width: 100%;
    background-color: $main-menu-active-color;
  }
}

.mobile-main-menu-item {
  color: $main-menu-color;
  font-weight: $main-menu-font-weight;
  letter-spacing: $main-menu-letter-spacing;
  text-shadow: 0 0 0.5px $main-menu-color;
  
  &:hover {
    color: $main-menu-hover-color;
    background-color: rgba($main-menu-hover-color, 0.05);
    text-shadow: 0 0 0.5px $main-menu-hover-color;
  }
}

.mobile-menu-active {
  color: $main-menu-active-color !important;
  background-color: rgba($main-menu-active-color, 0.1);
  text-shadow: 0 0 1px $main-menu-active-color !important;
  border-left: 3px solid $main-menu-active-color;
}

.dark .main-menu-item {
  color: $main-menu-dark-color;
  text-shadow: 0 0 0.5px $main-menu-dark-color;
  
  &:hover {
    color: $main-menu-dark-hover-color;
    text-shadow: 0 0 0.5px $main-menu-dark-hover-color;
  }
  
  &::after {
    background-color: $main-menu-dark-hover-color;
  }
}

.dark .menu-active {
  color: $main-menu-dark-hover-color !important;
  text-shadow: 0 0 1px $main-menu-dark-hover-color !important;
  
  &::after {
    background-color: $main-menu-dark-hover-color;
  }
}

.dark .mobile-main-menu-item {
  color: $main-menu-dark-color;
  text-shadow: 0 0 0.5px $main-menu-dark-color;
  
  &:hover {
    color: $main-menu-dark-hover-color;
    background-color: rgba($main-menu-dark-hover-color, 0.1);
    text-shadow: 0 0 0.5px $main-menu-dark-hover-color;
  }
}

.dark .mobile-menu-active {
  color: $main-menu-dark-hover-color !important;
  background-color: rgba($main-menu-dark-hover-color, 0.15);
  text-shadow: 0 0 1px $main-menu-dark-hover-color !important;
  border-left: 3px solid $main-menu-dark-hover-color;
}

.navbar-megamenu-item {
  @apply hover:bg-gray-100 transition-colors text-gray-700;
}

.dark .navbar-megamenu-item {
  @apply hover:bg-gray-700 text-gray-200;
}

/* Đảm bảo mega menu có background đúng trong chế độ dark */
.dark .mega-menu {
  @apply bg-gray-800;
}

/* Đảm bảo không có phần tử nào trong mega menu có background màu trắng trong chế độ dark */
.dark .mega-menu * {
  background-color: transparent;
}

/* Đảm bảo tất cả text trong mega menu có màu phù hợp trong chế độ dark */
.dark .mega-menu h3,
.dark .mega-menu p,
.dark .mega-menu span,
.dark .mega-menu div,
.dark .mega-menu a {
  color: #e5e7eb !important; /* text-gray-200 */
}
</style> 