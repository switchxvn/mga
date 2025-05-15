<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/useUserStore';
import { computed, ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { ChevronDown } from 'lucide-vue-next';
import { useAdminMenu } from '@/composables/useAdminMenu';
import { useNavigationMenu } from '@/composables/useNavigationMenu';
import { useLocalization } from '@/composables/useLocalization';
import type { NavigationItem } from '@/composables/useAdminMenu';

const { t } = useI18n();
const { locale } = useLocalization();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const isLanguageUpdating = ref(false);

// Sử dụng các composable mới
const {
  menuItems,
  isLoadingMenu,
  menuError,
  isSuperAdmin,
  hasRequiredRole,
  loadMenuItems
} = useAdminMenu();

const {
  currentPath,
  processMenuItems,
  isActive,
  toggleMenu,
  expandActiveMenus
} = useNavigationMenu();

// Xử lý menu từ API
const navigation = computed<NavigationItem[]>(() => {
  // If menu items are loading or there's an error, use default items
  if (isLoadingMenu.value || menuError.value || !menuItems.value || menuItems.value.length === 0) {
    const defaultItems: NavigationItem[] = [
      { 
        label: 'Dashboard', 
        icon: 'Home', 
        to: '/',
        isOpen: ref(false)
      }
    ];
    
    // Only show Settings for SUPER_ADMIN
    if (isSuperAdmin.value) {
      defaultItems.push({ 
        label: 'Settings', 
        icon: 'Settings', 
        to: '/settings',
        isOpen: ref(false)
      });
    }
    
    return defaultItems;
  }
  
  // Process API menu items with parent-child structure
  const processedItems = processMenuItems(menuItems.value);
  
  // Nếu là SUPER_ADMIN, trả về tất cả menu không lọc
  if (isSuperAdmin.value) {
    // Always include dashboard as first item if not already included
    const hasDashboard = processedItems.some(item => item.to === '/');
    if (!hasDashboard) {
      processedItems.unshift({ 
        label: 'Dashboard', 
        icon: 'Home', 
        to: '/', 
        isOpen: ref(false)
      });
    }
    
    return processedItems;
  }
  
  // Đối với người dùng thường, vẫn áp dụng bộ lọc
  // Filter items based on user roles
  const filteredItems = processedItems.filter(item => {
    // Filter by role if availableForRoles is specified and user is logged in
    if (item.availableForRoles) {
      const hasRole = hasRequiredRole(item.availableForRoles);
      return hasRole;
    }
    return true;
  });
  
  // Always include dashboard as first item if not already included
  const hasDashboard = filteredItems.some(item => item.to === '/');
  if (!hasDashboard) {
    filteredItems.unshift({ 
      label: 'Dashboard', 
      icon: 'Home', 
      to: '/', 
      isOpen: ref(false)
    });
  }
  
  return filteredItems;
});

// Watch for locale changes to reload menu
watch(locale, async (newLocale) => {
  if (newLocale && auth.isAuthenticated.value) {
    try {
      isLanguageUpdating.value = true;
      await loadMenuItems();
      // Set initial state based on current route
      expandActiveMenus(navigation.value);
    } catch (error) {
      console.error('Failed to reload menu after language change:', error);
    } finally {
      isLanguageUpdating.value = false;
    }
  }
});

// Watch for route changes and initialize data
onMounted(() => {
  currentPath.value = route.path;
  
  // Listen to route changes
  router.afterEach((to) => {
    currentPath.value = to.path;
  });
  
  // Kiểm tra xác thực trước khi tải menu
  const initialize = async () => {
    try {
      const isAuthenticated = await auth.checkAuth();
      
      // Reload user from store after auth check
      if (isAuthenticated && !user.value) {
        try {
          await userStore.fetchUser();
        } catch (error) {
          console.error('SidebarNavigation: Failed to fetch user:', error);
        }
      }
      
      // Chỉ tải menu khi đã xác thực
      if (isAuthenticated) {
        await loadMenuItems();
        
        // Set initial state based on current route
        expandActiveMenus(navigation.value);
      } else {
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
    expandActiveMenus(navigation.value);
  });
});
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
    
    <!-- Language change notification -->
    <div v-if="isLanguageUpdating" class="px-4 py-2 mb-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 rounded">
      {{ t('common.loading_menu_items') }}...
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