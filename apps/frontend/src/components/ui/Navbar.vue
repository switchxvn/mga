<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useTrpc } from '../../composables/useTrpc';
import { TRPCClientError } from '@trpc/client';

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

// tRPC client
const trpc = useTrpc();

// Menu items from tRPC
const menuItems = ref<any[]>([]);
const isLoadingMenu = ref(true);
const menuError = ref('');

// Fetch menu items from tRPC
const fetchMenuItems = async () => {
  try {
    isLoadingMenu.value = true;
    menuError.value = '';
    
    // Gọi tRPC endpoint settings.getAllMenuItems
    const response = await trpc.settings.getAllMenuItems.query();
    console.log('Raw API response:', response);
    
    // Xử lý dữ liệu từ API
    let menuData: any[] = [];
    
    // Kiểm tra xem response có cấu trúc { result: { data: [...] } } không
    if (response && typeof response === 'object' && 'result' in response && 
        response.result && typeof response.result === 'object' && 'data' in response.result) {
      menuData = response.result.data as any[];
      console.log('Using response.result.data structure');
    } else if (Array.isArray(response)) {
      // Nếu response là mảng trực tiếp
      menuData = response;
      console.log('Using direct array response');
    } else {
      console.warn('Unexpected response structure:', response);
      menuData = [];
    }
    
    if (menuData && Array.isArray(menuData) && menuData.length > 0) {
      // Chuyển đổi dữ liệu từ API sang định dạng menu
      menuItems.value = menuData.map((item: any) => ({
        label: item.label,
        href: item.href || '#',
        hasMegaMenu: Boolean(item.hasMegaMenu),
        megaMenuColumns: item.megaMenuColumns || [],
        order: item.order || 0,
        isActive: item.isActive
      })).filter((item: any) => item.isActive !== false)
        .sort((a: any, b: any) => a.order - b.order);
      
      console.log('Menu items processed:', menuItems.value);
    } else {
      menuItems.value = [];
      console.warn('No menu items returned from API');
    }
  } catch (err) {
    console.error('Error fetching menu items:', err);
    menuItems.value = [];
    
    if (err instanceof TRPCClientError) {
      menuError.value = err.message;
    } else {
      menuError.value = 'Không thể tải menu.';
    }
  } finally {
    isLoadingMenu.value = false;
  }
};

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

  // Determine if scrolled
  isScrolled.value = currentScrollPosition > 50;

  // Hide navbar when scrolling down, show when scrolling up
  if (currentScrollPosition < 0) {
    return;
  }

  // Determine scroll direction and visibility
  if (currentScrollPosition > lastScrollPosition.value + 50) {
    isNavbarVisible.value = false;
  } else if (currentScrollPosition < lastScrollPosition.value - 10) {
    isNavbarVisible.value = true;
  }

  lastScrollPosition.value = currentScrollPosition;
};

// Computed classes for navbar
const navbarClasses = computed(() => {
  return {
    "shadow-md": isScrolled.value,
    "bg-background/95 backdrop-blur-sm": isScrolled.value,
    "bg-background": !isScrolled.value,
    "translate-y-0 opacity-100": isNavbarVisible.value,
    "-translate-y-full opacity-0": !isNavbarVisible.value,
  };
});

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  fetchMenuItems(); // Tải menu khi component được mount
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
            <span class="font-bold text-xl hidden sm:inline-block">E-Commerce</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <div v-if="isLoadingMenu" class="text-sm text-gray-500">Đang tải menu...</div>
          <div v-else-if="menuError" class="text-sm text-red-500">{{ menuError }}</div>
          <template v-else>
            <div
              v-for="(item, index) in menuItems"
              :key="item.label"
              class="relative group"
              @mouseenter="item.hasMegaMenu ? showMegaMenu(index) : null"
              @mouseleave="item.hasMegaMenu ? hideMegaMenu() : null"
            >
              <NuxtLink
                :to="item.href"
                class="text-sm font-medium transition-colors hover:text-primary py-5 flex items-center space-x-1"
              >
                <span>{{ item.label }}</span>
                <svg
                  v-if="item.hasMegaMenu"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-transform duration-300 group-hover:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </NuxtLink>

              <!-- Mega Menu -->
              <div
                v-if="item.hasMegaMenu && activeMegaMenu === index"
                class="absolute top-full left-0 w-screen max-w-4xl bg-white shadow-lg rounded-b-lg border-t border-gray-100 transition-all duration-300 transform origin-top"
                style="left: 50%; transform: translateX(-50%)"
                @mouseenter="keepMegaMenu"
                @mouseleave="hideMegaMenu"
              >
                <div class="grid grid-cols-3 gap-6 p-6">
                  <div
                    v-for="(column, colIndex) in item.megaMenuColumns"
                    :key="colIndex"
                    class="space-y-3"
                  >
                    <h3 class="font-medium text-sm text-gray-500">{{ column.title }}</h3>
                    <ul class="space-y-2">
                      <li v-for="subItem in column.items" :key="subItem.label">
                        <NuxtLink
                          :to="subItem.href"
                          class="text-sm hover:text-primary transition-colors block py-1"
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

        <!-- Hotline -->
        <div class="hidden md:flex items-center">
          <a href="tel:1900-1234" class="flex items-center space-x-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span class="font-medium">{{ hotline }}</span>
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden flex items-center"
          @click="toggleMobileMenu"
          aria-label="Toggle Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ hidden: isMobileMenuOpen }"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ hidden: !isMobileMenuOpen }"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      class="md:hidden"
      :class="{ hidden: !isMobileMenuOpen }"
    >
      <div class="px-4 py-3 space-y-1">
        <div v-if="isLoadingMenu" class="text-sm text-gray-500 px-3 py-2">Đang tải menu...</div>
        <div v-else-if="menuError" class="text-sm text-red-500 px-3 py-2">{{ menuError }}</div>
        <template v-else>
          <NuxtLink
            v-for="item in menuItems"
            :key="item.label"
            :to="item.href"
            class="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </template>
      </div>
      <div class="px-4 py-3 border-t">
        <a href="tel:1900-1234" class="flex items-center space-x-2 px-3 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-primary"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span class="font-medium">{{ hotline }}</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Spacer to prevent content from being hidden under fixed navbar -->
  <div class="h-16"></div>
</template>

<style scoped>
/* Fade animation for mega menu */
.mega-menu-enter-active,
.mega-menu-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.mega-menu-enter-from,
.mega-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
