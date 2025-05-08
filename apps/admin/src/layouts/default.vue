<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui/dist/runtime/types'
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'
import { 
  Moon, 
  Sun, 
  Home, 
  FileText, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Star, 
  Tag, 
  Settings, 
  UserCircle, 
  LogOut, 
  ChevronDown, 
  RotateCcw, 
  Folder,
  Image,
  Palette
} from 'lucide-vue-next'
import { ref, computed, inject, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorMode, useHead, navigateTo } from '#imports'

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
  { label: 'Dashboard', icon: Home, to: '/' },
  {
    label: 'Content',
    icon: FileText,
    children: [
      {
        label: 'Posts',
        icon: FileText,
        isOpen: ref(false),
        children: [
          { label: 'List All Posts', to: '/posts' },
          { label: 'Create New Post', to: '/posts/create' }
        ]
      },
      {
        label: 'Categories',
        icon: Folder,
        isOpen: ref(false),
        children: [
          { label: 'List All Categories', to: '/categories' },
          { label: 'Create New Category', to: '/categories/create' }
        ]
      },
      {
        label: 'Gallery',
        icon: Image,
        isOpen: ref(false),
        children: [
          { label: 'List All Galleries', to: '/galleries' },
          { label: 'Create New Gallery', to: '/galleries/create' }
        ]
      }
    ]
  },
  {
    label: 'User Management',
    icon: Users,
    children: [
      {
        label: 'Users',
        icon: Users,
        isOpen: ref(false),
        children: [
          { label: 'List All Users', to: '/users' },
          { label: 'Create New User', to: '/users/create' }
        ]
      },
      {
        label: 'Roles',
        icon: UserCircle,
        isOpen: ref(false),
        children: [
          { label: 'List All Roles', to: '/roles' },
          { label: 'Create New Role', to: '/roles/create' }
        ]
      }
    ]
  },
  {
    label: 'E-commerce',
    icon: ShoppingBag,
    children: [
      {
        label: 'Products',
        icon: ShoppingBag,
        isOpen: ref(false),
        children: [
          { label: 'List All Products', to: '/products' },
          { label: 'Create New Product', to: '/products/create' }
        ]
      },
      {
        label: 'Orders',
        icon: ShoppingCart,
        isOpen: ref(false),
        children: [
          { label: 'List All Orders', to: '/orders' },
          { label: 'Pending Orders', to: '/orders?status=pending' }
        ]
      },
      { label: 'Customers', icon: Users, to: '/customers' }
    ]
  },
  {
    label: 'Reviews',
    icon: Star,
    children: [
      {
        label: 'Customer Reviews',
        icon: Star,
        isOpen: ref(false),
        children: [
          { label: 'List All Reviews', to: '/reviews' },
          { label: 'Add New Review', to: '/reviews/add' }
        ]
      },
      {
        label: 'Service Types',
        icon: Tag,
        isOpen: ref(false),
        children: [
          { label: 'List All Types', to: '/reviews/service-types' },
          { label: 'Add New Type', to: '/reviews/service-types/add' }
        ]
      }
    ]
  },
  { label: 'Settings', icon: Settings, to: '/settings' },
  {
    label: 'Theme Management',
    icon: Palette,
    children: [
      {
        label: 'Themes',
        icon: Palette,
        isOpen: ref(false),
        children: [
          { label: 'List All Themes', to: '/themes' },
          { label: 'Create New Theme', to: '/themes/create' }
        ]
      }
    ]
  }
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
  if (path.includes('/users/create')) return 'Create User'
  if (path.includes('/users/edit/')) return 'Edit User'
  if (path.includes('/roles/create')) return 'Create Role'
  if (path.includes('/roles/edit/')) return 'Edit Role'
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

// Xóa event listener khi component bị phá hủy
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

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
    
    // Xử lý trường hợp đặc biệt cho User Management
    if (currentPath.startsWith('/users')) {
      // Tìm và mở menu Users
      navigation.forEach(item => {
        if (item.label === 'User Management' && item.children) {
          item.children.forEach((child: any) => {
            if (child.label === 'Users' && child.isOpen) {
              child.isOpen.value = true;
              activeMenuFound = true;
            }
          });
        }
      });
    }
    else if (currentPath.startsWith('/roles')) {
      // Tìm và mở menu Roles
      navigation.forEach(item => {
        if (item.label === 'User Management' && item.children) {
          item.children.forEach((child: any) => {
            if (child.label === 'Roles' && child.isOpen) {
              child.isOpen.value = true;
              activeMenuFound = true;
            }
          });
        }
      });
    }
    // Xử lý trường hợp đặc biệt cho Products & Orders
    else if (currentPath.startsWith('/products')) {
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
    // Xử lý trường hợp đặc biệt cho Gallery
    else if (currentPath.startsWith('/galleries')) {
      // Tìm và mở menu Gallery
      navigation.forEach(item => {
        if (item.label === 'Content' && item.children) {
          item.children.forEach((child: any) => {
            if (child.label === 'Gallery' && child.isOpen) {
              child.isOpen.value = true;
              activeMenuFound = true;
            }
          });
        }
      });
    }
    // Xử lý trường hợp đặc biệt cho Themes
    else if (currentPath.startsWith('/themes')) {
      // Tìm và mở menu Themes
      navigation.forEach(item => {
        if (item.label === 'Theme Management' && item.children) {
          item.children.forEach((child: any) => {
            if (child.label === 'Themes' && child.isOpen) {
              child.isOpen.value = true;
              activeMenuFound = true;
            }
          });
        }
      });
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
            <component
              :is="item.icon"
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
                    <component
                      :is="child.icon"
                      class="w-5 h-5 text-gray-500 dark:text-gray-400"
                      :class="{ 'text-primary-600 dark:text-primary-400': child.children.some(subItem => isActive(subItem.to)) }"
                    />
                    <span 
                      class="text-[15px] font-medium"
                      :class="{ 'text-primary-600 dark:text-primary-400': child.children.some(subItem => isActive(subItem.to)) }"
                    >{{ child.label }}</span>
                  </div>
                  <ChevronDown 
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
                <component 
                  :is="child.icon"
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
              <RotateCcw class="w-5 h-5 animate-spin mr-2 inline" />
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
            
            <!-- Custom User Dropdown -->
            <div class="relative">
              <button
                ref="userDropdownButtonRef"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                @click="toggleUserMenu"
              >
                <UAvatar
                  :src="user?.avatar || ''"
                  :alt="user?.email || ''"
                  size="sm"
                />
                <span class="font-medium">{{ user?.email }}</span>
                <ChevronDown class="w-4 h-4" />
              </button>
              
              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div 
                  v-if="isUserMenuOpen" 
                  class="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none overflow-hidden"
                  ref="userMenuRef"
                >
                  <NuxtLink
                    to="/profile"
                    class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                    @click="isUserMenuOpen = false"
                  >
                    <UserCircle class="w-5 h-5" />
                    Profile
                  </NuxtLink>
                  <button
                    class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                    @click="handleLogout(); isUserMenuOpen = false"
                  >
                    <LogOut class="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </Transition>
            </div>
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