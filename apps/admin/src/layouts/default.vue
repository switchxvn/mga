<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui/dist/runtime/types'
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'
import { Moon, Sun } from 'lucide-vue-next'
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const userStore = useUserStore()
const { user, isLoading } = storeToRefs(userStore)
const route = useRoute()
const router = useRouter()
const currentPath = ref(route.path)

// Try to get injected page title from child components
const injectedTitle = inject('pageTitle', ref(''))

// Watch for route changes
onMounted(() => {
  currentPath.value = route.path
  // Listen to route changes
  router.afterEach((to) => {
    currentPath.value = to.path
  })
})

const navigation = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  {
    label: 'Content',
    icon: 'i-heroicons-document-text',
    children: [
      {
        label: 'Posts',
        icon: 'i-heroicons-document-text',
        isOpen: ref(false),
        children: [
          { label: 'List All Posts', to: '/posts' },
          { label: 'Create New Post', to: '/posts/create' }
        ]
      },
      {
        label: 'Categories',
        icon: 'i-heroicons-folder',
        isOpen: ref(false),
        children: [
          { label: 'List All Categories', to: '/categories' },
          { label: 'Create New Category', to: '/categories/create' }
        ]
      }
    ]
  },
  {
    label: 'E-commerce',
    icon: 'i-heroicons-shopping-bag',
    children: [
      {
        label: 'Products',
        icon: 'i-heroicons-shopping-bag',
        isOpen: ref(false),
        children: [
          { label: 'List All Products', to: '/products' },
          { label: 'Create New Product', to: '/products/create' }
        ]
      },
      {
        label: 'Orders',
        icon: 'i-heroicons-shopping-cart',
        isOpen: ref(false),
        children: [
          { label: 'List All Orders', to: '/orders' },
          { label: 'Pending Orders', to: '/orders?status=pending' }
        ]
      },
      { label: 'Customers', icon: 'i-heroicons-users', to: '/customers' }
    ]
  },
  {
    label: 'Reviews',
    icon: 'i-heroicons-star',
    children: [
      {
        label: 'Customer Reviews',
        icon: 'i-heroicons-star',
        isOpen: ref(false),
        children: [
          { label: 'List All Reviews', to: '/reviews' },
          { label: 'Add New Review', to: '/reviews/add' }
        ]
      },
      {
        label: 'Service Types',
        icon: 'i-heroicons-tag',
        isOpen: ref(false),
        children: [
          { label: 'List All Types', to: '/reviews/service-types' },
          { label: 'Add New Type', to: '/reviews/service-types/add' }
        ]
      }
    ]
  },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
]

// Recursive isActive function to handle nested routes
const isActive = (path: string | undefined) => {
  if (!path) return false
  
  if (path === '/') {
    return currentPath.value === '/'
  }
  
  // Xử lý chính xác cho từng đường dẫn cụ thể
  if (path === '/products') {
    return currentPath.value === '/products' || currentPath.value === '/products/';
  }
  
  if (path === '/products/create') {
    return currentPath.value === '/products/create';
  }
  
  if (path === '/reviews') {
    return currentPath.value === '/reviews' || currentPath.value === '/reviews/';
  }
  
  if (path === '/reviews/add') {
    return currentPath.value === '/reviews/add';
  }
  
  if (path === '/reviews/service-types') {
    return currentPath.value === '/reviews/service-types' || 
           currentPath.value === '/reviews/service-types/';
  }
  
  if (path === '/reviews/service-types/add') {
    return currentPath.value === '/reviews/service-types/add';
  }
  
  if (path === '/orders') {
    return currentPath.value === '/orders' || currentPath.value === '/orders/';
  }
  
  // Nếu đường dẫn chứa các tham số động (như ID), xử lý riêng
  if (path === '/products/edit') {
    return currentPath.value.startsWith('/products/edit/');
  }
  
  if (path === '/reviews/edit') {
    return currentPath.value.startsWith('/reviews/edit/');
  }
  
  // Mặc định cho các đường dẫn khác
  return currentPath.value === path;
}

// Get current section from route
const getCurrentSection = () => {
  const path = currentPath.value
  // If we have an injected title from a child component, use it
  if (injectedTitle.value) return injectedTitle.value
  
  // Thêm handling cho các trường hợp cụ thể
  if (path.includes('/products/create')) return 'Create Product'
  if (path.includes('/products/edit/')) return 'Edit Product'
  if (path.includes('/reviews/add')) return 'Add Review'
  if (path.includes('/reviews/edit/')) return 'Edit Review'
  
  const currentRoute = navigation.find(item => isActive(item.to))
  return currentRoute?.label || 'Admin Dashboard'
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

// Fetch user data when component mounts
onMounted(async () => {
  try {
    await userStore.fetchUser()
    console.log('User data in component:', user.value)
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }
})

const handleLogout = async () => {
  userStore.clearUser()
  // Redirect to login page
  navigateTo('/login')
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

// Expands menu items based on current route
onMounted(() => {
  // Set initial state based on current route
  expandActiveMenus()
  
  // Update on route changes
  router.afterEach(() => {
    expandActiveMenus()
  })
})

// Function to toggle a menu item's open state
const toggleMenu = (child: any) => {
  if (child.isOpen) {
    child.isOpen.value = !child.isOpen.value;
  }
};

// Function to expand active menu items
const expandActiveMenus = () => {
  // Đóng tất cả menu trước khi mở menu hiện tại
  navigation.forEach(item => {
    if (item.children) {
      item.children.forEach((child: any) => {
        if (child.children && child.isOpen) {
          // Đặt về false cho tất cả
          child.isOpen.value = false;
        }
      });
    }
  });

  // Chỉ mở menu chứa route hiện tại nếu tùy chọn này được bật
  const shouldExpandActive = true; // Tùy chọn này có thể được lưu trong user settings
  
  if (shouldExpandActive) {
    // Tìm menu đang active dựa trên path hiện tại
    const currentPath = route.path;
    
    // Kiểm tra các trường hợp đặc biệt trước
    let activeMenuFound = false;
    
    // Xử lý trường hợp đặc biệt cho Products & Orders
    if (currentPath.startsWith('/products')) {
      // Tìm và mở menu Products
      navigation.forEach(item => {
        if (item.label === 'E-commerce' && item.children) {
          item.children.forEach((child: any) => {
            if (child.label === 'Products' && child.isOpen) {
              child.isOpen.value = true;
              activeMenuFound = true;
            }
          });
        }
      });
    }
    else if (currentPath.startsWith('/orders') && !currentPath.includes('/orders/items')) {
      // Tìm và mở menu Orders
      navigation.forEach(item => {
        if (item.label === 'E-commerce' && item.children) {
          item.children.forEach((child: any) => {
            if (child.label === 'Orders' && child.isOpen) {
              child.isOpen.value = true;
              activeMenuFound = true;
            }
          });
        }
      });
    }
    // Xử lý trường hợp đặc biệt cho Reviews
    else if (currentPath.startsWith('/reviews')) {
      if (currentPath.includes('/service-types')) {
        // Tìm và mở menu Service Types
        navigation.forEach(item => {
          if (item.label === 'Reviews' && item.children) {
            item.children.forEach((child: any) => {
              if (child.label === 'Service Types' && child.isOpen) {
                child.isOpen.value = true;
                activeMenuFound = true;
              }
            });
          }
        });
      } else {
        // Tìm và mở menu Customer Reviews
        navigation.forEach(item => {
          if (item.label === 'Reviews' && item.children) {
            item.children.forEach((child: any) => {
              if (child.label === 'Customer Reviews' && child.isOpen) {
                child.isOpen.value = true;
                activeMenuFound = true;
              }
            });
          }
        });
      }
    }
    
    // Nếu không tìm thấy menu đặc biệt, dùng cách mặc định
    if (!activeMenuFound) {
      navigation.forEach(item => {
        if (item.children) {
          item.children.forEach((child: any) => {
            if (child.children) {
              // Check if any children match the current route
              const isChildActive = child.children.some((subItem: any) => 
                isActive(subItem.to)
              );
              
              if (isChildActive && child.isOpen) {
                child.isOpen.value = true;
              }
            }
          });
        }
      });
    }
  }
};
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-72 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg">
      <!-- Logo/Header -->
      <div class="shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Admin Dashboard</h1>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- First Level Menu -->
        <div v-for="(item, index) in navigation" :key="index" class="space-y-1">
          <!-- If no children, just show as a simple link -->
          <NuxtLink
            v-if="!item.children"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              isActive(item.to)
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
            ]"
          >
            <UIcon 
              :name="item.icon"
              :class="[
                'w-6 h-6',
                isActive(item.to)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              ]"
            />
            <span class="text-[16px] font-medium">{{ item.label }}</span>
          </NuxtLink>
          
          <!-- First level with children -->
          <div v-else class="space-y-1">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
              {{ item.label }}
            </div>
            
            <!-- Second Level Items -->
            <div v-for="(child, childIndex) in item.children" :key="childIndex" class="mb-1">
              <!-- If second level has children, make it a dropdown -->
              <div v-if="child.children" class="relative">
                <!-- Dropdown Trigger -->
                <button 
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  :class="{ 'bg-gray-100 dark:bg-gray-700': child.children.some(subItem => isActive(subItem.to)) }"
                  @click="toggleMenu(child)"
                >
                  <div class="flex items-center gap-3">
                    <UIcon
                      :name="child.icon"
                      class="w-5 h-5 text-gray-500 dark:text-gray-400"
                      :class="{ 'text-primary-600 dark:text-primary-400': child.children.some(subItem => isActive(subItem.to)) }"
                    />
                    <span 
                      class="text-[15px] font-medium"
                      :class="{ 'text-primary-600 dark:text-primary-400': child.children.some(subItem => isActive(subItem.to)) }"
                    >{{ child.label }}</span>
                  </div>
                  <UIcon 
                    name="i-heroicons-chevron-down" 
                    class="w-4 h-4 transition-transform"
                    :class="{ 'transform rotate-180': child.isOpen?.value }"
                  />
                </button>
                
                <!-- Dropdown Content -->
                <div 
                  v-show="child.isOpen?.value"
                  class="pl-8 mt-1 space-y-1"
                >
                  <NuxtLink
                    v-for="subitem in child.children"
                    :key="subitem.to"
                    :to="subitem.to"
                    :class="[
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                      isActive(subitem.to)
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                    ]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ subitem.label }}
                  </NuxtLink>
                </div>
              </div>
              
              <!-- Second level without children -->
              <NuxtLink
                v-else
                :to="child.to"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive(child.to)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                ]"
              >
                <UIcon 
                  :name="child.icon"
                  :class="[
                    'w-5 h-5',
                    isActive(child.to)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  ]"
                />
                <span class="text-[15px] font-medium">{{ child.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <header class="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex justify-between items-center px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            <template v-if="isLoading">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
              Loading...
            </template>
            <template v-else-if="user">
              Welcome, 
              <span class="text-primary-600 dark:text-primary-400">{{ user.email }}</span>
              <span v-if="user.roles?.length" class="text-sm text-gray-500 dark:text-gray-400 ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                {{ user.roles[0] }}
              </span>
            </template>
          </h2>
          <div class="flex items-center gap-4">
            <button
              class="p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              :class="[
                isDark 
                  ? 'text-gray-400 hover:text-primary-400' 
                  : 'text-gray-600 hover:text-primary-600'
              ]"
              @click="colorMode.preference = isDark ? 'light' : 'dark'"
            >
              <component :is="isDark ? Moon : Sun" class="w-5 h-5" />
            </button>
            <UDropdown
              :items="userMenuItems"
              :ui="{
                wrapper: 'relative',
                container: 'z-50 w-48',
                width: 'w-48',
                background: 'bg-white dark:bg-gray-800',
                shadow: 'shadow-lg',
                rounded: 'rounded-md',
                ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
                base: 'overflow-hidden focus:outline-none',
                button: {
                  base: 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'
                },
                item: {
                  base: 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }
              }"
            >
              <UButton
                color="gray"
                variant="ghost"
                class="flex items-center space-x-2"
              >
                <UAvatar
                  :src="user?.avatar || ''"
                  :alt="user?.email || ''"
                  size="sm"
                />
                <span class="font-medium">{{ user?.email }}</span>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
              </UButton>
            </UDropdown>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Remove router-link-active styling */
</style> 