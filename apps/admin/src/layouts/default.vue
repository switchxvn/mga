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
import { ref, computed, inject, onMounted, watch, onUnmounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore
import { useColorMode, useHead, navigateTo, useNuxtApp } from '#imports'
import { useTrpc } from "@/composables/useTrpc"

// Define interfaces for menu items
interface MenuItem {
  id: number;
  code: string;
  name: string;
  icon: string | null;
  path: string | null;
  parentId: number | null;
  order: number;
  isActive: boolean;
  availableForRoles: string | null;
}

interface UserRole {
  code: string;
  name: string;
}

interface User {
  id: number;
  email: string;
  roles: UserRole[];
}

interface NavigationItem {
  label: string;
  icon: any;
  to?: string;
  children?: NavigationItem[];
  isOpen?: Ref<boolean>;
  availableForRoles?: string;
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const userStore = useUserStore()
const { user, isLoading } = storeToRefs(userStore)
const route = useRoute()
const router = useRouter()
const currentPath = ref(route.path)
const trpc = useTrpc()

// Try to get injected page title from child components
const injectedTitle = inject('pageTitle', ref(''))

// Admin menu data from API
const menuItems = ref<MenuItem[]>([])
const isLoadingMenu = ref(true)
const menuError = ref<Error | null>(null)

// Load menu items from API
const loadMenuItems = async () => {
  isLoadingMenu.value = true
  try {
    console.log('Calling admin menu API...');
    // Sử dụng đúng endpoint từ adminMenuAdminRouter
    const response = await trpc.admin.adminMenu.getAdminMenuItems.query({ 
      includeInactive: false 
    });
    console.log('API response:', response);
    menuItems.value = response as MenuItem[];
    console.log('Loaded admin menu items successfully, items count:', menuItems.value.length);
    console.log('Menu items:', JSON.stringify(menuItems.value, null, 2));
  } catch (error) {
    console.error('Failed to load admin menu:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    menuError.value = error as Error;
    
    // Fallback to default menu if API fails
    menuItems.value = [
      {
        id: 1,
        code: 'dashboard',
        name: 'Dashboard',
        icon: 'Home',
        path: '/',
        parentId: null,
        order: 1,
        isActive: true,
        availableForRoles: null
      },
      {
        id: 2,
        code: 'settings',
        name: 'Settings',
        icon: 'Settings',
        path: '/settings',
        parentId: null,
        order: 99,
        isActive: true,
        availableForRoles: 'SUPER_ADMIN'
      }
    ];
  } finally {
    console.log('Menu loading complete, have error:', !!menuError.value);
    isLoadingMenu.value = false;
  }
}

// Watch for route changes and initialize data
onMounted(async () => {
  currentPath.value = route.path
  // Listen to route changes
  router.afterEach((to) => {
    currentPath.value = to.path
  })
  
  try {
    // Fetch user data first
    await userStore.fetchUser()
    // Then load menu items
    await loadMenuItems()
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
  
  // Set initial state based on current route
  expandActiveMenus()
  
  // Update on route changes
  router.afterEach(() => {
    expandActiveMenus()
  })
})

// Check if user has SUPER_ADMIN role
const isSuperAdmin = computed(() => {
  if (!user.value || !user.value.roles) return false
  // Type assertion tới unknown trước để tránh lỗi TypeScript
  const roles = (user.value.roles as unknown) as UserRole[]
  return roles.some(role => role.code === 'SUPER_ADMIN')
})

// Filter items based on user roles
const hasRequiredRole = (requiredRoles: string) => {
  if (!user.value || !user.value.roles) {
    console.log('User or user roles not available');
    return false;
  }
  
  // Type assertion tới unknown trước để tránh lỗi TypeScript
  const roles = (user.value.roles as unknown) as UserRole[];
  
  // SUPER_ADMIN có thể thấy tất cả các menu
  if (roles.some(role => role.code === 'SUPER_ADMIN')) {
    console.log('User is SUPER_ADMIN, granting access to all menus');
    return true;
  }
  
  const allowedRoles = requiredRoles.split(',');
  console.log('Checking roles:', allowedRoles, 'against user roles:', roles.map(r => r.code));
  
  return roles.some(role => allowedRoles.includes(role.code));
}

// Function to map icon string to icon component
const getIconComponent = (iconName: string | null) => {
  const iconMap: Record<string, any> = {
    'Home': Home,
    'FileText': FileText,
    'ShoppingBag': ShoppingBag,
    'ShoppingCart': ShoppingCart,
    'Users': Users,
    'Star': Star,
    'Tag': Tag,
    'Settings': Settings,
    'Folder': Folder,
    'Image': Image,
    'Palette': Palette
  }
  
  if (!iconName) return Home
  return iconMap[iconName] || Home // Default to Home icon if not found
}

// Group menu items by parent
const processMenuItems = (items: MenuItem[]): NavigationItem[] => {
  console.log('processMenuItems called with items count:', items.length);
  
  // First, filter to get only active items
  const activeItems = items.filter(item => item.isActive);
  console.log('Active items count:', activeItems.length);
  
  // Find root items (no parent)
  const rootItems = activeItems.filter(item => !item.parentId);
  console.log('Root items count:', rootItems.length);
  console.log('Root items:', JSON.stringify(rootItems, null, 2));
  
  // Create a map of child items by parentId
  const childItemsByParent: Record<number, MenuItem[]> = {};
  activeItems.forEach(item => {
    if (item.parentId) {
      if (!childItemsByParent[item.parentId]) {
        childItemsByParent[item.parentId] = [];
      }
      childItemsByParent[item.parentId].push(item);
    }
  });
  
  console.log('Children map keys:', Object.keys(childItemsByParent));
  
  // Sort children by order
  Object.keys(childItemsByParent).forEach(parentId => {
    childItemsByParent[Number(parentId)].sort((a, b) => a.order - b.order);
  });
  
  // Function to recursively build menu tree
  const buildMenuItem = (item: MenuItem): NavigationItem => {
    console.log('Building menu item:', item.name);
    const menuItem: NavigationItem = {
      label: item.name,
      icon: getIconComponent(item.icon),
      to: item.path || undefined,
      isOpen: ref(false), // For expandable state
      availableForRoles: item.availableForRoles || undefined
    };
    
    // Add children if any
    const children = childItemsByParent[item.id];
    if (children && children.length > 0) {
      console.log(`Found ${children.length} children for ${item.name}`);
      menuItem.children = children.map(child => buildMenuItem(child));
    }
    
    return menuItem;
  };
  
  // Sort root items by order
  rootItems.sort((a, b) => a.order - b.order);
  
  // Build the full menu tree
  const result = rootItems.map(item => buildMenuItem(item));
  console.log('Final processed items count:', result.length);
  return result;
}

// Define navigation items
const navigation = computed((): NavigationItem[] => {
  console.log('Navigation computed executing...');
  console.log('isLoadingMenu:', isLoadingMenu.value);
  console.log('menuError exists:', !!menuError.value);
  console.log('menuItems exists:', !!menuItems.value);
  console.log('menuItems length:', menuItems.value?.length || 0);
  
  // If menu items are loading or there's an error, use default items
  if (isLoadingMenu.value || menuError.value || !menuItems.value || menuItems.value.length === 0) {
    console.log('Using default navigation items due to:', 
      isLoadingMenu.value ? 'loading' : 
      menuError.value ? 'error' : 
      !menuItems.value ? 'no items array' : 
      'empty items array'
    );
    
    const items: NavigationItem[] = [
      { label: 'Dashboard', icon: Home, to: '/' }
    ]
    
    // Only show Settings for SUPER_ADMIN
    if (isSuperAdmin.value) {
      items.push({ label: 'Settings', icon: Settings, to: '/settings' })
    }
    
    return items
  }
  
  console.log('Processing API menu items...');
  // Process API menu items with parent-child structure
  const processedItems = processMenuItems(menuItems.value)
  console.log('Processed items:', processedItems.length);
  
  // Nếu là SUPER_ADMIN, trả về tất cả menu không lọc
  if (isSuperAdmin.value) {
    console.log('User is SUPER_ADMIN, showing all menu items without filtering');
    
    // Always include dashboard as first item if not already included
    const hasDashboard = processedItems.some(item => item.to === '/')
    if (!hasDashboard) {
      console.log('Adding dashboard item as it was not included');
      processedItems.unshift({ label: 'Dashboard', icon: Home, to: '/' })
    }
    
    return processedItems;
  }
  
  // Đối với người dùng thường, vẫn áp dụng bộ lọc
  // Filter items based on user roles
  const filteredItems = processedItems.filter(item => {
    // Filter by role if availableForRoles is specified and user is logged in
    if (item.availableForRoles) {
      const hasRole = hasRequiredRole(item.availableForRoles);
      console.log(`Item ${item.label} requires roles: ${item.availableForRoles}, user has role: ${hasRole}`);
      return hasRole;
    }
    console.log(`Item ${item.label} has no role restrictions, showing`);
    return true
  });
  console.log('Filtered items count:', filteredItems.length);
  
  // Always include dashboard as first item if not already included
  const hasDashboard = filteredItems.some(item => item.to === '/')
  if (!hasDashboard) {
    console.log('Adding dashboard item as it was not included');
    filteredItems.unshift({ label: 'Dashboard', icon: Home, to: '/' })
  }
  
  console.log('Final navigation items count:', filteredItems.length);
  return filteredItems
})

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
  
  const currentRoute = navigation.value.find(item => isActive(item.to))
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
  if (!menuItems.value || menuItems.value.length === 0) return;
  
  const currentPath = route.path;
  console.log('Expanding active menus for path:', currentPath);
  
  // Tìm và cập nhật trạng thái mở cho menu đang active
  const processedItems = navigation.value;
  
  // Trước tiên, đóng tất cả menu (reset state)
  const resetAllMenus = (items: NavigationItem[]) => {
    items.forEach(item => {
      if (item.isOpen) {
        item.isOpen.value = false;
      }
      if (item.children) {
        resetAllMenus(item.children);
      }
    });
  };
  
  resetAllMenus(processedItems);
  
  // Hàm đệ quy để tìm và mở menu tương ứng
  const findAndExpandActiveMenu = (items: NavigationItem[]) => {
    for (const item of items) {
      // Kiểm tra xem item hiện tại có phù hợp với path hiện tại
      if (item.to && isActive(item.to)) {
        console.log('Found active menu item:', item.label);
        
        // Tìm item cha và mở nó
        const findParentAndExpand = (allItems: NavigationItem[], targetItem: NavigationItem): boolean => {
          for (const parentItem of allItems) {
            if (parentItem.children) {
              // Kiểm tra xem targetItem có phải là con của parentItem
              const isChild = parentItem.children.some(child => child === targetItem);
              if (isChild && parentItem.isOpen) {
                console.log('Opening parent menu:', parentItem.label);
                parentItem.isOpen.value = true;
                return true;
              }
              
              // Tìm kiếm đệ quy trong các con của parentItem
              const foundInChildren = findParentAndExpand(parentItem.children, targetItem);
              if (foundInChildren && parentItem.isOpen) {
                console.log('Opening parent menu (recursive):', parentItem.label);
                parentItem.isOpen.value = true;
                return true;
              }
            }
          }
          return false;
        };
        
        findParentAndExpand(processedItems, item);
      }
      
      // Kiểm tra xem con của item hiện tại có phù hợp với path hiện tại không
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          if (child.to && isActive(child.to)) {
            return true;
          }
          if (child.children) {
            return child.children.some(grandchild => grandchild.to && isActive(grandchild.to));
          }
          return false;
        });
        
        if (hasActiveChild && item.isOpen) {
          console.log('Opening menu with active child:', item.label);
          item.isOpen.value = true;
        }
        
        // Tiếp tục tìm kiếm đệ quy trong các con
        findAndExpandActiveMenu(item.children);
      }
    }
  };
  
  findAndExpandActiveMenu(processedItems);
};
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
              <div v-if="!isLoading && user" class="relative">
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center uppercase">
                  {{ user.email ? user.email[0] : 'U' }}
                </div>
                <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
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
            <span class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Main Navigation</span>
          </div>
          
          <!-- Navigation Links -->
          <nav>
            <!-- Loading state for menu -->
            <div v-if="isLoadingMenu" class="animate-pulse space-y-4 px-4 py-2">
              <div v-for="i in 5" :key="i" class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
            
            <!-- Error state -->
            <div v-else-if="menuError" class="px-4 py-3 text-sm text-red-600 dark:text-red-400">
              Failed to load menu. Please try again later.
            </div>
            
            <!-- Loaded menu items -->
            <template v-else v-for="(item, i) in navigation" :key="i">
              <!-- Single Item (no children) -->
              <template v-if="!item.children || item.children.length === 0">
                <!-- Link if has path -->
                <NuxtLink 
                  v-if="item.to" 
                  :to="item.to" 
                  class="flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
                  :class="[
                    isActive(item.to) 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  ]"
                >
                  <component 
                    :is="item.icon" 
                    class="mr-3 h-5 w-5" 
                    :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : ''"
                  />
                  {{ item.label }}
                </NuxtLink>
                
                <!-- Non-link if no path -->
                <div 
                  v-else
                  class="flex items-center px-4 py-2.5 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <component 
                    :is="item.icon" 
                    class="mr-3 h-5 w-5"
                  />
                  {{ item.label }}
                </div>
              </template>
              
              <!-- Menu with children -->
              <div v-else class="mb-1">
                <div 
                  class="flex items-center justify-between px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  @click="() => { if (item.isOpen) item.isOpen.value = !item.isOpen.value }"
                >
                  <div class="flex items-center">
                    <component :is="item.icon" class="mr-3 h-5 w-5" />
                    {{ item.label }}
                  </div>
                  <ChevronDown 
                    class="h-4 w-4 transition-transform" 
                    :class="{ 'transform rotate-180': item.isOpen?.value }"
                  />
                </div>
                
                <!-- Submenu -->
                <div v-if="item.isOpen && item.isOpen.value" class="pl-4 mt-1">
                  <template v-for="(child, j) in item.children" :key="j">
                    <!-- Link if has path -->
                    <NuxtLink 
                      v-if="child.to"
                      :to="child.to" 
                      class="flex items-center px-4 py-2 text-sm transition-colors rounded-md"
                      :class="[
                        isActive(child.to) 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      ]"
                    >
                      <component 
                        :is="child.icon" 
                        class="mr-3 h-4 w-4" 
                        :class="isActive(child.to) ? 'text-primary-600 dark:text-primary-400' : ''"
                      />
                      {{ child.label }}
                    </NuxtLink>
                    
                    <!-- Child item with its own children (3rd level) -->
                    <div v-else-if="child.children && child.children.length > 0" class="mb-1">
                      <div 
                        class="flex items-center justify-between px-4 py-2 text-sm transition-colors rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
                        @click="toggleMenu(child)"
                      >
                        <div class="flex items-center">
                          <component 
                            :is="child.icon" 
                            class="mr-3 h-4 w-4"
                          />
                          {{ child.label }}
                        </div>
                        <ChevronDown 
                          class="h-3 w-3 transition-transform" 
                          :class="{ 'transform rotate-180': child.isOpen?.value }"
                        />
                      </div>
                      
                      <!-- 3rd level items -->
                      <div v-if="child.isOpen && child.isOpen.value" class="pl-4 mt-1">
                        <template v-for="(grandchild, k) in child.children" :key="k">
                          <NuxtLink 
                            v-if="grandchild.to"
                            :to="grandchild.to" 
                            class="flex items-center px-4 py-1.5 text-xs transition-colors rounded-md"
                            :class="[
                              isActive(grandchild.to) 
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            ]"
                          >
                            <span class="w-1.5 h-1.5 mr-2 rounded-full bg-current"></span>
                            {{ grandchild.label }}
                          </NuxtLink>
                        </template>
                      </div>
                    </div>
                    
                    <!-- Non-link if no path and no children -->
                    <div 
                      v-else
                      class="flex items-center px-4 py-2 text-sm transition-colors rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <component 
                        :is="child.icon" 
                        class="mr-3 h-4 w-4"
                      />
                      {{ child.label }}
                    </div>
                  </template>
                </div>
              </div>
            </template>
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