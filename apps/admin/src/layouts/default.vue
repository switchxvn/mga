<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui/dist/runtime/types'
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'
import { 
  Moon, 
  Sun, 
  Home, 
  Settings, 
  UserCircle, 
  LogOut, 
  ChevronDown, 
  RotateCcw,
  Globe
} from 'lucide-vue-next'
import { ref, computed, inject, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore
import { useColorMode, useHead, navigateTo, useNuxtApp } from '#imports'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { usePermissions } from '@/composables/usePermissions'
import { useLocalization } from '@/composables/useLocalization'
import SidebarNavigation from '@/components/common/SidebarNavigation.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

// Minimal interfaces needed
interface UserRole {
  code: string;
  name: string;
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const userStore = useUserStore()
const { user, isLoading } = storeToRefs(userStore)
const { checkAuth, user: authUser, logout } = useAuth()
const { isSuperAdmin, hasPermission } = usePermissions()
const route = useRoute()
const router = useRouter()
const currentPath = ref(route.path)
const { t } = useI18n()

// Localization
const { locale, locales, currentLocale, switchLanguage } = useLocalization()

// Try to get injected page title from child components
const injectedTitle = inject('pageTitle', ref(''))

// Computed để kết hợp thông tin từ cả hai nguồn
const combinedUser = computed(() => {
  // Ưu tiên dữ liệu từ useUserStore
  if (user.value) return user.value;
  
  // Sử dụng dữ liệu từ useAuth nếu userStore trống
  if (authUser.value) {
    console.log('Using auth user:', authUser.value);
    return {
      email: authUser.value.email,
      profile: {
        firstName: authUser.value.name,
        lastName: ''
      }
    };
  }
  
  // Không có thông tin người dùng
  return null;
});

// Hiển thị tên hoặc chữ cái đầu tiên
const displayName = computed(() => {
  if (!combinedUser.value) return 'U';
  
  if (combinedUser.value.profile?.firstName) {
    return combinedUser.value.profile.firstName;
  }
  
  return combinedUser.value.email?.split('@')[0] || 'U';
});

// Lấy email của người dùng
const userEmail = computed(() => {
  if (!combinedUser.value) return '';
  return combinedUser.value.email || '';
});

// Chữ cái đầu tiên cho avatar
const avatarInitial = computed(() => {
  if (!combinedUser.value) return 'U';
  
  if (combinedUser.value.profile?.firstName) {
    return combinedUser.value.profile.firstName[0].toUpperCase();
  }
  
  if (combinedUser.value.email) {
    return combinedUser.value.email[0].toUpperCase();
  }
  
  return 'U';
});

// Get current section from route
const getCurrentSection = () => {
  const path = currentPath.value
  // If we have an injected title from a child component, use it
  if (injectedTitle.value) return injectedTitle.value
  
  // Thêm handling cho các trường hợp cụ thể
  if (path.includes('/users/create')) return 'Create User'
  if (path.includes('/users/edit/')) return 'Edit User'
  if (path.includes('/roles/create')) return 'Create Role'
  if (path.includes('/roles/edit/')) return 'Edit Role'
  if (path.includes('/products/create')) return 'Create Product'
  if (path.includes('/products/edit/')) return 'Edit Product'
  if (path.includes('/reviews/add')) return 'Add Review'
  if (path.includes('/reviews/edit/')) return 'Edit Review'
  
  // Get the current route label from navigation
  return 'Admin Dashboard'
}

// Dynamic page title based on current route with SSR support
const pageTitle = computed(() => {
  const section = getCurrentSection()
  // If section already includes "- Admin Dashboard", return as is
  if (section.includes('- Admin Dashboard')) return section
  return section !== 'Dashboard' ? `${section} - Admin Dashboard` : 'Admin Dashboard'
})

// Set page title with SSR support
useHead(() => ({
  title: pageTitle.value
}))

// Watch for route changes
onMounted(async () => {
  currentPath.value = route.path;
  
  // Kiểm tra xác thực khi component được tải
  try {
    const isAuthenticated = await checkAuth();
    console.log('Default layout: authentication check:', isAuthenticated);
  } catch (error) {
    console.error('Authentication check failed:', error);
  }
  
  // Listen to route changes
  router.afterEach((to) => {
    currentPath.value = to.path;
  });
})

const handleLogout = async () => {
  try {
    // Gọi hàm logout từ useAuth để xử lý đăng xuất đúng cách
    // Hàm này sẽ tự động chuyển hướng đến trang đăng nhập
    await logout();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

const userMenuItems: DropdownItem[][] = [[
  { 
    label: 'Profile', 
    icon: 'i-heroicons-user-circle',
    to: '/profile'
  },
  { 
    label: 'Logout', 
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: handleLogout
  }
]]

// Theo dõi trạng thái mở của dropdown menu
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const userDropdownButtonRef = ref<HTMLElement | null>(null)

// Đóng dropdown khi click ra ngoài
const handleClickOutside = (event: MouseEvent) => {
  // Bỏ qua nếu click vào dropdown button
  if (userDropdownButtonRef.value && userDropdownButtonRef.value.contains(event.target as Node)) {
    return
  }
  
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

// Chuyển đổi trạng thái dropdown
const toggleUserMenu = (event: MouseEvent) => {
  event.stopPropagation() // Ngăn sự kiện lan tỏa để không kích hoạt handleClickOutside
  isUserMenuOpen.value = !isUserMenuOpen.value
}

// Locale dropdown
const isLocaleMenuOpen = ref(false)
const localeMenuRef = ref<HTMLElement | null>(null)
const localeDropdownButtonRef = ref<HTMLElement | null>(null)

// Đóng locale dropdown khi click ra ngoài
const handleLocaleClickOutside = (event: MouseEvent) => {
  if (localeDropdownButtonRef.value && localeDropdownButtonRef.value.contains(event.target as Node)) {
    return
  }
  
  if (localeMenuRef.value && !localeMenuRef.value.contains(event.target as Node)) {
    isLocaleMenuOpen.value = false
  }
}

// Chuyển đổi trạng thái locale dropdown
const toggleLocaleMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isLocaleMenuOpen.value = !isLocaleMenuOpen.value
}

// Xử lý thay đổi ngôn ngữ
const handleLocaleChange = (localeCode: string) => {
  switchLanguage(localeCode)
  isLocaleMenuOpen.value = false
}

// Thêm/xóa event listener khi menu mở/đóng
watch(isUserMenuOpen, (newVal) => {
  if (newVal) {
    // Đăng ký sự kiện click outside
    setTimeout(() => {
      window.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    // Xóa sự kiện nếu menu đóng
    window.removeEventListener('click', handleClickOutside)
  }
})

// Thêm/xóa event listener khi locale menu mở/đóng
watch(isLocaleMenuOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      window.addEventListener('click', handleLocaleClickOutside)
    }, 0)
  } else {
    window.removeEventListener('click', handleLocaleClickOutside)
  }
})

// Xóa event listener khi component bị phá hủy
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('click', handleLocaleClickOutside)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
      <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center text-gray-800 dark:text-white">
            <span class="text-xl font-semibold ml-2">Admin Dashboard</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-2 relative">
          <!-- Language Switcher -->
          <LanguageSwitcher />
          
          <!-- Color Mode Toggle -->
          <UButton 
            icon
            color="gray" 
            variant="ghost" 
            aria-label="Toggle color mode"
            @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
          >
            <template #leading>
              <component :is="isDark ? Sun : Moon" class="w-5 h-5" />
            </template>
          </UButton>
          
          <!-- User Menu -->
          <UDropdown :items="userMenuItems" :open="isUserMenuOpen" :popper="{ placement: 'bottom-end', offsetDistance: 8 }">
            <div 
              class="flex items-center cursor-pointer"
              ref="userDropdownButtonRef"
              @click="toggleUserMenu"
            >
              <div v-if="combinedUser" class="flex items-center">
                <div class="relative">
                  <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center uppercase">
                    {{ avatarInitial }}
                  </div>
                  <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>
                <div class="ml-2 hidden sm:block">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {{ displayName }}
                    <span v-if="isSuperAdmin" class="ml-1 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">SUPER</span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ userEmail }}</div>
                </div>
              </div>
              <div v-else class="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
              <ChevronDown class="w-4 h-4 ml-1 text-gray-500" />
            </div>
          </UDropdown>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto hidden md:block">
        <div class="py-4">
          <div class="px-4 mb-4">
            <span class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">{{ t('Main Navigation') }}</span>
          </div>
          
          <!-- Navigation Links -->
          <nav>
            <SidebarNavigation />
          </nav>
        </div>
      </aside>
      
      <!-- Content Area -->
      <main class="flex-grow p-6 overflow-y-auto">
        <div class="container mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Remove router-link-active styling */
</style> 