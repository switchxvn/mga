<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useMenuItems } from '../../composables/useMenuItems';
import type { MenuItem, MenuColumn } from '@ew/shared';
import Icon from './Icon.vue';
import ThemeToggle from '../ThemeToggle.vue';

// Props cho component
interface NavbarProps {
  logo?: string;
  hotline?: string;
}

const props = withDefaults(defineProps<NavbarProps>(), {
  logo: "/logo.svg",
  hotline: "1900 1234",
});

// Scroll behavior
const isScrolled = ref(false);
const lastScrollPosition = ref(0);
const isNavbarVisible = ref(true);

// Menu items from composable
const { menuItems, isLoading, error, fetchMenuItems } = useMenuItems();

// Process menu items for display
interface ProcessedMenuItem extends MenuItem {
  megaMenuColumns: MenuColumn[];
}

const processedMenuItems = computed<ProcessedMenuItem[]>(() => {
  return menuItems.value
    .filter(item => item.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => ({
      ...item,
      href: item.href || '#',
      hasMegaMenu: Boolean(item.hasMegaMenu),
      megaMenuColumns: item.megaMenuColumns || []
    }));
});

// Active mega menu
const activeMegaMenu = ref<number | null>(null);
const megaMenuTimeout = ref<number | null>(null);

const showMegaMenu = (index: number) => {
  if (megaMenuTimeout.value) {
    clearTimeout(megaMenuTimeout.value);
    megaMenuTimeout.value = null;
  }
  activeMegaMenu.value = index;
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
  "shadow-md": isScrolled.value,
  "bg-background/95 backdrop-blur-sm": isScrolled.value,
  "bg-background": !isScrolled.value,
  "translate-y-0 opacity-100": isNavbarVisible.value,
  "-translate-y-full opacity-0": !isNavbarVisible.value,
}));

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  fetchMenuItems();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
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
              v-for="(item, index) in processedMenuItems"
              :key="item.id || `menu-item-${index}`"
              class="relative group"
              @mouseenter="item.hasMegaMenu ? showMegaMenu(index) : null"
              @mouseleave="item.hasMegaMenu ? hideMegaMenu() : null"
            >
              <NuxtLink
                :to="item.href"
                class="text-sm font-medium transition-colors hover:text-primary py-5 flex items-center space-x-1 dark:text-gray-200 dark:hover:text-white"
              >
                <span>{{ item.label }}</span>
                <Icon
                  v-if="item.hasMegaMenu"
                  name="ChevronDown"
                  class="transition-transform duration-300 group-hover:rotate-180 h-4 w-4"
                />
              </NuxtLink>

              <!-- Mega Menu -->
              <div
                v-if="item.hasMegaMenu && activeMegaMenu === index"
                class="mega-menu absolute top-full left-0 w-screen max-w-4xl shadow-lg rounded-b-lg border-t transition-all duration-300 transform origin-top z-50 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 dark:shadow-gray-900/50"
                style="left: 50%; transform: translateX(-50%)"
                @mouseenter="keepMegaMenu"
                @mouseleave="hideMegaMenu"
              >
                <div class="grid grid-cols-3 gap-6 p-6">
                  <div
                    v-for="(column, columnIndex) in item.megaMenuColumns || []"
                    :key="`column-${columnIndex}-${column.title}`"
                    class="space-y-3"
                  >
                    <h3 class="font-medium text-sm text-gray-900 dark:text-white">{{ column.title }}</h3>
                    <ul class="space-y-2">
                      <li 
                        v-for="(subItem, subIndex) in column.items" 
                        :key="`subitem-${subIndex}-${subItem.href}`"
                        class="block"
                      >
                        <NuxtLink
                          :to="subItem.href"
                          class="navbar-megamenu-item block py-1.5 px-2 rounded-md text-sm text-gray-700 dark:text-gray-200"
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
        <div class="hidden md:flex items-center space-x-4">
          <!-- Theme Toggle -->
          <ThemeToggle />
          
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
            v-for="(item, index) in processedMenuItems"
            :key="item.id || `mobile-menu-${index}`"
            :to="item.href"
            class="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </template>
      </div>
      <div class="px-4 py-3 border-t dark:border-gray-700">
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

<style scoped>
.navbar-megamenu-item {
  @apply hover:bg-gray-100 transition-colors text-gray-700;
}

.dark .navbar-megamenu-item {
  @apply hover:bg-gray-700 text-gray-200;
}

/* Đảm bảo mega menu có background đúng trong chế độ dark */
.dark .mega-menu {
  @apply bg-gray-800 border-gray-700;
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