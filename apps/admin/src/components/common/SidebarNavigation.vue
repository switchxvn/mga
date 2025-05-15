<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/useUserStore';
import { computed, ref, onMounted, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from "@/composables/useTrpc";
import { useAuth } from '@/composables/useAuth';
import { 
  Home, 
  FileText, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Star, 
  Tag, 
  Settings, 
  Folder,
  Image,
  Palette,
  ChevronDown,
  UserCircle,
  Menu,
  List,
  Plus
} from 'lucide-vue-next';

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

interface NavigationItem {
  label: string;
  icon: any;
  to?: string;
  children?: NavigationItem[];
  isOpen?: Ref<boolean>;
  availableForRoles?: string | null;
}

const { t } = useI18n();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const route = useRoute();
const router = useRouter();
const currentPath = ref(route.path);
const trpc = useTrpc();
const auth = useAuth();

// Admin menu data from API
const menuItems = ref<MenuItem[]>([]);
const isLoadingMenu = ref(true);
const menuError = ref<Error | null>(null);

// Load menu items from API
const loadMenuItems = async () => {
  isLoadingMenu.value = true;
  menuError.value = null; // Reset error
  
  try {
    console.log('SidebarNavigation: Calling admin menu API...');
    console.log('User state:', JSON.stringify(user.value, null, 2));
    console.log('Auth user state:', JSON.stringify(auth.user.value, null, 2));
    
    // Kiểm tra xem có token không
    const storage = process.client ? localStorage : null; 
    const token = storage ? storage.getItem('accessToken') : null;
    console.log('Token available:', !!token);
    
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Chưa đăng nhập');
    }
    
    // Sử dụng đúng endpoint từ adminMenuAdminRouter
    const response = await trpc.admin.adminMenu.getAdminMenuItems.query({ 
      includeInactive: false 
    });
    console.log('API response:', response);
    
    if (response) {
      menuItems.value = response as MenuItem[];
      console.log('Loaded admin menu items successfully, items count:', menuItems.value.length);
    } else {
      console.error('API response is empty or invalid');
      throw new Error('API response is empty or invalid');
    }
  } catch (error) {
    console.error('Failed to load admin menu:', error);
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

// Check if user has SUPER_ADMIN role
const isSuperAdmin = computed(() => {
  console.log('SidebarNavigation: Checking SUPER_ADMIN role');
  console.log('User from store:', user.value);
  console.log('User from auth:', auth.user.value);
  
  // Kiểm tra từ user store
  if (user.value && user.value.roles) {
    // Nếu roles không phải là mảng hoặc mảng rỗng, chuyển sang kiểm tra auth
    if (!Array.isArray(user.value.roles) || user.value.roles.length === 0) {
      console.log('User roles not available in store or empty');
    } else {
      // Kiểm tra kiểu dữ liệu của roles
      if (typeof user.value.roles[0] === 'object') {
        // Trường hợp roles là mảng object
        if ((user.value.roles as any[]).some(role => role.code === 'SUPER_ADMIN')) {
          console.log('SUPER_ADMIN from user store (object)');
          return true;
        }
      } else {
        // Trường hợp roles là mảng string
        if ((user.value.roles as string[]).some(role => role === 'SUPER_ADMIN')) {
          console.log('SUPER_ADMIN from user store (string)');
          return true;
        }
      }
    }
  } else {
    console.log('No user or roles from store');
  }
  
  // Kiểm tra từ auth composable nếu user store không có thông tin
  const authUser = auth.user.value;
  if (authUser && authUser.permissions) {
    const isSuperAdminFromAuth = authUser.permissions.includes('SUPER_ADMIN');
    console.log('SUPER_ADMIN from auth composable:', isSuperAdminFromAuth);
    console.log('Auth permissions:', authUser.permissions);
    return isSuperAdminFromAuth;
  }
  
  console.log('No SUPER_ADMIN role found from any source');
  return false;
})

// Filter items based on user roles
const hasRequiredRole = (requiredRoles: string | null) => {
  // Nếu không có yêu cầu về vai trò (null hoặc empty string), cho phép tất cả người dùng
  if (!requiredRoles) {
    console.log('No role restrictions, allowing access');
    return true;
  }
  
  if (!user.value) {
    // Thử lấy user từ auth composable
    const authUser = auth.user.value;
    console.log('User from useAuth:', authUser);
    
    if (!authUser || !authUser.permissions) {
      console.log('User not available from any source');
      return false;
    }
    
    // Kiểm tra quyền từ auth user
    if (authUser.permissions.includes('SUPER_ADMIN')) {
      console.log('User from auth is SUPER_ADMIN');
      return true;
    }
    
    const allowedRoles = requiredRoles.split(',');
    return allowedRoles.some(role => authUser.permissions.includes(role));
  }
  
  // Kiểm tra user.roles và log chi tiết
  console.log('User roles type:', typeof user.value.roles);
  console.log('User roles value:', user.value.roles);
  
  // Nếu không có roles hoặc roles là mảng rỗng
  if (!user.value.roles || !Array.isArray(user.value.roles) || user.value.roles.length === 0) {
    console.log('User roles not available or empty');
    return false;
  }
  
  // Kiểm tra xem roles là mảng string hay mảng object
  const isRoleObject = typeof user.value.roles[0] === 'object';
  console.log('Roles are objects:', isRoleObject);
  
  // SUPER_ADMIN có thể thấy tất cả các menu - xử lý cả hai trường hợp
  if (isRoleObject) {
    const hasAdmin = (user.value.roles as any[]).some(role => role.code === 'SUPER_ADMIN');
    console.log('Has SUPER_ADMIN (object check):', hasAdmin);
    if (hasAdmin) return true;
  } else {
    const hasAdmin = (user.value.roles as string[]).some(role => role === 'SUPER_ADMIN');
    console.log('Has SUPER_ADMIN (string check):', hasAdmin);
    if (hasAdmin) return true;
  }
  
  const allowedRoles = requiredRoles.split(',');
  console.log('Checking roles:', allowedRoles);
  
  // Kiểm tra phù hợp với kiểu dữ liệu của roles
  if (isRoleObject) {
    return (user.value.roles as any[]).some(role => {
      const hasRole = allowedRoles.includes(role.code);
      console.log(`Checking role ${role.code}: ${hasRole}`);
      return hasRole;
    });
  } else {
    return (user.value.roles as string[]).some(role => {
      const hasRole = allowedRoles.includes(role);
      console.log(`Checking role ${role}: ${hasRole}`);
      return hasRole;
    });
  }
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
    'Palette': Palette,
    'UserCircle': UserCircle,
    'Menu': Menu,
    'List': List,
    'Plus': Plus
  }
  
  if (!iconName) return Home;
  return iconMap[iconName] || Home; // Default to Home icon if not found
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

// Watch for route changes and initialize data
onMounted(() => {
  console.log('SidebarNavigation: Component mounted');
  currentPath.value = route.path;
  
  // Listen to route changes
  router.afterEach((to) => {
    currentPath.value = to.path;
  });
  
  // Kiểm tra xác thực trước khi tải menu
  const initialize = async () => {
    try {
      console.log('SidebarNavigation: Checking authentication...');
      console.log('Current user store state:', user.value);
      
      const isAuthenticated = await auth.checkAuth();
      console.log('SidebarNavigation: Is authenticated:', isAuthenticated);
      console.log('Auth user after check:', auth.user.value);
      
      // Reload user from store after auth check
      if (isAuthenticated && !user.value) {
        try {
          console.log('SidebarNavigation: Fetching user from store...');
          await userStore.fetchUser();
          console.log('SidebarNavigation: User after fetch:', user.value);
        } catch (error) {
          console.error('SidebarNavigation: Failed to fetch user:', error);
        }
      }
      
      // Chỉ tải menu khi đã xác thực
      if (isAuthenticated) {
        console.log('SidebarNavigation: Loading menu items after authentication...');
        await loadMenuItems();
        
        // Set initial state based on current route
        expandActiveMenus();
      } else {
        console.log('SidebarNavigation: User not authenticated, using default menu');
        // Đặt menu mặc định cho người dùng chưa xác thực
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
          }
        ];
      }
    } catch (error) {
      console.error('SidebarNavigation: Failed to initialize:', error);
    }
  };
  
  // Khởi tạo với độ trễ ngắn để đảm bảo các store đã được tải
  setTimeout(initialize, 300);
  
  // Update on route changes
  router.afterEach(() => {
    expandActiveMenus();
  });
});

// Original check permissions function
const hasAnyPermission = (requiredRoles: string[]) => {
  if (!user.value || !user.value.roles) return false;
  
  // Kiểm tra xem roles có phải là mảng không và có rỗng không
  if (!Array.isArray(user.value.roles) || user.value.roles.length === 0) return false;
  
  // Kiểm tra xem roles là mảng object hay mảng string
  const isRoleObject = typeof user.value.roles[0] === 'object';
  
  // Kiểm tra quyền SUPER_ADMIN
  if (isRoleObject) {
    // Trường hợp roles là mảng object
    if ((user.value.roles as any[]).some(role => role.code === 'SUPER_ADMIN')) {
      return true;
    }
    
    // Kiểm tra các quyền yêu cầu
    return (user.value.roles as any[]).some(role => 
      requiredRoles.includes(role.code)
    );
  } else {
    // Trường hợp roles là mảng string
    if ((user.value.roles as string[]).some(role => role === 'SUPER_ADMIN')) {
      return true;
    }
    
    // Kiểm tra các quyền yêu cầu
    return (user.value.roles as string[]).some(role => 
      requiredRoles.includes(role)
    );
  }
};
</script>

<template>
  <!-- Navigation Links -->
  <div>
    <!-- Loading state for menu -->
    <div v-if="isLoadingMenu" class="animate-pulse space-y-4 px-4 py-2">
      <div v-for="i in 5" :key="i" class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="menuError" class="px-4 py-3 text-sm text-red-600 dark:text-red-400">
      Failed to load menu. Please try again later.
    </div>
    
    <!-- Loaded menu items -->
    <template v-else>
      <!-- API-driven menu items -->
      <template v-for="(item, i) in navigation" :key="i">
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
    </template>
  </div>
</template> 